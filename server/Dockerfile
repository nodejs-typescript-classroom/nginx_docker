FROM node:20.10.0-alpine
WORKDIR app/
COPY server/index.js  server/package*.json ./
RUN npm install
CMD [ "node", "index.js"]