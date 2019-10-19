import iconv from 'iconv-lite';
import request from 'request-promise';

import {
	USER_AGENT,
} from '~/constants';

export async function sendRequest(url: string) {
	const body = await request({
		url,
		headers: { 'User-Agent': USER_AGENT },
		encoding: null,
	});
	return iconv.decode(body, 'euc-kr');
}
