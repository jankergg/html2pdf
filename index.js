/*
 * @Author: Jianqiang Zhang
 * @Date:   2020-01-08 11:33:03
 * @Last Modified by:   Jianqiang Zhang
 * @Last Modified time: 2020-01-09 15:19:20
 */
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const browser = require('./utils/browser');
const path = require('path');
// local port
const port = 8000;
// make `public` visible outside
app.use(express.static('public'));
app.use(bodyParser.json());

const message = (msg, data) => ({ msg, data });
// set a simple pool to hold cache
let data_pool = '';
let lastUpdate = '';
// generate pdf
app.post('/pdf/gen', async function(req, res, next) {
	console.log('generating...');
	// TODO: replace timeStamp with credential token
	const timeStamp = req.body.data;
	if (!data_pool) {
		console.log('no data...ending');
		res.json(message('no data', null));
		return;
	}
	if (!timeStamp || timeStamp !== lastUpdate) {
		console.log(timeStamp, lastUpdate);
		console.log('invalid timestamp ...ending');
		res.json(message('invalid timestamp', null));
		return;
	}
	console.log('data_pool is...', data_pool);
	const pdfUrl = await yieldPdf(data_pool, timeStamp);
	console.log(pdfUrl);
	res.json(message('success', timeStamp));
});
// download pdf
app.get('/download/:fileName', function(req, res) {
	console.log(req.params)
	res.download(browser.filePath + '/' + req.params.fileName + '.pdf', 'Cover-Letter.pdf');
});
// update data
app.post('/pdf/update', function(req, res, next) {
	// if cached item exceeds 100, then release it.
	console.log('received...', req.body.data);
	data_pool = req.body.data;
	console.log('...updated');
	lastUpdate = new Date().getTime();
	res.json({ data: lastUpdate });
});

// run app on port
app.listen(port, () => {
	console.log('server is running on port' + port);
});

// logics for yield pdf
async function yieldPdf(content, time) {
	const templatePath = 'http://localhost:' + port + '/template/boilerplate.html';
	await browser.start({ path: templatePath });
	console.log('browser start...', templatePath);
	if (content) {
		await browser.fill(content);
	}
	const filePath = await browser.pdf(time);
	return filePath;
}
