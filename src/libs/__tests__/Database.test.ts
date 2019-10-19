import _ from 'lodash';

import faker from 'faker';

import {
	Item,
} from '~/models';

import {
	getDateString,
} from '~/helpers';

import {
	Database,
} from '../Database';

describe('libs/Database', () => {
	function getRandomItem(): Item {
		return {
			id: faker.random.alphaNumeric(8),
			type: faker.random.alphaNumeric(8),
			model: faker.random.alphaNumeric(8),
			manufacturer: faker.random.alphaNumeric(8),
			date: getDateString(faker.date.recent()),
			tweet: 0,
		};
	}

	const prevItem = getRandomItem();

	const database = new Database();

	beforeEach(async () => {
		await database.flush();
		await database.insertItem(prevItem);
	});

	describe('getItem', () => {
		test('success', async () => {
			const item = await database.getItem(prevItem.id);
			expect(item).not.toBeNull();
		});

		test('failure - not found', async () => {
			const id = faker.random.uuid();
			const item = await database.getItem(id);
			expect(item).toBeNull();
		});
	});

	describe('getItems', () => {
		test('success', async () => {
			const items = await database.getItems();
			expect(items).toHaveLength(1);
			expect(items).toContainEqual(prevItem);
		});
	});

	describe('insertItem', () => {
		test('success', async () => {
			const item = getRandomItem();

			const res = await database.insertItem(item);
			expect(res).toBe(true);

			const nextItem = await database.getItem(item.id);
			expect(nextItem).toEqual(item);
		});

		test('failure - duplicate', async () => {
			const item = _.cloneDeep(prevItem);

			const res = await database.insertItem(item);
			expect(res).toBe(false);

			const nextItem = await database.getItem(item.id);
			expect(nextItem).toEqual(prevItem);
		});
	});

	describe('updateItem', () => {
		test('success', async () => {
			const item = _.cloneDeep(prevItem);
			item.tweet = 1;

			const res = await database.updateItem(item);
			expect(res).toBe(true);

			const nextItem = await database.getItem(prevItem.id);
			expect(nextItem).not.toBeNull();
			expect(nextItem!.tweet).toBe(1);
		});

		test('failure', async () => {
			const item = _.cloneDeep(prevItem);
			item.tweet = 1;

			{
				const res = await database.updateItem(item);
				expect(res).toBe(true);
			}

			item.tweet = 0;
			const res = await database.updateItem(item);
			expect(res).toBe(false);

			const nextItem = await database.getItem(prevItem.id);
			expect(nextItem).not.toBeNull();
			expect(nextItem!.tweet).toBe(1);
		});
	});
});
