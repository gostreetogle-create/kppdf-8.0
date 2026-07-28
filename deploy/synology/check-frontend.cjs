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

  console.log('=== Check frontend files on server ===');
  console.log(await run('ls -la /opt/kppdf-8.0/frontend/browser/ 2>&1 | head -10'));

  console.log('\n=== Check if index.html exists ===');
  console.log(await run('ls -la /opt/kppdf-8.0/frontend/browser/index.html 2>&1'));

  console.log('\n=== Check frontend directory ===');
  console.log(await run('ls /opt/kppdf-8.0/frontend/ 2>&1'));

  console.log('\n=== Check container frontend mount ===');
  console.log(await run('echo Tg30121986 | sudo -S docker inspect kppdf-backend --format "{{range .Mounts}}{{.Source}} -> {{.Destination}}{{println}}{{end}}" 2>&1'));

  console.log('\n=== Check frontend in container ===');
  console.log(await run('echo Tg30121986 | sudo -S docker exec kppdf-backend ls -la /app/frontend/ 2>&1 | head -10'));

  console.log('\n=== Try accessing frontend directly ===');
  console.log(await run('curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>&1'));

  console.log('\n=== Backend logs for frontend ===');
  console.log(await run('echo Tg30121986 | sudo -S docker logs kppdf-backend 2>&1 | grep -i "frontend\|static\|500" | tail -5'));

  conn.end();
  process.exit(0);
});

conn.on('error', (err) => {
  console.error('SSH error:', err.message);
  process.exit(1);
});

conn.connect({ host: '192.168.1.103', username: 'tiit', password: 'Tg30121986' });
