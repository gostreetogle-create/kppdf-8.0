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

  console.log('=== ALL running containers ===');
  console.log(await run('docker ps -a --format "{{.Names}}: {{.Status}} {{.Image}}"'));

  console.log('\n=== ALL listening ports ===');
  console.log(await run('ss -tlnp'));

  console.log('\n=== All node processes ===');
  console.log(await run('ps aux | grep node | grep -v grep'));

  console.log('\n=== Check for kppdf-3.0 ===');
  console.log(await run('ls -la /opt/ | grep kppdf'));

  console.log('\n=== Check /etc/nginx or other web servers ===');
  console.log(await run('ls /etc/nginx/ 2>/dev/null || echo "no nginx"'));
  console.log(await run('ls /etc/apache2/ 2>/dev/null || echo "no apache"'));
  console.log(await run('ls /etc/caddy/ 2>/dev/null || echo "no caddy"'));

  console.log('\n=== Docker compose files ===');
  console.log(await run('find /opt -name "docker-compose*" -type f 2>/dev/null'));

  console.log('\n=== Check what serves port 80/443 on external IP ===');
  console.log(await run('ss -tlnp | grep -E ":80 |:443 |:8080 "'));

  conn.end();
  process.exit(0);
});

conn.on('error', (err) => {
  console.error('SSH error:', err.message);
  process.exit(1);
});

conn.connect({ host: '192.168.1.103', username: 'tiit', password: 'Tg30121986' });
