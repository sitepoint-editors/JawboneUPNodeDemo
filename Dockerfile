FROM node:4

MAINTAINER Anne Gentle <annegentle@justwriteclick.com>

# Create app directory

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

# Install app dependencies

COPY package.json /usr/src/app
RUN npm install

COPY server.js /usr/src/app

COPY public/images/ /usr/src/app

COPY views/ /usr/src/app

EXPOSE 8080

CMD ["npm", "start"]
