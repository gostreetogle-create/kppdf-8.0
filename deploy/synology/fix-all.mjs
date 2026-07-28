#!/usr/bin/env node
/**
 * fix-all.mjs — ФИНАЛЬНАЯ НАСТРОЙКА всего деплоя (v3)
 *
 * Шаг 1 (авто): Подготовка VPS (kill tunnel, nginx, autossh)
 * Шаг 2 (авто): Создание setup-vm.sh — скрипт для VM
 * Шаг 3 (ручной): Пользователь запускает setup-vm.sh на VM
 * Шаг 4 (авто): Проверка работоспособности
 */

import { Client } from 'ssh2';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ============================================================
// CONFIG
// ============================================================
const CFG = {
  vps: { host: '193.222.62.240', port: 22, username: 'root', password: 'serenaubxuekin' },
  vm: { user: 'tiit', password: 'Tg30121986' },
  tunnel: { port: 4200, backend: 3000, name: 'kppdf-tunnel' },
  domain: 'kppdf-crm.ru',
};

const VM_SCRIPT_PATH = join(__dirname, 'setup-tunnel-vm.sh');

// ============================================================
// HELPERS
// ============================================================
function sshExec(conn, cmd) {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let out = '', errOut = '';
      stream.on('data', d => out += d.toString());
      stream.stderr.on('data', d => errOut += d.toString());
      stream.on('close', () => resolve({ out: out.trim(), err: errOut.trim() }));
    });
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function sshConnect(cfg) {
  return new Promise((resolve, reject) => {
    const c = new Client();
    c.on('ready', () => resolve(c));
    c.on('error', reject);
    c.connect(cfg);
  });
}

// ============================================================
// STEP 1: VPS SETUP
// ============================================================
async function setupVPS(conn) {
  console.log('\n╔═══════════════════════════════════════════╗');
  console.log('║   ШАГ 1: ПОДГОТОВКА VPS                  ║');
  console.log('╚═══════════════════════════════════════════╝\n');

  console.log('1.1 Убиваю старый туннель...');
  await sshExec(conn, "pkill -f '4200:' 2>/dev/null; pkill -f socat 2>/dev/null; true");
  for (let i = 0; i < 15; i++) {
    const r = await sshExec(conn, "ss -tlnp | grep ':4200 ' || echo FREE");
    if (r.out.includes('FREE')) { console.log('  ✅ Порт 4200 освобождён'); break; }
    console.log(`  ⏳ Жду освобождения порта... (${i + 1}s)`);
    await sleep(1000);
  }

  console.log('\n1.2 Проверяю autossh...');
  let r = await sshExec(conn, 'which autossh 2>/dev/null || echo MISSING');
  if (r.out.includes('MISSING')) {
    console.log('  Устанавливаю autossh...');
    await sshExec(conn, 'apt-get update -qq && apt-get install -y -qq autossh 2>&1 | tail -2');
  }
  console.log('  ✅ autossh готов');

  console.log('\n1.3 Проверяю nginx...');
  const nginxCfg = [
    'server {',
    '    listen 80 default_server;',
    '    listen [::]:80 default_server;',
    `    server_name ${CFG.domain} 193.222.62.240 _;`,
    '',
    '    location / {',
    `        proxy_pass http://localhost:${CFG.tunnel.port};`,
    '        proxy_http_version 1.1;',
    '        proxy_set_header Upgrade $http_upgrade;',
    "        proxy_set_header Connection 'upgrade';",
    '        proxy_set_header Host $host;',
    '        proxy_set_header X-Real-IP $remote_addr;',
    '        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;',
    '        proxy_set_header X-Forwarded-Proto $scheme;',
    '        proxy_cache_bypass $http_upgrade;',
    '        proxy_read_timeout 120s;',
    '        proxy_send_timeout 120s;',
    '    }',
    '}',
  ].join('\n');

  r = await sshExec(conn, 'cat /etc/nginx/sites-enabled/kppdf-proxy 2>/dev/null || echo NO_CONFIG');
  if (r.out === 'NO_CONFIG' || !r.out.includes('proxy_pass')) {
    const escaped = nginxCfg.replace(/\$/g, '\\$');
    await sshExec(conn, [
      'mkdir -p /etc/nginx/sites-available',
      'cat > /etc/nginx/sites-available/kppdf-proxy << EOF',
      escaped,
      'EOF',
      'ln -sf /etc/nginx/sites-available/kppdf-proxy /etc/nginx/sites-enabled/kppdf-proxy 2>/dev/null',
      'rm -f /etc/nginx/sites-enabled/default',
    ].join('\n'));
    console.log('  ✅ Конфиг создан');
  } else {
    console.log('  ✅ Конфиг уже существует');
  }

  r = await sshExec(conn, 'nginx -t 2>&1');
  if (r.out.includes('ok') || r.out.includes('successful')) {
    await sshExec(conn, 'systemctl reload nginx 2>&1 || nginx -s reload 2>&1');
    console.log('  ✅ nginx reloaded');
  }

  console.log('\n1.4 SSH ключ VM на VPS...');
  r = await sshExec(conn, "grep 'tiit@ubuntuserver' ~/.ssh/authorized_keys 2>/dev/null || echo MISSING");
  console.log(`  ${r.out.includes('MISSING') ? '❌ НЕТ' : '✅ УЖЕ ЕСТЬ'}`);

  console.log('\n1.5 Firewall...');
  r = await sshExec(conn, "ufw status | grep -E '80|22' || echo ok");
  console.log(`  ${r.out.includes('80') ? '✅ Порт 80 открыт' : '✅'}`);
}

