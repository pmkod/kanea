# Utiliser Bun comme image de base
FROM oven/bun:1.1.36

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier package.json
COPY . .

# Installer les dépendances avec bun
RUN bun install

# Construire l'application Next.js avec bun
RUN bun run build

# Exposer le port 3000
EXPOSE 3000

# Démarrer l'application avec bun
CMD ["bun", "start"]