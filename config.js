/* =========================================================================
   atture-adv — configuração do site
   -------------------------------------------------------------------------
   ESTE É O ÚNICO ARQUIVO QUE MUDA quando muda preço, WhatsApp, CNPJ ou link.
   Nenhuma página deve trazer esses valores escritos no HTML — todas leem daqui.

   Como carregar (antes dos scripts que usam os valores):
       <script src="config.js"></script>

   Não é módulo ES: é um script comum que publica tudo em `window.ATTURE`.
   Assim o site continua funcionando aberto direto do disco (file://), sem
   servidor e sem etapa de build.

   ⚠️ NADA DE SEGREDO AQUI. Este repositório é PÚBLICO. Este arquivo vai
   inteiro para o navegador de qualquer visitante. Chave de API, senha, token
   ou dado de cliente NÃO entram — nem aqui nem em nenhum outro arquivo.
   ========================================================================= */

window.ATTURE = {

  /* -----------------------------------------------------------------------
     PREÇO — hoje em modo "sob consulta"
     -----------------------------------------------------------------------
     Enquanto `preco` for null, a seção de preço deve renderizar:
         "Sob consulta — fale com a gente"  +  botão do WhatsApp.

     NUNCA renderizar "R$ 00,00", "R$ --" ou campo vazio: parece site
     quebrado justamente na seção onde a confiança é decidida.
     (design.md, seção 3.4)

     No dia em que o preço existir, basta trocar o null pelo objeto abaixo —
     a mesma seção passa a mostrar valor e itens inclusos, sem mexer no HTML:

         preco: {
           valor: 349,                  // número, sem "R$" e sem centavos
           ciclo: "mês",                // "mês" | "ano"
           inclui: [
             "Coleta e triagem das publicações do DJE",
             "Prazos classificados e confirmados por pessoa",
             "Leitura profunda dos autos, inclusive página digitalizada",
             "Peça gerada no timbre do seu escritório",
             "Instalação isolada, com backup diário fora do servidor"
           ]
         },
  ----------------------------------------------------------------------- */
  preco: null,


  /* -----------------------------------------------------------------------
     WHATSAPP — canal principal de contato
     -----------------------------------------------------------------------
     `numero` ainda NÃO foi definido. Preencher aqui liga, de uma vez, TODOS
     os botões de WhatsApp de todas as páginas do site.

     Formato: só dígitos, com código do país e DDD, sem +, espaço, traço ou
     parêntese. Exemplo de um número do Paraná: "5541999999999".

     Enquanto estiver vazio, `linkWhatsApp()` devolve null e as páginas devem
     cair na alternativa: o e-mail de contato. O visitante nunca fica sem
     saída (design.md, seção 3.5).
  ----------------------------------------------------------------------- */
  whatsapp: {
    numero: "",
    mensagem: "Olá! Vim pelo site do atture-adv e quero saber mais."
  },


  /* -----------------------------------------------------------------------
     E-MAIL — caixas que já existem (Zoho Mail, domínio verificado)
     -----------------------------------------------------------------------
     `contato` é o destino do formulário e a alternativa quando o WhatsApp
     ainda não está configurado.
  ----------------------------------------------------------------------- */
  email: {
    contato: "contato@atture-adv.com",
    suporte: "suporte@atture-adv.com"
  },


  /* -----------------------------------------------------------------------
     EMPRESA — identificação legal
     -----------------------------------------------------------------------
     `identificacao` recebe o CNPJ do MEI. Ele aparece em dois lugares, e só
     nesses dois: no RODAPÉ de todas as páginas e no texto dos TERMOS DE USO
     e da POLÍTICA DE PRIVACIDADE (onde identifica quem é o controlador dos
     dados para a LGPD).

     Enquanto estiver vazio, o rodapé deve simplesmente omitir a linha do
     CNPJ — não escrever "CNPJ: —" nem deixar um espaço solto.
  ----------------------------------------------------------------------- */
  empresa: {
    nome: "atture-adv",
    identificacao: ""   // CNPJ do MEI — preencher
  },


  /* -----------------------------------------------------------------------
     LINKS
     -----------------------------------------------------------------------
     `sistema` é o endereço de login. Preenchido = o botão "Entrar" aparece
     em todas as páginas; vazio = o botão some (e é assim que deve ficar se
     o Gateway sair do ar de novo — nunca deixar botão levando a 404).

     Aponta para o **Gateway**, que descobre pelo domínio do e-mail qual
     instalação atende aquele escritório. Religado em 27/07/2026, depois de
     ter ficado desligado desde 25/07. NÃO apontar para
     `prazos.advocaciabordignon.com.br`: aquele é o sistema do escritório de
     origem, e o site foi decidido para não nomeá-lo.

     As redes sociais ainda não foram criadas (dependem de telefone e e-mail
     do Ademir). Enquanto o valor estiver vazio, o rodapé deve omitir o link
     — nunca publicar um ícone que leva a 404.
  ----------------------------------------------------------------------- */
  links: {
    sistema: "https://app.atture-adv.com",
    youtube: "",
    instagram: "",
    linkedin: ""
  },


  /* -----------------------------------------------------------------------
     TAGLINE
     -----------------------------------------------------------------------
     Assinatura da marca. Regra da spec (3.8): NUNCA colar esta frase a texto
     contratual nem à seção de preço — ali ela soaria como garantia
     contratada, e o produto é ferramenta de apoio.
  ----------------------------------------------------------------------- */
  tagline: "Nenhum prazo escapa."

};