// ============================================================
// STEP 2: CREATE VM SETUP SCRIPT
// ============================================================
function createVMScript() {
  console.log('\n╔═══════════════════════════════════════════╗');
  console.log('║   ШАГ 2: СОЗДАНИЕ setup-tunnel-vm.sh     ║');
  console.log('╚═══════════════════════════════════════════╝\n');

  // Node.js variables for template interpolation
  // IMPORTANT: all ${...} in the template must reference these, not bash variables
  const VPS_IP = CFG.vps.host;
  const VPS_USER = CFG.vps.username;
  const VPS_PASS = CFG.vps.password;
  const VM_PORT = CFG.tunnel.backend;
  const TUNNEL_PORT = CFG.tunnel.port;
  const TUNNEL_NAME = CFG.tunnel.name;
  const VM_USER = CFG.vm.user;

  // Build script by joining lines to avoid template literal pitfalls
  const script = [
    '#!/bin/bash',
    '# ================================================================',
    '# setup-tunnel-vm.sh — НАСТРОЙКА SSH TUNNEL НА VM (один раз)',
    '# Создан: fix-all.mjs (v3) — ' + new Date().toISOString(),
    '#',
    '# Запустить на VM (192.168.1.103):',
    '#   chmod +x setup-tunnel-vm.sh && ./setup-tunnel-vm.sh',
    '# ================================================================',
    'set -e',
    '',
    `VPS_IP="${VPS_IP}"`,
    `VPS_USER="${VPS_USER}"`,
    `VPS_PASS="${VPS_PASS}"`,
    `VM_PORT="${VM_PORT}"`,
    `TUNNEL_PORT="${TUNNEL_PORT}"`,
    `TUNNEL_NAME="${TUNNEL_NAME}"`,
    '',
    'echo "============================================"',
    'echo "  KPPDF — НАСТРОЙКА SSH TUNNEL НА VM"',
    'echo "============================================"',
    'echo ""',
    '',
    '# ---- 1. SSH key ----',
    'echo "[1/5] SSH ключ..."',
    'KEY_FILE="$HOME/.ssh/id_ed25519"',
    'if [ ! -f "$KEY_FILE" ]; then',
    '    ssh-keygen -t ed25519 -f "$KEY_FILE" -N "" -q',
    '    echo "  ✅ Ключ создан"',
    'fi',
    '',
    '# ---- 2. sshpass + key copy to VPS ----',
    'echo "[2/5] Установка sshpass и копирование ключа на VPS..."',
    'if ! command -v sshpass &>/dev/null; then',
    '    sudo apt-get update -qq && sudo apt-get install -y -qq sshpass',
    'fi',
    'sshpass -p "$VPS_PASS" ssh-copy-id -o StrictHostKeyChecking=no \\',
    '    -o UserKnownHostsFile=/dev/null \\',
    `    ${VPS_USER}@${VPS_IP} 2>&1 | grep -v "Warning" | tail -3`,
    'echo "  ✅ SSH ключ скопирован на VPS"',
    '',
    '# Test key auth',
    `ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \\`,
    `    -o BatchMode=yes -o ConnectTimeout=5 \\`,
    `    ${VPS_USER}@${VPS_IP} "echo OK" 2>&1 || echo "  ⚠️ Key auth failed"`,
    '',
    '# ---- 3. SSH config ----',
    'echo "[3/5] SSH config..."',
    'mkdir -p ~/.ssh',
    'chmod 700 ~/.ssh',
    `if ! grep -q "Host ${TUNNEL_NAME}" ~/.ssh/config 2>/dev/null; then`,
    '    cat >> ~/.ssh/config << EOF',
    '',
    `Host ${TUNNEL_NAME}`,
    `    HostName ${VPS_IP}`,
    `    User ${VPS_USER}`,
    '    Port 22',
    '    ServerAliveInterval 30',
    '    ServerAliveCountMax 3',
    '    ExitOnForwardFailure yes',
    '    StrictHostKeyChecking no',
    '    UserKnownHostsFile /dev/null',
    'EOF',
    '    chmod 600 ~/.ssh/config',
    '    echo "  ✅ SSH config обновлён"',
    'else',
    `    echo "  ✅ SSH config уже содержит ${TUNNEL_NAME}"`,
    'fi',
    '',
    '# ---- 4. Install autossh ----',
    'echo "[4/5] Установка autossh..."',
    'if ! command -v autossh &>/dev/null; then',
    '    sudo apt-get update -qq && sudo apt-get install -y -qq autossh',
    '    echo "  ✅ autossh установлен"',
    'else',
    '    echo "  ✅ autossh уже установлен"',
    'fi',
    '',
    '# ---- 5. Systemd service ----',
    `echo "[5/5] Systemd сервис ${TUNNEL_NAME}..."`,
    `sudo tee /etc/systemd/system/${TUNNEL_NAME}.service > /dev/null << EOF`,
    '[Unit]',
    'Description=KPPDF SSH Reverse Tunnel (autossh)',
    'After=network.target network-online.target',
    'Wants=network-online.target',
    '',
    '[Service]',
    `User=${VM_USER}`,
    `ExecStart=/usr/bin/autossh -M 0 \\`,
    '    -o ServerAliveInterval=30 \\',
    '    -o ServerAliveCountMax=3 \\',
    '    -o ExitOnForwardFailure=yes \\',
    '    -o StrictHostKeyChecking=no \\',
    '    -o UserKnownHostsFile=/dev/null \\',
    `    -N -R ${TUNNEL_PORT}:localhost:${VM_PORT} ${TUNNEL_NAME}`,
    'Restart=always',
    'RestartSec=10',
    'StartLimitInterval=0',
    'StartLimitBurst=5',
    '',
    '[Install]',
    'WantedBy=multi-user.target',
    'EOF',
    '',
    'sudo systemctl daemon-reload',
    `sudo systemctl enable ${TUNNEL_NAME}`,
    `sudo systemctl restart ${TUNNEL_NAME}`,
    '',
    'echo ""',
    'echo "  Статус сервиса:"',
    'sleep 5',
    `sudo systemctl status ${TUNNEL_NAME} --no-pager 2>&1 | head -8`,
    '',
    '# ---- Verification ----',
    'echo ""',
    'echo "============================================"',
    'echo "  ПРОВЕРКА"',
    'echo "============================================"',
    'echo ""',
    '',
    'echo "  Локальный backend (VM):"',
    `curl -sf http://localhost:${VM_PORT}/api/health 2>&1 && echo "" || echo "  ❌ Backend не отвечает"`,
    '',
    'echo ""',
    'echo "  Проверка через туннель (с VPS):"',
    'for i in 1 2 3 4 5; do',
    '    result=$(ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no \\',
    `        ${VPS_USER}@${VPS_IP} \\`,
    `        "curl -sf --connect-timeout 3 http://localhost:${TUNNEL_PORT}/api/health" 2>&1)`,
    '    if echo "$result" | grep -q "ok"; then',
    '        echo "  ✅ Туннель работает! Backend доступен через VPS"',
    '        echo "  Response: $result"',
    '        break',
    '    fi',
    '    echo "  ⏳ Туннель ещё не готов... (${i}/5)"',
    '    sleep 5',
    'done',
    '',
    'echo ""',
    'echo "============================================"',
    'echo "  ✅ НАСТРОЙКА ЗАВЕРШЕНА"',
    'echo "============================================"',
    'echo ""',
    'echo "  http://kppdf-crm.ru/ — должен работать"',
    'echo "  http://193.222.62.240/ — должен работать"',
    'echo ""',
    'echo "  Если туннель упадёт — systemd поднимет автоматически через 10 сек"',
    `echo "  Проверка: sudo systemctl status ${TUNNEL_NAME}"`,
    '',
  ].join('\n');

  writeFileSync(VM_SCRIPT_PATH, script, 'utf-8');
  console.log(`  ✅ Скрипт создан: ${VM_SCRIPT_PATH} (${(script.length / 1024).toFixed(1)} KB)`);
  return VM_SCRIPT_PATH;
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║   KPPDF 8.0 — ФИНАЛЬНАЯ НАСТРОЙКА v3      ║');
  console.log('╚══════════════════════════════════════════════╝');

  // ---- STEP 1: VPS ----
  console.log('\nПодключаюсь к VPS...');
  let conn;
  try {
    conn = await sshConnect(CFG.vps);
    console.log('✅ SSH на VPS');
  } catch (err) {
    console.error('❌ SSH на VPS не удался:', err.message);
    process.exit(1);
  }
  await setupVPS(conn);
  conn.end();

  // ---- STEP 2: Create VM script ----
  createVMScript();

  // ---- STEP 3: Summary ----
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║   ✅ VPS ГОТОВ. ОСТАЛСЯ ОДИН ШАГ НА VM   ║');
  console.log('╚══════════════════════════════════════════════╝\n');

  console.log(`  Скрипт создан: deploy/synology/setup-tunnel-vm.sh\n`);
  console.log(`  Выполни на своей машине (Windows/LAN):\n`);
  console.log(`    scp deploy/synology/setup-tunnel-vm.sh tiit@192.168.1.103:/tmp/`);
  console.log(`    ssh tiit@192.168.1.103 "bash /tmp/setup-tunnel-vm.sh"\n`);
  console.log(`  Или если уже на VM:\n`);
  console.log(`    chmod +x setup-tunnel-vm.sh && ./setup-tunnel-vm.sh\n`);
  console.log(`  Скрипт сделает всё автоматом:`);
  console.log(`    • SSH ключ для VPS`);
  console.log(`    • sshpass + копирование ключа на VPS`);
  console.log(`    • SSH config (Host ${CFG.tunnel.name})`);
  console.log(`    • Установка autossh`);
  console.log(`    • Systemd сервис ${CFG.tunnel.name} (автоперезапуск)`);
  console.log(`    • Проверка работоспособности\n`);
  console.log(`  После запуска — http://kppdf-crm.ru/ заработает! 🚀\n`);
}

main().catch(e => {
  console.error('\n❌ Fatal:', e.message);
  process.exit(1);
});
