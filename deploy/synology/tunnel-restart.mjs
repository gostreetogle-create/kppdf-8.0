#!/usr/bin/env node
/**
 * tunnel-restart.mjs — Перезапуск reverse tunnel на VPS + проверка
 *
 * Ситуация: backend на VM перезапущен (healthy), но 502 остаётся.
 * Причина: туннель мог оборваться, пока backend был down.
 * Решение: проверить tunnel, перезапустить если нужно, подправить nginx.
 */

import { Client } from 'ssh2';

const VPS = {
  host: '193.222.62.240',
  port: 22,
  username: 'root',
  password: 'serenaubxuekin',
};

function sshExec(conn, cmd) {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let out = '', errOut = '';
      stream.on('data', d => out += d.toString());
      stream.stderr.on('data', d => errOut += d.toString());
      stream.on('close', code => resolve({ out: out.trim(), err: errOut.trim(), code }));
    });
  });
}

async function main() {
  console.log('=== TUNNEL RESTART ===\n');

  const conn = await new Promise((resolve, reject) => {
    const c = new Client();
    c.on('ready', () => resolve(c));
    c.on('error', reject);
    c.connect(VPS);
  });
  console.log('✅ SSH to VPS\n');

  // 1. Check tunnel process
  let r = await sshExec(conn, "ps aux | grep '4200:localhost:3000' | grep -v grep | head -3");
  const hadTunnel = r.out.length > 0;
  console.log(`Old tunnel process: ${hadTunnel ? '✅ WAS RUNNING' : '❌ NOT FOUND'}`);
  if (hadTunnel) console.log(r.out);

  // 2. Kill old tunnel if exists
  if (hadTunnel) {
    r = await sshExec(conn, "pkill -f '4200:localhost:3000' 2>&1 || true");
    console.log('Killed old tunnel');
    await new Promise(r => setTimeout(r, 2000));
  }

  // 3. Check port 4200
  r = await sshExec(conn, "ss -tlnp | grep ':4200 '");
  console.log(`Port 4200 after kill: ${r.out.length > 0 ? '⚠️ STILL LISTENING' : '✅ FREE'}`);

  // 4. Start new tunnel from VPS side (try all routes to VM)
  console.log('\nTrying to establish tunnel...');
  
  // Try all possible VM routes
  const routes = ['192.168.1.103', '46.158.58.183', '10.0.0.47'];
  let tunnelStarted = false;
  
  for (const vmIp of routes) {
    console.log(`  Trying VM via ${vmIp}:3000...`);
    r = await sshExec(conn, `curl -sf --connect-timeout 3 http://${vmIp}:3000/api/health 2>&1 || echo 'UNREACHABLE'`);
    
    if (!r.out.includes('UNREACHABLE') && r.out.includes('ok')) {
      console.log(`  ✅ VM reachable at ${vmIp}:3000 — backend responding!`);
      
      // Create reverse tunnel: VPS:4200 → VM_IP:3000
      // This uses socat to forward localhost:4200 → VM_IP:3000
      r = await sshExec(conn, `which socat 2>/dev/null && echo 'socat found' || echo 'socat not found'`);
      const hasSocat = r.out.includes('socat found');
      console.log(`  socat: ${hasSocat ? '✅' : '❌ not installed'}`);
      
      if (hasSocat) {
        // Kill any old socat
        await sshExec(conn, "pkill -f 'socat.*4200' 2>&1 || true");
        // Start socat forwarder
        await sshExec(conn, `setsid socat TCP-LISTEN:${4200},reuseaddr,fork TCP:${vmIp}:3000 &`);
        console.log(`  Started socat forwarder: VPS:4200 → ${vmIp}:3000`);
        tunnelStarted = true;
      }
      break;
    } else {
      console.log(`  ❌ ${vmIp}: UNREACHABLE`);
    }
  }

  if (!tunnelStarted) {
    console.log('\n⚠️ Cannot reach VM from VPS directly.');
    console.log('   The tunnel must be initiated FROM the VM side:');
    console.log('   Run this on VM (192.168.1.103):');
    console.log('   ssh -R 4200:localhost:3000 root@193.222.62.240 -N');
    console.log('   (password: serenaubxuekin)');
  }

  // 5. Wait and check
  await new Promise(r => setTimeout(r, 3000));
  
  r = await sshExec(conn, `curl -sf --connect-timeout 5 http://localhost:${4200}/api/health 2>&1 || echo 'FAIL'`);
  console.log(`\nBackend via localhost:${4200}: ${r.out.slice(0, 150)}`);

  r = await sshExec(conn, 'curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 http://localhost:80/ 2>&1 || echo ERR');
  console.log(`Via nginx localhost:80: HTTP ${r.out}`);

  r = await sshExec(conn, 'ss -tlnp | grep ":4200\\|:3000\\|:80 "');
  console.log(`\nFinal port status:\n${r.out || '(none)'}`);

  conn.end();
  
  console.log('\n=== DONE ===');
  if (tunnelStarted) {
    console.log('✅ Tunnel restarted — check http://kppdf-crm.ru/');
  } else {
    console.log('❌ Need manual tunnel from VM side');
  }
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
