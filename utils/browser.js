const puppeteer = require('puppeteer');
const path = require('path');

let browser;
let page;

async function start({ path }) {
  if (!browser) {
    browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  }
  if (!page) {
    page = await browser.newPage();
  }
  await page.goto(path);
  return page;
}

async function fill(content) {
  await page.setContent(
    `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="threme-color" content="#000000" />
        <title>Cover Letter</title>
        <link rel="stylesheet" href="../assets/style/main.css" />
      </head>
      <body>
        ${content}
      </body>
      </html>`,
    {
      waitUntil: 'networkidle0'
    }
  );
  return page;
}

const filePath = path.join(__dirname, '..', 'output');
async function pdf(time) {
  const tmp = time || new Date().getTime();
  const pdfName = `${filePath}/${tmp}.pdf`;
  const buf = await page.pdf({
    landscape: false,
    printBackground: true,
    path: pdfName
  });
  return pdfName;
}

async function close() {
  await browser.close();
}

async function getPDF(path) {
  await start({ path });
  const filePath = await pdf();
  return filePath;
}

module.exports = {
  filePath,
  getPDF,
  fill,
  start,
  pdf,
  close
};
