/**
 * functions/api/contato.js
 * -----------------------------------------------------------------------
 * Cloudflare Pages Function que recebe o formulário de contato do site
 * atture-adv e envia um e-mail para a caixa comercial, usando a API da
 * Resend. Roda no servidor (edge da Cloudflare), nunca no navegador do
 * visitante — por isso é aqui que a validação de verdade acontece, e é
 * aqui que a chave de API pode ficar fora do código-fonte.
 *
 * A chave da Resend vive só como variável de ambiente do projeto, no
 * painel da Cloudflare Pages (env.RESEND_API_KEY). Este arquivo NUNCA
 * contém a chave: o repositório D:\atture-site é PÚBLICO no GitHub.
 * -----------------------------------------------------------------------
 */

// Limite de tamanho do corpo da requisição, em bytes. Acima disso, a
// requisição é recusada antes de gastar tempo tentando interpretar o JSON.
const LIMITE_CORPO_BYTES = 10 * 1024; // ~10 KB

// Limite de caracteres por campo — evita que um campo de texto vire um
// jeito barato de estourar o tamanho do e-mail de destino.
const LIMITES_CAMPO = {
  nome: 200,
  email: 200,
  whatsapp: 40,
  tamanhoEscritorio: 100,
  mensagem: 5000,
};

// Formato de e-mail plausível. Não tenta validar contra a RFC inteira —
// só recusar o que claramente não é um endereço de e-mail.
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Nome do campo honeypot que o formulário real deve incluir, escondido
// por CSS (não por "display:none" óbvio a um robô, mas fora da área
// visível). Uma pessoa nunca vê nem preenche esse campo; um robô que
// preenche todos os campos do formulário, sim.
const CAMPO_HONEYPOT = "empresa_url";

/**
 * Monta uma resposta JSON no formato padrão do endpoint:
 * { ok: true } em caso de sucesso, ou { ok: false, erro: "..." } em falha.
 */
