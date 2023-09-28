const mysql = require("mysql2");
require('dotenv').config()
const connection = mysql.createConnection(process.env.DATABASE_URL)
require("dotenv").config()
mysql.createConnection(process.env.DATABASE_URL)