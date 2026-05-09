FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

# Vite needs --host to allow Docker port mapping
CMD ["npm", "run", "dev", "--", "--host"]
