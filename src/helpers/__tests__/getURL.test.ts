import { BASE_URL } from '~/constants';
import { getURL } from '../getURL';

describe('helpers/getURL', () => {
	test('success', () => {
		const url = getURL();
		expect(url).toBe(BASE_URL);
	});
});
