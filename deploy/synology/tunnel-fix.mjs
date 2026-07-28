#!/usr/bin/env node
/**
 * tunnel-fix.mjs — Диагностика + настройка туннеля VPS→VM
 *
 * Проблема: VPS (193.222.62.240) → nginx → localhost:4200 → reverse tunnel → VM:3000
 *   502 Bad Gateway = tunnel или backend не работают
 *
 * 1. Диагностика tunnel + порт 4200
 * 2. Исправление nginx если нужно
 * 3. Проверка работоспособности
 */

import { Client } from 'ssh2';
import { writeFileSync, existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const VPS = {
  host: '193.222.62.240',
  port: 22,
  username: 'root',
  password: 'serenaubxuekin',
};

function sshExec(conn, command) {
  return new Promise((resolve, reject) => {
    conn.exec(command, (err, stream) => {
      if (err) return reject(err);
      let stdout = '', stderr = '';
      stream.on('data', (d) => stdout += d.toString());
      stream.stderr.on('data', (d) => stderr += d.toString());
      stream.on('close', (code) => resolve({ stdout: stdout.trim(), stderr: stderr.trim(), code }));
    });
  });
}

function sshConnect(config) {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    conn.on('ready', () => resolve(conn));
    conn.on('error', reject);
    conn.connect(config);
  });
}

