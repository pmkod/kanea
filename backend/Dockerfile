FROM node:22-bullseye

WORKDIR /app

COPY . .

RUN npm install -g pnpm

RUN pnpm install --frozen-lockfile && pnpm build

EXPOSE 8000

CMD ["pnpm", "tsx", "./src/index.ts"]