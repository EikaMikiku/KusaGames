const fs = require("fs");
const Scanner = require("n-readlines");
const utils = require("./functions/timeUtils.js");

function StatisticsManager(server) {
	this.server = server;
}

StatisticsManager.prototype.getCharacterPlayerStats = function(char) {
	let players = {};

	for(let vid in this.server.games) {
		let videoData = this.server.games[vid];
		if(videoData.provIP) continue;

		for(let match of videoData.matches) {
			let c;
			if(match.p1name.length > 0 && match.p1char === char) {
				c = players[match.p1name] || {
					total: 0,
					wins: 0,
					losses: 0,
					draws: 0
				}
				if(match.winner === "1") {
					c.wins++;
				} else if(match.winner === "2") {
					c.losses++;
				} else {
					c.draws++;
				}
				c.total++;
				players[match.p1name] = c;
			} else if(match.p2name.length > 0 && match.p2char === char) {
				c = players[match.p2name] || {
					total: 0,
					wins: 0,
					losses: 0,
					draws: 0
				};
				if(match.winner === "1") {
					c.losses++;
				} else if(match.winner === "2") {
					c.wins++;
				} else {
					c.draws++;
				}
				c.total++;
				players[match.p2name] = c;
			}
		}
	}

	//Calculate winrate and proficiency
	for(let name in players) {
		let p = players[name];
		p.winrate = p.wins / p.total;
		p.prof = p.wins * p.winrate ** 3;
	}

	//Sort
	let names = Object.keys(players);
	names.sort((a, b) => {
		let diff = players[b].prof - players[a].prof;
		if(diff === 0) {
			diff = players[a].losses - players[b].losses;
		}
		return diff !== 0 ? diff : a.localeCompare(b);
	});

	//Re-map array to objects + add names
	return names.map(name => {
		players[name].name = name;
		return players[name];
	});
};

StatisticsManager.prototype.getPlayerStats = function() {
	let players = {};
	
	//Collect wins/losses/draws
	for(let vid in this.server.games) {
		let videoData = this.server.games[vid];
		if(videoData.provIP) continue;

		for(let match of videoData.matches) {
			let p1 = players[match.p1name] || {
				total: 0,
				wins: 0,
				losses: 0,
				draws: 0
			};
			let p2 = players[match.p2name] || {
				total: 0,
				wins: 0,
				losses: 0,
				draws: 0
			};

			if(match.winner === "1") {
				p1.wins++;
				p2.losses++;
			} else if(match.winner === "2") {
				p1.losses++;
				p2.wins++;
			} else {
				p1.draws++;
				p2.draws++;
			}

			p1.total++;
			p2.total++;

			players[match.p1name] = p1;
			players[match.p2name] = p2;
		}
	}

	//Calculate winrate and proficiency
	for(let name in players) {
		let p = players[name];
		p.winrate = p.wins / p.total;
		p.prof = p.wins * p.winrate ** 3;
	}
	
	//Sort
	let names = Object.keys(players);
	names.sort((a, b) => {
		let diff = players[b].prof - players[a].prof;
		if(diff === 0) {
			diff = players[a].losses - players[b].losses;
		}
		return diff !== 0 ? diff : a.localeCompare(b);
	});

	names.splice(names.indexOf(""), 1); //Remove no name

	//Re-map array to objects + add names
	return names.map(name => {
		players[name].name = name;
		return players[name];
	});
};

StatisticsManager.prototype.getCharacterMatchupStats = function(cname) {
	let chars = {};

	for(let vid in this.server.games) {
		let videoData = this.server.games[vid];
		if(videoData.provIP) continue;

		for(let match of videoData.matches) {
			let c;
			if(match.p1char === cname) {
				c = chars[match.p2char] || {
					total: 0,
					wins: 0,
					losses: 0,
					draws: 0
				}
				if(match.winner === "1") {
					c.wins++;
				} else if(match.winner === "2") {
					c.losses++;
				} else {
					c.draws++;
				}
				c.total++;
				chars[match.p2char] = c;
			} else if(match.p2char === cname) {
				c = chars[match.p1char] || {
					total: 0,
					wins: 0,
					losses: 0,
					draws: 0
				};
				if(match.winner === "1") {
					c.losses++;
				} else if(match.winner === "2") {
					c.wins++;
				} else {
					c.draws++;
				}
				c.total++;
				chars[match.p1char] = c;
			}
		}
	}

	//Calculate winrate and proficiency
	for(let name in chars) {
		let c = chars[name];
		c.winrate = c.wins / c.total;
		c.prof = c.wins * c.winrate ** 3;
	}

	//Sort
	let names = Object.keys(chars);
	names.sort((a, b) => {
		let diff = chars[b].prof - chars[a].prof;
		if(diff === 0) {
			diff = chars[a].losses - chars[b].losses;
		}
		return diff !== 0 ? diff : a.localeCompare(b);
	});

	//Re-map array to objects + add names/id
	return names.map(name => {
		chars[name].name = this.server.charMap[name].name || "Unknown!";
		chars[name].id = name;
		return chars[name];
	});
};

