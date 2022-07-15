FROM arm64v8/node:18.3.0-alpine3.11

RUN apk add --update alpine-sdk
RUN apk add --update make
RUN apk add --update libtool
RUN apk add --update autoconf
RUN apk add --update automake
RUN apk add --update --no-cache python3

COPY package.json package-lock.json ./
RUN npm ci

COPY ./src/ ./src/
COPY ./index.ts ./index.ts

CMD ["npm", "start"]