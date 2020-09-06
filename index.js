const gpio = require('onoff').Gpio;
const fs = require('fs');
const http = require('http');
const socketIo = require('socket.io');

const htmlPath = __dirname + '/html';

const gpioPins = {
  '4': new gpio(4, 'out'),
};

const server = http.createServer((req, res) => {
  fs.readFile(`${htmlPath}/index.html`, (err, data) => {
    if (err) {
      console.error(err);
      res.writeHead(500);
      res.end(err.message);
    }
    else {
      console.error('Connection!');
      res.writeHead(200);
      res.end(data);
    }
  });
});

const io = socketIo(server);

server.listen(8080);

io.sockets.on('connection', (socket) => {
  socket.on('pinState', (data) => {
    console.log(`Received Pin State Data: ${JSON.stringify(data, null, 2)}`);
    const decodedData = JSON.parse(data);
    const pinNumber = decodedData.pin;
    const state = decodedData.state;
    const pin = gpioPins[pinNumber];
    if (state != pin.readSync()) {
      console.log(`Writing state ${state} to pin ${pin}.`);
      pin.writeSync(state);
    }
  });
});
