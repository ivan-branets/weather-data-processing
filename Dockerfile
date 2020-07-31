FROM node:14.7-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
RUN npm ci --only=production
RUN npm install pm2 -g

# Bundle app source
COPY . .

EXPOSE 3000
CMD [ "pm2-runtime", "./dist/main.js", "-i", "max" ]