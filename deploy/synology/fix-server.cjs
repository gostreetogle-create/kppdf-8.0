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

  console.log('=== Step 1: Stop ALL old containers ===');
  console.log(await run('echo Tg30121986 | sudo -S docker stop $(docker ps -aq) 2>/dev/null; echo Tg30121986 | sudo -S docker rm $(docker ps -aq) 2>/dev/null; echo DONE'));

  console.log('\n=== Step 2: Check port 27017 ===');
  console.log(await run('ss -tlnp | grep 27017 || echo "Port 27017 free"'));

  console.log('\n=== Step 3: Start fresh stack ===');
  console.log(await run('cd /opt/kppdf-8.0 && echo Tg30121986 | sudo -S docker compose -f docker-compose.prod.yml up -d 2>&1'));

  console.log('\n=== Step 4: Wait 20s for boot ===');
  await new Promise(x => setTimeout(x, 20000));

  console.log('\n=== Step 5: Container status ===');
  console.log(await run('docker ps --format "{{.Names}}: {{.Status}}"'));

  console.log('\n=== Step 6: Health check ===');
  console.log(await run('curl -sf http://localhost:3000/api/health 2>&1'));

  console.log('\n=== Step 7: Frontend check ===');
  console.log(await run("curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/ 2>&1"));

  console.log('\n=== Step 8: Backend logs ===');
  console.log(await run('echo Tg30121986 | sudo -S docker logs kppdf-backend --tail=20 2>&1'));

  console.log('\n=== Step 9: Check what listens on 80/443 ===');
  console.log(await run('ss -tlnp | grep -E ":80 |:443 " || echo "Nothing on 80/443"'));

  console.log('\n=== Step 10: Check nginx/cloudflared ===');
  console.log(await run('echo Tg30121986 | sudo -S systemctl status nginx 2>&1 | head -5 || echo "nginx not found"'));
  console.log(await run('echo Tg30121986 | sudo -S systemctl status cloudflared 2>&1 | head -5 || echo "cloudflared not found"'));

  conn.end();
  process.exit(0);
});

conn.on('error', (err) => {
  console.error('SSH error:', err.message);
  process.exit(1);
});

conn.connect({ host: '192.168.1.103', username: 'tiit', password: 'Tg30121986' });
