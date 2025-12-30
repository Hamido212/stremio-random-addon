# Dockerfile für Stremio Random Addon
FROM node:18-alpine

# Arbeitsverzeichnis erstellen
WORKDIR /app

# Package-Dateien kopieren
COPY package*.json ./

# Dependencies installieren
RUN npm ci --only=production

# Anwendungsdateien kopieren
COPY server.js ./
COPY configure ./configure

# Port freigeben
EXPOSE 7000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:7000/manifest.json', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Starten
CMD ["node", "server.js"]
