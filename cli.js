const path = require("path");

const getConfig = function getConfig() {
  if (process.argv.length < 4) {
    console.error("Vous devez indiquer le fichier de configuration");
    console.info(`Usage : node ${process.argv[1]} <fileName> <command>`);
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
  let param = process.argv[5] || null;
  if (process.argv[3] === "set") {
    console.log('true');
    socket.emit(process.argv[3], process.argv[4], param, (value) => {
      console.log(`get callback: ${value}`);
          acc = value || 0;
          socket.close();
        });
  }else {
    socket.emit(process.argv[3], process.argv[4], (value) => {
      console.log(`get callback: ${value}`);
          acc = value || 0;
          socket.close();
        });
  }


});
