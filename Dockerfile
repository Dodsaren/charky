FROM node:14.11.0-alpine3.12

COPY package.json package-lock.json ./
RUN npm ci

COPY ./src/ ./src/
COPY ./index.js ./index.js

CMD ["node", "index.js"]