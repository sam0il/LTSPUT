// server/config/db.js
const mysql = require('mysql2');

const conn = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DATABASE,
});

conn.connect((err) => {
  if (err) {
    console.log("Error connecting to database: " + err.message);
    return;
  }
  console.log(`Connection to database ${process.env.DB_DATABASE} established!`)
});

let dataPool = {};
dataPool.authenticateLogin = (name, password) => {
    return new Promise( (resolve, reject) => {
        conn.query(`SELECT * FROM SISIII2025_89231015_users WHERE name = ? and password = ?`, 
            [name, password], (err, res)=>{
                if(err){
                    reject(err);
                }
                resolve(res);
            })
    })
}


dataPool.registerUser=(name, password) => {
    return new Promise((resolve, reject) => {
        conn.query("INSERT INTO SISIII2025_89231015_users (id, name, password) VALUES (NULL, ?, ?)",
            [name, password], (err, res)=> {
                if(err){
                    reject(err);
                }
                resolve(res);
            })
    })
}
module.exports = dataPool;