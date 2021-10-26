function convertSecondsToReadable(time) {
	time = parseInt(time, 10);

	if(time === 0) {
		return "0s";
	}

	let hours = 0;
	let minutes = 0;
	let seconds = 0;

	while(true) {
		if(time >= 3600) {
			hours++;
			time -= 3600;
			continue;
		}
		if(time >= 60) {
			minutes++;
			time -= 60;
			continue;
		}
		seconds = time;
		break;
	}

	let str = "";
	if(hours > 0 || (minutes === 0 && seconds === 0)) {
		str += `${hours}h`;
	}
	if(minutes > 0 || (hours === 0 && seconds === 0)) {
		str += `${minutes}m`;
	}
	if(seconds > 0 || (minutes === 0 && hours === 0)) {
		str += `${seconds}s`;
	}

	return str;
}

function convertTimeToSeconds(time) {
	let hour = time.match(/\d+h/g);
	let minute = time.match(/\d+m/g);
	let second = time.match(/\d+s/g);

	if(!hour && !minute && !second) {
		//Already in seconds, remove any padded 0s
		return parseInt(time, 10).toString();
	}
	let seconds = 0;
	if(hour) {
		seconds += 60 * 60 * parseInt(hour[0], 10);
	}
	if(minute) {
		seconds += 60 * parseInt(minute[0], 10);
	}
	if(second) {
		seconds += parseInt(second[0], 10);
	}

	return seconds;
}

module.exports = {
	convertSecondsToReadable,
	convertTimeToSeconds
};