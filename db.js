const path = require("path");
const process = require("process");
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
var ff = config.friends;
const regex = /::ffff:/;

const io = new Server(PORT, {
  path: '/dbyb',
  serveClient: false,
});

const addPeer = (f) => {
  const s = io_cli(f, {
    path: '/dbyb',
  });
  friends.push(s);
};

console.log(`Serveur lancé sur le port ${PORT}.`);

const io_cli = require('socket.io-client');
var friends = new Array(0);
for (const f of ff){
  addPeer(f)
}
console.log(`Serveurs connectés`);

const db = Object.create(null);

const check = () => {
  for(const f of friends){
    f.emit('getPeers', '', (peers) => {
      for (const f of peers) {
        console.log("add", f)
        addPeer(f)
      }

      f.emit('register', config.port, (cb) => {
        console.log('recieved', cb)
        if(!cb){
          console.log('Failed to register');
          process.exit();
        }
      });
    });
    f.emit('keys', '', value => {
      for(const c of value){
        if(!(c in db)){
        f.emit('get', c, (v) => {
            db[c] = v;
            console.log('added new value');
          });
        }
      }
    });
  }
};

check();

io.on('connect', (socket) => {
  console.log('Nouvelle connexion');

  //Get values
  socket.on('get', function(field, callback){
    console.log(`get ${field}: ${db[field]}`);
    callback(db[field]);
  });

  //Set new value
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

  //Get keys from db
  socket.on('keys', function(field, callback){
    let keys = Object.keys(db);
    callback(keys);
  });

  //Register new server
  socket.on('register', function(pport, callback){
    let add = "" + socket.handshake.address;
    add = add.replace(regex, '')
    addPeer('http://' + add + ':' + pport);
    ff.push('http://' + add + ':' + pport);
    callback(true);
  });

  socket.on('getPeers', function(field, callback){
    callback(ff);
  });
});
