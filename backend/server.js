const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/kepek', express.static('kepek')); // Új sor: képek kiszolgálása

// MySQL kapcsolat
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'webshop'
});

// Multer konfiguráció a képfeltöltéshez
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Adatbázis kapcsolódás
connection.connect((err) => {
    if (err) {
        console.error('MySQL kapcsolódási hiba:', err);
        return;
    }
    console.log('MySQL kapcsolódás sikeres');
    
    // Táblák létrehozása
    const createTables = `
        CREATE TABLE IF NOT EXISTS felhasznalok (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL UNIQUE,
            jelszo VARCHAR(255) NOT NULL,
            szerepkor ENUM('admin', 'user') DEFAULT 'user',
            vezeteknev VARCHAR(100),
            keresztnev VARCHAR(100),
            telefon VARCHAR(20),
            ceg_nev VARCHAR(255),
            adoszam VARCHAR(255),
            szamlazasi_cim TEXT,
            szallitasi_cim TEXT,
            letrehozas_datuma TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS termekek (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nev VARCHAR(255) NOT NULL,
            leiras TEXT,
            ar DECIMAL(10, 2) NOT NULL,
            akcio_ar DECIMAL(10, 2),
            keszlet INT NOT NULL DEFAULT 0,
            kategoria VARCHAR(100),
            kep_url VARCHAR(255),
            letrehozas_datuma TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS kosar (
            id INT AUTO_INCREMENT PRIMARY KEY,
            felhasznalo_id INT NOT NULL,
            termek_id INT NOT NULL,
            mennyiseg INT NOT NULL DEFAULT 1,
            FOREIGN KEY (felhasznalo_id) REFERENCES felhasznalok(id),
            FOREIGN KEY (termek_id) REFERENCES termekek(id)
        );

        CREATE TABLE IF NOT EXISTS rendelesek (
            id INT AUTO_INCREMENT PRIMARY KEY,
            felhasznalo_id INT NOT NULL,
            letrehozva TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (felhasznalo_id) REFERENCES felhasznalok(id)
        );

        CREATE TABLE IF NOT EXISTS rendeles_termekek (
            id INT AUTO_INCREMENT PRIMARY KEY,
            rendeles_id INT NOT NULL,
            termek_id INT NOT NULL,
            mennyiseg INT NOT NULL,
            egysegar DECIMAL(10, 2) NOT NULL,
            FOREIGN KEY (rendeles_id) REFERENCES rendelesek(id),
            FOREIGN KEY (termek_id) REFERENCES termekek(id)
        );
    `;
    
    connection.query(createTables, (err) => {
        if (err) {
            console.error('Tábla létrehozási hiba:', err);
            return;
        }
        console.log('Táblák ellenőrizve/létrehozva');
    });
});

// JWT ellenőrzés middleware
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ uzenet: 'Nincs hozzáférési token' });
    }

    try {
        const decoded = jwt.verify(token, 'titkos_kulcs');
        req.userId = decoded.id;
        next();
    } catch (error) {
        return res.status(401).json({ uzenet: 'Érvénytelen token' });
    }
};

// Admin jogosultság ellenőrzése
const verifyAdmin = async (req, res, next) => {
    try {
        const [users] = await connection.promise().query(
            'SELECT szerepkor FROM felhasznalok WHERE id = ?',
            [req.userId]
        );

        if (users.length === 0 || users[0].szerepkor !== 'admin') {
            return res.status(403).json({ uzenet: 'Adminisztrátori jogosultság szükséges' });
        }

        next();
    } catch (error) {
        res.status(500).json({ uzenet: 'Szerver hiba' });
    }
};

