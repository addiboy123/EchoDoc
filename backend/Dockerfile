FROM node:lts-alpine3.21

WORKDIR /app

COPY package*.json ./

RUN npm install --only=production

COPY . .

ARG PORT=3000
EXPOSE ${PORT}
ENV PORT=${PORT}

CMD ["npm", "start"]
