FROM node:22-alpine

RUN apk add --no-cache tesseract-ocr tesseract-ocr-data-por poppler-utils

WORKDIR /app

COPY package.json .
RUN npm install --production

COPY . .

RUN mkdir -p /app/uploads

EXPOSE 3000

CMD node src/database/migrate.js && node src/database/seed.js && node src/server.js
