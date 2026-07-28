const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', async () => {
  const run = (cmd) => new Promise((resolve) => {
    conn.exec(cmd, { pty: true }, (err, stream) => {
      let out = '';
      stream.on('data', (d) => { out += d.toString(); });
      stream.stderr.on('data', (d) => { out += d.toString(); });
      stream.on('close', () => resolve(out));
    });
  });

  console.log('=== Check MongoDB replica set status ===');
  console.log(await run('echo Tg30121986 | sudo -S docker exec kppdf-mongo mongo --eval "rs.status()" 2>&1'));

  console.log('\n=== Try direct connection from backend container ===');
  console.log(await run('echo Tg30121986 | sudo -S docker exec kppdf-backend node -e "const mongoose=require(\'mongoose\');mongoose.connect(\'mongodb://mongo:27017/kppdf?replicaSet=rs0\').then(()=>console.log(\'OK\')).catch(e=>console.error(e.message))" 2>&1'));

  console.log('\n=== Try without replicaSet ===');
  console.log(await run('echo Tg30121986 | sudo -S docker exec kppdf-backend node -e "const mongoose=require(\'mongoose\');mongoose.connect(\'mongodb://mongo:27017/kppdf\').then(()=>console.log(\'OK\')).catch(e=>console.error(e.message))" 2>&1'));

  console.log('\n=== Check mongo health ===');
  console.log(await run('echo Tg30121986 | sudo -S docker exec kppdf-mongo mongo --eval "db.adminCommand(\'ping\')" 2>&1'));

  conn.end();
  process.exit(0);
});

conn.on('error', (err) => {
  console.error('SSH error:', err.message);
  process.exit(1);
});

conn.connect({ host: '192.168.1.103', username: 'tiit', password: 'Tg30121986' });
