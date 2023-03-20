---
sidebar_position: 7
---

# Publish and Deploy

## Locally testing the docker image

### Build the image

```sh
docker build . -t api-template:local
```

### Launch a development instance of mongodb (if needed) {#mongodb}

Create a local network for dependent docker instances (once only, optional)
```sh
docker network create local
```

Make sure a mongodb instance is running locally

- Create a new docker instance for mongodb (only once)
  ```sh
  docker run \
    --net local \
    -d \
    --name mongodb-dev \
    -p 27017:27017 \
    mongo:6
  ```

- ... or simply start an already created instance
  ```sh
  docker start mongodb-dev
  ```

### Run the image connecting it to your local mongodb instance

```sh
docker run \
  --rm \
  --name api-template \
  -p 80:8000 \
  --net local \
  --env mongoDbHost="mongodb://mongodb-dev:27017/prod" \
  --env logLevel="debug" \
  api-template:local
```

This will keep a running instance attached to your terminal in order to easily monitor logs and will map the internal container port 80 to your local 8000 port. Your docker running server should be available at [http://localhost:8000/](http://localhost:8000/).

## CI Workflows

### Build and publish

### Publish documentation website to gh-pages

- [Github pages setup](https://github.com/dral/api-template/settings/pages)
  - Deploy from a branch `gh-pages` `/(root)`

## Project assets

### Docker image

### Npm packages

## Helm chart

