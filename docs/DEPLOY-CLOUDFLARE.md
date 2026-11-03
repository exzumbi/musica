# Publicar este projeto musical na Cloudflare Pages

Este é um projeto separado. Não selecionar repositório, projeto Pages/Workers, domínio ou zona do site Incômodo Coletivo. O repositório de destino deste aplicativo é `exzumbi/musica`.

## GitHub → Cloudflare Pages

1. Abra o painel da Cloudflare e entre em **Workers & Pages**.
2. Escolha **Create application → Pages → Import an existing Git repository**.
3. Use a integração GitHub já existente e selecione **somente `exzumbi/musica`**. Se o repositório não aparecer, abra as configurações da instalação GitHub da Cloudflare e acrescente esse repositório à lista permitida, preservando os demais.
4. Crie um projeto novo, com nome sugerido **`dicionario-musical`**. Se esse nome estiver ocupado, escolha outro nome novo; nunca reutilize o projeto da Incômodo.
5. Na configuração do build:

| Campo | Valor |
| --- | --- |
| Production branch | `main` |
| Framework preset | `React (Vite)` se disponível; caso contrário `None`, com os campos abaixo |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | Raiz do repositório (deixar em branco; não usar `/workspace/musica`) |
| Environment variable | `NODE_VERSION` = `24.19.0` |

A Cloudflare instala as dependências com base em `package.json` e `package-lock.json`. A versão do Node também está fixada em `.node-version`. Nenhum segredo da aplicação é necessário.

6. Escolha **Save and Deploy**. O build deve terminar com a criação de `dist/index.html` e `dist/assets/`.
7. Copie o endereço **HTTPS `*.pages.dev` efetivamente exibido pela Cloudflare**. Não há um domínio pré-garantido neste documento.
8. Abra a URL em uma nova aba, confira as sete áreas e abra o afinador. Clique **Ativar microfone** e autorize somente se quiser afinar. No celular, abra o endereço HTTPS diretamente no navegador; um iframe de outro site pode bloquear a permissão.

Não é necessário domínio personalizado, plano pago, porta 5173, servidor Vite em produção ou alteração de DNS. Depois do primeiro deploy, novos commits na branch de produção podem disparar novas publicações deste projeto musical.

## Arquivos e rotas

- `npm run build` faz a checagem TypeScript e gera os arquivos estáticos em `dist`.
- `wrangler.jsonc` declara o nome sugerido e o diretório de saída de **Pages**; não contém conta, token ou domínio.
- `public/_headers` é copiado para `dist/_headers`. Ele permite microfone na própria origem, sem habilitar câmera ou geolocalização.
- O site usa navegação por fragmentos (`/#theory`, `/#repertoire`, etc.). Cloudflare Pages também fornece fallback de SPA quando não existe um `404.html` na raiz. Por isso não é necessário criar uma regra genérica de redirecionamento que possa interferir nos assets.
- Fontes, CSS e JavaScript são servidos a partir dos arquivos locais gerados. Não enviar `node_modules` como diretório de publicação.
- Não usar `npm run dev` ou `vite preview` como comando de build.

## Backup e alternativa de upload manual

O ZIP completo contém código-fonte, lockfile, configuração, testes, documentação e a versão compilada. Exclui Git, dependências instaladas, caches e resultados de testes.

Para colocar o código em um repositório GitHub novo pela interface:

1. No GitHub, clique **+ → New repository** e escolha um nome novo, como `dicionario-musical`. Não reutilize o repositório da Incômodo.
2. Crie o repositório. Extraia o ZIP completo no computador.
3. Escolha **Add file → Upload files** e envie os arquivos da raiz extraída, incluindo `src`, `public`, `package.json`, `package-lock.json`, `index.html`, `tsconfig.json`, `.gitignore`, `.node-version` e `wrangler.jsonc`. Não envie o ZIP como um único arquivo esperando que o GitHub o extraia. `dist` não precisa ser enviado ao GitHub: será reconstruído pela Cloudflare.
4. Confirme o commit em `main` e siga a integração Pages acima usando esse novo repositório.

Para publicar sem GitHub, crie **outro projeto novo** na área Pages usando **Upload assets/Direct Upload** e envie o ZIP de produção, cujo `index.html` está na raiz. Esse modo não configura a integração automática GitHub; para o caminho solicitado, prefira o projeto conectado ao Git. Os dois modos não devem ser usados para substituir o site da Incômodo.

## Verificação depois do deploy

- Página inicial carrega por HTTPS e mostra as sete áreas.
- JavaScript/CSS/fontes em `/assets/` retornam 200 com os tipos corretos.
- Links `/#theory` e `/#repertoire` carregam sem 404.
- O navegador informa contexto seguro; `navigator.mediaDevices.getUserMedia` existe nos navegadores compatíveis.
- O microfone só é solicitado após clicar, e Encerrar captação libera o acesso.
- Os estudos continuam locais ao navegador. O domínio novo tem um armazenamento separado; use exportar/importar para transferir estudos entre origens.

Só considerar o site publicado depois de conferir o endereço real do deploy. Publicar o ambiente de desenvolvimento é diferente de publicar o aplicativo na Cloudflare.

## Referências oficiais conferidas

Documentação oficial consultada no repositório `cloudflare/cloudflare-docs`, branch `production`:

- [React no Pages](https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/)
- [Servir páginas e fallback SPA](https://developers.cloudflare.com/pages/configuration/serving-pages/)

Nenhuma alteração em outro site, domínio ou conta é necessária para esses passos.