async function main() {
  console.log('=== KPPDF 8.0 — Tunnel Fix ===\n');

  let conn;
  try {
    conn = await sshConnect(VPS);
    console.log('✅ SSH connected\n');
  } catch (err) {
    console.error('❌ SSH failed:', err.message);
    process.exit(1);
  }

  // ---- 1. Detailed tunnel check ----
  console.log('━━━ 1. TUNNEL & PORT 4200 CHECK ━━━');
  
  // Find the exact tunnel process
  let r = await sshExec(conn, "ps aux | grep '4200:localhost:3000' | grep -v grep");
  console.log('Reverse tunnel process:\n' + (r.stdout || '(NOT FOUND — tunnel is down!)'));

  // Check what's listening on port 4200
  r = await sshExec(conn, "ss -tlnp | grep ':4200 '");
  console.log('\nPort 4200 listener:\n' + (r.stdout || '(NOT LISTENING)'));

  // Try to curl port 4200 locally
  r = await sshExec(conn, 'curl -sf --connect-timeout 5 http://localhost:4200/api/health 2>&1 || echo "NO RESPONSE"');
  console.log(`\ncurl localhost:4200/api/health: ${r.stdout.slice(0, 200)}`);

  r = await sshExec(conn, 'curl -sf --connect-timeout 5 http://localhost:4200/ 2>&1 | head -5 || echo "NO RESPONSE"');
  console.log(`curl localhost:4200/: ${r.stdout.slice(0, 200)}`);

  // ---- 2. Check what's on port 3000 (old direct kppdf-3.0) ----
  console.log('\n━━━ 2. PORT 3000 CHECK ━━━');
  r = await sshExec(conn, "ss -tlnp | grep ':3000 '");
  console.log('Port 3000 listener:\n' + (r.stdout || '(NOT LISTENING — old kppdf-3.0 is dead)'));

  // ---- 3. nginx full config ----
  console.log('\n━━━ 3. NGINX CONFIG ━━━');
  r = await sshExec(conn, "nginx -T 2>/dev/null | grep -A10 'server {' | head -60");
  console.log(r.stdout || '(no config)');

  r = await sshExec(conn, 'ls -la /etc/nginx/sites-enabled/ 2>/dev/null');
  console.log('\nsites-enabled:\n' + (r.stdout || '(empty)'));

  // ---- 4. FIX: Update nginx config if needed ----
  console.log('\n━━━ 4. NGINX FIX ━━━');
  
  // Check if tunnel is running AND port 4200 is responding
  const tunnelRunning = r.stdout.includes('4200:localhost:3000');
  // Actually need to re-check tunnel
  r = await sshExec(conn, "ps aux | grep '4200:localhost:3000' | grep -v grep | head -1");
  const hasTunnel = r.stdout.length > 0;
  
  r = await sshExec(conn, "ss -tlnp | grep ':4200 '");
  const port4200Listening = r.stdout.length > 0;

  console.log(`Tunnel process: ${hasTunnel ? '✅ RUNNING' : '❌ DOWN'}`);
  console.log(`Port 4200: ${port4200Listening ? '✅ LISTENING' : '❌ NOT LISTENING'}`);

  if (!hasTunnel || !port4200Listening) {
    console.log('\n⚠️ Tunnel is DOWN. Options:');
    console.log('  A) Restart reverse tunnel from VM side (ssh -R 4200:localhost:3000 ...)');
    console.log('  B) Use SSH from VPS to VM if reachable');
    console.log('  C) Install cloudflared on VM for tunnel');
    
    // Try to restart the tunnel if possible
    // Check if we can reach the VM from VPS at all
    r = await sshExec(conn, 'curl -sf --connect-timeout 3 http://192.168.1.103:3000/api/health 2>&1 || echo "UNREACHABLE"');
    console.log(`\nVM direct check (192.168.1.103:3000): ${r.stdout.slice(0, 100)}`);
    
    r = await sshExec(conn, 'curl -sf --connect-timeout 3 http://10.0.0.47:3000/api/health 2>&1 || echo "UNREACHABLE"');
    console.log(`Synology check (10.0.0.47:3000): ${r.stdout.slice(0, 100)}`);
  } else {
    console.log('\n✅ Tunnel is running. Testing nginx proxy...');
    
    // Test nginx through the tunnel
    r = await sshExec(conn, 'curl -sf --connect-timeout 5 http://localhost:80/api/health 2>&1 || echo "NO RESPONSE"');
    console.log(`Via nginx (localhost:80/api/health): ${r.stdout.slice(0, 200)}`);
    
    if (r.stdout === 'NO RESPONSE' || r.stdout.includes('502')) {
      console.log('\n⚠️ Nginx returns 502 — checking nginx config...');
      
      // Check nginx proxy_pass
      r = await sshExec(conn, "grep -rn 'proxy_pass' /etc/nginx/ 2>/dev/null");
      console.log('proxy_pass directives:\n' + (r.stdout || '(not found)'));
      
      // The nginx is proxying to :4200 but the tunnel maps VM:3000→VPS:4200
      // This should work IF the tunnel is up AND VM backend is up
      console.log('\nPossible causes:');
      console.log('  1. VM backend is DOWN (needs redeploy)');
      console.log('  2. Tunnel is stale (process alive but connection dead)');
      console.log('  3. Firewall blocking');
    }
  }

  // ---- 5. nginx config review ----
  console.log('\n━━━ 5. CURRENT NGINX CONFIG ━━━');
  r = await sshExec(conn, 'cat /etc/nginx/sites-enabled/default 2>/dev/null || cat /etc/nginx/conf.d/default.conf 2>/dev/null');
  
  let nginxConfig = r.stdout;
  if (nginxConfig) {
    console.log(nginxConfig);
    
    // Check if proxy_pass points to :4200
    if (nginxConfig.includes('proxy_pass')) {
      const proxyLine = nginxConfig.split('\n').find(l => l.includes('proxy_pass'));
      console.log(`\nProxy directive: ${proxyLine ? proxyLine.trim() : '(not found)'}`);
      
      if (proxyLine && !proxyLine.includes('4200')) {
        console.log('\n⚠️ proxy_pass does NOT point to tunnel port 4200!');
        console.log('   Fix: change proxy_pass to http://localhost:4200;');
      }
    }
  } else {
    console.log('(no config found)');
  }

  conn.end();
  console.log('\n✅ Diagnostics complete');
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
