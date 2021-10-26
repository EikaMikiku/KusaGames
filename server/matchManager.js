const utils = require("./functions/timeUtils.js");

function MatchManger(server) {
	this.server = server;
}

MatchManger.prototype.validateAddEditVideoForm = function(form) {
	if(!form || Object.keys(form) === 0) {
		return "Nothing passed in.";
	}

	//Global tab chracter check
	for(let field in form) {
		if(form[field].toString().includes("\t")) {
			return "One of the fields contains an invalid character.";
		}
	}

	if(typeof form.vid !== "string" || form.vid.length !== 11) {
		return "Invalid video ID.";
	}

	if(!form.date) {
		return "Set the video date.";
	}

	if(typeof form.date !== "string" || !form.date.match(/\d{4}-\d{2}-\d{2}/) || isNaN(new Date(form.date).getTime())) {
		return "Invalid date.";
	}

	if(!form.netplay) {
		return "Set if the video is netplay or locals(offline)";
	}

	if(form.netplay !== "L" && form.netplay !== "N") {
		return "Invalid netplay value";
	}

	if(!form.tags || typeof form.tags !== "string") {
		form.tags = [];
	} else {
		form.tags = form.tags.replace(/\|+/g, "|").split("|").map(x => x.trim());
	}
};

MatchManger.prototype.editVideo = function(form, ip, auth) {
	let error = this.validateAddEditVideoForm(form);
	if(error) return error;

	let videoData = this.server.games[form.vid] || {};
	if(Object.keys(videoData).length === 0) {
		//New video
		let log = `Added ${auth ? "" : "provisional "}video\t`;
		log += `VideoID: ${form.vid}\t`;
		log += `Tags: ${form.tags}\t`;
		log += `Date: ${form.date}\t`;
		log += `Netplay: ${form.netplay}.`;
		this.server.logger.log(log, ip, auth);

		videoData.id = form.vid;
		videoData.date = form.date;
		videoData.netplay = form.netplay;
		videoData.tags = form.tags;
		videoData.provIP = auth ? null : ip;
		videoData.matches = [];
	} else if(!videoData.provIP && !auth) {
		return "Not authorised to edit a non-provisional video.";
	} else if(!auth && videoData.provIP && videoData.provIP !== ip) {
		return "This provisional video was added by someone else.";
	}

	this.editVideoSpecificFields(videoData, form, ip, auth);

	this.server.games[form.vid] = videoData;

	return null;
};

MatchManger.prototype.addMatch = function(form, ip, auth) {
	let error = this.validateAddEditVideoForm(form);
	if(error) return error;
	error = this.validateAddEditMatchForm(form);
	if(error) return error;

	let videoData = this.server.games[form.vid] || {};

	if(Object.keys(videoData).length === 0) {
		//New video
		let log = `Added ${auth ? "" : "provisional "}video\t`;
		log += `VideoID: ${form.vid}\t`;
		log += `Tags: ${form.tags}\t`;
		log += `Date: ${form.date}\t`;
		log += `Netplay: ${form.netplay}.`;
		this.server.logger.log(log, ip, auth);

		videoData.id = form.vid;
		videoData.date = form.date;
		videoData.netplay = form.netplay;
		videoData.tags = form.tags;
		videoData.provIP = auth ? null : ip;
		videoData.matches = [];
	} else if(!videoData.provIP && !auth) {
		return "Not authorised to add a match to a non-provisional video.";
	} else if(!auth && videoData.provIP && videoData.provIP !== ip) {
		return "This provisional video was added by someone else.";
	}

	this.editVideoSpecificFields(videoData, form, ip, auth);

	videoData.matches = videoData.matches || [];
	videoData.matches.push({
		"time": parseInt(form.time),
		"readableTime": utils.convertSecondsToReadable(form.time),
		"p1char": form.p1char,
		"p1name": form.p1name,
		"p2char": form.p2char,
		"p2name": form.p2name,
		"winner": form.winner
	});

	videoData.matches.sort((a, b) => {
		return parseInt(a.time) - parseInt(b.time);
	});

	for(let i = 0; i < videoData.matches.length; i++) {
		videoData.matches[i].orderIndex = i + 1;
		videoData.matches[i].videoData = videoData;
	}

	this.server.games[form.vid] = videoData;

	let log = `Added ${auth ? "" : "provisional "}match\t`;
	log += `VideoID: ${form.vid}\t`;
	log += `Time: ${form.readableTime}\t`;
	log += `P1: ${form.p1char} ${form.p1name}\t`;
	log += `P2: ${form.p2char} ${form.p2name}\t`;
	log += `Winner: ${form.winner}.`;
	this.server.logger.log(log, ip, auth);

	return null;
};

