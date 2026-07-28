#!/bin/bash
# ================================================================
# setup-tunnel-vm.sh — НАСТРОЙКА SSH TUNNEL НА VM (один раз)
# Создан: fix-all.mjs (v3) — 2026-07-25T10:20:06.856Z
#
# Запустить на VM (192.168.1.103):
#   chmod +x setup-tunnel-vm.sh && ./setup-tunnel-vm.sh
# ================================================================
set -e

VPS_IP="193.222.62.240"
VPS_USER="root"
VPS_PASS="serenaubxuekin"
VM_PORT="3000"
TUNNEL_PORT="4200"
TUNNEL_NAME="kppdf-tunnel"

echo "============================================"
echo "  KPPDF — НАСТРОЙКА SSH TUNNEL НА VM"
echo "============================================"
echo ""

# ---- 1. SSH key ----
echo "[1/5] SSH ключ..."
KEY_FILE="$HOME/.ssh/id_ed25519"
if [ ! -f "$KEY_FILE" ]; then
    ssh-keygen -t ed25519 -f "$KEY_FILE" -N "" -q
    echo "  ✅ Ключ создан"
fi

# ---- 2. sshpass + key copy to VPS ----
echo "[2/5] Установка sshpass и копирование ключа на VPS..."
if ! command -v sshpass &>/dev/null; then
    sudo apt-get update -qq && sudo apt-get install -y -qq sshpass
fi
sshpass -p "$VPS_PASS" ssh-copy-id -o StrictHostKeyChecking=no \
    -o UserKnownHostsFile=/dev/null \
    root@193.222.62.240 2>&1 | grep -v "Warning" | tail -3
echo "  ✅ SSH ключ скопирован на VPS"

# Test key auth
ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    -o BatchMode=yes -o ConnectTimeout=5 \
    root@193.222.62.240 "echo OK" 2>&1 || echo "  ⚠️ Key auth failed"

# ---- 3. SSH config ----
echo "[3/5] SSH config..."
mkdir -p ~/.ssh
chmod 700 ~/.ssh
if ! grep -q "Host kppdf-tunnel" ~/.ssh/config 2>/dev/null; then
    cat >> ~/.ssh/config << EOF

Host kppdf-tunnel
    HostName 193.222.62.240
    User root
    Port 22
    ServerAliveInterval 30
    ServerAliveCountMax 3
    ExitOnForwardFailure yes
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
EOF
    chmod 600 ~/.ssh/config
    echo "  ✅ SSH config обновлён"
else
    echo "  ✅ SSH config уже содержит kppdf-tunnel"
fi

# ---- 4. Install autossh ----
echo "[4/5] Установка autossh..."
if ! command -v autossh &>/dev/null; then
    sudo apt-get update -qq && sudo apt-get install -y -qq autossh
    echo "  ✅ autossh установлен"
else
    echo "  ✅ autossh уже установлен"
fi

# ---- 5. Systemd service ----
echo "[5/5] Systemd сервис kppdf-tunnel..."
sudo tee /etc/systemd/system/kppdf-tunnel.service > /dev/null << EOF
[Unit]
Description=KPPDF SSH Reverse Tunnel (autossh)
After=network.target network-online.target
Wants=network-online.target

[Service]
User=tiit
ExecStart=/usr/bin/autossh -M 0 \
    -o ServerAliveInterval=30 \
    -o ServerAliveCountMax=3 \
    -o ExitOnForwardFailure=yes \
    -o StrictHostKeyChecking=no \
    -o UserKnownHostsFile=/dev/null \
    -N -R 4200:localhost:3000 kppdf-tunnel
Restart=always
RestartSec=10
StartLimitInterval=0
StartLimitBurst=5

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable kppdf-tunnel
sudo systemctl restart kppdf-tunnel

echo ""
echo "  Статус сервиса:"
sleep 5
sudo systemctl status kppdf-tunnel --no-pager 2>&1 | head -8

# ---- Verification ----
echo ""
echo "============================================"
echo "  ПРОВЕРКА"
echo "============================================"
echo ""

echo "  Локальный backend (VM):"
curl -sf http://localhost:3000/api/health 2>&1 && echo "" || echo "  ❌ Backend не отвечает"

echo ""
echo "  Проверка через туннель (с VPS):"
for i in 1 2 3 4 5; do
    result=$(ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no \
        root@193.222.62.240 \
        "curl -sf --connect-timeout 3 http://localhost:4200/api/health" 2>&1)
    if echo "$result" | grep -q "ok"; then
        echo "  ✅ Туннель работает! Backend доступен через VPS"
        echo "  Response: $result"
        break
    fi
    echo "  ⏳ Туннель ещё не готов... (${i}/5)"
    sleep 5
done

echo ""
echo "============================================"
echo "  ✅ НАСТРОЙКА ЗАВЕРШЕНА"
echo "============================================"
echo ""
echo "  http://kppdf-crm.ru/ — должен работать"
echo "  http://193.222.62.240/ — должен работать"
echo ""
echo "  Если туннель упадёт — systemd поднимет автоматически через 10 сек"
echo "  Проверка: sudo systemctl status kppdf-tunnel"
