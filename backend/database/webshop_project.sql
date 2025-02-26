-- Adatbázis létrehozása és kiválasztása
DROP DATABASE IF EXISTS webshop_project;
CREATE DATABASE IF NOT EXISTS webshop_project
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE webshop_project;

-- Felhasználók (vevo) tábla létrehozása
CREATE TABLE IF NOT EXISTS felhasznalok (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  jelszo VARCHAR(255) NOT NULL,
  vezeteknev VARCHAR(100) NOT NULL,
  keresztnev VARCHAR(100) NOT NULL,
  telefon VARCHAR(20),
  szerepkor ENUM('felhasznalo', 'admin') NOT NULL DEFAULT 'felhasznalo',
  szuletesi_datum DATE,
  iranyitoszam INT(11),
  telepules VARCHAR(255),
  kozterulet VARCHAR(255),
  hazszam VARCHAR(50),
  egyeb TEXT,
  szamlazasi_nev VARCHAR(255),
  szamlazasi_iranyitoszam INT(11),
  szamlazasi_telepules VARCHAR(255),
  szamlazasi_kozterulet VARCHAR(255),
  szamlazasi_hazszam VARCHAR(50),
  szamlazasi_egyeb TEXT,
  adoszam VARCHAR(50),
  szallitasi_nev VARCHAR(255),
  szallitasi_iranyitoszam INT(11),
  szallitasi_telepules VARCHAR(255),
  szallitasi_kozterulet VARCHAR(255),
  szallitasi_hazszam VARCHAR(50),
  szallitasi_egyeb TEXT,
  hirlevel TINYINT(1) DEFAULT 0,
  email_megerositva TINYINT(1) DEFAULT 0,
  megerosito_token VARCHAR(100),
  token_lejar DATETIME,
  letrehozva TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  utolso_belepes TIMESTAMP NULL,
  aktiv TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Termék kategóriák (csoport) tábla létrehozása
CREATE TABLE IF NOT EXISTS kategoriak (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nev VARCHAR(255) NOT NULL,
  szulo_kategoria INT(11),
  hivatkozas VARCHAR(255),
  tizennyolc_plusz TINYINT(1) DEFAULT 0,
  FOREIGN KEY (szulo_kategoria) REFERENCES kategoriak(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Termékek tábla létrehozása
CREATE TABLE IF NOT EXISTS termekek (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nev VARCHAR(255) NOT NULL,
  ar INT NOT NULL,
  egysegar INT,
  kategoria_id INT,
  leiras TEXT,
  kiszereles VARCHAR(255),
  keszlet INT NOT NULL DEFAULT 0,
  akcios TINYINT(1) DEFAULT 0,
  akcios_ar INT,
  akcio_kezdete DATE,
  akcio_vege DATE,
  hivatkozas VARCHAR(255),
  ajanlott_termekek VARCHAR(255),
  tizennyolc_plusz TINYINT(1) DEFAULT 0,
  afa_kulcs VARCHAR(50),
  meret VARCHAR(100),
  szin VARCHAR(100),
  kep VARCHAR(255),
  letrehozva TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modositva TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  aktiv TINYINT(1) DEFAULT 1,
  FOREIGN KEY (kategoria_id) REFERENCES kategoriak(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Áruház árak tábla létrehozása
CREATE TABLE IF NOT EXISTS aruhaz_arak (
  id INT AUTO_INCREMENT PRIMARY KEY,
  termek_id INT NOT NULL,
  aruhaz_nev VARCHAR(255) NOT NULL,
  ar FLOAT NOT NULL,
  url VARCHAR(255),
  FOREIGN KEY (termek_id) REFERENCES termekek(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Receptek tábla létrehozása
CREATE TABLE IF NOT EXISTS receptek (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nev VARCHAR(255) NOT NULL,
  link VARCHAR(255) NOT NULL,
  kulcsszo VARCHAR(255) NOT NULL,
  hozzavalok TEXT NOT NULL,
  leiras TEXT NOT NULL,
  letrehozva TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Rendelések tábla létrehozása
CREATE TABLE IF NOT EXISTS rendelesek (
  id INT AUTO_INCREMENT PRIMARY KEY,
  felhasznalo_id INT NOT NULL,
  rendeles_szam VARCHAR(20) NOT NULL,
  osszeg INT NOT NULL,
  statusz ENUM('új', 'feldolgozás alatt', 'szállítás alatt', 'teljesítve', 'törölve') NOT NULL DEFAULT 'új',
  szamlazasi_nev VARCHAR(200) NOT NULL,
  szamlazasi_cim TEXT NOT NULL,
  szallitasi_nev VARCHAR(200) NOT NULL,
  szallitasi_cim TEXT NOT NULL,
  adoszam VARCHAR(20),
  megjegyzes TEXT,
  letrehozva TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modositva TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (felhasznalo_id) REFERENCES felhasznalok(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Rendelés tételek tábla létrehozása
CREATE TABLE IF NOT EXISTS rendeles_tetelek (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rendeles_id INT NOT NULL,
  termek_id INT NOT NULL,
  mennyiseg INT NOT NULL DEFAULT 1,
  egysegar INT NOT NULL,
  FOREIGN KEY (rendeles_id) REFERENCES rendelesek(id) ON DELETE CASCADE,
  FOREIGN KEY (termek_id) REFERENCES termekek(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Kosár tábla létrehozása
CREATE TABLE IF NOT EXISTS kosar (
  id INT AUTO_INCREMENT PRIMARY KEY,
  felhasznalo_id INT NOT NULL,
  termek_id INT NOT NULL,
  mennyiseg INT NOT NULL DEFAULT 1,
  letrehozva TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (felhasznalo_id) REFERENCES felhasznalok(id) ON DELETE CASCADE,
  FOREIGN KEY (termek_id) REFERENCES termekek(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexek létrehozása a gyorsabb kereséshez
CREATE INDEX IF NOT EXISTS idx_termek_kategoria ON termekek(kategoria_id);
CREATE INDEX IF NOT EXISTS idx_felhasznalo_email ON felhasznalok(email);
CREATE INDEX IF NOT EXISTS idx_rendeles_szam ON rendelesek(rendeles_szam);

-- Alapértelmezett kategóriák beszúrása
INSERT INTO kategoriak (nev, szulo_kategoria, hivatkozas, tizennyolc_plusz) VALUES
('Háztartási', NULL, 'haztartasi', 0),
('Édességek', NULL, 'edessegek', 0),
('18+', NULL, '18-plusz', 1),
('Étel', NULL, 'etelek', 0);

-- Admin felhasználó létrehozása (jelszó: Admin123!)
INSERT INTO felhasznalok 
(email, jelszo, vezeteknev, keresztnev, telefon, szerepkor, email_megerositva, aktiv) 
VALUES 
('admin@webshop.hu', '$2b$10$8KzQ9.QQ9LWZ2GXzQ2ZUyOtU4JyNmUCFGBF1Ow.9s4p1qR5zF5Hl2', 'Admin', 'Admin', '+36201234567', 'admin', 1, 1);

-- Példa termékek beszúrása
INSERT INTO termekek (nev, ar, kategoria_id, leiras, keszlet, kep, aktiv) VALUES
('Milka csoki', 1600, 2, 'Finom tejcsokoládé', 1500, 'kepek/milka.jpg', 1),
('Banán', 450, 4, 'Friss banán', 213, 'kepek/banan.jpg', 1),
('Serpenyő', 7500, 1, 'Kiváló minőségű serpenyő', 1000, 'kepek/serpenyo.jpg', 1),
('Chivas Regal', 7500, 3, 'Prémium whiskey', 400, 'kepek/chivas.jpg', 1),
('Csirkemell', 1500, 4, 'Friss csirkemell', 476, 'kepek/csirkemell.jpg', 1);

-- Trigger a termékek módosításának naplózásához
DELIMITER //
CREATE TRIGGER IF NOT EXISTS termek_modositas_trigger
BEFORE UPDATE ON termekek
FOR EACH ROW
BEGIN
    SET NEW.modositva = CURRENT_TIMESTAMP;
END;//
DELIMITER ;