MatchManger.prototype.editMatch = function(form, ip, auth) {
	let error = this.validateAddEditVideoForm(form);
	if(error) return error;
	error = this.validateAddEditMatchForm(form, true);
	if(error) return error;

	let videoData = this.server.games[form.vid];
	if(!videoData.provIP && !auth) {
		return "Not authorised to edit a match on a non-provisional video.";
	} else if(!auth && videoData.provIP && videoData.provIP !== ip) {
		return "This provisional video was added by someone else.";
	}

	this.editVideoSpecificFields(videoData, form, ip, auth);

	let match = videoData.matches.find(m => parseInt(m.orderIndex) === parseInt(form.orderIndex));
	if(!match) {
		return;
	}

	let log = `Modified ${auth ? "" : "provisional "}match\t`;
	log += `VideoID: ${form.vid}\t`;
	if(match.time !== form.time) {
		log += `Time from: ${match.time} to ${form.time}\t`;
		match.time = parseInt(form.time);
		match.readableTime = utils.convertSecondsToReadable(match.time);
	}
	if(match.p1char !== form.p1char) {
		log += `P1 Char from: ${match.p1char} to ${form.p1char}\t`;
		match.p1char = form.p1char;
	}
	if(match.p1name !== form.p1name) {
		log += `P1 Name from: ${match.p1name} to ${form.p1name}\t`;
		match.p1name = form.p1name;
	}
	if(match.p2char !== form.p2char) {
		log += `P2 Char from: ${match.p2char} to ${form.p2char}\t`;
		match.p2char = form.p2char;
	}
	if(match.p2name !== form.p2name) {
		log += `P2 Name from: ${match.p2name} to ${form.p2name}\t`;
		match.p2name = form.p2name;
	}
	if(match.winner !== form.winner) {
		log += `Winner from: ${match.winner} to ${form.winner}\t`;
		match.winner = form.winner;
	}
	this.server.logger.log(log.trim(), ip, auth);

	videoData.matches.sort((a, b) => {
		return parseInt(a.time) - parseInt(b.time);
	});

	for(let i = 0; i < videoData.matches.length; i++) {
		videoData.matches[i].orderIndex = i + 1;
		videoData.matches[i].videoData = videoData;
	}
};

MatchManger.prototype.editVideoSpecificFields = function(videoData, form, ip, auth) {
	if(videoData.date !== form.date) {
		let log = "Modified video\t";
		log += `VideoID: ${form.vid}\t`;
		log += `Date From: ${videoData.date}\t`;
		log += `Date To: ${form.date}.`;
		this.server.logger.log(log, ip, auth);

		videoData.date = form.date;
	}

	if(videoData.tags.toString() !== form.tags.toString()) {
		let log = "Modified video\t";
		log += `VideoID: ${form.vid}\t`;
		log += `Tags From: ${videoData.tags.toString()}\t`;
		log += `Tags To: ${form.tags.toString()}.`;
		this.server.logger.log(log, ip, auth);

		videoData.tags = form.tags;
	}

	if(videoData.netplay !== form.netplay) {
		let log = "Modified video\t";
		log += `VideoID: ${form.vid}\t`;
		log += `Netplay From: ${videoData.netplay}\t`;
		log += `Netplay To: ${form.netplay}.`;
		this.server.logger.log(log, ip, auth);

		videoData.netplay = form.netplay;
	}
};

MatchManger.prototype.deleteMatch = function(form, ip, auth) {
	if(!this.server.games[form.vid]) {
		return "Invalid video ID.";
	}
	if(typeof form.time !== "number" || form.time < 0) {
		return "Invalid match time.";
	}
	let video = this.server.games[form.vid];

	if(!video.provIP && !auth) {
		return "Not authorised to delete a match on a non-provisional video.";
	} else if(!auth && video.provIP && video.provIP !== ip) {
		return "This provisional video was added by someone else.";
	}

	for(let i = 0; i < video.matches.length; i++) {
		let m = video.matches[i];
		if(m.time === form.time) {
			let log = `Deleted ${auth ? "" : "provisional "}match\t`;
			log += `VideoID: ${form.vid}\t`;
			log += `Time: ${m.time}\t`;
			log += `P1: ${m.p1char} ${m.p1name}\t`;
			log += `P2: ${m.p2char} ${m.p2name}\t`;
			log += `Winner: ${m.winner}.`;
			this.server.logger.log(log, ip, auth);

			video.matches.splice(i, 1);
			break;
		}
	}

	if(video.matches.length === 0) {
		delete this.server.games[form.vid];
		return null;
	}

	for(let i = 0; i < video.matches.length; i++) {
		video.matches[i].orderIndex = i + 1;
	}

	return null;
};

MatchManger.prototype.validateAddEditMatchForm = function(form, skipCloseTimeCheck) {
	if(parseInt(form.time).toString() !== form.time.toString() || parseInt(form.time) < 0) {
		return "Invalid time.";
	}
	if(!form.p1char) {
		return "Select player 1 character.";
	}
	if(!this.server.charMap[form.p1char]) {
		return "Select player 1 character.";
	}
	if(!form.p2char) {
		return "Select player 2 character.";
	}
	if(!this.server.charMap[form.p2char]) {
		return "Select player 2 character.";
	}
	if(form.winner !== "1" && form.winner !== "2" && form.winner !== "D") {
		return "Select the winner of the match.";
	}

	//Existing close match test
	if(!skipCloseTimeCheck && this.server.games[form.vid]) {
		let closeMatch = this.server.games[form.vid].matches.find(match => {
			let diff = Math.abs(match.time - parseInt(form.time));
			if(diff < 10) {
				return true;
			}
		});

		if(closeMatch) {
			return "There is already a match within 10 seconds.";
		}
	}

	if(!form.p1name) {
		form.p1name = "";
	}
	if(!form.p2name) {
		form.p2name = "";
	}

	return null;
};

module.exports = MatchManger;
