# Pokédex

Aplicação full-stack para pesquisar e explorar Pokémon. O frontend Vue consome uma API Laravel, que integra a PokéAPI, pagina os resultados e normaliza os dados usados pela interface.

## Funcionalidades

- Catálogo paginado com pesquisa por nome e filtro por tipo.
- Detalhes com sprites, tipos, altura, peso, habilidades e seis atributos base.
- Estados visuais de carregamento, falha de conexão e resultados vazios.
- Respostas JSON com metadados de paginação e validação dos parâmetros.
- Cache local da lista, dos tipos e dos detalhes consultados.
- Interface responsiva, navegação por teclado e respeito a movimento reduzido.

## Tecnologias

- Backend: PHP 8.2+, Laravel 12 e PHPUnit 11.
- Frontend: Vue 3, Vue Router, Pinia e Vite 7.
- Origem dos dados: PokéAPI v2. A aplicação não exige banco de dados para o catálogo; o Laravel usa SQLite para as tabelas internas padrão.

## Arquitetura

```text
pokedex-api/                 API Laravel
  app/Http/Controllers/      validação e respostas HTTP
  app/Services/              pesquisa, filtros, paginação e cache
  app/Repositories/          integração e normalização da PokéAPI
  routes/api.php             endpoints REST
  tests/Feature/             testes do contrato da API
pokedex-front/               SPA Vue/Vite
  src/components/            interface do catálogo e detalhes
  src/services/              cliente HTTP da API Laravel
  src/assets/                estilos globais e responsivos
  vite.config.js             proxy local /api -> localhost:8000
```

## Requisitos

- PHP 8.2 ou superior com extensões usuais do Laravel e SQLite.
- Composer 2.
- Node.js 20.19+ ou 22.12+, com npm.
- Acesso à internet para obter dados e imagens da PokéAPI.

## Instalação e execução

Abra dois terminais na pasta clonada do repositório.

### 1. API

No PowerShell ou terminal compatível:

```powershell
cd pokedex-api
composer install
Copy-Item .env.example .env
New-Item -ItemType File -Force database/database.sqlite
php artisan key:generate
php artisan migrate
php artisan serve --host=127.0.0.1 --port=8000
```

Se `.env` já existir, mantenha sua configuração e não o substitua. A API fica em `http://127.0.0.1:8000`.

### 2. Frontend

No segundo terminal, a partir da raiz do repositório:

```powershell
cd pokedex-front
npm ci
npm run dev
```

Abra o endereço informado pelo Vite, normalmente `http://localhost:5173`. Durante o desenvolvimento, o proxy encaminha `/api` ao Laravel na porta 8000.

### Build do frontend

```powershell
cd pokedex-front
npm run build
npm run preview
```

## Publicação no GitHub Pages

O GitHub Pages hospeda apenas arquivos estáticos e não executa o backend Laravel. O workflow em `.github/workflows/pages.yml` compila o frontend para o caminho `/pokedex/` e usa a PokéAPI diretamente no navegador. No desenvolvimento local, o frontend continua usando o Laravel através do proxy `/api`.

Após enviar as alterações para a branch `main`, acompanhe **Actions** no GitHub. Quando o workflow concluir, o site estará em `https://gustavovin1.github.io/pokedex/`. Caso o Pages ainda não esteja habilitado, em **Settings > Pages > Build and deployment** selecione **GitHub Actions**.

As consultas diretas de produção precisam que o navegador esteja conectado à internet e dependem da disponibilidade e das regras de uso da PokéAPI.

## Endpoints

| Método | Endpoint | Descrição |
| --- | --- | --- |
| `GET` | `/api/pokemon?page=1&per_page=24` | Catálogo paginado |
| `GET` | `/api/pokemon?search=pika` | Pesquisa por nome |
| `GET` | `/api/pokemon?type=electric` | Filtro por tipo |
| `GET` | `/api/pokemon/types` | Tipos disponíveis |
| `GET` | `/api/pokemon/{id-ou-nome}` | Detalhes de um Pokémon |
| `GET` | `/api/pokemon/search-list/{termo}` | Rota de busca legada |
| `GET` | `/api/pokemon/search/{nome}` | Rota de detalhe legada |

A listagem responde com `data` e `meta` (`current_page`, `per_page`, `total`, `last_page`). Erros de validação usam HTTP 422; falhas do provedor externo retornam JSON com HTTP 503; identificadores inexistentes retornam HTTP 404.

## Testes

```powershell
cd pokedex-api
php artisan test
```

Os testes de feature simulam a PokéAPI e verificam o contrato HTTP sem depender da disponibilidade do serviço externo.

## Capturas de tela

Adicione capturas em `docs/screenshots/` e atualize os caminhos abaixo quando estiverem disponíveis:

```text
docs/screenshots/catalog.png
docs/screenshots/pokemon-detail.png
```

<!-- ![Catálogo da Pokédex](docs/screenshots/catalog.png) -->

## Melhorias futuras

- Paginação por cursor ou carregamento progressivo.
- Cache HTTP com expiração configurável e métricas de provedor.
- Testes de interface e integração automatizados.
- Filtros combináveis por tipo e faixa de atributos.