// Bejelentkezési végpont
app.post('/api/bejelentkezes', async (req, res) => {
    try {
        const { email, jelszo } = req.body;
        console.log('Bejelentkezési kísérlet:', email); // Debug log

        // Felhasználó keresése
        const [felhasznalok] = await connection.promise().query(
            'SELECT * FROM felhasznalok WHERE email = ?',
            [email]
        );

        if (felhasznalok.length === 0) {
            console.log('Felhasználó nem található:', email); // Debug log
            return res.status(400).json({ uzenet: 'Hibás email vagy jelszó' });
        }

        const felhasznalo = felhasznalok[0];
        console.log('Tárolt jelszó hash:', felhasznalo.jelszo); // Debug log

        // Jelszó ellenőrzése
        const jelszoEgyezik = await bcrypt.compare(jelszo, felhasznalo.jelszo);
        console.log('Jelszó egyezés:', jelszoEgyezik); // Debug log

        if (!jelszoEgyezik) {
            return res.status(400).json({ uzenet: 'Hibás email vagy jelszó' });
        }

        // Token generálása
        const token = jwt.sign(
            { 
                id: felhasznalo.id,
                email: felhasznalo.email,
                szerepkor: felhasznalo.szerepkor
            },
            'titkos_kulcs',
            { expiresIn: '24h' }
        );

        // Sikeres válasz
        res.json({
            token,
            felhasznalo: {
                id: felhasznalo.id,
                email: felhasznalo.email,
                szerepkor: felhasznalo.szerepkor,
                vezeteknev: felhasznalo.vezeteknev,
                keresztnev: felhasznalo.keresztnev
            }
        });
    } catch (error) {
        console.error('Bejelentkezési hiba:', error);
        res.status(500).json({ uzenet: 'Szerver hiba történt' });
    }
});

// Regisztrációs végpont
app.post('/api/regisztracio', async (req, res) => {
    const { email, jelszo, vezeteknev, keresztnev, telefon } = req.body;

    if (!email || !jelszo || !vezeteknev || !keresztnev || !telefon) {
        return res.status(400).json({ uzenet: 'Minden mező kitöltése kötelező!' });
    }

    try {
        // Ellenőrizzük, hogy létezik-e már a felhasználó
        const [existingUser] = await connection.promise().query(
            'SELECT id FROM felhasznalok WHERE email = ?',
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({ uzenet: 'Ez az email cím már regisztrálva van!' });
        }

        // Jelszó hashelése
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(jelszo, salt);

        // Felhasználó létrehozása
        const [result] = await connection.promise().query(
            `INSERT INTO felhasznalok (email, jelszo, vezeteknev, keresztnev, telefon) 
             VALUES (?, ?, ?, ?, ?)`,
            [email, hashedPassword, vezeteknev, keresztnev, telefon]
        );

        // JWT token generálása
        const token = jwt.sign(
            { id: result.insertId, email: email },
            'titkos_kulcs',
            { expiresIn: '1h' }
        );

        res.json({
            token,
            felhasznalo: {
                id: result.insertId,
                email,
                vezeteknev,
                keresztnev,
                szerepkor: 'felhasznalo'
            }
        });
    } catch (error) {
        console.error('Hiba a regisztráció során:', error);
        res.status(500).json({ uzenet: 'Szerver hiba' });
    }
});

// Termékek lekérése
app.get('/api/termekek', async (req, res) => {
    try {
        let query = 'SELECT * FROM termekek WHERE 1=1';
        const queryParams = [];

        if (req.query.kategoria) {
            query += ' AND kategoria = ?';
            queryParams.push(req.query.kategoria);
        }

        if (req.query.minAr) {
            query += ' AND ar >= ?';
            queryParams.push(req.query.minAr);
        }

        if (req.query.maxAr) {
            query += ' AND ar <= ?';
            queryParams.push(req.query.maxAr);
        }

        if (req.query.kereses) {
            query += ' AND (nev LIKE ? OR leiras LIKE ?)';
            const searchTerm = `%${req.query.kereses}%`;
            queryParams.push(searchTerm, searchTerm);
        }

        const [termekek] = await connection.promise().query(query, queryParams);
        res.json(termekek);
    } catch (error) {
        console.error('Hiba a termékek lekérésekor:', error);
        res.status(500).json({ uzenet: 'Szerver hiba történt' });
    }
});

