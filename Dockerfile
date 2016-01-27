FROM node:4

MAINTAINER Anne Gentle <annegentle@justwriteclick.com>

# Create app directory

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

# Install app dependencies

COPY package.json /usr/src/app
RUN npm install

COPY . /usr/src/app

EXPOSE 5000

CMD ["npm", "start"]
