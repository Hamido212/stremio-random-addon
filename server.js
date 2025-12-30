const express = require('express');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 7000;
const CONFIG_FILE = path.join(__dirname, 'config.json');

// Logging-Funktion
function log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'warn' ? '⚠️' : 'ℹ️';
    console.log(`[${timestamp}] ${prefix} ${message}`);
}

// CORS Middleware für Stremio
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Request Logging
app.use((req, res, next) => {
    log(`${req.method} ${req.path}`, 'info');
    next();
});

// Middleware
app.use(express.static('public'));
app.use(express.json());

// Hilfsfunktionen für Config
function loadConfig() {
    try {
        if (fs.existsSync(CONFIG_FILE)) {
            const data = fs.readFileSync(CONFIG_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        log('Fehler beim Laden der Config: ' + error.message, 'error');
    }
    return { apiKey: null };
}

function saveConfig(config) {
    try {
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
        log('Konfiguration erfolgreich gespeichert', 'info');
        return true;
    } catch (error) {
        log('Fehler beim Speichern der Config: ' + error.message, 'error');
        return false;
    }
}

// API-Key Verifizierung
async function verifyTMDBApiKey(apiKey) {
    try {
        const response = await fetch(
            `https://api.themoviedb.org/3/configuration?api_key=${apiKey}`
        );
        if (response.ok) {
            log('API-Key erfolgreich verifiziert', 'info');
            return true;
        }
        log(`API-Key Verifizierung fehlgeschlagen: ${response.status}`, 'warn');
        return false;
    } catch (error) {
        log('Fehler bei der API-Key-Verifizierung: ' + error.message, 'error');
        return false;
    }
}

// TMDB API Funktionen
async function fetchPopularMovies(apiKey, page = 1) {
    try {
        const response = await fetch(
            `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=de-DE&page=${page}`
        );
        if (!response.ok) {
            throw new Error('TMDB API Error: ' + response.status);
        }
        const data = await response.json();
        return data.results || [];
    } catch (error) {
        log('Fehler beim Abrufen der Filme: ' + error.message, 'error');
        return [];
    }
}

async function getRandomMovies(apiKey, count = 10) {
    try {
        // Hole mehrere Seiten, um einen größeren Pool zu haben (ca. 500 Filme = 25 Seiten)
        const totalPages = 25;
        const randomPages = [];
        
        // Wähle 5 zufällige Seiten aus
        for (let i = 0; i < 5; i++) {
            randomPages.push(Math.floor(Math.random() * totalPages) + 1);
        }
        
        log(`Lade Filme von Seiten: ${randomPages.join(', ')}`, 'info');
        
        // Hole alle Filme von den zufälligen Seiten
        const moviePromises = randomPages.map(page => fetchPopularMovies(apiKey, page));
        const movieArrays = await Promise.all(moviePromises);
        
        // Kombiniere alle Filme
        const allMovies = movieArrays.flat();
        
        // Mische und wähle 10 zufällige Filme
        const shuffled = allMovies.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, count);
        
        log(`${selected.length} zufällige Filme ausgewählt`, 'info');
        return selected;
    } catch (error) {
        log('Fehler beim Abrufen zufälliger Filme: ' + error.message, 'error');
        return [];
    }
}

function convertTMDBToMeta(movie) {
    return {
        id: `tmdb:${movie.id}`,
        type: 'movie',
        name: movie.title,
        poster: movie.poster_path 
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
            : 'https://via.placeholder.com/500x750?text=No+Poster',
        background: movie.backdrop_path 
            ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` 
            : undefined,
        description: movie.overview || 'Keine Beschreibung verfügbar',
        releaseInfo: movie.release_date ? movie.release_date.substring(0, 4) : undefined,
        imdbRating: movie.vote_average ? movie.vote_average.toFixed(1) : undefined
    };
}

// Konfigurationsseite
app.get('/configure', (req, res) => {
    res.sendFile(path.join(__dirname, 'configure', 'index.html'));
});

// API-Key speichern und verifizieren
app.post('/api/configure', async (req, res) => {
    const { apiKey } = req.body;
    
    if (!apiKey || apiKey.trim().length < 10) {
        return res.status(400).json({ 
            success: false, 
            message: 'Ungültiger API-Key' 
        });
    }
    
    // Verifiziere den API-Key mit TMDB
    const isValid = await verifyTMDBApiKey(apiKey);
    
    if (!isValid) {
        return res.status(401).json({ 
            success: false, 
            message: 'API-Key ist ungültig oder konnte nicht verifiziert werden. Bitte überprüfe deinen Key.' 
        });
    }
    
    // Speichere den API-Key
    const config = { apiKey: apiKey.trim() };
    const saved = saveConfig(config);
    
    if (!saved) {
        return res.status(500).json({ 
            success: false, 
            message: 'Fehler beim Speichern der Konfiguration' 
        });
    }
    
    // Verwende die tatsächliche Host-Adresse aus dem Request
    const host = req.get('host') || `127.0.0.1:${PORT}`;
    const protocol = req.protocol || 'http';
    
    res.json({ 
        success: true, 
        message: 'API-Key erfolgreich verifiziert und gespeichert!',
        manifestUrl: `${protocol}://${host}/manifest.json`
    });
});

