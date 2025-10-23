const { program } = require('commander');
const fs = require('fs');
const http = require('http');
const { XMLBuilder } = require('fast-xml-parser');
const { URL } = require('url');

program
  .requiredOption('-i, --input <path>', 'path to input file' )
  .requiredOption('-h, --host <path>', 'server address')
  .requiredOption('-p, --port <path>', 'server port')

program.parse(process.argv);
const options = program.opts();
const inputFilePath = options.input;
const host = options.host;
const port = options.port;

if (!fs.existsSync(options.input)) {
  console.error('Cannot find input file');
  process.exit(1);
}

const server = http.createServer((req, res) => {
    fs.readFile(inputFilePath, 'utf8', (err, data) => {
        if (err) {
  res.writeHead(500, { 'Content-Type': 'text/plain' });
  res.end('Server Error: Could not read file.');
  return;
}
try {
      const banksData = JSON.parse(data);
      const requestUrl = new URL(req.url, `http://${req.headers.host}`);
      const queryParams = requestUrl.searchParams;

      let filteredBanks = [...banksData];
      if (queryParams.get('normal') === 'true') {
        filteredBanks = filteredBanks.filter(bank => String(bank.COD_STATE) === '1');
      }
      const banksForXml = filteredBanks.map(bank => {
        const bankRecord = {
          name: bank.NAME,
          state_code: bank.COD_STATE,
        };
        if (queryParams.get('mfo') === 'true') {
          bankRecord.mfo_code = bank.MFO;
        }
        return bankRecord;
      });
      const builder = new XMLBuilder();
      const xmlOutput = builder.build({ banks: { bank: banksForXml } });
res.writeHead(200, { 'Content-Type': 'application/xml' });
res.end(xmlOutput);

} catch (parseError) {
  res.writeHead(500, { 'Content-Type': 'text/plain' });
  res.end('Server Error: Invalid JSON format in file.');
}
});
});
server.listen(port, host, () => {
    console.log(`Server is running successfully at http://${host}:${port}`);
});