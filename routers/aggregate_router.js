const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const queries = require('../db/queries/queries');
const { isInteger } = require("./utility/utility.js");

const path = require("path");
const config = require("config");
const { assert } = require('console');

let router = express.Router();

const DB_FOLDER_PATH = "../db/";
let db_filename = path.join(__dirname, DB_FOLDER_PATH + config.get("dbConfig.file_name"));

//======================================
// Aggregation Utilities ===============
//======================================

const AggregationType = {
    AGE: "age",
    EDUCATION_LVL_ID: "education_level_id",
    OCCUPATION_ID: "occupation_id"
}

Object.freeze(AggregationType);

function isAggregationType(str) {
    return Object.values(AggregationType).includes(str);
}

function getAggregationResult(aggrType, queryStr, params, callback) {

    assert(typeof aggrType === "object" && isAggregationType(aggrType), "Parameter 'aggrType' must be an AggregationType");
    assert(typeof queryStr === "string", "Parameter 'queryStr' must be a String");
    assert(typeof params === "object" && Object.values(params).length !== 0, "Parameter 'params' must be a non-empty object");

    let db = new sqlite3.Database(db_filename, (err) => {
        if (err) {
            console.log(err.message);
            return res.status(500).send(err);
        }

        console.log("Connected to the db");
    });

    db.get(queryStr, params, (err, rows) => {
        if (err) {
            console.log(err.message);
            return callback(err, undefined);
        }

        let results = {
            aggregationType: aggrType,
            aggregationFilter: Object.values(params)[0],
            ...rows
        }

        callback(undefined, results);
    });

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
    let aggrType = req.query.aggregationType;
    let aggrValue = req.query.aggregationValue;

    if (!isAggregationType(aggrType)) {
        return res.status(422).send("Bad value for query parameter 'aggregationType'!");
    }

    if (!isInteger(aggrValue)) {
        return res.status(422).send("Bad value for query parameter 'aggregationValue'!");
    }

    function resulthandler(err, results) {
        if (err) {
            console.log("Error creating aggregation by value!");
            return res.status(500).send(err.message);
        }

        return res.status(200).send(results);
    }

    switch(aggrType) {
        case AggregationType.AGE:
            const aggregateByAgeStr = queries.AggregateByAgeQueryString;
            getAggregationResult(AggregationType.AGE, aggregateByAgeStr, { $age: aggrValue },  resulthandler);
            break;
        case AggregationType.EDUCATION_LVL_ID:
            const aggregateByEducationLvlIdStr = queries.AggregateByEducationLevelIdQueryString;
            getAggregationResult(AggregationType.EDUCATION_LVL_ID, aggregateByEducationLvlIdStr, { $education_lvl_id: aggrValue },  resulthandler);
            break;
        case AggregationType.OCCUPATION_ID:
            const aggregateByOccupationIdStr = queries.AggregateByOccupationIdQueryString;
            getAggregationResult(AggregationType.OCCUPATION_ID, aggregateByOccupationIdStr, { $occupation_id: aggrValue },  resulthandler);
            break;
    }
});

module.exports = router;