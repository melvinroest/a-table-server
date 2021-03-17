FROM node:12.21.0-alpine3.10

WORKDIR /app

COPY package.json ./
COPY yarn.lock ./
RUN yarn install

# COPY ./build/ ./build/
COPY . ./

CMD [ 'yarn' 'run' 'dev:watch' ]