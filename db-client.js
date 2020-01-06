const path = require("path");

const getConfig = function getConfig() {
  if (process.argv.length < 3) {
    console.error("Vous devez indiquer le fichier de configuration");
    console.info(`Usage : node ${process.argv[1]} <fileName>`);
    throw new Error("Need config filename");
  } else {
    return require(path.resolve(process.argv[2]));
  }
}

const config = getConfig();

const PORT = config.port;

const io = require('socket.io-client');

const socket = io(`http://localhost:${PORT}`, {
  path: '/dbyb',
});

socket.on('connect', () => {
  console.log('Connection établie');

  let acc;

  socket.emit('get', 'test', (value) => {
    console.log(`get callback: ${value}`);
    acc = value || 0;

    socket.emit('set', 'test', acc + 1, (value) => {
      console.log(`set callback: ${value}`);
      socket.close();
    });
  });
});
