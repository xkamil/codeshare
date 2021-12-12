FROM node:16
WORKDIR /build
COPY package*.json ./
RUN npm install

FROM node:16-alpine
WORKDIR /app
COPY --from=0 /build ./
COPY . .
EXPOSE 8080
CMD [ "node", "server.js" ]
