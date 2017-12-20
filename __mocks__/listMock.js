import fs from 'fs';
import path from 'path';

function listMock() {
	const filePath = path.resolve(__dirname, '../src', 'manufacturers.txt');
	const data = fs.readFileSync(filePath).toString();
	return data.split('\n');
}

export default listMock();
