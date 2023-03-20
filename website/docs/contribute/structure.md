---
sidebar_position: 2
image: https://i.imgur.com/mErPwqL.png
keywords: 
  - toto
  - titi
  - devs
---

# Project structure

The project is organised as follows:

- `readme.md`
- `config/` <-- configuration files per environment
- `src/`
  - `index.ts` <-- Application launch and teardown
  - `server.ts` <-- API server setup and initialisation logic
  - `db.ts` <-- Db initialisation
  - `logger.ts` <-- Logger setup
  - `app.ts` <-- The main application router
  - `base/`
- `website/` <-- Documentation website
  - `docs/`
  - `src/`
  - `static/`
- `.github/workflows/` <-- CI/CD github actions

## Project setup

- [x] nvm setup for node version
- [x] Typescript setup
  - [x] Linter
  - [x] Import synax
  - [x] Build scripts
  - [x] Production setup
- [x] Nodemon
  - [x] Reload on config and code changes
  - [x] Ignores tests
  - [x] Dev Tool inspect
- [x] Tests
  - [x] Jest for typescript
  - [x] Detect open handles
  - [x] Code coverage
  - [x] Supertest
- [x] Config
  - [x] Env variables support
  - [x] Defaults, dev, test & prod environment settings  
- [x] Logger
  - [x] Json output
  - [x] Api request log
- [ ] Docker file
  - [x] Incremental changes
  - [x] Test image
  - [x] Production image excluding dev dependencies
  - [ ] Private packages
- [x] CI/CD - GitHub Actions
  - [x] Linter
  - [x] Tests
  - [x] Licences audit
  - [ ] Sonarqube
  - [ ] Integration env
  - [x] Public doc to github pages
  - [x] OpenAPI doc
  - [x] Build image
  - [x] Publish image to Github packages
- [ ] Helm chart
- [ ] Server setup
  - [x] `ok` and `not found` middlewares
  - [x] error handler for uncatched and silent exceptions
  - [x] exit on initialization error
  - [x] health probe
  - [ ] prometheus metrics
  - [x] license, licenses and license summary endpoints
  - [x] API doc
    - [x] OpenAPI doc
    - [x] Development server url from config
-[x] Persistency
  - [x] Mongodb setup
