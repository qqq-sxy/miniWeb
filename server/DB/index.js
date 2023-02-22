const mysql = require("mysql");

const db = mysql.createPool({
  host: "127.0.0.1",
  user: "root",
  password: "SXYsxy52$$",
  database: "graduation_project",
});

module.exports = db;
