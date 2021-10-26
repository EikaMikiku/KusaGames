const fs = require("fs");

function Logger(cfg) {
	this.logFilename = cfg.logFilename;
}

Logger.prototype.log = function(msg, address, auth) {
	let timestamp = new Date().toString().substring(0, 24);
	let date = new Date().toISOString().slice(0,7);
	let filename = this.logFilename.replace("DATE", date);
	fs.appendFileSync(
		filename,
		`IP: ${address} | ${timestamp} ${auth?`| ${auth} `:""}| ${msg.replace("\n", "\\n")}\n`
	);
};

module.exports = Logger;