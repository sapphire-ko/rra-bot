export function dateToString(date) {
	return `${date.getFullYear()}${`0${date.getMonth() + 1}`.substr(-2)}${`0${date.getDate()}`.substr(-2)}`;
}
