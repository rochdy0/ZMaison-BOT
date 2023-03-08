FROM node:18.14.2-alpine3.17
WORKDIR /app
COPY ./ /app
RUN npm i && npm i -g nodemon
EXPOSE 80 443
CMD ["nodemon", "index.js"]