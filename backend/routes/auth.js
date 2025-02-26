const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const { body, validationResult } = require('express-validator');

// Adatbázis kapcsolat konfigurálása
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'webshop'
};

// Regisztráció validáció
const registerValidation = [
  body('email').isEmail().withMessage('Érvénytelen email cím'),
  body('jelszo').isLength({ min: 6 }).withMessage('A jelszónak legalább 6 karakter hosszúnak kell lennie'),
  body('vezeteknev').notEmpty().withMessage('A vezetéknév megadása kötelező'),
  body('keresztnev').notEmpty().withMessage('A keresztnév megadása kötelező'),
  body('telefon').notEmpty().withMessage('A telefonszám megadása kötelező')
];

// Regisztráció
router.post('/register', registerValidation, async (req, res) => {
  try {
    // Validációs hibák ellenőrzése
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const connection = await mysql.createConnection(dbConfig);
    
    // Email cím ellenőrzése
    const [existingUsers] = await connection.execute(
      'SELECT id FROM felhasznalok WHERE email = ?',
      [req.body.email]
    );

    if (existingUsers.length > 0) {
      await connection.end();
      return res.status(400).json({ error: 'Ez az email cím már regisztrálva van' });
    }

    // Jelszó hashelése
    const hashedPassword = await bcrypt.hash(req.body.jelszo, 10);

    // Felhasználó beszúrása
    const [result] = await connection.execute(
      'INSERT INTO felhasznalok (email, jelszo, vezeteknev, keresztnev, telefon) VALUES (?, ?, ?, ?, ?)',
      [req.body.email, hashedPassword, req.body.vezeteknev, req.body.keresztnev, req.body.telefon]
    );

    await connection.end();

    res.status(201).json({
      message: 'Sikeres regisztráció',
      userId: result.insertId
    });
  } catch (error) {
    console.error('Regisztrációs hiba:', error);
    res.status(500).json({ error: 'Hiba történt a regisztráció során' });
  }
});

// Bejelentkezés
router.post('/login', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Felhasználó keresése
    const [users] = await connection.execute(
      'SELECT * FROM felhasznalok WHERE email = ? AND aktiv = 1',
      [req.body.email]
    );

    if (users.length === 0) {
      await connection.end();
      return res.status(401).json({ error: 'Hibás email cím vagy jelszó' });
    }

    const user = users[0];

    // Jelszó ellenőrzése
    const validPassword = await bcrypt.compare(req.body.jelszo, user.jelszo);
    if (!validPassword) {
      await connection.end();
      return res.status(401).json({ error: 'Hibás email cím vagy jelszó' });
    }

    // Utolsó belépés frissítése
    await connection.execute(
      'UPDATE felhasznalok SET utolso_belepes = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );

    await connection.end();

    // JWT token generálása
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        szerepkor: user.szerepkor
      },
      'your-jwt-secret',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        vezeteknev: user.vezeteknev,
        keresztnev: user.keresztnev,
        szerepkor: user.szerepkor
      }
    });
  } catch (error) {
    console.error('Bejelentkezési hiba:', error);
    res.status(500).json({ error: 'Hiba történt a bejelentkezés során' });
  }
});

module.exports = router;