// Termékek lekérése
app.get('/api/products', async (req, res) => {
    try {
        const [termekek] = await connection.promise().query(
            `SELECT t.*, k.nev as kategoria_nev 
             FROM termekek t 
             LEFT JOIN kategoriak k ON t.kategoria_id = k.id 
             WHERE t.aktiv = 1`
        );
        
        // Módosítjuk a képek elérési útját - eltávolítjuk a dupla kepek mappát
        const modositottTermekek = termekek.map(termek => ({
            ...termek,
            kep: termek.kep ? `http://localhost:3001/kepek/${termek.kep.replace('kepek/', '')}` : null
        }));
        
        console.log('Lekért termékek:', modositottTermekek);
        res.json(modositottTermekek);
    } catch (error) {
        console.error('Hiba a termékek lekérésénél:', error);
        res.status(500).json({ uzenet: 'Szerver hiba történt' });
    }
});

app.get('/api/products', (req, res) => {
  const query = 'SELECT * FROM termekek';
  connection.query(query, (error, results) => {
    if (error) {
      return res.status(500).json({ error: 'Adatbázis hiba' });
    }
    res.json(results);
  });
});

// Kosár kezelése
app.get('/api/kosar', verifyToken, async (req, res) => {
    try {
        const [kosarTermekek] = await connection.promise().query(
            `SELECT k.*, t.* 
             FROM kosar k 
             JOIN termekek t ON k.termek_id = t.id 
             WHERE k.felhasznalo_id = ?`,
            [req.userId]
        );
        res.json(kosarTermekek);
    } catch (error) {
        console.error('Hiba a kosár lekérésekor:', error);
        res.status(500).json({ uzenet: 'Szerver hiba történt' });
    }
});

app.post('/api/kosar/add', verifyToken, async (req, res) => {
    try {
        const { termekId, mennyiseg } = req.body;

        // Ellenőrizzük, hogy van-e már ilyen termék a kosárban
        const [existing] = await connection.promise().query(
            'SELECT * FROM kosar WHERE felhasznalo_id = ? AND termek_id = ?',
            [req.userId, termekId]
        );

        if (existing.length > 0) {
            // Ha már van, növeljük a mennyiséget
            await connection.promise().query(
                'UPDATE kosar SET mennyiseg = mennyiseg + ? WHERE felhasznalo_id = ? AND termek_id = ?',
                [mennyiseg, req.userId, termekId]
            );
        } else {
            // Ha még nincs, új tételt szúrunk be
            await connection.promise().query(
                'INSERT INTO kosar (felhasznalo_id, termek_id, mennyiseg) VALUES (?, ?, ?)',
                [req.userId, termekId, mennyiseg]
            );
        }

        res.json({ uzenet: 'Termék hozzáadva a kosárhoz' });
    } catch (error) {
        console.error('Hiba a kosárhoz adáskor:', error);
        res.status(500).json({ uzenet: 'Szerver hiba történt' });
    }
});

app.put('/api/kosar/update', verifyToken, async (req, res) => {
    try {
        const { termekId, mennyiseg } = req.body;

        if (mennyiseg <= 0) {
            await connection.promise().query(
                'DELETE FROM kosar WHERE felhasznalo_id = ? AND termek_id = ?',
                [req.userId, termekId]
            );
        } else {
            await connection.promise().query(
                'UPDATE kosar SET mennyiseg = ? WHERE felhasznalo_id = ? AND termek_id = ?',
                [mennyiseg, req.userId, termekId]
            );
        }

        res.json({ uzenet: 'Kosár frissítve' });
    } catch (error) {
        console.error('Hiba a kosár frissítésekor:', error);
        res.status(500).json({ uzenet: 'Szerver hiba történt' });
    }
});

