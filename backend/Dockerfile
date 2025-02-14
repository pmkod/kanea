FROM node:20-slim

WORKDIR /app

COPY . .

RUN npm install -g pnpm

RUN pnpm install && pnpm build

EXPOSE 8000

CMD ["node", "./dist/index.js"]