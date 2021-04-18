import iconv from 'iconv-lite';
import fetch from 'node-fetch';
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
	const res = await fetch(url, {
		method: 'POST',
		headers: {
			'content-type': 'application/x-www-form-urlencoded',
			referer: url,
		},
		body: params ? stringifyParams(params) : '',
	});
	if (!res.ok) {
		throw new Error(res.statusText);
	}
	const body = await res.buffer();
	return iconv.decode(body, 'euc-kr');
}
