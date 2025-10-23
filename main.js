const { program } = require('commander');
const fs = require('fs');
const http = require('http');

program
  .requiredOption('-i, --input <path>', 'if the file to be read is not found' )
  .requiredOption('-h, --host <path>', 'server address')
  .requiredOption('-p, --port <path>', 'порт сервера')

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
  res.end('Server works!');
});
server.listen(port, host);
