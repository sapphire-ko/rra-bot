import _ from 'lodash';

import IORedis from 'ioredis';

import IORedisMock from 'ioredis-mock';

import {
	Item,
} from '~/models';

import {
	serializeItem,
	deserializeItem,
} from '~/helpers';

export class Database {
	private readonly redis: IORedis.Redis;

	public constructor() {
		if (__test) {
			this.redis = new IORedisMock();
		}
		else {
			this.redis = new IORedis(process.env.REDIS_HOST);
		}
	}

	public get key() {
		return 'rra_bot';
	}

	public async flush() {
		await this.redis.flushall();
	}

	public async getItem(id: string): Promise<Item | null> {
		const res = await this.redis.hget(this.key, id);

		if (res === null) {
			return null;
		}
		return deserializeItem(res);
	}

	public async getItems(): Promise<Item[]> {
		const res: { [key: string]: string; } = await this.redis.hgetall(this.key);

		const items = Object.values(res).map(x => deserializeItem(x));
		return items.filter((x): x is Item => x !== null);
	}

	public async insertItem(nextItem: Item): Promise<boolean> {
		const id = nextItem.id;

		const prevItem = await this.getItem(id);
		if (prevItem !== null) {
			return false;
		}

		const value = serializeItem(nextItem);
		await this.redis.hset(this.key, nextItem.id, value);

		return true;
	}

	public async updateItem(nextItem: Item): Promise<boolean> {
		const id = nextItem.id;

		const prevItem = await this.getItem(id);
		if (prevItem === null) {
			return false;
		}
		if (prevItem.tweet === 1) {
			return false;
		}
		if (_.isEqual(prevItem, nextItem)) {
			return false;
		}

		const value = serializeItem(nextItem);
		await this.redis.hset(this.key, nextItem.id, value);

		return true;
	}
}
