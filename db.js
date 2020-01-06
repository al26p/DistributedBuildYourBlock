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

const Server = require('socket.io');
const io = new Server(PORT, {
  path: '/dbyb',
  serveClient: false,
});

console.log(`Serveur lancé sur le port ${PORT}.`);

const io_cli = require('socket.io-client');
var friends = new Array(0);
for (const p of config.friends){
  const s = io_cli(`http://localhost:${p}`, {
    path: '/dbyb',
  });
  friends.push(s);
}

console.log(`Serveurs connectés`);

const db = Object.create(null);

io.on('connect', (socket) => {
  console.log('Nouvelle connexion');

  socket.on('get', function(field, callback){
    console.log(`get ${field}: ${db[field]}`);
    callback(db[field]);
  });

  socket.on('set', function(field, value, callback){
    if (field in db) {
      console.log(`set error : Field ${field} exists.`);
      callback(false);
    } else {
      console.log(`set ${field} : ${value}`);
      db[field] = value;
      for (const f of friends){
        console.log('Begin duplicate to', f.io.uri);
        f.emit('set', field, value, (v) => {
          console.log(`duplicate callback to ${f.io.uri} : ${v}`);
        });
      }
      callback(true);
    }
  });

  socket.on('keys', function(field, callback){
    let keys = Object.keys(db);
    callback(keys);
  });
});
