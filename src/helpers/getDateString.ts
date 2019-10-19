export function getDateString(date: Date, dateDiff?: number): string {
	const nextDate = new Date(date);
	if (dateDiff !== undefined) {
		nextDate.setDate(nextDate.getDate() + dateDiff);
	}
	return [
		nextDate.getUTCFullYear(),
		`${nextDate.getUTCMonth() + 1}`.padStart(2, '0'),
		`${nextDate.getUTCDate()}`.padStart(2, '0'),
	].join('');
}