function respostaJson(corpo, status) {
  return new Response(JSON.stringify(corpo), {
    status: status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

export async function onRequestPost({ request, env }) {
  // -----------------------------------------------------------------------
  // 1) Tamanho do corpo. Lemos como texto primeiro para medir o tamanho
  //    real em bytes antes de tentar interpretar como JSON.
  // -----------------------------------------------------------------------
  let textoBruto;
  try {
    textoBruto = await request.text();
  } catch (erro) {
    return respostaJson({ ok: false, erro: "Não foi possível ler a requisição." }, 400);
  }

  const tamanhoBytes = new TextEncoder().encode(textoBruto).length;
  if (tamanhoBytes > LIMITE_CORPO_BYTES) {
    return respostaJson({ ok: false, erro: "A mensagem enviada é grande demais." }, 413);
  }

  // -----------------------------------------------------------------------
  // 2) O corpo precisa ser um JSON válido.
  // -----------------------------------------------------------------------
  let dados;
  try {
    dados = JSON.parse(textoBruto);
  } catch (erro) {
    return respostaJson({ ok: false, erro: "Não foi possível interpretar os dados enviados." }, 400);
  }

  if (!dados || typeof dados !== "object") {
    return respostaJson({ ok: false, erro: "Dados inválidos." }, 400);
  }

  // -----------------------------------------------------------------------
  // 3) Honeypot. Se o campo escondido veio preenchido, é robô: respondemos
  //    200 fingindo sucesso, sem enviar e-mail nenhum. Devolver "sucesso"
  //    falso evita que o robô perceba o bloqueio e tente contornar.
  // -----------------------------------------------------------------------
  const valorHoneypot = dados[CAMPO_HONEYPOT];
  if (typeof valorHoneypot === "string" && valorHoneypot.trim() !== "") {
    return respostaJson({ ok: true }, 200);
  }

  // -----------------------------------------------------------------------
  // 4) Validação dos campos. Nome e e-mail são obrigatórios; os demais são
  //    opcionais, mas todos têm limite de tamanho.
  // -----------------------------------------------------------------------
  const nome = String(dados.nome || "").trim();
  const email = String(dados.email || "").trim();
  const whatsapp = String(dados.whatsapp || "").trim();
  const tamanhoEscritorio = String(dados.tamanhoEscritorio || "").trim();
  const mensagem = String(dados.mensagem || "").trim();

  if (!nome) {
    return respostaJson({ ok: false, erro: "Informe o seu nome." }, 400);
  }
  if (nome.length > LIMITES_CAMPO.nome) {
    return respostaJson({ ok: false, erro: "O nome informado é longo demais." }, 400);
  }

  if (!email) {
    return respostaJson({ ok: false, erro: "Informe o seu e-mail." }, 400);
  }
  if (email.length > LIMITES_CAMPO.email || !REGEX_EMAIL.test(email)) {
    return respostaJson({ ok: false, erro: "Informe um e-mail válido." }, 400);
  }

  if (whatsapp.length > LIMITES_CAMPO.whatsapp) {
    return respostaJson({ ok: false, erro: "O WhatsApp informado é longo demais." }, 400);
  }
  if (tamanhoEscritorio.length > LIMITES_CAMPO.tamanhoEscritorio) {
    return respostaJson({ ok: false, erro: "O campo 'tamanho do escritório' é longo demais." }, 400);
  }
  if (mensagem.length > LIMITES_CAMPO.mensagem) {
    return respostaJson({ ok: false, erro: "A mensagem é longa demais." }, 400);
  }

  // -----------------------------------------------------------------------
  // 5) A chave da Resend precisa existir como variável de ambiente do
  //    projeto na Cloudflare Pages. Se não existir, é erro de configuração
  //    nosso — devolvemos um JSON claro, nunca deixamos a exceção estourar
  //    crua para o visitante.
  // -----------------------------------------------------------------------
  if (!env.RESEND_API_KEY) {
    return respostaJson(
      { ok: false, erro: "O envio de contato está temporariamente indisponível. Tente pelo WhatsApp ou pelo e-mail." },
      500
    );
  }

  // -----------------------------------------------------------------------
  // 6) Monta o e-mail e envia pela API da Resend.
  //    O remetente usa o subdomínio send.atture-adv.com, que tem SPF e
  //    DKIM próprios — assim o envio transacional nunca interfere no SPF
  //    do domínio principal (contato@, no Zoho Mail). O destinatário é
  //    sempre a caixa comercial fixa contato@atture-adv.com.
  // -----------------------------------------------------------------------
  const corpoTexto =
    "Novo contato pelo site atture-adv\n\n" +
    "Nome: " + nome + "\n" +
    "E-mail: " + email + "\n" +
    "WhatsApp: " + (whatsapp || "não informado") + "\n" +
    "Tamanho do escritório: " + (tamanhoEscritorio || "não informado") + "\n\n" +
    "Mensagem:\n" + (mensagem || "(sem mensagem)");

  try {
    const respostaResend = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + env.RESEND_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "atture-adv <no-reply@send.atture-adv.com>",
        to: ["contato@atture-adv.com"],
        reply_to: email, // responder o e-mail vai direto para quem preencheu o formulário
        subject: "Novo contato pelo site — " + nome,
        text: corpoTexto,
      }),
    });

    if (!respostaResend.ok) {
      return respostaJson(
        { ok: false, erro: "Não foi possível enviar sua mensagem agora. Tente pelo WhatsApp ou pelo e-mail." },
        502
      );
    }
  } catch (erro) {
    // Falha de rede ao chamar a Resend — mesma resposta de falha amigável,
    // nunca uma exceção crua na resposta HTTP.
    return respostaJson(
      { ok: false, erro: "Não foi possível enviar sua mensagem agora. Tente pelo WhatsApp ou pelo e-mail." },
      502
    );
  }

  // -----------------------------------------------------------------------
  // 7) Sucesso.
  // -----------------------------------------------------------------------
  return respostaJson({ ok: true }, 200);
}
