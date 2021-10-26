const DEFAULT_SEARCH = {
	page: 1,
	p1char: "",
	p1name: "",
	p2char: "",
	p2name: "",
	winner: "",
	net: ""
};

function SearchManager(cfg) {
	this.resultsPerPage = cfg.resultsPerPage;
};

SearchManager.prototype.search = function(data, form) {
	let searchQuery = {
		page: parseInt(form.page) || DEFAULT_SEARCH.page,
		p1char: form.p1char || DEFAULT_SEARCH.p1char,
		p1name: form.p1name || DEFAULT_SEARCH.p1name,
		p2char: form.p2char || DEFAULT_SEARCH.p2char,
		p2name: form.p2name || DEFAULT_SEARCH.p2name,
		winner: form.winner || DEFAULT_SEARCH.winner,
		net: form.net || DEFAULT_SEARCH.net
	};
	let foundMatches = [];

	for(let videoId in data) {
		let videoData = data[videoId];

		if(videoData.provIP) {
			continue;
		}

		if(form.vid && form.vid.length === 11 && videoData.id !== form.vid) {
			continue;
		}
		if(form.tag && !videoData.tags.includes(form.tag)) {
			continue;
		}

		//Check video netplay
		if(searchQuery.net === "N" && videoData.netplay === "L") {
			continue;
		} else if(searchQuery.net === "L" && videoData.netplay === "N") {
			continue;
		}

		for(let i = 0; i < videoData.matches.length; i++) {
			let match = videoData.matches[i];
			if(matchTest(match, searchQuery)) {
				foundMatches.push(match);
			}
		}

	}

	//Sort matches by video date, and then by order idx in the video
	foundMatches.sort((a, b) => {
		let ad = new Date(a.videoData.date).getTime();
		let bd = new Date(b.videoData.date).getTime();
		let diff = bd - ad;

		//Multiple videos can be in the same date, consistently sort them by id
		if(diff === 0) {
			diff = b.videoData.id.localeCompare(a.videoData.id);
		}

		//Multiple matches can be in the video, sort them by their order
		if(diff === 0) {
			diff = a.orderIndex - b.orderIndex;
		}

		return diff;
	});

	let startIdx = (searchQuery.page - 1) * this.resultsPerPage;

	return {
		"page": searchQuery.page,
		"total": foundMatches.length,
		"matches": foundMatches.splice(startIdx, this.resultsPerPage)
	};
};

function matchTest(mData, sq) {
	let p1set = sq.p1char.length || sq.p1name.length;
	let p2set = sq.p2char.length || sq.p2name.length;

	if(p1set) {
		if(p2set) {
			let p1 = playerMatches(mData.p1char, mData.p1name, sq.p1char, sq.p1name);
			let p2 = playerMatches(mData.p2char, mData.p2name, sq.p2char, sq.p2name);
			//Swapped:
			let p1asp2 = playerMatches(mData.p2char, mData.p2name, sq.p1char, sq.p1name);
			let p2asp1 = playerMatches(mData.p1char, mData.p1name, sq.p2char, sq.p2name);

			if(p1 && p2) {
				//Normal match
				let p1Char = sq.p1char + sq.p1name;
				let p2Char = sq.p2char + sq.p2name;
				if(p1Char !== p2Char) {
					//Characters are different, so sq.winner is important
					if(sq.winner === "1" && mData.winner !== "1") {
						//Only p1 winner allowed, no p2 or draw
						return false;
					} else if(sq.winner === "2" && mData.winner !== "2") {
						//Only p2 winner allowed, no p1 or draw
						return false;
					}
				}
				//Sides don't matter for draws
				if(sq.winner === "D" && mData.winner !== "D") {
					return false;
				}
			} else if(p1asp2 && p2asp1) {
				//Swapped match
				let p1Char = sq.p1char + sq.p1name;
				let p2Char = sq.p2char + sq.p2name;
				if(p1Char !== p2Char) {
					//Characters are different, so sq.winner is important
					if(sq.winner === "1" && mData.winner !== "2") {
						//We are searching for p1 winner, but in reality we want p2 to be a winner
						return false;
					} else if(sq.winner === "2" && mData.winner !== "1") {
						//We are searching for p2 winner, but in reality we want p1 to be a winner
						return false;
					}
				}
				//Sides don't matter for draws
				if(sq.winner === "D" && mData.winner !== "D") {
					return false;
				}
			} else {
				//No match
				return false;
			}
		} else {
			//Only p1 search
			let p1 = playerMatches(mData.p1char, mData.p1name, sq.p1char, sq.p1name);
			let p1asp2 = playerMatches(mData.p2char, mData.p2name, sq.p1char, sq.p1name);
			if(p1) {
				//Winner check
				if(sq.winner === "1" && mData.winner !== "1") {
					//Only p1 winner allowed, no p2 or draw
					return false;
				} else if(sq.winner === "2" && mData.winner !== "2") {
					//Only p2 winner allowed, no p1 or draw
					return false;
				} else if(sq.winner === "D" && mData.winner !== "D") {
					//Sides don't matter for draws
					return false;
				}
			} else if(p1asp2) {
				//Winner check reversed
				if(sq.winner === "1" && mData.winner !== "2") {
					//We are searching for p1 winner, but in reality we want p2 to be a winner
					return false;
				} else if(sq.winner === "2" && mData.winner !== "1") {
					//We are searching for p2 winner, but in reality we want p1 to be a winner
					return false;
				} else if(sq.winner === "D" && mData.winner !== "D") {
					//Sides don't matter for draws
					return false;
				}
			} else {
				//Player 1 is set, but no match
				return false;
			}
		}
	} else if(p2set) {
		//Reverse search
		//Only p2 search
		let p2 = playerMatches(mData.p2char, mData.p2name, sq.p2char, sq.p2name);
		let p2asp1 = playerMatches(mData.p1char, mData.p1name, sq.p2char, sq.p2name);
		if(p2) {
			//Winner check
			if(sq.winner === "1" && mData.winner !== "1") {
				//Only p1 winner allowed, no p2 or draw
				return false;
			} else if(sq.winner === "2" && mData.winner !== "2") {
				//Only p2 winner allowed, no p1 or draw
				return false;
			} else if(sq.winner === "D" && mData.winner !== "D") {
				//Sides don't matter for draws
				return false;
			}
		} else if(p2asp1) {
			//Winner check reversed
			if(sq.winner === "1" && mData.winner !== "2") {
				//We are searching for p1 winner, but in reality we want p2 to be a winner
				return false;
			} else if(sq.winner === "2" && mData.winner !== "1") {
				//We are searching for p2 winner, but in reality we want p1 to be a winner
				return false;
			} else if(sq.winner === "D" && mData.winner !== "D") {
				//Sides don't matter for draws
				return false;
			}
		} else {
			//Player 2 is set, but no match
			return false;
		}
	} else {
		//Chars are not set, sides don't matter, but draws do
		if(sq.winner === "D" && mData.winner !== "D") {
			return false;
		}
		//Also if side is picked no draws are allows
		if(sq.winner === "1" || sq.winner === "2") {
			if(mData.winner === "D") {
				return false;
			}
		}
	}

	return true;
}

function playerMatches(mChar, mName, sqChar, sqName) {
	//Player character check
	if(sqChar.length > 0) {
		if(sqChar !== mChar) {
			return false;
		}
	}
	//Player name check
	if(sqName.length > 0) {
		if(mName.toLowerCase() !== sqName.toLowerCase()) {
			return false;
		}
	}

	return true;
}

module.exports = SearchManager;
