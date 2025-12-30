# 🎲 Zufalls-Entdecker - Stremio TMDB Addon

Entdecke bei jedem Aufruf 10 neue zufällige Filme aus den Top 500 TMDB-Filmen.

## ✨ Features

- 🎬 10 zufällige beliebte Filme bei jedem Aufruf
- 🔐 Sichere API-Key-Verwaltung
- 🎨 Einfache Web-Konfiguration
- 🌐 TMDB-Integration mit Postern und Beschreibungen

## 🚀 Installation

### Lokal (Windows/Mac/Linux)

```bash
git clone <repository-url>
cd stremio-random-addon
npm install
npm start
```

Öffne: `http://localhost:7000/configure`

### Server mit Docker (NAS/VPS)

```bash
git clone <repository-url>
cd stremio-random-addon
docker-compose up -d
```

Öffne: `http://deine-ip:7000/configure`

### Port ändern

Bearbeite `docker-compose.yml`:
```yaml
ports:
  - "8080:7000"  # Links ist dein Port
```

## 🔑 TMDB API-Key

1. Registriere dich auf [themoviedb.org](https://www.themoviedb.org/signup)
2. Gehe zu [Account-Einstellungen → API](https://www.themoviedb.org/settings/api)
3. Beantrage API-Key (Developer)
4. Kopiere den **v3 API-Key**

## 🐛 Problemlösung

**Port bereits belegt?**
```bash
# Linux/Mac
lsof -i :7000
kill -9 <PID>

# Windows
netstat -ano | findstr :7000
taskkill /PID <PID> /F
```

**Docker Permission denied?**
```bash
sudo docker-compose up -d
# oder
sudo usermod -aG docker $USER
```

**Stremio verbindet nicht?**
- Verwende `http://` nicht `https://`
- Teste: `http://deine-ip:7000/health`
- Prüfe Firewall (Port 7000 freigeben)

## 🔧 Nützliche Befehle

```bash
# Starten/Stoppen
npm start
docker-compose up -d
docker-compose down

# Updates
git pull
docker-compose down
docker-compose up -d --build

# Logs
docker-compose logs -f
```

## 📁 Dateien

```
stremio-random-addon/
├── server.js              # Server
├── package.json           # Dependencies
├── docker-compose.yml     # Docker Config
├── configure/
│   └── index.html        # Konfigurationsseite
└── config.json           # API-Key (wird erstellt)
```

## 📝 Lizenz

MIT - Viel Spaß! 🎬🎲
