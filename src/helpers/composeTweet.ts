import {
	Item,
} from '~/models';

export function composeTweet(item: Item): string {
	return [
		`[${item.date}]`,
		`[${item.manufacturer}]`,
		`[${item.model}]`,
		`[${item.type}]`,
		`http://rra.go.kr/ko/license/A_b_popup.do?app_no=${item.id}`,
	].join('\n');
}
