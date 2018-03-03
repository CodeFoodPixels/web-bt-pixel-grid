FROM node:9

RUN apt-get update
RUN apt-get install -y bluetooth bluez libbluetooth-dev libudev-dev

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

CMD [ "npm", "start" ]
