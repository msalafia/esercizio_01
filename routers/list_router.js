const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const queries = require('../db/queries/queries');

const path = require("path");
const config = require("config");

let router = express.Router();

const DB_FOLDER_PATH = "../db/";
const DEFAULT_OFFSET = 0;
const DEFAULT_LIMIT = 20;

let db_filename = path.join(__dirname, DB_FOLDER_PATH + config.get("dbConfig.file_name"));

router.get('/', (req, res) => {
    let offset = isInteger(req.query.offset) ? req.query.offset : DEFAULT_OFFSET;
    let count = isInteger(req.query.count) ? req.query.count : DEFAULT_LIMIT;

    //TODO: check string for sql injection
    const listAllStr = queries.buildListAllQueryString(offset, count);

    let db = new sqlite3.Database(db_filename, (err) => {
        if (err) {
            console.log(err.message);
            res.status(500).send(err);
        }

        console.log("Connected to the db");

    });

    db.all(listAllStr, (err, rows) => {
        if (err) {
            console.log(err.message);
            res.status(500).send(err);
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
            console.log(err.message);
        }

        console.log("Db connection closed");
    })
    
});

const isInteger = (str) => !isNaN(str) && Number.isInteger(+str);

module.exports = router;