const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const queries = require('../db/queries/queries');
const { isInteger } = require("./utility/utility.js");

const path = require("path");
const config = require("config");

let router = express.Router();

const DB_FOLDER_PATH = "../db/";
const DEFAULT_OFFSET = 0;
const DEFAULT_LIMIT = 20;

let db_filename = path.join(__dirname, DB_FOLDER_PATH + config.get("dbConfig.file_name"));

//======================================
// Routes ==============================
//======================================

router.get('/', (req, res) => {
    let offset = isInteger(req.query.offset) ? req.query.offset : DEFAULT_OFFSET;
    let count = isInteger(req.query.count) ? req.query.count : DEFAULT_LIMIT;

    const listAllStr = queries.ListAllQueryString;

    let db = new sqlite3.Database(db_filename, sqlite3.OPEN_READONLY, (err) => {
        if (err) {
            console.log(err.message);
            return res.status(500).send(err);
        }

        console.log("Connected to the db");

    });

    db.all(listAllStr, { $limit: count, $offset: offset }, (err, rows) => {
        if (err) {
            console.log(err.message);
            return res.status(500).send(err);
        }

        let results = {
            offset,
            count,
            records: rows
        }

        res.status(200).send(results);
    });

    db.close((err) => {
        if (err) {
            return console.log(err.message);
        }

        console.log("Db connection closed");
    })
    
});

module.exports = router;