const fs = require("fs");
const TemplateManager = require("./templateManager.js");
const VideoDataManager = require("./videoDataManager.js");
const StatisticsManager = require("./statisticsManager.js");
const SearchManager = require("./searchManager.js");
const MatchManager = require("./matchManager.js");
const Logger = require("./logger.js");
const charIdMap = require("./charIdMap.js");

function Server(cfg, app) {
	this.charMap = charIdMap;
	this.cfg = cfg;
	this.app = app;
	this.templateManager = new TemplateManager(this);
	this.videoDataManager = new VideoDataManager(this.cfg);
	this.searchManager = new SearchManager(this.cfg);
	this.games = this.videoDataManager.getJSON();
	this.statisticsManager = new StatisticsManager(this);
	this.matchManager = new MatchManager(this);
	this.logger = new Logger(this.cfg);
	this.setupRoutes();
}

Server.prototype.getRandomCharId = function() {
	let chars = Object.values(this.charMap);
	return chars[Math.floor(Math.random() * chars.length)].id;
};

Server.prototype.getRandomPortrait = function() {
	return "img/chars/" + this.getRandomCharId() + ".png";
};

Server.prototype.authCheck = function(req) {
	if(!req.cookies.token) return false;

	for(let user of this.cfg.contributors) {
		if(user.token && user.token === req.cookies.token) {
			return user.name;
		}
	}

	return false;
};

Server.prototype.approveCheck = function(auth, req) {
	if(!auth) return false;
	if(!req.cookies.token) return false;

	for(let user of this.cfg.contributors) {
		if(user.token && user.token === req.cookies.token) {
			return !user.noApprove;
		}
	}

	return false;
};

Server.prototype.setupRoutes = function() {
	this.app.get("/", (req, res) => {
		let searchResult = null;
		
		if(Object.keys(req.query).length > 0) {
			searchResult = this.searchManager.search(this.games, req.query);
		}

		res.send(this.templateManager.renderTemplate("index.html", {
			search: searchResult
		}));
	});

	this.app.get("/faq", (req, res) => {
		res.send(this.templateManager.renderTemplate("faq.html"));
	});

	this.app.get("/statistics", (req, res) => {
		let type = "all-players";

		if(req.query.chars) {
			type = "chars";
		}
		if(req.query.player) {
			type = "player";
		}
		if(req.query.character) {
			type = "matchup";
		}

		res.send(this.templateManager.renderTemplate("statistics.html", {
			type,
			player: req.query.player,
			character: this.charMap[req.query.character]
		}));
	});

	this.app.get("/contributors", (req, res) => {
		res.send(this.templateManager.renderTemplate("contributors.html"));
	});

	this.app.get("/characters", (req, res) => {
		res.send(this.templateManager.renderTemplate("characters.html"));
	});

	this.app.get("/editor", (req, res) => {
		let auth = this.authCheck(req);
		res.send(this.templateManager.renderTemplate("editor.html", {
			auth,
			canApprove: this.approveCheck(auth, req)
		}));
	});

	this.app.get("/provisional", (req, res) => {
		let auth = this.authCheck(req);
		if(!auth || !this.approveCheck(auth, req)) {
			res.status(400).send("No!");
		}
		res.send(this.templateManager.renderTemplate("provisional.html"));
	});

	this.app.post("/approveVideo", (req, res) => {
		let auth = this.authCheck(req);
		if(!auth || !this.approveCheck(auth, req)) {
			res.status(400).send("No!");
		}
		let ip = req.connection.remoteAddress;

		if(req.body && req.body.vid) {
			let videoData = this.games[req.body.vid];
			if(videoData) {
				videoData.provIP = null;
				this.videoDataManager.saveData(this.games);
				this.logger.log("Approved provisional video: " + req.body.vid, ip, auth);
				res.sendStatus(200);
			} else {
				res.status(400).send("Couldn't find the video.");
			}
		} else {
			res.status(400).send("Couldn't get the video id.");
		}
	});

	this.app.post("/deleteProvVideo", (req, res) => {
		let auth = this.authCheck(req);
		if(!auth || !this.approveCheck(auth, req)) {
			res.status(400).send("No!");
		}
		let ip = req.connection.remoteAddress;

		if(req.body && req.body.vid) {
			let videoData = this.games[req.body.vid];
			if(videoData && videoData.provIP) {
				delete this.games[req.body.vid];
				this.videoDataManager.saveData(this.games);
				this.logger.log("Deleted provisional video: " + req.body.vid, ip, auth);
				res.sendStatus(200);
			} else {
				res.status(400).send("Couldn't find the video.");
			}
		} else {
			res.status(400).send("Couldn't get the video id.");
		}
	});

	this.app.post("/addMatch", (req, res) => {
		let ip = req.connection.remoteAddress;
		let error = this.matchManager.addMatch(req.body, ip, this.authCheck(req));
		if(error) {
			res.status(400).send(error);
		} else {
			this.videoDataManager.saveData(this.games);
			res.sendStatus(200);
		}
	});

	this.app.put("/editMatch", (req, res) => {
		let ip = req.connection.remoteAddress;
		let error = this.matchManager.editMatch(req.body, ip, this.authCheck(req));
		if(error) {
			res.status(400).send(error);
		} else {
			this.videoDataManager.saveData(this.games);
			res.sendStatus(200);
		}
	});

	this.app.put("/editVideo", (req, res) => {
		let ip = req.connection.remoteAddress;
		let error = this.matchManager.editVideo(req.body, ip, this.authCheck(req));
		if(error) {
			res.status(400).send(error);
		} else {
			this.videoDataManager.saveData(this.games);
			res.sendStatus(200);
		}
	});

	this.app.delete("/deleteMatch", (req, res) => {
		let ip = req.connection.remoteAddress;
		let error = this.matchManager.deleteMatch(req.body, ip, this.authCheck(req));
		if(error) {
			res.status(400).send(error);
		} else {
			this.videoDataManager.saveData(this.games);
			res.sendStatus(200);
		}
	});

	this.app.get("/videoMatches", (req, res) => {
		let vid = req.query.vid;
		if(!vid) {
			res.sendStatus(400);
		} else {
			let json = {
				html: this.templateManager.renderTemplate("editorVideoMatches.html", {
					vid
				}),
				date: this.games[vid] && this.games[vid].date,
				netplay: this.games[vid] && this.games[vid].netplay,
				tags: this.games[vid] && this.games[vid].tags,
			}
			res.send(JSON.stringify(json));
		}
	});

	this.app.get("/404", (req, res) => {
		res.send(this.templateManager.renderTemplate("404.html"));
	});

	this.app.post("/report", (req, res) => {
		if(req.body && req.body.vid) {
			let line = "";
			line += "Video: " + (req.body.vid).padEnd(15);
			line += "Order: " + (req.body.idx||"???").padEnd(6);
			line += "Time: " + (req.body.time||"???").padEnd(9);
			line += "Reason: " + (req.body.reason||"???");
			line += " IP: " + req.connection.remoteAddress;

			fs.appendFileSync(this.cfg.reportsFilename, line + "\n");
		} else {
			res.sendStatus(400);
		}
		res.sendStatus(200);
	});

	this.app.get("/charInfo", (req, res) => {
		res.send({
			charData: this.charMap[req.query.char],
			charPlayers: this.templateManager.renderTemplate("characterPlayerStatistics.html", {
				char: req.query.char
			})
		});
	});
};

module.exports = Server;
