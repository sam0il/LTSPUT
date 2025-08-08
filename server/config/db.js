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

dataPool.getFilteredTechnicians = (name, category) => {
    let sql = `SELECT id, name, category FROM SISIII2025_89231015_technicians WHERE 1=1`;
    const params = [];

    if (name) {
        sql += ` AND name LIKE ?`;
        params.push(`%${name}%`);
    }

    if (category) {
        sql += ` AND category = ?`;
        params.push(category);
    }

    return new Promise((resolve, reject) => {
        conn.query(sql, params, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
};



dataPool.becomeTechnician = (name, category) => {
    return new Promise((resolve, reject) => {
        const insertSql = `INSERT INTO SISIII2025_89231015_technicians (name, category) VALUES (?, ?)`;

        conn.query(insertSql, [name, category], (err, res) => {
            if (err) {
                reject(err);
            } else {
                resolve(res);
            }
        });
    });
};

// Create a new service request
dataPool.createServiceRequest = (userId, technicianId, description) => {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO SISIII2025_89231015_service_requests (user_id, technician_id, description)
            VALUES (?, ?, ?)
        `;
        conn.query(sql, [userId, technicianId, description], (err, res) => {
            if (err) reject(err);
            else resolve(res);
        });
    });
};


// Get all service requests for a user
dataPool.getUserServiceRequests = (userId) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT sr.*, t.name as technician_name 
            FROM SISIII2025_89231015_service_requests sr
            JOIN SISIII2025_89231015_technicians t ON sr.technician_id = t.id
            WHERE sr.user_id = ?
        `;
        conn.query(sql, [userId], (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
};

module.exports = dataPool;