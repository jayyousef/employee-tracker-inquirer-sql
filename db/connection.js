require('dotenv').config();
const mysql = require('mysql');

const DB_NAME=process.env.DB_NAME
const password=process.env.DB_PASSWORD
const DB_USER = process.env.DB_USER

// create the connection information for the sql database
const connection = mysql.createConnection({
  host: 'localhost',

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: DB_USER,

  // Your password
  password: password,
  database: DB_NAME
});




module.exports = connection ;
