FROM node:8-alpine

RUN apk add --update bluez bluez-libs linux-headers

WORKDIR /usr/src/app

COPY package*.json ./

RUN apk add --no-cache --virtual .build-deps alpine-sdk python \
 && npm install --production \
 && apk del .build-deps

COPY . .

CMD [ "npm", "start" ]
