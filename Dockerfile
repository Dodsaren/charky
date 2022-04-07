FROM arm64v8/node:16.13.0-alpine3.11

RUN apk add --update alpine-sdk
RUN apk add --update --no-cache python

COPY package.json package-lock.json ./
RUN npm ci

COPY ./src/ ./src/
COPY ./index.js ./index.js

CMD ["node", "index.js"]