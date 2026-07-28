const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', async () => {
  console.log('Connected to VM. Starting interactive shell for tunnel...');

  // Get interactive shell
  conn.shell((err, stream) => {
    if (err) {
      console.error('Shell error:', err.message);
      conn.end();
      process.exit(1);
    }

    let output = '';
    stream.on('data', (data) => {
      const text = data.toString();
      output += text;
      process.stdout.write(text);

      // After shell prompt appears, run tunnel command
      if (output.includes('$') || output.includes('#')) {
        setTimeout(() => {
          // Kill old tunnels first
          stream.write('sudo pkill -f "ssh -R"\n');
          stream.write('sudo pkill -f autossh\n');
          stream.write('sleep 2\n');
          // Start new tunnel
          stream.write('ssh -R 4200:localhost:3000 root@193.222.62.240 -N -o StrictHostKeyChecking=no -o ServerAliveInterval=30 &\n');
          stream.write('sleep 3\n');
          stream.write('ps aux | grep "ssh -R" | grep -v grep\n');
          stream.write('curl -sf http://localhost:3000/api/health\n');
          stream.write('echo TUNNEL_CHECK_DONE\n');
        }, 2000);
      }

      if (output.includes('TUNNEL_CHECK_DONE')) {
        setTimeout(() => {
          stream.write('exit\n');
          conn.end();
          process.exit(0);
        }, 2000);
      }
    });

    stream.on('close', () => {
      conn.end();
      process.exit(0);
    });
  });
});

conn.on('error', (err) => {
  console.error('SSH error:', err.message);
  process.exit(1);
});

conn.connect({ host: '192.168.1.103', username: 'tiit', password: 'Tg30121986' });
