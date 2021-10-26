document.addEventListener("DOMContentLoaded", () => {
	let form = document.getElementById("form");
	let page = document.getElementById("page");
	let p1char = document.getElementById("p1char");
	let p1name = document.getElementById("p1name");
	let net = document.getElementById("net");
	let winner = document.getElementById("winner");
	let p2char = document.getElementById("p2char");
	let p2name = document.getElementById("p2name");
	let videoId = document.getElementById("videoId");
	let videoTag = document.getElementById("videoTag");

	//Strip names until search
	page.dataset.name = page.name;
	page.name = "";
	p1char.dataset.name = p1char.name;
	p1char.name = "";
	p1name.dataset.name = p1name.name;
	p1name.name = "";
	net.dataset.name = net.name;
	net.name = "";
	winner.dataset.name = winner.name;
	winner.name = "";
	p2char.dataset.name = p2char.name;
	p2char.name = "";
	p2name.dataset.name = p2name.name;
	p2name.name = "";
	videoId.dataset.name = videoId.name;
	videoId.name = "";
	videoTag.dataset.name = videoTag.name;
	videoTag.name = "";

	p1char.onchange = onFormChange;
	p1name.onchange = onFormChange;
	net.onchange = onFormChange;
	winner.onchange = onFormChange;
	p2char.onchange = onFormChange;
	p2name.onchange = onFormChange;
	videoId.onchange = onFormChange;
	videoTag.onchange = onFormChange;

	//Populate fields to the params
	let url = new URLSearchParams(location.search);
	page.value = url.get("page")||"1";
	p1char.value = url.get("p1char")||"";
	p1name.value = url.get("p1name")||"";
	net.value = url.get("net")||"";
	winner.value = url.get("winner")||"";
	p2char.value = url.get("p2char")||"";
	p2name.value = url.get("p2name")||"";
	videoTag.value = url.get("tag")||"";
	videoId.value = url.get("vid")||"";
	
	//Search button
	document.getElementById("search-button").addEventListener("click", () => {
		updateFormNames();
		let hasValue = updateFormNames();
		if(!hasValue) {
			page.name = page.dataset.name;
			page.value = "1";
		}
		form.submit();
	});

	//Pagination
	let pages = document.querySelectorAll("a[data-page]");
	for(let pageBtn of pages) {
		pageBtn.addEventListener("click", () => {
			page.name = page.dataset.name;
			page.value = pageBtn.dataset.page;
			let hasValue = updateFormNames();
			if(hasValue && page.value === "1") {
				page.name = "";
			}
			form.submit();
		});
	}

	//Report buttons
	let reportButtons = document.getElementsByClassName("report-button");
	for(let btn of reportButtons) {
		btn.addEventListener("click", () => {
			let answer = prompt("What is wrong with this match?");
			if(!answer || answer.length === 0) {
				return alert("Gotta give a reason for reporting something, pal.");
			}

			sendReport(btn.dataset.vid, btn.dataset.idx, btn.dataset.time, answer);
		});
	}

	function onFormChange(elem) {
		let pages = document.querySelectorAll(".ms-pagination");
		for(let p of pages) {
			p.classList.add("ms-disabled");
		}
	}

	function updateFormNames() {
		let hasValue = false;
		
		if(p1char.value.length > 0) {
			hasValue = true;
			p1char.name = p1char.dataset.name;
		}
		if(p1name.value.length > 0) {
			hasValue = true;
			p1name.name = p1name.dataset.name;
		}
		if(net.value.length > 0) {
			hasValue = true;
			net.name = net.dataset.name;
		}
		if(winner.value.length > 0) {
			hasValue = true;
			winner.name = winner.dataset.name;
		}
		if(p2char.value.length > 0) {
			hasValue = true;
			p2char.name = p2char.dataset.name;
		}
		if(p2name.value.length > 0) {
			hasValue = true;
			p2name.name = p2name.dataset.name;
		}
		if(videoId.value.length > 0) {
			hasValue = true;
			videoId.name = videoId.dataset.name;
		}
		if(videoTag.value.length > 0) {
			hasValue = true;
			videoTag.name = videoTag.dataset.name;
		}

		return hasValue;
	}

	function sendReport(vid, idx, time, reason) {
		fetch("/report", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				vid, idx, time, reason
			})
		}).then(() => {
			alert("Your report has been logged. Thanks!");
		});
	}
});