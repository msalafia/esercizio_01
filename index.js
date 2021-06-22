const config = require("config");
const express = require("express");

const port = config.get("restApiConfig.port");

//======================================
// Importing routers ===================
//======================================
let listRouter = require("./routers/list_router");

//======================================
// Creating Express App ================
//======================================
const app = express();

app.use("/records", listRouter);

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})