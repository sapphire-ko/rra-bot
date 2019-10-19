import request from 'supertest';

import {
	Item,
} from '~/models';

import {
	Server,
} from '../Server';

describe('libs/Server', () => {
	const item: Item = {
		id: '201817210000184930',
		type: '특정소출력 무선기기(무선데이터통신시...',
		date: '2018-08-02',
		manufacturer: '애플코리아 유한회사',
		model: 'A1990',
		tweet: 0,
	};

	class TestServer extends Server {
		protected async getItems(): Promise<Item[]> {
			return [item];
		}
	}

	const server = new TestServer();

	afterAll(() => {
		server.close();
	});

	test('/', async () => {
		const { body } = await request(server.app).get('/').expect(200);

		expect(body).toBe(true);
	});

	test('/api', async () => {
		const { body } = await request(server.app).get('/api').expect(200);

		expect(body).toHaveLength(1);
		expect(body).toContainEqual(item);
	});
});
