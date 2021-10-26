document.addEventListener("DOMContentLoaded", () => {
	let currentCharImg = null;
	let imgs = document.getElementsByClassName("char-img");
	let bgImg = document.getElementById("bg-img");
	let charWiki = document.getElementById("char-wiki");
	let charPlayers = document.getElementById("char-players");
	let charInfoContainer = document.getElementById("char-info-container");
	let showChart = false;

	window.onThemeSwitch = function(theme) {
		window.location.reload();
	};

	bgImg.onload = function() {
		setTimeout(() => {
			bgImg.classList.remove("transparent");
		}, 200);
	};

	for(let img of imgs) {
		img.onclick = () => {
			if(currentCharImg) {
				currentCharImg.classList.remove("selected");
			}
			bgImg.classList.add("transparent");
			setTimeout(() => {
				bgImg.src = `/img/chars/big/${img.dataset.id}.png`;
			}, 200);
			currentCharImg = img.parentElement;
			currentCharImg.classList.add("selected");
			getCharInfo(img.dataset.id).then(updateCharInfo);
		};
	}

	if(window.location.hash.length > 0) {
		let id = window.location.hash.slice(1);
		document.querySelector(`[data-id=${id}]`).click();
	}

	function updateCharInfo(json) {
		charWiki.innerText = json.charData.full || json.charData.name;
		charWiki.href = json.charData.wiki;
		charPlayers.tBodies[0].innerHTML = json.charPlayers;
		window.location.href = "#" + json.charData.id;
	} 

	function rng() {
		return Math.floor(Math.random() * 5) + 1;
	}

	function getCharInfo(char) {
		charInfoContainer.removeAttribute("hidden");
		return fetch("/charInfo?char=" + char)
		.then(r => r.json())
	}
});