app.delete('/api/kosar/remove/:termekId', verifyToken, async (req, res) => {
    try {
        await connection.promise().query(
            'DELETE FROM kosar WHERE felhasznalo_id = ? AND termek_id = ?',
            [req.userId, req.params.termekId]
        );
        res.json({ uzenet: 'Termék törölve a kosárból' });
    } catch (error) {
        console.error('Hiba a termék törlésekor:', error);
        res.status(500).json({ uzenet: 'Szerver hiba történt' });
    }
});

// Admin végpontok
app.get('/api/admin/termekek', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const [termekek] = await connection.promise().query('SELECT * FROM termekek');
        res.json(termekek);
    } catch (error) {
        console.error('Hiba a termékek lekérésekor:', error);
        res.status(500).json({ uzenet: 'Szerver hiba történt' });
    }
});

app.post('/api/admin/termekek', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { nev, leiras, ar, akcio_ar, keszlet, kategoria, kep_url } = req.body;
        const [result] = await connection.promise().query(
            'INSERT INTO termekek (nev, leiras, ar, akcio_ar, keszlet, kategoria, kep_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nev, leiras, ar, akcio_ar, keszlet, kategoria, kep_url]
        );
        res.status(201).json({ id: result.insertId, uzenet: 'Termék sikeresen hozzáadva' });
    } catch (error) {
        console.error('Hiba a termék hozzáadásakor:', error);
        res.status(500).json({ uzenet: 'Szerver hiba történt' });
    }
});

app.put('/api/admin/termekek/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { nev, leiras, ar, akcio_ar, keszlet, kategoria, kep_url } = req.body;
        await connection.promise().query(
            'UPDATE termekek SET nev = ?, leiras = ?, ar = ?, akcio_ar = ?, keszlet = ?, kategoria = ?, kep_url = ? WHERE id = ?',
            [nev, leiras, ar, akcio_ar, keszlet, kategoria, kep_url, req.params.id]
        );
        res.json({ uzenet: 'Termék sikeresen frissítve' });
    } catch (error) {
        console.error('Hiba a termék frissítésekor:', error);
        res.status(500).json({ uzenet: 'Szerver hiba történt' });
    }
});

app.delete('/api/admin/termekek/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        await connection.promise().query('DELETE FROM termekek WHERE id = ?', [req.params.id]);
        res.json({ uzenet: 'Termék sikeresen törölve' });
    } catch (error) {
        console.error('Hiba a termék törlésekor:', error);
        res.status(500).json({ uzenet: 'Szerver hiba történt' });
    }
});

// Felhasználók lekérése (csak admin számára)
app.get('/api/admin/felhasznalok', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const [felhasznalok] = await connection.promise().query(
            'SELECT id, email, szerepkor FROM felhasznalok'
        );
        res.json(felhasznalok);
    } catch (error) {
        console.error('Hiba a felhasználók lekérésénél:', error);
        res.status(500).json({ uzenet: 'Szerver hiba' });
    }
});

// Felhasználó szerepkörének módosítása (csak admin számára)
app.put('/api/admin/felhasznalok/:id/szerepkor', verifyToken, verifyAdmin, async (req, res) => {
    const { id } = req.params;
    const { isAdmin } = req.body;
    const szerepkor = isAdmin ? 'admin' : 'felhasznalo';

    try {
        // Ellenőrizzük, hogy nem az utolsó admin jogosultságát próbáljuk-e elvenni
        if (!isAdmin) {
            const [adminok] = await connection.promise().query(
                'SELECT COUNT(*) as adminCount FROM felhasznalok WHERE szerepkor = "admin"'
            );
            if (adminok[0].adminCount <= 1) {
                const [currentUser] = await connection.promise().query(
                    'SELECT szerepkor FROM felhasznalok WHERE id = ?',
                    [id]
                );
                if (currentUser[0]?.szerepkor === 'admin') {
                    return res.status(400).json({ 
                        uzenet: 'Nem lehet eltávolítani az utolsó admin jogosultságot!' 
                    });
                }
            }
        }

        await connection.promise().query(
            'UPDATE felhasznalok SET szerepkor = ? WHERE id = ?',
            [szerepkor, id]
        );
        res.json({ uzenet: 'Szerepkör sikeresen módosítva' });
    } catch (error) {
        console.error('Hiba a szerepkör módosításánál:', error);
        res.status(500).json({ uzenet: 'Szerver hiba' });
    }
});