/* =========================================================================
   UTILITÁRIOS
   Funções puras, sem dependência. Ficam penduradas no mesmo objeto.
   ========================================================================= */

/**
 * Monta o link do WhatsApp já com a mensagem pré-escrita e codificada.
 *
 * @param {string} [mensagem] Texto alternativo, para um botão específico da
 *        página querer uma abordagem diferente da mensagem padrão.
 * @returns {string|null} URL do wa.me, ou null se o número ainda não foi
 *          definido — nesse caso a página deve usar o e-mail de contato.
 */
window.ATTURE.linkWhatsApp = function (mensagem) {
  var cfg = window.ATTURE.whatsapp || {};
  var numero = String(cfg.numero || "").replace(/\D/g, "");

  if (!numero) return null;   // sem número: quem chama cai no e-mail

  var texto = mensagem != null ? String(mensagem) : String(cfg.mensagem || "");
  var url = "https://wa.me/" + numero;

  return texto ? url + "?text=" + encodeURIComponent(texto) : url;
};

/**
 * Link `mailto:` para o e-mail de contato — a alternativa de sempre.
 *
 * @param {string} [assunto] Assunto do e-mail.
 * @returns {string} URL mailto: pronta para um href.
 */
window.ATTURE.linkEmail = function (assunto) {
  var endereco = (window.ATTURE.email && window.ATTURE.email.contato) || "";
  var url = "mailto:" + endereco;
  return assunto ? url + "?subject=" + encodeURIComponent(assunto) : url;
};

/**
 * Diz se o preço já pode ir ao ar.
 * Enquanto devolver false, a seção de preço fica em "sob consulta".
 *
 * @returns {boolean}
 */
window.ATTURE.temPreco = function () {
  var p = window.ATTURE.preco;
  return !!(p && typeof p.valor === "number" && p.valor > 0);
};

/**
 * Formata o preço em real, no padrão brasileiro (R$ 349 / R$ 1.299).
 * Só faz sentido chamar quando `temPreco()` for true.
 *
 * @returns {string} Valor formatado, ou string vazia se ainda não há preço.
 */
window.ATTURE.precoFormatado = function () {
  if (!window.ATTURE.temPreco()) return "";
  var v = window.ATTURE.preco.valor;
  try {
    return v.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: v % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2
    });
  } catch (e) {
    return "R$ " + String(v).replace(".", ",");
  }
};
