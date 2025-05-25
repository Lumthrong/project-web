const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',      // or your MySQL username
  password: '',      // your MySQL password
  database: 'school'
});

module.exports = pool.promise(); // use promise wrapper
