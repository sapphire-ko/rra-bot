import {
	Item,
} from '~/models';

import {
	composeTweet,
} from '../composeTweet';

describe('helpers/composeTweet', () => {
	const item: Item = {
		id: '201817210000184930',
		type: '특정소출력 무선기기(무선데이터통신시...',
		date: '2018-08-02',
		manufacturer: '애플코리아 유한회사',
		model: 'A1990',
		tweet: 0,
	};

	test('success', () => {
		expect(composeTweet(item)).toBe([
			'[2018-08-02]',
			'[애플코리아 유한회사]',
			'[A1990]',
			'[특정소출력 무선기기(무선데이터통신시...]',
			'http://rra.go.kr/ko/license/A_b_popup.do?app_no=201817210000184930',
		].join('\n'));
	});
});
