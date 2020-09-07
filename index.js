const gpio = require('onoff').Gpio;
const fs = require('fs');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const dhtSensor = require('node-dht-sensor').promises;
const KasaClient = require('tplink-smarthome-api').Client;

const kasaClient = new KasaClient();

dhtSensor.setMaxRetries(10);

const htmlPath = __dirname + '/html';

const mime = {
  html: 'text/html',
  txt: 'text/plain',
  css: 'text/css',
  gif: 'image/gif',
  jpg: 'image/jpeg',
  png: 'image/png',
  svg: 'image/svg+xml',
  js: 'application/javascript'
};

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
    pin: gpioPins['4'],
  },
  {
    id: 2,
    pin: gpioPins['17'],
  },
  {
    id: 3,
    pin: gpioPins['18'],
  },
  {
    id: 4,
    pin: gpioPins['27'],
  },
  {
    id: 5,
    pin: gpioPins['22'],
  },
  {
    id: 6,
    pin: gpioPins['23'],
  },
  {
    id: 7,
    pin: gpioPins['24'],
  },
  {
    id: 8,
    pin: gpioPins['25'],
  },
];

const server = http.createServer((req, res) => {
  const reqpath = req.url.toString().split('?')[0];
  const file = path.join(htmlPath, reqpath.replace(/\/$/, '/index.html'));
  if (file.indexOf(`${htmlPath}${path.sep}`) !== 0) {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain');
    return res.end('Forbidden');
  }
  const type = mime[path.extname(file).slice(1)] || 'text/plain';
  const readStream = fs.createReadStream(file);
  readStream.on('open', function () {
    res.setHeader('Content-Type', type);
    readStream.pipe(res);
  });
  readStream.on('error', function () {
    res.setHeader('Content-Type', 'text/plain');
    res.statusCode = 404;
    res.end('Not found');
  });
});

const io = socketIo(server);

console.log('Starting server...');
server.listen(8080, () => {
  console.log('Server started.');
});

io.sockets.on('connection', (socket) => {

  for (let i = 0; i < outlets.length; i++) {
    const data = {
      outlet: i + 1,
      state: outlets[i].pin.readSync() ? false : true,
    };
    socket.emit('outletState', JSON.stringify(data, null, 2));
  }

  socket.on('outletState', (data) => {
    console.log(`Received Outlet State Data: ${JSON.stringify(data, null, 2)}`);
    const decodedData = JSON.parse(data);
    const outletNumber = decodedData.outlet;
    const state = decodedData.state ? 0 : 1;
    const pin = outlets[outletNumber - 1].pin;
    if (state != pin.readSync()) {
      console.log(`Writing state ${state} to outlet ${outletNumber}.`);
      pin.writeSync(state);
      socket.emit('outletState', data);
    }
  });

  socket.on('updateEnvironment', () => {
    dhtSensor
      .read(11, 14)
      .then((response) => {
        const data = {
          temperature: response.temperature.toFixed(1),
          humidity: response.humidity.toFixed(1),
        };
        socket.emit('updateEnvironment', JSON.stringify(data, null, 2));
      })
      .catch((error) => {
        console.error(error);
      });
  });

  kasaClient.on('device-new', (device) => {

    console.log('device-new', device);
    device.startPolling(5000);

    // Plug Events
    device.on('power-on', () => {
      console.log('power-on', device);
    });
    device.on('power-off', () => {
      console.log('power-off', device);
    });
    device.on('power-update', (powerOn) => {
      console.log('power-update', device, powerOn);
    });
    device.on('in-use', () => {
      console.log('in-use', device);
    });
    device.on('not-in-use', () => {
      console.log('not-in-use', device);
    });
    device.on('in-use-update', (inUse) => {
      console.log('in-use-update', device, inUse);
    });

  });

  kasaClient.on('device-online', (device) => {
    console.log('device-online', device);
  });

  kasaClient.on('device-offline', (device) => {
    console.log('device-offline', device);
  });

  kasaClient.startDiscovery();

});
