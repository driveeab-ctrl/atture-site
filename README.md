# atture-site

Site público do **atture-adv** — `atture-adv.com`.

---

## ⚠️ ESTE REPOSITÓRIO É PÚBLICO. LEIA ANTES DE COMMITAR.

> **Nenhuma credencial, chave de API, token, senha ou dado de cliente pode
> entrar aqui.** Nem em arquivo, nem em comentário, nem em nome de arquivo,
> nem "só para testar", nem em commit que você pretende desfazer depois —
> commit apagado continua no histórico e em qualquer clone que já existir.
>
> As chaves da **Porkbun** (domínio e DNS), do **Zoho** (e-mail) e da
> **Cloudflare** (publicação) vivem **no gerenciador de senhas do Ademir**.
> Jamais no repositório.
>
> Também não entram: dado de processo, nome de parte, número de CNJ real,
> print de tela com informação verdadeira de cliente. Todo exemplo, print e
> vídeo sai da demonstração fictícia do sistema.

Se um segredo vazar mesmo assim: **rotacione a chave primeiro** (na Porkbun,
no Zoho, na Cloudflare) e só depois se preocupe em limpar o histórico. Chave
publicada é chave queimada — reescrever o histórico não a torna secreta de novo.

---

## O que é este projeto

A porta de entrada pública do **atture-adv**, o SaaS jurídico de gestão de
prazos e publicações para advocacia (o sistema `coletor-dje` transformado em
produto). O site responde, em menos de dez segundos de leitura: o que é, para
quem é, o que resolve, como falar com a gente e por onde o cliente já
contratado entra no sistema.

**Tecnologia: HTML e CSS puros.** Sem framework, sem etapa de build, sem CDN,
sem fonte baixada de terceiro. Não é preguiça — é decisão registrada na spec:
o site carrega instantâneo em 4G, não quebra quando uma biblioteca de terceiro
sai do ar, e qualquer sessão futura consegue editar sem reconstruir ambiente.

**Não instale dependência aqui.** Se você sentiu vontade de criar um
`package.json`, pare e releia a spec — o problema provavelmente é outro.

---

## Como abrir localmente

Não tem servidor, não tem `npm install`, não tem nada para compilar:

```
abra o arquivo index.html no navegador
```

Duplo clique resolve. Editou o `estilo.css`? Recarregue a página (`Ctrl+F5`
para ignorar o cache).

Se precisar de um servidor local (por exemplo, para testar o formulário ou
qualquer coisa que o `file://` bloqueie), qualquer servidor estático serve:

```
python -m http.server 8000
```

e acesse `http://localhost:8000`.

---

## Estrutura

```
atture-site/
  index.html          a home inteira
  privacidade.html    Política de Privacidade (LGPD)
  termos.html         Termos de Uso
  obrigado.html       depois do envio do formulário
  404.html
  estilo.css          folha ÚNICA — tokens da marca no topo, em :root
  config.js           ← preço, WhatsApp, CNPJ e links moram só aqui
  assets/
    logo.svg                 lockup horizontal, para o cabeçalho
    logo-claro.svg           o mesmo, para fundo escuro (rodapé)
    logo-simbolo.svg         só o símbolo, quadrado
    logo-simbolo-claro.svg   o símbolo para fundo escuro
    favicon.svg              ladrilho petróleo com o símbolo
    favicon.png              versão rasterizada, para navegador antigo
```

---

## Preço, WhatsApp, CNPJ e links: só no `config.js`

**Nunca escreva esses valores no HTML.** Todas as páginas leem de
`window.ATTURE`, definido em `config.js`. Trocar o preço, publicar o número do
WhatsApp ou registrar o CNPJ do MEI é editar **uma linha**, num arquivo só —
não caçar texto em cinco páginas.

