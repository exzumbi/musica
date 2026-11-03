# Publicar no Worker existente `musica` com Static Assets

O destino deste projeto é o **Cloudflare Worker `musica`**, conectado ao repositório **`exzumbi/musica`**. Não criar um projeto Pages para esta configuração, nem alterar qualquer repositório, Worker, domínio ou zona da Incômodo Coletivo.

## Configuração do Worker

`wrangler.jsonc` usa **Workers Static Assets**:

```json
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "musica",
  "compatibility_date": "2026-11-02",
  "workers_dev": true,
  "assets": {
    "directory": "./dist",
    "not_found_handling": "single-page-application"
  }
}
```

A data de compatibilidade foi preservada. `pages_build_output_dir` foi removido porque pertence exclusivamente a Pages e fazia o Wrangler rejeitar o comando de deploy de Workers. Este projeto não precisa de `main`/script Worker: só publica os assets gerados pelo Vite.

O fallback `single-page-application` serve `index.html` para navegações sem um arquivo correspondente. Os arquivos reais de `/assets/` continuam sendo servidos normalmente. A navegação da aplicação também usa fragmentos como `/#theory` e `/#repertoire`.

O arquivo `public/_headers` vai para `dist/_headers` e permite microfone na própria origem. Abrir o endereço HTTPS diretamente no navegador é necessário para evitar bloqueios de microfone de um iframe externo.

## Cloudflare: usar o destino existente

1. No painel, abra **Workers & Pages → musica**. Confirme que é o Worker musical; não abra o projeto da Incômodo.
2. Em **Settings → Builds**, edite a configuração de build da integração GitHub existente. Os nomes podem aparecer traduzidos no painel.
3. Configure:

| Campo | Valor |
| --- | --- |
| Repositório | `exzumbi/musica` |
| Branch de produção | `main` |
| Diretório raiz | Raiz do repositório; deixar vazio ou usar `/`, conforme o campo. Não usar `/workspace/musica`. |
| Build command | `npm run build` |
| Deploy command | **`npm run deploy`**, equivalente a **`npx wrangler deploy`** |
| Variável de build | `NODE_VERSION` = `24.19.0` |

O diretório de assets é `./dist`, definido no Wrangler. Não usar `wrangler pages deploy` nem campos de saída de Pages para este Worker. Se o painel ainda contém um comando com `pages`, substitua-o pelo comando de Workers acima.

A integração deve instalar as dependências, inclusive as de desenvolvimento necessárias para TypeScript, Vite e Wrangler. `.node-version` também fixa o Node. O pacote Wrangler faz parte do projeto e sua versão exata está no lockfile.

4. Salve e execute **Retry build/Deploy**, ou aguarde o build disparado pelo commit em `main`.
5. Abra a URL **HTTPS `workers.dev`** exibida no Worker `musica`. `workers_dev: true` habilita esse endereço, mas o subdomínio da conta deve estar configurado na própria Cloudflare, se ainda não existir. Não é necessário contratar serviço pago ou alterar DNS/domínios existentes.

## Validar e publicar pelo terminal

Depois de instalar as dependências:

```sh
npm ci
npm run build
npm run deploy:check
```

`deploy:check` executa `wrangler deploy --dry-run`: valida a configuração de Workers sem publicar.

Para efetivamente publicar, em um ambiente autenticado na conta Cloudflare correta:

```sh
npm run deploy
```

Em uma execução manual sem um passo separado de build, use `npm run build && npm run deploy`. No painel, mantenha o build e o deploy nos respectivos campos.

A aplicação não exige segredos. A publicação exige a autorização Cloudflare da integração/CLI; credenciais GitHub não substituem essa autorização. Não salvar tokens em arquivos versionados.

## Conferir depois do deploy

- O log identifica o Worker `musica` e publica os arquivos de `dist`.
- A URL real `workers.dev` carrega por HTTPS; não inventar o subdomínio antes de vê-lo no painel.
- As sete áreas e os arquivos JS/CSS/fontes carregam corretamente.
- As navegações SPA sem um arquivo correspondente recebem `index.html`; assets reais mantêm seus tipos e conteúdos.
- O afinador só solicita microfone após clique e Encerrar captação libera o dispositivo.
- Progresso e repertório continuam locais ao navegador. Ao mudar de origem, transferir estudos com exportar/importar.

Um dry-run aprovado ou um push ao GitHub não confirmam publicação. Só considerar o Worker publicado depois de conferir a URL real. Nenhuma publicação do ambiente de desenvolvimento é necessária para esta correção.

## Documentação oficial

- [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)
- [Configuração de Static Assets](https://developers.cloudflare.com/workers/static-assets/configuration/)
- [Roteamento e fallback SPA](https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/)
