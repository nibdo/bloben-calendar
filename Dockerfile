FROM node:16.19.0-bullseye-slim

WORKDIR /usr/app/tmp
ENV NODE_ENV development

COPY . ./
RUN npm run setup

ENV NODE_ENV production

# build web
RUN npm run prepare-web

RUN npm run build-web

RUN mkdir /usr/app/calendar

RUN cp -r ./dist/* /usr/app/calendar/

RUN rm -r dist

# build electron
RUN npm run prepare-electron

RUN npm run build-electron

RUN mkdir /usr/app/electron

RUN cp -r ./dist/* /usr/app/electron/

WORKDIR /usr/app/api

RUN rm -r /usr/app/tmp
