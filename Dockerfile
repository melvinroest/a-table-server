FROM node:12.21.0-alpine3.10

WORKDIR /app

COPY ./server/package.json ./package.json
COPY ./server/yarn.lock ./yarn.lock
RUN yarn install

# COPY ./build/ ./build/
COPY ./server/ .
RUN rm -rf ./shared
# Note: the shared folder is in the CRA project, since I do not yet want to detach and CRA cannot deal with TypeScript outside of the source folder
COPY ./client/src/shared/src/ ./src/shared/

CMD [ 'yarn' 'run' 'start:dev' ]