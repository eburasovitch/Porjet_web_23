const mysql = require("mysql2");
require('dotenv').config()
const connection = mysql.createConnection(process.env.DATABASE_URL)

connection.connect(error =>{
    if (error) console.log("My SQL connection: " + error);
    else console.log("Sucessfully connected to the database")
})
module.exports = connection;