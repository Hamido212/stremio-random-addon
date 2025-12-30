# 🎲 Zufalls-Entdecker - Stremio TMDB Addon

Ein Stremio-Addon, das zufällige beliebte Filme aus der TMDB-Datenbank anzeigt.

## ✨ Features

- 🎬 **Zufällige Filme**: Bei jedem Aufruf 10 neue zufällige Filme aus den Top 500
- 🔐 **Sichere API-Key-Verwaltung**: API-Key wird lokal gespeichert, nicht in der URL
- ✅ **API-Key-Verifizierung**: Automatische Überprüfung vor der Speicherung
- 🎨 **Schöne Konfigurationsseite**: Einfache Einrichtung über Web-Interface
- 🌐 **TMDB-Integration**: Hochwertige Filmdaten mit Postern und Beschreibungen

## 📋 Voraussetzungen

- **Node.js** (Version 14 oder höher)
- **TMDB API-Key** (kostenlos bei [themoviedb.org](https://www.themoviedb.org/signup))

## 🚀 Schnellstart

### Lokale Installation (Windows/Mac/Linux)

```bash
# 1. Repository klonen oder herunterladen
git clone <repository-url>
cd stremio-random-addon

# 2. Dependencies installieren
npm install

# 3. Server starten
npm start

# 4. Browser öffnen und konfigurieren
# Öffne: http://localhost:7000/configure
# Gib deinen TMDB API-Key ein

# 5. In Stremio installieren
# URL: http://127.0.0.1:7000/manifest.json
```

### Server-Installation mit PM2 (Empfohlen für Production)

```bash
# 1. Projekt hochladen und Dependencies installieren
npm install

# 2. PM2 installieren (falls nicht vorhanden)
sudo npm install -g pm2

# 3. Mit PM2 starten
pm2 start ecosystem.config.json

# 4. Autostart aktivieren
pm2 save
pm2 startup

# 5. API-Key konfigurieren
# Öffne: http://deine-ip:7000/configure
```

### Docker (Einfachste Server-Methode)

```bash
# Mit Docker Compose
docker-compose up -d

# Oder mit Docker direkt
docker build -t stremio-addon .
docker run -d -p 7000:7000 --name stremio-addon \
  -v $(pwd)/config.json:/app/config.json \
  --restart unless-stopped stremio-addon
```

## 🔑 TMDB API-Key erhalten

1. Registriere dich auf [themoviedb.org](https://www.themoviedb.org/signup)
2. Gehe zu [Account-Einstellungen → API](https://www.themoviedb.org/settings/api)
3. Beantrage einen API-Key (Option: Developer)
4. Fülle das Formular aus (Purpose: "Personal/Educational Project")
5. Kopiere den **v3 API-Key** (nicht v4)

---

## 📖 Detaillierte Installations-Anleitungen

---

## 📖 Detaillierte Installations-Anleitungen

### Option 1: Mit PM2 (Empfohlen für Production)

1. **Auf Server verbinden**
   ```bash
   ssh user@dein-server.com
   ```

2. **Node.js installieren** (falls nicht vorhanden)
   ```bash
   # Ubuntu/Debian
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # CentOS/RHEL
   curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
   sudo yum install -y nodejs
   ```

3. **PM2 installieren**
   ```bash
   sudo npm install -g pm2
   ```

4. **Projekt hochladen**
   ```bash
   # Auf lokalem Rechner
   scp -r stremio-random-addon user@dein-server.com:/home/user/
   
   # Oder mit Git
   git clone <repository-url> /home/user/stremio-random-addon
   ```

5. **Dependencies installieren**
   ```bash
   cd /home/user/stremio-random-addon
   npm install
   ```

6. **Mit PM2 starten**
   ```bash
   pm2 start server.js --name "stremio-addon"
   pm2 save
   pm2 startup
   ```

7. **API-Key konfigurieren**
   - Öffne: `http://dein-server.com:7000/configure`
   - Trage deinen TMDB API-Key ein

8. **Port 7000 in Firewall öffnen**
   ```bash
   # Ubuntu/Debian
   sudo ufw allow 7000
   
   # CentOS/RHEL
   sudo firewall-cmd --permanent --add-port=7000/tcp
   sudo firewall-cmd --reload
   ```

### Option 2: Als Systemd Service

1. **Service-Datei erstellen**
   ```bash
   sudo nano /etc/systemd/system/stremio-addon.service
   ```

2. **Inhalt einfügen:**
   ```ini
   [Unit]
   Description=Stremio TMDB Random Addon
   After=network.target

   [Service]
   Type=simple
   User=dein-benutzer
   WorkingDirectory=/home/dein-benutzer/stremio-random-addon
   ExecStart=/usr/bin/node server.js
   Restart=always
   RestartSec=10
   StandardOutput=syslog
   StandardError=syslog
   SyslogIdentifier=stremio-addon

   [Install]
   WantedBy=multi-user.target
   ```

3. **Service aktivieren und starten**
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable stremio-addon
   sudo systemctl start stremio-addon
   ```

4. **Status überprüfen**
   ```bash
   sudo systemctl status stremio-addon
   ```

### Option 3: Mit Docker

1. **Dockerfile erstellen** (siehe unten)

2. **Image bauen**
   ```bash
   docker build -t stremio-addon .
   ```

3. **Container starten**
   ```bash
   docker run -d \
     --name stremio-addon \
     -p 7000:7000 \
     -v $(pwd)/config.json:/app/config.json \
     --restart unless-stopped \
     stremio-addon
   ```

## 🌐 Mit Reverse Proxy (Nginx)

Wenn du das Addon über eine Domain bereitstellen möchtest:

1. **Nginx konfigurieren**
   ```bash
   sudo nano /etc/nginx/sites-available/stremio-addon
   ```

2. **Konfiguration:**
   ```nginx
   server {
       listen 80;
       server_name addon.deine-domain.com;

       location / {
           proxy_pass http://127.0.0.1:7000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. **Aktivieren und neu laden**
   ```bash
   sudo ln -s /etc/nginx/sites-available/stremio-addon /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

4. **SSL mit Let's Encrypt (Optional aber empfohlen)**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d addon.deine-domain.com
   ```

## 🔑 TMDB API-Key erhalten

1. Registriere dich auf [themoviedb.org](https://www.themoviedb.org/signup)
2. Gehe zu [Account-Einstellungen → API](https://www.themoviedb.org/settings/api)
3. Beantrage einen API-Key (Option: Developer)
4. Fülle das Formular aus (Purpose: "Personal/Educational Project")
5. Kopiere den API-Key (v3 auth)

## 📁 Dateistruktur

```
stremio-random-addon/
├── server.js              # Hauptserver mit Express
├── package.json           # Dependencies und Scripts
├── config.json           # API-Key Speicherung (wird automatisch erstellt)
├── .gitignore            # Git-Ausschlüsse
├── configure/
│   └── index.html        # Konfigurations-Webseite
└── README.md             # Diese Datei
```

## 🔧 Nützliche Befehle

### NPM Scripts
```bash
npm start              # Server starten
npm run pm2:start      # Mit PM2 starten
npm run pm2:stop       # PM2 stoppen
npm run pm2:restart    # PM2 neustarten
npm run pm2:logs       # PM2 Logs anzeigen
npm run docker:build   # Docker Image bauen
npm run docker:run     # Docker Container starten
npm run docker:stop    # Docker Container stoppen
```

### PM2 Befehle
```bash
pm2 status                 # Status aller Prozesse
pm2 logs stremio-addon     # Logs live anzeigen
pm2 restart stremio-addon  # Addon neustarten
pm2 stop stremio-addon     # Addon stoppen
pm2 delete stremio-addon   # Addon entfernen
pm2 monit                  # Monitoring Dashboard
```

### Docker Befehle
```bash
docker ps                     # Laufende Container
docker logs -f stremio-addon  # Logs live anzeigen
docker restart stremio-addon  # Container neustarten
docker stop stremio-addon     # Container stoppen
docker-compose up -d          # Mit Compose starten
docker-compose down           # Mit Compose stoppen
docker-compose logs -f        # Compose Logs
```

## 🔥 Firewall-Konfiguration

### Ubuntu/Debian
```bash
sudo ufw allow 7000
sudo ufw reload
sudo ufw status
```

### CentOS/RHEL
```bash
sudo firewall-cmd --permanent --add-port=7000/tcp
sudo firewall-cmd --reload
sudo firewall-cmd --list-ports
```

### Windows
```powershell
New-NetFirewallRule -DisplayName "Stremio Addon" -Direction Inbound -LocalPort 7000 -Protocol TCP -Action Allow
```

## 🐛 Problembehandlung

### Port bereits in Verwendung

**Linux/Mac:**
```bash
# Port-Nutzung finden
lsof -i :7000
# oder
netstat -tulpn | grep 7000

# Prozess beenden
kill -9 <PID>
```

**Windows:**
```powershell
# Port-Nutzung finden
netstat -ano | findstr :7000

# Prozess beenden
taskkill /PID <PID> /F
```

### API-Key wird nicht akzeptiert

- ✅ Verwende den **v3 API Key** (nicht v4 Bearer Token)
- ✅ Überprüfe, ob der Key richtig kopiert wurde (keine Leerzeichen)
- ✅ Warte 2-5 Minuten nach der Erstellung des Keys
- ✅ Teste den Key direkt: `https://api.themoviedb.org/3/configuration?api_key=DEIN_KEY`

### Stremio kann nicht verbinden

- ✅ Stelle sicher, dass Port 7000 offen ist
- ✅ Verwende `127.0.0.1` statt `localhost`
- ✅ Überprüfe Firewall-Einstellungen
- ✅ Bei Server: Verwende externe IP oder Domain
- ✅ Teste Health Check: `http://127.0.0.1:7000/health`

### Server startet nicht

**Mit PM2:**
```bash
pm2 logs stremio-addon --lines 50
```

**Mit Systemd:**
```bash
sudo journalctl -u stremio-addon -f
```

**Mit Docker:**
```bash
docker logs stremio-addon
```

### Keine Filme werden angezeigt

- ✅ Prüfe ob API-Key konfiguriert ist: `http://127.0.0.1:7000/health`
- ✅ Schaue in die Logs nach API-Fehlern
- ✅ Teste TMDB-API direkt im Browser
- ✅ Überprüfe Rate-Limits (max. 40 Anfragen/10 Sekunden)

## 🔄 Updates

### Lokales Update
```bash
git pull
npm install
npm start
```

### Server Update mit PM2
```bash
cd /pfad/zum/addon
git pull
npm install
pm2 restart stremio-addon
```

### Docker Update
```bash
docker-compose down
git pull
docker-compose build
docker-compose up -d
```

## 📊 Monitoring & Health Check

Das Addon bietet einen Health Check Endpoint:

```bash
# Lokal
curl http://127.0.0.1:7000/health

# Server
curl http://deine-domain.com:7000/health
```

**Response:**
```json
{
  "sGitignore**: `config.json` ist bereits in `.gitignore` enthalten
- **Rate Limits**: TMDB hat API-Rate-Limits (40 Anfragen/10 Sekunden). Bei zu vielen Anfragen kann es zu Fehlern kommen
- **Produktiv-Einsatz**: Für öffentliche Server empfiehlt sich die Verwendung von HTTPS (SSL)
- **Backup**: Sichere deine `config.json` regelmäßig
- **Updates**: Halte Node.js und Dependencies aktuell für Sicherheit und Stabilität

## 🛡️ Sicherheits-Tipps

1. **Firewall**: Öffne nur Port 7000, nicht alle Ports
2. **Nginx**: Nutze Nginx als Reverse Proxy mit SSL
3. **Updates**: Halte System und Dependencies aktuell
4. **Fail2Ban**: Schütze gegen Brute-Force-Angriffe
5. **Monitoring**: Überwache Logs auf verdächtige Aktivitäten

## 🎯 Performance-Tipps

1. **PM2 Cluster Mode**: Für mehr Performance bei vielen Nutzern
2. **Caching**: Implementiere Redis für API-Response-Caching
3. **CDN**: Nutze CDN für statische Dateien (configure Seite)
4. **Compression**: Aktiviere gzip-Kompression in Nginx
5. **Rate Limiting**: Implementiere Rate Limiting gegen Missbrauch

## 📝 Entwicklung

### Projekt-Struktur
```
stremio-random-addon/
├── server.js              # Hauptserver
├── package.json           # Dependencies
├── ecosystem.config.json  # PM2-Config
├── Dockerfile            # Docker-Image
├── docker-compose.yml    # Docker Compose
├── .gitignore           # Git-Ausschlüsse
├── README.md            # Diese Datei
├── configure/
│   └── index.html       # Konfigurations-UI
└── config.json          # API-Key (wird erstellt)
```

### Environment Variables

Du kannst den Port über eine Umgebungsvariable ändern:

```bash
# .env Datei oder direkt
export PORT=8080
npm start
```

### API-Endpunkte

- `GET /` - Redirect zu /configure
- `GET /configure` - Konfigurationsseite
- `POST /api/configure` - API-Key speichern
- `GET /manifest.json` - Stremio Manifest
- `GET /catalog/:type/:id.json` - Katalog-Daten
- `GET /health` - Health Check

### Mit Uptime Monitoring (Optional)

Du kannst Services wie [UptimeRobot](https://uptimerobot.com/) oder [Pingdom](https://www.pingdom.com/) nutzen:
- Monitor-URL: `http://deine-domain.com:7000/health`
- Interval: 5 Minuten
- Expected Response: `"status":"ok"`

## 🌍 Umgebungsvariablen (Optional)

Du kannst den Port über eine Umgebungsvariable ändern:

```bash
# .env Datei erstellen
PORT=8080
```

Und in `server.js` anpassen:
```javascript
const PORT = process.env.PORT || 7000;
```

## 📝 Lizenz

MIT

## 🤝 Contributing

Pull Requests sind willkommen!

## ⚠️ Wichtige Hinweise

- **Sicherheit**: Der API-Key wird lokal in `config.json` gespeichert. Teile diese Datei NICHT öffentlich!
- **Rate Limits**: TMDB hat API-Rate-Limits. Bei zu vielen Anfragen kann es zu Fehlern kommen.
- **Produktiv-Einsatz**: Für öffentliche Server empfiehlt sich die Verwendung von HTTPS (SSL).

## 📞 Support

Bei Problemen erstelle ein Issue im Repository oder kontaktiere den Entwickler.

---

**Viel Spaß mit deinem Zufalls-Entdecker! 🎬🎲**
