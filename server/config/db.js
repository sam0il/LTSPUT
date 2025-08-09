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
// dataPool.authenticateLogin = (name, password) => {
//     return new Promise( (resolve, reject) => {
//         conn.query(`SELECT * FROM SISIII2025_89231015_users WHERE name = ? and password = ?`, 
//             [name, password], (err, res)=>{
//                 if(err){
//                     reject(err);
//                 }
//                 resolve(res);
//             })
//     })
// }

dataPool.authenticateLogin = (name, password) => {
    return new Promise((resolve, reject) => {
        conn.query(
            `SELECT u.*, 
                    CASE WHEN t.id IS NOT NULL THEN 1 ELSE 0 END AS isTechnician,
                    t.id AS technicianId
             FROM SISIII2025_89231015_users u
             LEFT JOIN SISIII2025_89231015_technicians t
                 ON u.id = t.user_id
             WHERE u.name = ? AND u.password = ?`,
            [name, password],
            (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            }
        );
    });
};



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




// In db.js
dataPool.becomeTechnician = (userId, category) => {
  return new Promise((resolve, reject) => {
    // First get user info
    conn.query(
      'SELECT name FROM SISIII2025_89231015_users WHERE id = ?',
      [userId],
      (err, userResults) => {
        if (err) return reject(err);
        if (userResults.length === 0) return reject(new Error('User not found'));
        
        const userName = userResults[0].name;
        
        // Then insert technician record
        const insertSql = `
          INSERT INTO SISIII2025_89231015_technicians 
            (user_id, name, category) 
          VALUES (?, ?, ?)
        `;
        
        conn.query(
          insertSql, 
          [userId, userName, category], 
          (err, res) => {
            if (err) reject(err);
            else resolve({
              insertId: res.insertId,
              userName,
              category
            });
          }
        );
      }
    );
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



dataPool.getTechnicianServiceRequests = (technicianId) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT sr.*, u.name as user_name
            FROM SISIII2025_89231015_service_requests sr
            JOIN SISIII2025_89231015_users u ON sr.user_id = u.id
            WHERE sr.technician_id = ?
        `;
        conn.query(sql, [technicianId], (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
};

dataPool.acceptServiceRequest = (requestId) => {
    return new Promise((resolve, reject) => {
        const sql = `
            UPDATE SISIII2025_89231015_service_requests
            SET status = 'accepted'
            WHERE id = ?
        `;
        conn.query(sql, [requestId], (err, res) => {
            if (err) reject(err);
            else resolve(res);
        });
    });
};

// dataPool.submitReview = (requestId, userId, stars, comment) => {
//   const sql = `
//     INSERT INTO service_reviews (request_id, user_id, stars, comment)
//     VALUES (?, ?, ?, ?)
//   `;
//   return new Promise(...);
// };

dataPool.finishServiceRequest = (requestId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE SISIII2025_89231015_service_requests
      SET status = 'finished'
      WHERE id = ?
    `;
    conn.query(sql, [requestId], (err, res) => {
      if (err) reject(err);
      else resolve(res);
    });
  });
};


dataPool.canRateRequest = (requestId, userId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT status, technician_id 
      FROM SISIII2025_89231015_service_requests 
      WHERE id = ? AND user_id = ?
    `;
    conn.query(sql, [requestId, userId], (err, results) => {
      if (err) reject(err);
      else resolve(results[0]); // Return the first row or undefined
    });
  });
};


dataPool.canTechnicianFinishRequest = (requestId, technicianId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT id 
      FROM SISIII2025_89231015_service_requests 
      WHERE id = ? AND technician_id = ? AND status = 'accepted'
    `;
    conn.query(sql, [requestId, technicianId], (err, results) => {
      if (err) reject(err);
      else resolve(results.length > 0);
    });
  });
};

dataPool.createRating = (requestId, userId, technicianId, stars, comment, repair_lasted) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO SISIII2025_89231015_ratings 
        (request_id, user_id, technician_id, stars, comment, repair_lasted)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    conn.query(sql, [
      requestId, 
      userId, 
      technicianId, 
      stars, 
      comment, 
      repair_lasted
    ], (err, res) => {
      if (err) reject(err);
      else resolve(res.insertId);
    });
  });
};


// Decline service request
// Add decline function
dataPool.declineServiceRequest = (requestId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE SISIII2025_89231015_service_requests
      SET status = 'declined'
      WHERE id = ?
    `;
    conn.query(sql, [requestId], (err, res) => {
      if (err) reject(err);
      else resolve(res.affectedRows > 0);
    });
  });
};

dataPool.canTechnicianUpdateRequest = (requestId, technicianId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT id 
      FROM SISIII2025_89231015_service_requests 
      WHERE id = ? AND technician_id = ? AND status = 'pending'
    `;
    conn.query(sql, [requestId, technicianId], (err, results) => {
      if (err) reject(err);
      else resolve(results.length > 0);
    });
  });
};

dataPool.getRequestDetailsForUser = (requestId, userId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT t.name AS technician_name
      FROM SISIII2025_89231015_service_requests sr
      JOIN SISIII2025_89231015_technicians t ON sr.technician_id = t.id
      WHERE sr.id = ? AND sr.user_id = ?
    `;
    conn.query(sql, [requestId, userId], (err, results) => {
      if (err) reject(err);
      else resolve(results[0]); // Return the first row or undefined
    });
  });
};


dataPool.isRequestOwner = (requestId, technicianId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT id 
      FROM SISIII2025_89231015_service_requests 
      WHERE id = ? AND technician_id = ?
    `;
    conn.query(sql, [requestId, technicianId], (err, results) => {
      if (err) reject(err);
      else resolve(results.length > 0);
    });
  });
};

dataPool.updateRequestStatus = (requestId, status) => {
  const validStatuses = ['pending', 'accepted', 'declined', 'finished'];
  if (!validStatuses.includes(status)) {
    return Promise.reject(new Error(`Invalid status: ${status}`));
  }
  
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE SISIII2025_89231015_service_requests
      SET status = ?
      WHERE id = ?
    `;
    conn.query(sql, [status, requestId], (err, res) => {
      if (err) reject(err);
      else resolve(res.affectedRows > 0);
    });
  });
};

// Check if request can be transitioned to a new status
dataPool.canChangeStatus = (requestId, technicianId, requiredStatus, newStatus) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT id 
      FROM SISIII2025_89231015_service_requests 
      WHERE id = ? 
        AND technician_id = ?
        AND status = ?
    `;
    conn.query(sql, [requestId, technicianId, requiredStatus], (err, results) => {
      if (err) reject(err);
      else resolve({
        canChange: results.length > 0,
        newStatus
      });
    });
  });
};
module.exports = dataPool;