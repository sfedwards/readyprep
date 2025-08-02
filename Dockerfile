FROM node:latest

COPY client/build /app/client
COPY server/dist /app/server
COPY server/package.json /app
COPY server/package-lock.json /app
COPY server/assets /app/server/assets

RUN cd app/server && npm i

WORKDIR /app
EXPOSE 3000
CMD [ "node", "server/src/main" ]
