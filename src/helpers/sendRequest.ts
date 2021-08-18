import iconv from 'iconv-lite';
import fetch from 'node-fetch';
import { USER_AGENT } from '~/constants';
import { Parameters } from '~/models';

export const sendRequest = async (url: string, params?: Parameters): Promise<string> => {
	const stringifyParams = (params: Parameters) => {
		const values = [];
		if(params.cpage) {
			values.push(['cpage', params.cpage]);
		}
		values.push(...[
			['category', ''],
			['fromdate', params.fromdate],
			['todate', params.todate],
			['firm', ''],
			['equip', ''],
			['model_no', ''],
			['app_no', ''],
			['maker', ''],
			['nation', ''],
		]);
		return values.map(x => x.join('=')).join('&');
	};
	const res = await fetch(`${url}?${params ? stringifyParams(params) : ''}`, {
		method: 'GET',
		headers: {
			'content-type': 'application/x-www-form-urlencoded',
			'User-Agent': USER_AGENT,
			referer: url,
		},
	});
	if (!res.ok) {
		throw new Error(res.statusText);
	}
	const body = await res.buffer();
	return iconv.decode(body, 'euc-kr');
}
