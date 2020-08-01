FROM node:14.7-alpine

ENV PORT 4000
ENV REDIS_HOST redis
ENV DB_HOST db

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
RUN npm ci --only=production
RUN npm install pm2 -g

# Bundle app source
COPY ./dist ./dist

EXPOSE 4000
CMD [ "pm2-runtime", "./dist/main.js", "-i", "max" ]