FROM node:20-slim

ENV PNPM_HOME="/pnpm"

ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

COPY . .

RUN pnpm install && pnpm run build 

EXPOSE 3000

CMD ["pnpm", "start"]