const config = require("config");
const express = require("express");

const port = config.get("restApiConfig.port");

//======================================
// Importing routers ===================
//======================================
let listRouter = require("./routers/list_router");
let aggregationRouter = require("./routers/aggregate_router");
let csvRouter = require("./routers/csv_router");

//======================================
// Creating Express App ================
//======================================
const app = express();

app.use("/records", listRouter);
app.use("/aggregate", aggregationRouter);
app.use("/csv", csvRouter);

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})