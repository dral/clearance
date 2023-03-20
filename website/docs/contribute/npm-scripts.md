---
sidebar_position: 1
---

# `npm` scripts

## Production build and run

Transpile sources into plain javascript code for production use. Excludes source maps and tests.
```sh
npm run build
```

Clean generated code.
```sh
npm run clean
```

Start the server from the transpiled sources.
```sh
npm run prod
```

Actual production equivalent may use additional environment variables (see [environment variables](./configuration#environment-variables) and [deployment](./deployment) for more).
```sh
NODE_ENV=production PORT=80 npm run prod
```

## Local development

Runs the server from typescript sources
```sh
npm start
```

Auto-reload run exposing a websocket for debugging with developper tools.
```sh
npm run watch
```

In order to fine tune reload options see `nodemon.json` settings.


## Tests

Run the full test suite (from typescript sources) including coverage analysis
```sh
npm test
```

Continuous (auto-reloading) test runs.
```sh
npm run test:watch
```

For detailed test setup see `jest.config.ts` file.

## Linter

Checks code syntax conventions. Used for CI.
```sh
npm run lint
```

## Licences

Verifies production dependencies against licence copyleft protection. Allowed licences include:
- MIT
- ISC
- BSD-3-Clause
- Apache-2.0
- Python-2.0

```sh
npm run license:check
```

Outputs a report of prouction packages into `licences.json`.
```sh
npm run license:report
```

## Documentation

Generates an Open API specificatin file from api jsdoc comments into `website/openapi.json`. Used for documentation website generation.

```sh
npm run dumpApiSpec
```