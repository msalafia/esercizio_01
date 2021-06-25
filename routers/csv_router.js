const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const stringify = require('csv-stringify');
const queries = require('../db/queries/queries');
const path = require('path');
const fs = require('fs');
const config = require('config');

let router = express.Router();

const DB_FOLDER_PATH = "../db/";
let db_filename = path.join(__dirname, DB_FOLDER_PATH + config.get("dbConfig.file_name"));

//======================================
// CSV Utilities =======================
//======================================

function writeCSVFile(writeStream, callback) {
    //remove everything after the ListAllQueryString query
    const listAllStr = queries.ListAllQueryString.replace(/limit[\s|\S]*/, '');

    let db = new sqlite3.Database(db_filename, sqlite3.OPEN_READONLY, (err) => {
        if (err) {
            console.log(err.message);
            return callback(err, undefined);
        }

        console.log("Connected to the db");
    });

    let columns;
    let stringifier;

    db.each(listAllStr,
        (err, row) => {
            if (err) {
                console.log(err.message);
                return callback(err, undefined);
            }

            if (!columns) columns = Object.keys(row);

            if (!stringifier) {
                stringifier = stringify({
                    delimiter: ',',
                    header: true,
                    columns: columns
                });
                stringifier.pipe(writeStream);
            }

            stringifier.write(row);
        },
        (err) => {
            if (err) {
                console.log(err.message);
                return callback(err, undefined);
            }
            stringifier.end();
        }
    );

    db.close((err) => {
        if (err) {
            console.log(err.message);
            return callback(err, undefined);
        }

        console.log("Db connection closed");
    })
}

//======================================
// Routes ==============================
//======================================

router.get("/", (req, res) => {
    const CSV_TMP_PATH = path.join(__dirname, "./temp/csv_records" + Date.now() + ".csv");
    let writeStream = fs.createWriteStream(CSV_TMP_PATH);
    
    writeStream.on('finish', () => {
        //Download the csv temp file after download completion 
        res.status(200).download(CSV_TMP_PATH, "csv_records.csv", () => fs.unlinkSync(CSV_TMP_PATH));
    });

    writeCSVFile(writeStream, (err) => {
        if(err) {
            console.log(err.message);
            res.status(500).send(err.message);
            //When error occurs destroy the stream and delete temp csv file
            writeStream.destroy();
            fs.unlinkSync(CSV_TMP_PATH);
        }
    });
});

module.exports = router;