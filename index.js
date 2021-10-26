const cfg = require("./config.js");
const url = require("url");
const fs = require("fs");
const http = require("http");
const express = require("express");
const cookieParser = require("cookie-parser");

let port = cfg.port || 10800;
let app = express();
app.use(express.json());
app.use(cookieParser());

//Start server site to register priority routes
let siteServer = new (require(cfg.server))(cfg, app);

//Setup routes to static content
app.use(express.static("site", {extensions:['html']}));

//404
app.get("*", function(req, res){
	res.redirect("/404");
});

//Start listening on port
let server = http.Server(app);
server.listen(port, () => console.log(`Listening on: ${port}!`));