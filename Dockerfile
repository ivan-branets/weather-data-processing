FROM node:12

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
RUN npm ci --only=production
RUN npm install pm2 -g

# Bundle app source
COPY . .

EXPOSE 3000
CMD [ "pm2-runtime", "./dist/main.js", "-i", "max" ]