const mysql = require('mysql2');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'webshop'
});

connection.query(
    'UPDATE termekek SET kep = REPLACE(kep, "kepek/", "")',
    (error, results) => {
        if (error) {
            console.error('Hiba:', error);
        } else {
            console.log('Képek elérési útja frissítve:', results);
        }
        connection.end();
        process.exit();
    }
);
