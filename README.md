# Webshop Project

Ez a projekt egy teljes értékű webáruház alkalmazás, amely React frontend és Node.js/Express backend technológiákkal készült.

## Funkciók

- Felhasználói regisztráció és bejelentkezés
- Termékek böngészése kategóriák szerint
- Kosár kezelése
- Rendelés leadása
- Kuponkódok kezelése
- Admin felület a termékek, rendelések és felhasználók kezeléséhez
- Recept keresés
- Felhasználói profil kezelése

## Telepítés

### Előfeltételek

- Node.js (v14 vagy újabb)
- MySQL (XAMPP vagy más MySQL szerver)
- Git

### Adatbázis beállítása

1. Indítsd el a MySQL szervert (pl. XAMPP Control Panel-ben)
2. Hozz létre egy új adatbázist `webshop_project` néven
3. Importáld az adatbázis sémát a `webshop_project.sql` fájlból

### Backend telepítése

1. Navigálj a backend mappába:
   ```
   cd backend
   ```

2. Telepítsd a függőségeket:
   ```
   npm install
   ```

3. Hozz létre egy `.env` fájlt a következő tartalommal (módosítsd a saját beállításaidnak megfelelően):
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=webshop_project
   JWT_SECRET=webshop-secret-key
   PORT=3001
   ```

4. Indítsd el a backend szervert:
   ```
   npm run dev
   ```

### Frontend telepítése

1. A projekt főkönyvtárában telepítsd a függőségeket:
   ```
   npm install
   ```

2. Indítsd el a frontend fejlesztői szervert:
   ```
   npm start
   ```

## Használat

### Felhasználói felület

1. Nyisd meg a böngészőben: `http://localhost:3000`
2. Regisztrálj egy új felhasználót vagy jelentkezz be
3. Böngéssz a termékek között, add hozzá őket a kosaradhoz
4. A kosár oldalon véglegesítsd a rendelést

### Admin felület

1. Jelentkezz be admin jogosultságú felhasználóval
   - Az admin felhasználó adatai megtalálhatók az `admin user.txt` fájlban
2. Navigálj az admin felületre: `http://localhost:3000/admin`
3. Itt kezelheted a termékeket, rendeléseket, felhasználókat és kuponokat

## Fejlesztői információk

### Projekt struktúra

- `backend/`: A backend szerver kódja
  - `controllers/`: API végpontok üzleti logikája
  - `models/`: Adatbázis modellek
  - `routes/`: API útvonalak
  - `middleware/`: Köztes réteg (pl. autentikáció)
  - `server.js`: A fő szerver alkalmazás

- `src/`: A frontend React alkalmazás
  - `components/`: React komponensek
  - `utils/`: Segédfüggvények

### API végpontok

- `/api/auth`: Autentikációs végpontok
- `/api/products`: Termék kezelés
- `/api/categories`: Kategória kezelés
- `/api/rendeles`: Rendelés kezelés
- `/api/kosar`: Kosár kezelés
- `/api/admin`: Admin funkciók

## Adatbázis

A projekt MySQL adatbázist használ. A séma a `webshop_project.sql` fájlban található.

## Hibaelhárítás

- Ha a backend nem tud csatlakozni az adatbázishoz, ellenőrizd a MySQL szerver futását és a `.env` fájl beállításait
- Ha a frontend nem tud csatlakozni a backendhez, ellenőrizd, hogy a backend szerver fut-e a 3001-es porton
- Ellenőrizd a konzol hibaüzeneteit további információkért

## Licenc

Ez a projekt oktatási célokra készült.
