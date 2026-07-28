#!/usr/bin/env node
/**
 * tunnel-setup-v2.mjs — Настройка туннеля от VPS (193.222.62.240) до Synology/VM
 *
 * Топология:
 *   🌐 Интернет → 193.222.62.240 (VPS, maroon-ubuntu2604-spb-01)
 *       └─ нужно: туннель → Synology (10.0.0.47) → VM (192.168.1.103:3000)
 *
 * Шаги:
 *   1. SSH на VPS → диагностика сети (routing, nginx, порты)
 *   2. Настройка SSH reverse tunnel или nginx proxy
 *   3. Проверка работоспособности
 */

import { Client } from 'ssh2';
import { writeFileSync, existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ============================================================
// Конфигурация
// ============================================================
const VPS = {
  host: '193.222.62.240',
  port: 22,
  username: 'root',
  password: 'serenaubxuekin',
};

const CREDENTIALS_PATH = join(__dirname, 'CREDENTIALS.md');
const CONFIG_ENV_PATH = join(__dirname, 'config.env');

// ============================================================
// SSH Helper
// ============================================================
function sshExec(conn, command, options = {}) {
  return new Promise((resolve, reject) => {
    conn.exec(command, options, (err, stream) => {
      if (err) return reject(err);
      let stdout = '';
      let stderr = '';
      stream.on('data', (data) => { stdout += data.toString(); });
      stream.stderr.on('data', (data) => { stderr += data.toString(); });
      stream.on('close', (code) => {
        resolve({ stdout: stdout.trim(), stderr: stderr.trim(), code });
      });
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

// ============================================================
// Update credentials file
// ============================================================
function updateCredentials(vpsPassword, vpsHostname) {
  let content = '';
  if (existsSync(CREDENTIALS_PATH)) {
    content = readFileSync(CREDENTIALS_PATH, 'utf-8');
  }

  // Update or add VPS section
  const vpsSection = `
## VPS (внешний сервер-мост)

| Поле | Значение |
|------|----------|
| Имя бокса | \`${vpsHostname}\` |
| WAN IP | \`193.222.62.240\` |
| Пользователь | \`root\` |
| Пароль SSH | \`${vpsPassword}\` |
| Порт | \`22\` |
| OS | Ubuntu 26.04 (maroon-ubuntu2604-spb-01) |
`;

  // Replace old VPS section or append
  if (content.includes('## VPS')) {
    content = content.replace(/## VPS[\s\S]*?(?=\n## |\n---|$)/, vpsSection.trim());
  } else {
    content += '\n' + vpsSection;
  }

  writeFileSync(CREDENTIALS_PATH, content, 'utf-8');
  console.log('✅ CREDENTIALS.md обновлён');
}

function updateConfigEnv(vpsHost) {
  let content = '';
  if (existsSync(CONFIG_ENV_PATH)) {
    content = readFileSync(CONFIG_ENV_PATH, 'utf-8');
  }

  // Update DEPLOY_HOST
  const lines = content.split('\n').map(line => {
    if (line.startsWith('DEPLOY_HOST=')) return `DEPLOY_HOST=${vpsHost}`;
    return line;
  });
  writeFileSync(CONFIG_ENV_PATH, lines.join('\n'), 'utf-8');
  console.log('✅ config.env обновлён');
}

// ============================================================
// Main
// ============================================================
async function main() {
  console.log('=== KPPDF 8.0 — VPS Tunnel Setup ===');
  console.log(`Connecting to ${VPS.username}@${VPS.host}:${VPS.port}...`);

  let conn;
  try {
    conn = await sshConnect(VPS);
    console.log('✅ SSH connected!\n');
  } catch (err) {
    console.error('❌ SSH failed:', err.message);
    process.exit(1);
  }

  // ---- Step 1: Host info ----
  console.log('=== 1. Host Info ===');
  let r = await sshExec(conn, 'hostname');
  const hostname = r.stdout;
  console.log(`Hostname: ${hostname}`);

  r = await sshExec(conn, 'cat /etc/os-release | head -3');
  console.log(r.stdout);

  // ---- Step 2: Network ----
  console.log('\n=== 2. Network Diagnostics ===');

  r = await sshExec(conn, 'ip route show');
  console.log('Routing:\n' + r.stdout);

  r = await sshExec(conn, 'ip addr show | grep "inet "');
  console.log('IP addresses:\n' + r.stdout);

  // ---- Step 3: Check connectivity to Synology ----
  console.log('\n=== 3. Connectivity to Synology/VM ===');

  const targets = [
    { name: 'Synology DSM', host: '10.0.0.47:5000' },
    { name: 'Synology :3000', host: '10.0.0.47:3000' },
    { name: 'VM LAN', host: '192.168.1.103:3000' },
  ];

  for (const t of targets) {
    r = await sshExec(conn, `curl -sf --connect-timeout 5 http://${t.host}/api/health 2>&1 || echo 'UNREACHABLE'`);
    console.log(`${t.name} (${t.host}): ${r.stdout.slice(0, 100)}`);
  }

  // ---- Step 4: Existing services ----
  console.log('\n=== 4. Listening Ports ===');
  r = await sshExec(conn, "ss -tlnp | grep -E ':80 |:443 |:3000 |:4200 |:22 '");
  console.log(r.stdout || '(none)');

  console.log('\n=== 5. Nginx Config ===');
  r = await sshExec(conn, 'cat /etc/nginx/sites-enabled/* 2>/dev/null; cat /etc/nginx/conf.d/*.conf 2>/dev/null');
  console.log(r.stdout || '(no sites-enabled/conf.d files)');

  r = await sshExec(conn, 'nginx -t 2>&1; echo "EXIT:$?"');
  console.log('Nginx test:', r.stdout.slice(0, 200));

  console.log('\n=== 6. Docker Status ===');
  r = await sshExec(conn, 'docker ps -a 2>/dev/null || echo "Docker not installed"');
  console.log(r.stdout.slice(0, 500));

  console.log('\n=== 7. Existing Processes/Tunnels ===');
  r = await sshExec(conn, "ps aux | grep -E 'frp|ngrok|cloudflare|tunnel|autossh|ssh' | grep -v grep");
  console.log(r.stdout || '(none)');

  // ---- Step 8: Ping from VPS to find Synology ----
  console.log('\n=== 8. Network Discovery ===');
  r = await sshExec(conn, "ping -c 2 -W 3 10.0.0.47 2>&1 | tail -3");
  console.log(`Ping 10.0.0.47: ${r.stdout.slice(0, 200)}`);
  r = await sshExec(conn, "ping -c 2 -W 3 192.168.1.103 2>&1 | tail -3");
  console.log(`Ping 192.168.1.103: ${r.stdout.slice(0, 200)}`);
  r = await sshExec(conn, "ping -c 2 -W 3 46.158.58.183 2>&1 | tail -3");
  console.log(`Ping 46.158.58.183 (VM external): ${r.stdout.slice(0, 200)}`);

  // ---- Step 9: Try to find Synology via arp/neigh ----
  console.log('\n=== 9. ARP/Neighbor Table ===');
  r = await sshExec(conn, 'ip neigh show 2>/dev/null || arp -a 2>/dev/null');
  console.log(r.stdout || '(none)');

  // ---- Step 10: Try SSH from VPS to Synology ----
  console.log('\n=== 10. SSH from VPS to Synology ===');
  r = await sshExec(conn, 'ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no root@10.0.0.47 "echo OK" 2>&1');
  console.log(r.stdout.slice(0, 200));

  // ---- Summary ----
  console.log('\n=== DIAGNOSTICS COMPLETE ===');
  console.log(`Hostname: ${hostname}`);

  // Update credentials with new info
  updateCredentials(VPS.password, hostname);

  conn.end();
  console.log('\n✅ Done. Проверь вывод выше, чтобы понять как настраивать туннель.');
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
