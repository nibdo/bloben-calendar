FROM node:18.9.0-bullseye-slim

WORKDIR /usr/app/tmp
ENV NODE_ENV development

COPY . ./
RUN mkdir .husky
RUN npm i

ENV NODE_ENV production
RUN npm run build

WORKDIR /usr/app
RUN cp -r ./tmp/dist ./calendar/

RUN rm -r ./tmp
