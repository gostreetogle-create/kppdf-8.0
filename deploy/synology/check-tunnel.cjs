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

  console.log('=== Check tunnel process ===');
  console.log(await run('ps aux | grep ssh | grep -v grep'));

  console.log('\n=== Check if 4200 is forwarded ===');
  console.log(await run('ss -tlnp | grep :4200 || echo "No 4200 on VM"'));

  console.log('\n=== Try tunnel with password via expect ===');
  // Use sshpass or expect to provide password
  console.log(await run('which sshpass 2>/dev/null || echo "sshpass not found"'));
  console.log(await run('which expect 2>/dev/null || echo "expect not found"'));

  console.log('\n=== Try setting up tunnel with ssh key ===');
  // Generate key if not exists
  console.log(await run('ls ~/.ssh/id_rsa.pub 2>/dev/null || ssh-keygen -t rsa -N "" -f ~/.ssh/id_rsa 2>&1'));

  console.log('\n=== Show public key ===');
  console.log(await run('cat ~/.ssh/id_rsa.pub 2>&1'));

  conn.end();
  process.exit(0);
});

conn.on('error', (err) => {
  console.error('SSH error:', err.message);
  process.exit(1);
});

conn.connect({ host: '192.168.1.103', username: 'tiit', password: 'Tg30121986' });
