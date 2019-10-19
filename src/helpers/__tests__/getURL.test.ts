import faker from 'faker';

import {
	BASE_URL,
} from '~/constants';

import {
	Parameters,
} from '~/models';

import {
	getDateString,
} from '~/helpers';

import {
	getURL,
} from '../getURL';

describe('helpers/getURL', () => {
	test('success', () => {
		const parameters: Parameters = {
			cpage: faker.random.number(),
			category: '',
			fromdate: getDateString(faker.date.recent()),
			todate: getDateString(faker.date.recent()),
		};

		const url = getURL(parameters);
		const params = Object.entries(parameters).map(([key, value]) => {
			return `${key}=${encodeURIComponent(value)}`;
		}).join('&');
		expect(url).toBe(`${BASE_URL}?${params}`);
	});
});
