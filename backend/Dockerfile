FROM node:22-alpine

WORKDIR /app

# Copy package files and prisma schema first for caching
COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

# Copy the rest of the code
COPY . .

# Generate Prisma client
# We provide a dummy URL just so Prisma can generate the types during build time
RUN DATABASE_URL="postgresql://dummy:dummy@dummy:5432/dummy" npx prisma generate

EXPOSE 3000

# We use nodemon or ts-node-dev for hot-reloading in dev
CMD ["npm", "run", "dev"]
