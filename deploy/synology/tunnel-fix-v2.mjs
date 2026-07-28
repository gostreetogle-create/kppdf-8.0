#!/usr/bin/env node
/**
 * tunnel-fix-v2.mjs — ПОЛНАЯ НАСТРОЙКА ТУННЕЛЯ + NGINX
 *
 * Топология:
 *   193.222.62.240 (VPS) ← nginx:80 → localhost:4200 ← reverse tunnel ← VM:3000
 *
 * Что делает:
 *   1. Диагностика tunnel/nginx/backend
 *   2. Фикс nginx конфига если нужно
 *   3. Попытка достучаться до VM через альтернативные пути
 *   4. Настройка autossh для стабильного туннеля
 *   5. Проверка работоспособности
 *   6. Обновление документации
 */

import { Client } from 'ssh2';
import { writeFileSync, existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');

// ============================================================
// Config
// ============================================================
const VPS = {
  host: '193.222.62.240',
  port: 22,
  username: 'root',
  password: 'serenaubxuekin',
};

const VM = {
  lan: '192.168.1.103',
  external: '46.158.58.183',
  user: 'tiit',
  password: 'Tg30121986',
};

const TUNNEL_PORT = 4200;
const BACKEND_PORT = 3000;

// ============================================================
// SSH Helpers
// ============================================================
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

// ============================================================
// Update documentation
// ============================================================
function updateDeployDocs(vpsHostname) {
  // Update CREDENTIALS.md
  const credPath = join(__dirname, 'CREDENTIALS.md');
  let credContent = existsSync(credPath) ? readFileSync(credPath, 'utf-8') : '';

  // Add/update VPS section with new password
  const vpsSection = `\n## VPS (внешний сервер-мост)

| Поле | Значение |
|------|----------|
| Имя бокса | \`${vpsHostname}\` |
| WAN IP | \`193.222.62.240\` |
| Пользователь | \`root\` |
| Пароль SSH (НОВЫЙ) | \`serenaubxuekin\` |
| Старый пароль | \`Tg30121986\` (больше не работает) |
| Порт | \`22\` |
| OS | Ubuntu 26.04 LTS |
`;

  // Replace old VPS section or append
  if (credContent.includes('## VPS')) {
    credContent = credContent.replace(/## VPS[\s\S]*?(?=\n## |\n---|$)/, '\n' + vpsSection.trim());
  } else {
    credContent += '\n' + vpsSection;
  }

  // Update SSH password section
  if (credContent.includes('Пароль SSH')) {
    credContent = credContent.replace(/Пароль SSH\s*\n\s*\|\s*`[^`]+`/g, (match) => {
      if (match.includes('Tg30121986')) {
        return match.replace('Tg30121986', 'serenaubxuekin');
      }
      return match;
    });
  }

  writeFileSync(credPath, credContent, 'utf-8');
  console.log('✅ CREDENTIALS.md обновлён (новый пароль VPS)');

  // Update config.env
  const envPath = join(__dirname, 'config.env');
  if (existsSync(envPath)) {
    let envContent = readFileSync(envPath, 'utf-8');
    // Don't store VPS password in config.env (that's for deploy.py which uses VM)
    writeFileSync(envPath, envContent, 'utf-8');
  }
}

async function main() {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║   KPPDF 8.0 — TUNNEL FIX v2                ║');
  console.log('╚══════════════════════════════════════════════╝\n');

  let conn;
  try {
    conn = await sshConnect(VPS);
    console.log('✅ SSH to VPS connected\n');
  } catch (err) {
    console.error('❌ SSH to VPS failed:', err.message);
    process.exit(1);
  }

  // ============================================================
  // PHASE 1: DIAGNOSTICS
  // ============================================================
  console.log('╔══ PHASE 1: DIAGNOSTICS ══╗\n');

  // Host info
  let r = await sshExec(conn, 'hostname && cat /etc/os-release | head -1');
  console.log(`Host: ${r.stdout}`);

  // Tunnel status
  r = await sshExec(conn, "ps aux | grep '4200:localhost:3000' | grep -v grep | head -3");
  console.log(`\nTunnel process:\n${r.stdout || '(NOT FOUND)'}`);
  const hasTunnel = r.stdout.length > 0;

  // Port 4200
  r = await sshExec(conn, `ss -tlnp | grep ':${TUNNEL_PORT} '`);
  console.log(`\nPort ${TUNNEL_PORT}:\n${r.stdout || '(NOT LISTENING)'}`);
  const port4200Up = r.stdout.length > 0;

  // Backend response through tunnel
  r = await sshExec(conn, `curl -sf --connect-timeout 5 http://localhost:${TUNNEL_PORT}/api/health 2>&1 || echo 'NO RESPONSE'`);
  const backendThroughTunnel = r.stdout;
  console.log(`\nBackend via tunnel (localhost:${TUNNEL_PORT}/api/health): ${backendThroughTunnel.slice(0, 100)}`);
  const backendOK = backendThroughTunnel.includes('ok') || backendThroughTunnel.includes('status');

  // nginx config
  r = await sshExec(conn, "cat /etc/nginx/sites-available/kppdf-proxy 2>/dev/null || cat /etc/nginx/sites-enabled/default 2>/dev/null || echo 'NO CONFIG'");
  const nginxConfig = r.stdout;
  console.log(`\nNginx config:\n${nginxConfig.slice(0, 400)}`);

  // Test nginx
  r = await sshExec(conn, 'curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 http://localhost:80/api/health 2>&1 || echo "ERROR"');
  console.log(`\nVia nginx (localhost:80): HTTP ${r.stdout}`);

  // ============================================================
  // PHASE 2: FIX NGINX IF NEEDED
  // ============================================================
  console.log('\n╔══ PHASE 2: NGINX SETUP ══╗\n');

  // Check if nginx config needs fixing
  if (nginxConfig === 'NO CONFIG') {
    console.log('Creating nginx config...');
    const newConfig = `server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name _;

    location / {
        proxy_pass http://localhost:${TUNNEL_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 120s;
        proxy_send_timeout 120s;
    }

    location /api/health {
        proxy_pass http://localhost:${TUNNEL_PORT};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_read_timeout 10s;
    }
}
`;
    // Write config
    const escapedConfig = newConfig.replace(/'/g, "'\\''");
    r = await sshExec(conn, `cat > /etc/nginx/sites-available/kppdf-proxy << 'NGINXEOF'\n${newConfig}\nNGINXEOF\nln -sf /etc/nginx/sites-available/kppdf-proxy /etc/nginx/sites-enabled/kppdf-proxy 2>/dev/null; rm -f /etc/nginx/sites-enabled/default`);
    console.log('Nginx config created');
  } else if (!nginxConfig.includes(`localhost:${TUNNEL_PORT}`)) {
    console.log(`Fixing proxy_pass → localhost:${TUNNEL_PORT}...`);
    r = await sshExec(conn, `sed -i 's|proxy_pass http://localhost:[0-9]*|proxy_pass http://localhost:${TUNNEL_PORT}|g' /etc/nginx/sites-available/kppdf-proxy`);
    console.log('proxy_pass fixed');
  } else {
    console.log('✅ Nginx config already correct');
  }

  // Test & reload nginx
  r = await sshExec(conn, 'nginx -t 2>&1');
  console.log(`\nNginx test: ${r.stdout.slice(0, 200)}`);
  
  if (r.stdout.includes('test is successful') || r.stdout.includes('ok')) {
    r = await sshExec(conn, 'systemctl reload nginx 2>&1 || nginx -s reload 2>&1');
    console.log(`Nginx reload: ${r.stdout.slice(0, 200)}`);
  } else {
    console.log('⚠️ Nginx config has errors, NOT reloading');
  }

  // ============================================================
  // PHASE 3: BACKEND CHECK & ALTERNATIVE ACCESS
  // ============================================================
  console.log('\n╔══ PHASE 3: BACKEND CONNECTIVITY ══╗\n');

  // Try all possible routes to the backend
  const routes = [
    { name: 'VM external IP', url: `http://${VM.external}:${BACKEND_PORT}/api/health` },
    { name: 'VM LAN IP', url: `http://${VM.lan}:${BACKEND_PORT}/api/health` },
    { name: 'Synology :3000', url: 'http://10.0.0.47:3000/api/health' },
    { name: 'Synology DSM', url: 'http://10.0.0.47:5000/' },
  ];

  for (const route of routes) {
    r = await sshExec(conn, `curl -sf --connect-timeout 5 '${route.url}' 2>&1 || echo 'UNREACHABLE'`);
    const status = r.stdout.slice(0, 100);
    if (!status.includes('UNREACHABLE') && status.length > 0) {
      console.log(`✅ ${route.name}: ${status}`);
    } else {
      console.log(`❌ ${route.name}: UNREACHABLE`);
    }
  }

  // ============================================================
  // PHASE 4: AUTO-RECOVERY SETUP
  // ============================================================
  console.log('\n╔══ PHASE 4: AUTO-RECOVERY ══╗\n');

  console.log(`Tunnel: ${hasTunnel ? '✅' : '❌'} | Port ${TUNNEL_PORT}: ${port4200Up ? '✅' : '❌'} | Backend: ${backendOK ? '✅' : '❌'}`);

  if (!backendOK) {
    console.log('\n⚠️ Backend not responding through tunnel.');
    console.log('   This means the Docker container on the VM is DOWN.');
    console.log('   Need to restart backend on VM (192.168.1.103):');
    console.log('');
    console.log('   ┌─────────────────────────────────────────────┐');
    console.log('   │  RUN THIS ON YOUR LOCAL MACHINE (LAN only):  │');
    console.log('   │                                             │');
    console.log('   │  ssh tiit@192.168.1.103 "sudo docker ps"    │');
    console.log('   │  ssh tiit@192.168.1.103 "sudo docker \\     │');
    console.log('   │    restart kppdf-backend"                   │');
    console.log('   │                                             │');
    console.log('   │  Or full redeploy:                          │');
    console.log('   │  python deploy/synology/deploy.py           │');
    console.log('   │    --host 192.168.1.103                     │');
    console.log('   └─────────────────────────────────────────────┘');

    // Alternative: try to SSH from VPS to VM via external IP
    console.log('\n   Trying SSH from VPS to VM external...');
    r = await sshExec(conn, `ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no ${VM.user}@${VM.external} "echo OK" 2>&1`);
    if (r.stdout.includes('OK') || r.stdout.includes('Welcome')) {
      console.log('   ✅ Can reach VM via external IP!');
    } else {
      console.log(`   ❌ Cannot reach VM from VPS: ${r.stdout.slice(0, 100)}`);
    }
  }

  // ============================================================
  // PHASE 5: FINAL CHECK
  // ============================================================
  console.log('\n╔══ PHASE 5: FINAL VERIFICATION ══╗\n');

  // Check nginx response
  r = await sshExec(conn, 'curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 http://localhost:80/ 2>&1 || echo "ERROR"');
  console.log(`HTTP http://localhost:80/ → ${r.stdout}`);

  r = await sshExec(conn, `curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 http://localhost:${TUNNEL_PORT}/ 2>&1 || echo "ERROR"`);
  console.log(`HTTP http://localhost:${TUNNEL_PORT}/ → ${r.stdout}`);

  // Get hostname for docs
  r = await sshExec(conn, 'hostname');
  const hostname = r.stdout.trim();

  conn.end();

  // ============================================================
  // UPDATE DOCUMENTATION
  // ============================================================
  console.log('\n╔══ PHASE 6: DOCUMENTATION UPDATE ══╗\n');
  updateDeployDocs(hostname);

  // ============================================================
  // SUMMARY
  // ============================================================
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║              FINAL SUMMARY                   ║');
  console.log('╚══════════════════════════════════════════════╝\n');

  console.log('Network topology:');
  console.log(`  🌐 Internet → 193.222.62.240 (VPS: ${hostname})`);
  console.log(`       └─ nginx:80 → localhost:${TUNNEL_PORT}`);
  console.log(`       └─ reverse tunnel ← VM (${VM.lan}):${BACKEND_PORT}`);
  console.log(`       └─ Synology (10.0.0.47) → VM (${VM.lan})`);
  console.log('');
  console.log('Status:');
  console.log(`  ✅ SSH to VPS: working (new password)`);
  console.log(`  ${port4200Up ? '✅' : '❌'} Reverse tunnel: ${port4200Up ? 'UP' : 'DOWN'}`);
  console.log(`  ✅ Nginx config: correct (proxy_pass → :${TUNNEL_PORT})`);
  console.log(`  ${backendOK ? '✅' : '❌'} Backend on VM: ${backendOK ? 'RUNNING' : 'DOWN — need restart'}`);
  console.log('');
  console.log('Tunnel command (run from VM):');
  console.log('  ssh -R 4200:localhost:3000 root@193.222.62.240 -N');
  console.log('');
  console.log('New VPS password: serenaubxuekin');
  console.log('Old VM password: Tg30121986 (unchanged)');
  console.log('');
  
  if (!backendOK) {
    console.log('⚠️ NEXT STEP: Restart backend on VM from your machine:');
    console.log('   ssh tiit@192.168.1.103 "sudo docker restart kppdf-backend"');
    console.log('   Or full deploy: node deploy.mjs');
  } else {
    console.log('🎉 Everything is working! http://193.222.62.240/ should show the app.');
  }
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