StatisticsManager.prototype.getPlayerCharacterStats = function(pname) {
	let chars = {};

	for(let vid in this.server.games) {
		let videoData = this.server.games[vid];
		if(videoData.provIP) continue;

		for(let match of videoData.matches) {
			let c;
			if(match.p1name === pname) {
				c = chars[match.p1char] || {
					total: 0,
					wins: 0,
					losses: 0,
					draws: 0
				};
				if(match.winner === "1") {
					c.wins++;
				} else if(match.winner === "2") {
					c.losses++;
				} else {
					c.draws++;
				}
				c.total++;
				chars[match.p1char] = c;
			} else if(match.p2name === pname) {
				c = chars[match.p2char] || {
					total: 0,
					wins: 0,
					losses: 0,
					draws: 0
				};
				if(match.winner === "1") {
					c.losses++;
				} else if(match.winner === "2") {
					c.wins++;
				} else {
					c.draws++;
				}
				c.total++;
				chars[match.p2char] = c;
			}
		}
	}

	//Calculate winrate and proficiency
	for(let name in chars) {
		let c = chars[name];
		c.winrate = c.wins / c.total;
		c.prof = c.wins * c.winrate ** 3;
	}

	//Sort
	let names = Object.keys(chars);
	names.sort((a, b) => {
		let diff = chars[b].prof - chars[a].prof;
		if(diff === 0) {
			diff = chars[a].losses - chars[b].losses;
		}
		return diff !== 0 ? diff : a.toLowerCase().localeCompare(b.toLowerCase());
	});

	//Re-map array to objects + add names/id
	return names.map(name => {
		chars[name].name = this.server.charMap[name].name || "Unknown!";
		chars[name].id = name;
		return chars[name];
	});
};

StatisticsManager.prototype.getPlayerNames = function() {
	let set = new Set();

	for(let vid in this.server.games) {
		let videoData = this.server.games[vid];
		if(videoData.provIP) continue;
		
		for(let match of videoData.matches) {
			if(match.p1name.length > 0) set.add(match.p1name);
			if(match.p2name.length > 0) set.add(match.p2name);
		}
	}

	return Array.from(set).sort((a, b) => {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	});
};

StatisticsManager.prototype.getVideoTags = function() {
	let set = new Set();

	for(let vid in this.server.games) {
		let videoData = this.server.games[vid];
		if(videoData.provIP) continue;
		
		for(let tag of videoData.tags) {
			set.add(tag);
		}
	}

	return Array.from(set).sort();
};

StatisticsManager.prototype.getCharacterStats = function() {
	let chars = {};

	//Collect wins/losses/draws
	for(let vid in this.server.games) {
		let videoData = this.server.games[vid];
		if(videoData.provIP) continue;
		
		for(let match of videoData.matches) {
			let c1 = chars[match.p1char] || {
				total: 0,
				wins: 0,
				losses: 0,
				draws: 0
			};
			let c2 = chars[match.p2char] || {
				total: 0,
				wins: 0,
				losses: 0,
				draws: 0
			};

			if(match.winner === "1") {
				c1.wins++;
				c2.losses++;
			} else if(match.winner === "2") {
				c1.losses++;
				c2.wins++;
			} else {
				c1.draws++;
				c2.draws++;
			}

			c1.total++;
			c2.total++;

			chars[match.p1char] = c1;
			chars[match.p2char] = c2;
		}
	}

	//Calculate winrate and proficiency
	for(let name in chars) {
		let c = chars[name];
		c.winrate = c.wins / c.total;
		c.prof = c.wins * c.winrate ** 3;
	}
	
	//Sort
	let names = Object.keys(chars);
	names.sort((a, b) => {
		let diff = chars[b].prof - chars[a].prof;
		if(diff === 0) {
			diff = chars[a].losses - chars[b].losses;
		}
		return diff !== 0 ? diff : a.localeCompare(b);
	});

	//Re-map array to objects + add names/id
	return names.map(name => {
		chars[name].name = this.server.charMap[name].name || "Unknown!";
		chars[name].id = name;
		return chars[name];
	});
};

module.exports = StatisticsManager;