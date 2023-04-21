FROM node:16-alpine AS build-env

# Install sarctool
WORKDIR /tools
ENV PYTHONUNBUFFERED=1
RUN apt-get install python3 git && ln -sf python3 /usr/bin/python
RUN python3 -m ensurepip
RUN pip3 install --no-cache --upgrade pip setuptools SarcLib==0.3 libyaz0==0.5
RUN git clone https://github.com/aboood40091/SARC-Tool

# build app
WORKDIR /usr/src/app

# Environment variables for production
ENV NODE_ENV=production

COPY package*.json ./
COPY yarn*.lock ./
RUN yarn global add typescript@4.2.3
RUN yarn install --network-timeout 1000000

COPY . .

RUN yarn run build

# Prune the dev dependencies
RUN yarn install --production --network-timeout 1000000

CMD yarn run start
