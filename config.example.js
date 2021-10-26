module.exports = {
	"port": 8888,
	"matchData": "data/match.data",
	"reportsFilename": "data/reports.data",
	"logFilename": "data/log-DATE.data",
	"resultsPerPage": 50,
	"server": "./server/index.js",
	"contributors": [
		{
			"name": "Eika",
			"html": "<p>I made this!</p><p>See me in melty!</p><a href='https://twitter.com/Eika_da'>@Eika_da</a>",
			"img": "/img/eika.png",
			"token": "eikaaa"
		},
		{
			"name": "Someone",
			"html": "<p>I add and approve matches, because I care!</p>",
			"img": "/img/someone.png",
			"token": "somelse1"
		},
		{
			"name": "Yabai",
			"html": "<p>I don't have a token! I was still useful!</p>",
			"img": "/img/someone.png"
		},
		{
			"name": "HoleeFuk",
			"html": "<p>I have a token, but can't approve!</p>",
			"img": "/img/someone.png",
			"token": "hohoho",
			"noApprove": true
		}
	]
};