| O que mudar | Onde | Estado hoje |
|---|---|---|
| Preço | `ATTURE.preco` | `null` = "sob consulta". O formato do dia em que houver valor está comentado logo abaixo. **Nunca renderizar `R$ 00,00`.** |
| WhatsApp | `ATTURE.whatsapp.numero` | vazio. Preencher liga todos os botões do site de uma vez. |
| CNPJ | `ATTURE.empresa.identificacao` | vazio. Aparece no rodapé e nos Termos. |
| Login do sistema | `ATTURE.links.sistema` | Gateway que já existe — o site só aponta. |
| Redes sociais | `ATTURE.links.*` | vazias. Link vazio deve ser **omitido**, nunca virar 404. |

Utilitários prontos no mesmo arquivo: `ATTURE.linkWhatsApp()` (devolve `null`
se o número ainda não existe, para a página cair no e-mail), `ATTURE.linkEmail()`,
`ATTURE.temPreco()` e `ATTURE.precoFormatado()`.

---

## Identidade visual

Os tokens da marca estão em `:root`, no topo do `estilo.css` — é a única fonte
de verdade de cor no projeto. **Não invente cor nova.**

| Token | Valor | Uso |
|---|---|---|
| `--petroleo` | `#0E3A44` | cor principal |
| `--petroleo-escuro` | `#0A2A31` | fundos escuros, rodapé |
| `--tinta` | `#0C2229` | texto sobre fundo claro |
| `--ambar` | `#C0872A` | destaque e ação |
| `--ambar-claro` | `#E0AE52` | destaque sobre fundo escuro |
| `--papel` | `#F4F6F3` | fundo da página |
| `--papel-frio` | `#EAF3F1` | seção alternada; texto no escuro |
| `--ciano` | `#79C6D2` | apoio — **só** sobre fundo escuro |

Cuidado registrado no CSS: **âmbar e ciano não passam no contraste como cor de
texto sobre fundo claro** (2,9:1 e 1,8:1). Servem como fundo de botão, filete,
ícone ou moldura. É por isso que o botão primário é âmbar com texto escuro, e
não âmbar com texto branco.

Os logos em `assets/` foram vetorizados a partir do logo misto protocolado no
INPI (`C:\Users\Ademir\atture-logo-mista.jpg`): o símbolo reaproveita os
mesmos traçados do original e o texto está em contorno vetorial, não em fonte
— então renderiza igual em qualquer máquina, mesmo sem a fonte instalada.

O nome se escreve **atture** com dois T. No logo, o separador é o ponto médio
(`atture·adv`), como no desenho protocolado; em texto corrido e no domínio,
escreve-se com hífen: **atture-adv** / `atture-adv.com`.

---

## Onde ficam as decisões

Nada de arquitetura, copy ou publicação se decide aqui. Está tudo em:

```
D:\coletor-dje\specs\27-site-atture-adv\
    requisitos.md    o que o site precisa fazer (R1 a R17)
    design.md        tecnologia, estrutura da home, preço, captação, DNS, publicação
    tarefas.md       o passo a passo da execução
```

Antes de escrever qualquer afirmação sobre o produto, leia o
`catalogo-de-provas.md` da skill `site-atture-adv`
(`C:\Users\Ademir\.claude\skills\site-atture-adv\`). Regra dura: **o site não
anuncia o que o sistema não faz hoje**, e item marcado como roadmap nunca é
escrito no presente do indicativo.

---

## Publicação

Cloudflare Pages ligado a este repositório: **`git push` publica**.

O DNS **fica na Porkbun** — decisão de 27/07/2026, registrada no `design.md`
(seção 3.6). O domínio tem o e-mail do Zoho no ar (MX, SPF, DKIM, DMARC e a
verificação). **Não se toca em nenhum desses registros.** Só mudam dois
registros web: o `ALIAS` da raiz e o `CNAME www`.

Reversão: repor o `ALIAS` da raiz para `uixie.porkbun.com` devolve o estado
anterior em minutos.
