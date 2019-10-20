import {
	Item,
} from '~/models';

import {
	serializeItem,
	deserializeItem,
} from '../serializeItem';

describe('helpers/serializeItem', () => {
	const prevItem: Item = {
		id: '201817210000184930',
		type: '특정소출력 무선기기(무선데이터통신시...',
		date: '2018-08-02',
		manufacturer: '애플코리아 유한회사',
		model: 'A1990',
		tweet: 0,
	};

	test('success', () => {
		const value = serializeItem(prevItem);
		const nextItem = deserializeItem(value);

		expect(nextItem).toEqual(prevItem);
	});
});