// Manifest ohne API-Key in URL
app.get('/manifest.json', (req, res) => {
    const config = loadConfig();
    
    if (!config.apiKey) {
        return res.status(400).json({ 
            error: 'Addon nicht konfiguriert. Bitte besuche /configure' 
        });
    }
    
    const manifest = {
        id: 'de.tmdb.random.addon',
        version: '1.0.0',
        name: '🎲 Zufalls-Entdecker (TMDB)',
        description: 'Entdecke zufällige beliebte Filme aus TMDB',
        resources: ['catalog'],
        types: ['movie'],
        catalogs: [
            {
                type: 'movie',
                id: 'tmdb_random_discover',
                name: '🎲 Zufalls-Entdecker',
                extra: [{ name: 'skip', isRequired: false }]
            }
        ]
    };
    
    res.json(manifest);
});

// Catalog Handler
app.get('/catalog/:type/:id.json', async (req, res) => {
    const config = loadConfig();
    
    if (!config.apiKey) {
        log('Catalog-Anfrage ohne API-Key', 'warn');
        return res.status(400).json({ 
            metas: [],
            error: 'API-Key nicht konfiguriert' 
        });
    }
    
    const type = req.params.type;
    const id = req.params.id;
    
    if (type === 'movie' && id === 'tmdb_random_discover') {
        try {
            const movies = await getRandomMovies(config.apiKey, 10);
            const metas = movies.map(convertTMDBToMeta);
            
            log(`Catalog bereitgestellt: ${metas.length} Filme`, 'info');
            res.json({ metas });
        } catch (error) {
            log('Fehler im Catalog Handler: ' + error.message, 'error');
            res.json({ metas: [] });
        }
    } else {
        res.json({ metas: [] });
    }
});

// Root-Route
app.get('/', (req, res) => {
    res.redirect('/configure');
});

// Health Check Endpoint
app.get('/health', (req, res) => {
    const config = loadConfig();
    res.json({
        status: 'ok',
        configured: !!config.apiKey,
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Error Handler
app.use((err, req, res, next) => {
    log('Unbehandelter Fehler: ' + err.message, 'error');
    res.status(500).json({ error: 'Interner Serverfehler' });
});

// Server starten
app.listen(PORT, '0.0.0.0', () => {
    const config = loadConfig();
    console.log('\n🎬 ═══════════════════════════════════════════════════════');
    console.log('   Stremio TMDB Random Addon gestartet!');
    console.log('   ═══════════════════════════════════════════════════════');
    console.log(`   📝 Konfiguration: http://127.0.0.1:${PORT}/configure`);
    console.log(`   🔗 Manifest-URL:  http://127.0.0.1:${PORT}/manifest.json`);
    console.log(`   💚 Health Check:  http://127.0.0.1:${PORT}/health`);
    console.log('   ═══════════════════════════════════════════════════════');
    
    if (config.apiKey) {
        console.log('   ✅ API-Key ist konfiguriert');
    } else {
        console.log('   ⚠️  Bitte konfiguriere zuerst deinen API-Key');
    }
    console.log('   ═══════════════════════════════════════════════════════\n');
});
