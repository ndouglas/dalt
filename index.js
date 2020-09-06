const gpio = require('onoff').Gpio;
const fs = require('fs');
const http = require('http');
const socketIo = require('socket.io');

const htmlPath = __dirname + '/html';

const gpioPins = {
  '4': new gpio(4, 'out'),
  '17': new gpio(17, 'out'),
  '18': new gpio(18, 'out'),
  '27': new gpio(27, 'out'),
  '22': new gpio(22, 'out'),
  '23': new gpio(23, 'out'),
  '24': new gpio(24, 'out'),
  '25': new gpio(25, 'out'),
};

const outlets = [
  {
    id: 1,
    pinNo: gpioPins.4,
  },
  {
    id: 2,
    pin: gpioPins.17,
  },
  {
    id: 3,
    pinNo: gpioPins.18,
  },
  {
    id: 4,
    pin: gpioPins.27,
  },
  {
    id: 5,
    pinNo: gpioPins.22,
  },
  {
    id: 6,
    pin: gpioPins.23,
  },
  {
    id: 7,
    pinNo: gpioPins.24,
  },
  {
    id: 8,
    pin: gpioPins.25,
  },
];

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
  socket.on('outletState', (data) => {
    console.log(`Received Outlet State Data: ${JSON.stringify(data, null, 2)}`);
    const decodedData = JSON.parse(data);
    const outletNumber = decodedData.outlet;
    const state = decodedData.state ? 0 : 1;
    const pin = outlets[outletNumber - 1];
    if (state != pin.readSync()) {
      console.log(`Writing state ${state} to outlet ${outletNumber}.`);
      pin.writeSync(state);
    }
  });
});