// Képfeltöltés
app.post('/api/admin/upload-image', verifyToken, verifyAdmin, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ uzenet: 'Nincs feltöltött fájl' });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ imageUrl });
});

// Felhasználói profil lekérése
app.get('/api/felhasznalo/profil', verifyToken, async (req, res) => {
    try {
        const [felhasznalo] = await connection.promise().query(
            'SELECT id, email, vezeteknev, keresztnev, telefon, ceg_nev, adoszam, szamlazasi_cim, szallitasi_cim FROM felhasznalok WHERE id = ?',
            [req.userId]
        );
        
        if (felhasznalo.length === 0) {
            return res.status(404).json({ uzenet: 'Felhasználó nem található' });
        }
        
        res.json(felhasznalo[0]);
    } catch (error) {
        console.error('Hiba a profil lekérésénél:', error);
        res.status(500).json({ uzenet: 'Szerver hiba' });
    }
});

// Felhasználói profil frissítése
app.put('/api/felhasznalo/profil', verifyToken, async (req, res) => {
    const { vezeteknev, keresztnev, telefon, ceg_nev, adoszam, szamlazasi_cim, szallitasi_cim } = req.body;
    
    try {
        await connection.promise().query(
            `UPDATE felhasznalok 
             SET vezeteknev = ?, keresztnev = ?, telefon = ?, 
                 ceg_nev = ?, adoszam = ?, szamlazasi_cim = ?, szallitasi_cim = ?
             WHERE id = ?`,
            [vezeteknev, keresztnev, telefon, ceg_nev, adoszam, szamlazasi_cim, szallitasi_cim, req.userId]
        );
        
        res.json({ uzenet: 'Profil sikeresen frissítve' });
    } catch (error) {
        console.error('Hiba a profil frissítésénél:', error);
        res.status(500).json({ uzenet: 'Szerver hiba' });
    }
});

// Felhasználó rendeléseinek lekérése
app.get('/api/felhasznalo/rendelesek', verifyToken, async (req, res) => {
    try {
        // Lekérjük a rendeléseket
        const [rendelesek] = await connection.promise().query(
            `SELECT r.*, GROUP_CONCAT(
                JSON_OBJECT(
                    'id', rt.id,
                    'termek_id', rt.termek_id,
                    'nev', t.nev,
                    'mennyiseg', rt.mennyiseg,
                    'egysegar', rt.egysegar
                )
             ) as termekek
             FROM rendelesek r
             LEFT JOIN rendeles_termekek rt ON r.id = rt.rendeles_id
             LEFT JOIN termekek t ON rt.termek_id = t.id
             WHERE r.felhasznalo_id = ?
             GROUP BY r.id
             ORDER BY r.letrehozva DESC`,
            [req.userId]
        );

        // Átalakítjuk a termékek stringet JSON objektummá
        const formattedRendelesek = rendelesek.map(rendeles => ({
            ...rendeles,
            termekek: JSON.parse(`[${rendeles.termekek}]`)
        }));

        res.json(formattedRendelesek);
    } catch (error) {
        console.error('Hiba a rendelések lekérésénél:', error);
        res.status(500).json({ uzenet: 'Szerver hiba' });
    }
});

// Kategóriák lekérése
app.get('/api/categories', async (req, res) => {
    try {
        const [kategoriak] = await connection.promise().query(
            'SELECT * FROM kategoriak ORDER BY nev'
        );
        res.json(kategoriak);
    } catch (error) {
        console.error('Hiba a kategóriák lekérésénél:', error);
        res.status(500).json({ uzenet: 'Szerver hiba történt' });
    }
});

// Port beállítása
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Szerver fut a ${PORT} porton`);
});
