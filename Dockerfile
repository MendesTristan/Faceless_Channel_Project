FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node","-e","console.log('override CMD in docker-compose to run orchestrator')"]
