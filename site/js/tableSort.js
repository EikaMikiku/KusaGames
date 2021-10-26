document.addEventListener("DOMContentLoaded", () => {
	let tables = document.getElementsByClassName("sort-table");
	for(let table of tables) {
		TableSort(table, table.dataset.sort.split(","));
	}
});


function TableSort(table, config) {
	let tbody = table.tBodies[0];
	let th_cells = table.tHead.rows[0].cells;
	for(let i = 0; i < th_cells.length; i++) {
		if(config[i] === "") continue;
		
		th_cells[i].addEventListener("dblclick", () => columnClick(i));
		th_cells[i].addEventListener("click", () => columnClick(i));
	}

	function columnClick(idx) {
		let sorted_cell = table.getElementsByClassName("sorted-asc");
		if(!sorted_cell.length > 0) sorted_cell = table.getElementsByClassName("sorted-desc");
		
		if(sorted_cell.length > 0) {
			sorted_cell[0].classList.remove("sorted-asc");
		}
		//sorted_cell is dynamic, gotta check again
		if(sorted_cell.length > 0) {
			sorted_cell[0].classList.remove("sorted-desc");
		}

		sortRows(idx);
	}

	function sortRows(idx) {
		let rows = Array.prototype.slice.call(tbody.rows, 0);

		rows.sort((a, b) => {
			if(config[idx] === "text") {
				//Text
				if(parseInt(table.dataset.sorted) === idx) {
					return a.cells[idx].innerText.localeCompare(b.cells[idx].innerText);
				} else {
					return b.cells[idx].innerText.localeCompare(a.cells[idx].innerText);
				}
			} else if(config[idx] === "num") {
				//Numerical
				if(parseInt(table.dataset.sorted) === idx) {
					return parseFloat(a.cells[idx].innerText) - parseFloat(b.cells[idx].innerText);
				} else {
					return parseFloat(b.cells[idx].innerText) - parseFloat(a.cells[idx].innerText);
				}
			}
		});

		while(tbody.rows.length > 0) {
			tbody.deleteRow(0);
		}

		for(let i = 0; i < rows.length; i++) {
			tbody.appendChild(rows[i]);
		}

		if(parseInt(table.dataset.sorted) !== idx) {
			th_cells[idx].classList.add("sorted-desc");
			table.dataset.sorted = idx;
		} else {
			th_cells[idx].classList.add("sorted-asc");
			table.dataset.sorted = null;
		}
	}
}