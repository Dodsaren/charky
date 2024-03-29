FROM arm64v8/node:18.13.0-alpine3.16

RUN apk add --update alpine-sdk
RUN apk add --update make
RUN apk add --update libtool
RUN apk add --update autoconf
RUN apk add --update automake
RUN apk add --update --no-cache python3

COPY package.json package-lock.json ./
RUN npm ci

COPY src ./src
COPY tsconfig.json index.ts ./

RUN npm run build

CMD ["npm", "start"]