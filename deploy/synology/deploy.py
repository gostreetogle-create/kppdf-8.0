"""
KPPDF 8.0 - Deploy to Synology NAS / Ubuntu server

Usage:
    python deploy/synology/deploy.py [--seed]
    python deploy/synology/deploy.py --wipe --seed
    python deploy/synology/deploy.py --password YOUR_PASSWORD --seed
    python deploy/synology/deploy.py --platform ubuntu --seed

Config: deploy/synology/config.env (copy from config.env.example)

Steps:
    1. Load config.env
    2. Build Angular frontend (pnpm --dir frontend build)
    3. Create archive (backend/ + frontend/browser + docker-compose.prod.yml)
    4. Connect via paramiko (password or DEPLOY_SSH_KEY)
    5. Optional wipe of REMOTE_DIR + mongo data
    6. Upload & extract + .env (JWT + ADMIN_PASSWORD)
    7. Docker build + up
    8. Health check + seed (optional) + verify API/frontend/login
"""

import argparse
import base64
import json
import os
import secrets
import shutil
import subprocess
import sys
import tarfile
import tempfile
import time
from pathlib import Path


# -- Platform defaults --------------------------------------------------

PLATFORMS = {
    "ubuntu": {
        "remote_dir": "/opt/kppdf-8.0",
        "data_dir": "/var/lib/kppdf",
        "docker": "docker",
    },
    "synology": {
        "remote_dir": "/volume1/docker/kppdf-8.0",
        "data_dir": "/volume1/docker/kppdf-data",
        "docker": "/usr/local/bin/docker",
    },
}

ARCHIVE_NAME = "kppdf-deploy.tar.gz"
CONFIG_FILE = "config.env"


# -- Config loader ------------------------------------------------------

def load_config(project_root):
    """Load deploy/synology/config.env (KEY=VALUE, # comments)."""
    cfg = {}
    cfg_path = project_root / "deploy" / "synology" / CONFIG_FILE
    if not cfg_path.exists():
        return cfg
    for line in cfg_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if "=" not in line:
            continue
        key, _, val = line.partition("=")
        cfg[key.strip()] = val.strip()
    return cfg


def resolve_settings(args, cfg):
    """Merge CLI args, config.env, platform defaults."""
    platform = (args.platform or cfg.get("PLATFORM") or "ubuntu").lower()
    if platform not in PLATFORMS:
        fail("Unknown platform: " + platform + ". Use ubuntu or synology.")

    defaults = PLATFORMS[platform]
    host = args.host or cfg.get("DEPLOY_HOST") or "192.168.1.103"
    user = args.user or cfg.get("DEPLOY_USER") or "tiit"
    password = args.password or cfg.get("DEPLOY_PASSWORD") or None
    ssh_key = cfg.get("DEPLOY_SSH_KEY") or None
    if ssh_key:
        ssh_key = os.path.expandvars(os.path.expanduser(ssh_key))
        if not os.path.isfile(ssh_key):
            fail("DEPLOY_SSH_KEY not found: " + ssh_key)
    remote_dir = cfg.get("REMOTE_DIR") or defaults["remote_dir"]
    data_dir = cfg.get("KPPDF_DATA_DIR") or defaults["data_dir"]
    docker = cfg.get("DOCKER_CMD") or defaults["docker"]
    seed = args.seed or cfg.get("SEED", "").lower() in ("true", "1", "yes")
    wipe = args.wipe or cfg.get("WIPE", "").lower() in ("true", "1", "yes")
    no_cache = getattr(args, "no_cache", False) or cfg.get("DOCKER_NO_CACHE", "").lower() in (
        "true",
        "1",
        "yes",
    )
    cors = cfg.get("CORS_ORIGIN") or "https://kppdf-crm.ru"
    desktop_download_url = (
        cfg["DESKTOP_DOWNLOAD_URL"]
        if "DESKTOP_DOWNLOAD_URL" in cfg
        else os.environ.get("DESKTOP_DOWNLOAD_URL")
    )

    jwt_secret = cfg.get("JWT_SECRET", "")
    jwt_refresh = cfg.get("JWT_REFRESH_SECRET", "")
    admin_password = cfg.get("ADMIN_PASSWORD", "")
    if not jwt_secret or "CHANGE_ME" in jwt_secret:
        jwt_secret = secrets.token_hex(32)
        warn("JWT_SECRET auto-generated — save it in config.env!")
    if not jwt_refresh or "CHANGE_ME" in jwt_refresh:
        jwt_refresh = secrets.token_hex(32)
        warn("JWT_REFRESH_SECRET auto-generated — save it in config.env!")
    if (
        not admin_password
        or "CHANGE_ME" in admin_password
        or admin_password == "admin-change-me-immediately-in-production"
    ):
        admin_password = "Kp8-" + secrets.token_urlsafe(16)
        warn("ADMIN_PASSWORD auto-generated — save it in config.env / CREDENTIALS.md!")

    return {
        "platform": platform,
        "host": host,
        "user": user,
        "password": password,
        "ssh_key": ssh_key,
        "remote_dir": remote_dir,
        "data_dir": data_dir,
        "docker": docker,
        "seed": seed,
        "wipe": wipe,
        "no_cache": no_cache,
        "cors": cors,
        "desktop_download_url": desktop_download_url,
        "jwt_secret": jwt_secret,
        "jwt_refresh": jwt_refresh,
        "admin_password": admin_password,
    }


# -- Helpers ------------------------------------------------------------

def log(msg):
    print("  " + msg)


def ok(msg):
    print("  [OK] " + msg)


def warn(msg):
    print("  [WARN] " + msg)


def fail(msg):
    print("  [FAIL] " + msg)
    sys.exit(1)


class RemoteHost:
    """SSH connection via paramiko (supports password & key auth)."""

    def __init__(self, host, user, password=None, docker="docker", ssh_key=None):
        self.host = host
        self.user = user
        self.password = password
        self.ssh_key = ssh_key
        self.docker = docker
        self._ssh = None

    def connect(self):
        import paramiko
        self._ssh = paramiko.SSHClient()
        self._ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        kwargs = {
            "hostname": self.host,
            "username": self.user,
            "timeout": 15,
            "allow_agent": False,
            "look_for_keys": False,
        }
        if self.ssh_key:
            kwargs["key_filename"] = self.ssh_key
        elif self.password:
            kwargs["password"] = self.password
        else:
            kwargs["allow_agent"] = True
            kwargs["look_for_keys"] = True
        try:
            self._ssh.connect(**kwargs)
            via = "key" if self.ssh_key else ("password" if self.password else "agent")
            ok("Connected to " + self.user + "@" + self.host + " (" + via + ")")
        except paramiko.AuthenticationException:
            fail("Auth failed. Set DEPLOY_SSH_KEY or DEPLOY_PASSWORD / --password.")
        except Exception as e:
            fail("Connection failed: " + str(e))

    def close(self):
        if self._ssh:
            self._ssh.close()

    def exec(self, command, timeout=30):
        try:
            stdin, stdout, stderr = self._ssh.exec_command(
                command, timeout=timeout)
            out = stdout.read().decode("utf-8", errors="replace").strip()
            err = stderr.read().decode("utf-8", errors="replace").strip()
            if err and "password" not in err.lower() and "Warning" not in err:
                return out + "\nERR: " + err
            return out
        except Exception as e:
            return "ERROR: " + str(e)

    def exec_sudo(self, command, timeout=30):
        pwd = self.password or ""
        full = "echo '" + pwd + "' | sudo -S bash -c '" + command.replace("'", "'\\''") + "'"
        return self.exec(full, timeout=timeout)

    def upload_file(self, local_path, remote_dir):
        filename = os.path.basename(local_path)
        remote_path = remote_dir + "/" + filename

        try:
            scp_cmd = [
                "scp", "-o", "ConnectTimeout=10", "-o", "StrictHostKeyChecking=no",
            ]
            if self.ssh_key:
                scp_cmd.extend(["-i", self.ssh_key])
            scp_cmd.extend([local_path, self.user + "@" + self.host + ":" + remote_path])
            result = subprocess.run(
                scp_cmd, capture_output=True, text=True, timeout=120)
            if result.returncode == 0:
                ok("Uploaded via SCP")
                return
        except Exception as e:
            warn("SCP: " + str(e))

        try:
            sftp = self._ssh.open_sftp()
            sftp.put(local_path, remote_path)
            sftp.close()
            ok("Uploaded via SFTP")
            return
        except Exception as e:
            warn("SFTP: " + str(e))

        with open(local_path, "rb") as f:
            b64 = base64.b64encode(f.read()).decode()
        chunk_size = 8000
        chunks = [b64[i:i + chunk_size] for i in range(0, len(b64), chunk_size)]

        self.exec("rm -f " + remote_path)
        for chunk in chunks:
            self._ssh.exec_command("echo -n '" + chunk + "' >> " + remote_path, timeout=30)
        self.exec("base64 -d " + remote_path + " > " + remote_path + ".tmp && "
                  "mv " + remote_path + ".tmp " + remote_path)
        ok("Uploaded via pipe")

    def upload_text(self, content, remote_path):
        """Upload small text file via SFTP or echo."""
        try:
            sftp = self._ssh.open_sftp()
            with sftp.file(remote_path, "w") as f:
                f.write(content)
            sftp.close()
            ok("Uploaded " + os.path.basename(remote_path))
            return
        except Exception as e:
            warn("SFTP text: " + str(e))

        b64 = base64.b64encode(content.encode()).decode()
        self.exec("rm -f " + remote_path)
        chunk_size = 8000
        for i in range(0, len(b64), chunk_size):
            chunk = b64[i:i + chunk_size]
            self._ssh.exec_command("echo -n '" + chunk + "' >> " + remote_path + ".b64", timeout=30)
        self.exec("base64 -d " + remote_path + ".b64 > " + remote_path + " && rm -f " + remote_path + ".b64")
        ok("Uploaded " + os.path.basename(remote_path) + " via pipe")

    def docker_exec(self, container, cmd, timeout=30):
        full = self.docker + " exec " + container + " " + cmd
        return self.exec(full, timeout=timeout)

    def docker_compose(self, remote_dir, action, timeout=300):
        # Always run from remote_dir; keep compound actions as one bash -c script.
        docker_cmd = (
            "export PATH=/usr/local/bin:/usr/bin:/sbin:$PATH; "
            "cd " + remote_dir + " || exit 1; "
            "DC='" + self.docker + " compose -f docker-compose.prod.yml'; "
            + action
        )
        return self.exec_sudo(docker_cmd, timeout=timeout)


# -- Frontend build -----------------------------------------------------

def inject_desktop_download_url(project_root, configured_url):
    """Inject DESKTOP_DOWNLOAD_URL into the built SPA without committing config."""
    index_path = project_root / "frontend" / "browser" / "index.html"
    if not index_path.exists():
        fail("frontend/browser/index.html not found for desktop download URL injection")
    value = "undefined" if configured_url is None else json.dumps(configured_url)
    html = index_path.read_text(encoding="utf-8")
    marker = "window.__DESKTOP_DOWNLOAD_URL__ = undefined;"
    if marker not in html:
        fail("desktop download URL runtime marker not found in built index.html")
    index_path.write_text(html.replace(marker, f"window.__DESKTOP_DOWNLOAD_URL__ = {value};", 1), encoding="utf-8")
    ok("Desktop installer URL injected" if configured_url is not None else "Desktop installer URL uses default")


def build_frontend(project_root):
    log("Building Angular frontend (pnpm)...")
    # Prefer workspace root: pnpm --dir frontend build
    result = subprocess.run(
        ["pnpm", "--dir", "frontend", "build"],
        cwd=str(project_root),
        capture_output=True, text=True, timeout=600,
        shell=(os.name == "nt"))
    if result.returncode != 0:
        err_lines = (result.stderr or result.stdout or "").strip().split("\n")
        for line in err_lines[-12:]:
            print("   " + line)
        fail("Angular build failed")
    ok("Angular build OK")

    dist_browser = project_root / "frontend" / "dist" / "kppdf-frontend" / "browser" / "index.html"
    if not dist_browser.exists():
        fail("frontend/dist/kppdf-frontend/browser/index.html not found after build")

    frontend_dir = project_root / "frontend" / "browser"
    if frontend_dir.exists():
        shutil.rmtree(str(frontend_dir))
    frontend_dir.mkdir(parents=True, exist_ok=True)
    for item in (project_root / "frontend" / "dist" / "kppdf-frontend" / "browser").iterdir():
        dest = frontend_dir / item.name
        if item.is_dir():
            shutil.copytree(item, dest, dirs_exist_ok=True)
        else:
            shutil.copy2(item, dest)
    ok("Frontend copied to frontend/browser/")


# -- Archive creation ---------------------------------------------------

def create_archive(archive_path, project_root):
    log("Creating archive...")
    # Only ship built browser assets + backend sources (Docker builds BE image).
    items = ["backend/", "frontend/browser/", "docker-compose.prod.yml"]
    exclude = [
        "backend/node_modules", "backend/dist", "backend/.git",
        "backend/src/__tests__", "backend/.env", "backend/.env.local",
        "backend/coverage",
        "frontend/node_modules", "frontend/dist", "frontend/.angular",
    ]

    def excluded(rel):
        rel = rel.replace("\\", "/")
        for p in exclude:
            p2 = p.replace("\\", "/")
            if rel == p2 or rel.startswith(p2 + "/"):
                return True
        return False

    with tarfile.open(archive_path, "w:gz") as tar:
        for item in items:
            item_path = project_root / item
            if not item_path.exists():
                warn(item + " not found, skip")
                continue
            if item_path.is_dir():
                for root, dirs, files in os.walk(item_path):
                    rel = os.path.relpath(root, project_root)
                    dirs[:] = [d for d in dirs if not excluded(os.path.join(rel, d))]
                    for f in files:
                        fp = os.path.join(root, f)
                        an = os.path.relpath(fp, project_root).replace("\\", "/")
                        if not excluded(an):
                            tar.add(fp, arcname=an)
            else:
                an = os.path.relpath(item_path, project_root).replace("\\", "/")
                tar.add(str(item_path), arcname=an)
        backup_script = project_root / "deploy" / "synology" / "backup.sh"
        if backup_script.exists():
            tar.add(str(backup_script), arcname="backup.sh")
    size = os.path.getsize(archive_path)
    ok("Archive: " + str(size // 1024) + " KB")


def make_env_file(settings):
    """Generate .env for docker compose on remote host."""
    return (
        "JWT_SECRET=" + settings["jwt_secret"] + "\n"
        "JWT_REFRESH_SECRET=" + settings["jwt_refresh"] + "\n"
        "ADMIN_PASSWORD=" + settings["admin_password"] + "\n"
        "CORS_ORIGIN=" + settings["cors"] + "\n"
        "KPPDF_DATA_DIR=" + settings["data_dir"] + "\n"
        "TRUST_PROXY=1\n"
    )


def ensure_data_dirs(remote, settings):
    """Create persistent data directories on host (outside REMOTE_DIR)."""
    data_dir = settings["data_dir"]
    user = settings["user"]
    log("Ensuring data dirs: " + data_dir)
    cmd = (
        "mkdir -p " + data_dir + "/mongodb " + data_dir + "/uploads "
        + data_dir + "/media " + data_dir + "/backups && "
        "chown -R 999:999 " + data_dir + "/mongodb && "
        "chown -R " + user + ":" + user + " " + data_dir + "/uploads "
        + data_dir + "/media " + data_dir + "/backups"
    )
    r = remote.exec_sudo(cmd, timeout=30)
    ok("Data dirs ready: mongodb/, uploads/, media/, backups/")
    if r and "ERR:" in r:
        warn(r[:150])


def wipe_remote(remote, settings):
    """Stop stack and delete app dir + mongo data (dev/demo wipe only)."""
    remote_dir = settings["remote_dir"]
    data_dir = settings["data_dir"]
    log("WIPE: stopping containers and clearing " + remote_dir + " + mongo data")
    remote.exec_sudo(
        "cd " + remote_dir + " && "
        + remote.docker + " compose -f docker-compose.prod.yml down --remove-orphans 2>/dev/null || true",
        timeout=120,
    )
    remote.exec_sudo(
        remote.docker + " rm -f kppdf-backend kppdf-mongo 2>/dev/null || true",
        timeout=60,
    )
    remote.exec_sudo(
        "rm -rf " + remote_dir + "/* " + remote_dir + "/.[!.]* 2>/dev/null || true; "
        "rm -rf " + data_dir + "/mongodb/* " + data_dir + "/uploads/* 2>/dev/null || true; "
        "mkdir -p " + remote_dir + " " + data_dir + "/mongodb " + data_dir + "/uploads "
        + data_dir + "/backups; "
        "chown -R 999:999 " + data_dir + "/mongodb; "
        "chown -R " + settings["user"] + ":" + settings["user"] + " " + remote_dir + " "
        + data_dir + "/uploads " + data_dir + "/backups",
        timeout=120,
    )
    ok("Wipe complete (app + mongo data cleared)")


def wait_for_replica_set(remote, max_wait=60):
    """After wipe, ensure rs0 is initiated before backend can connect."""
    log("Waiting for Mongo replica set rs0...")
    for i in range(max_wait // 5):
        status = remote.exec(
            remote.docker
            + " exec kppdf-mongo mongo --quiet --eval "
            + "'try{print(rs.status().ok)}catch(e){print(0)}'",
            timeout=15,
        )
        if status.strip().startswith("1"):
            ok("Replica set ready")
            return True
        time.sleep(5)
        if i % 2 == 0:
            log("  rs not ready yet (" + str((i + 1) * 5) + "s)")
    warn("Replica set not ready — backend may fail to connect")
    return False


# -- Verification helpers -----------------------------------------------

def ensure_mongodb_running(remote, remote_dir):
    status = remote.exec(remote.docker + " ps --filter name=kppdf-mongo --format '{{.Status}}'")
    if "Up" in status:
        ok("MongoDB running")
        return True
    log("MongoDB not running. Starting...")
    remote.exec(remote.docker + " start kppdf-mongo")
    time.sleep(3)
    status = remote.exec(remote.docker + " ps --filter name=kppdf-mongo --format '{{.Status}}'")
    if "Up" in status:
        ok("MongoDB started")
        return True
    log("Trying docker compose up...")
    remote.docker_compose(remote_dir, "up -d mongodb", timeout=60)
    time.sleep(5)
    status = remote.exec(remote.docker + " ps --filter name=kppdf-mongo --format '{{.Status}}'")
    if "Up" in status:
        ok("MongoDB running via compose")
        return True
    warn("MongoDB not running. Seed may fail.")
    return False


def wait_for_backend(remote, max_wait=90):
    log("Waiting for backend (up to " + str(max_wait) + "s)...")
    for i in range(max_wait // 5):
        time.sleep(5)
        h = remote.exec("curl -sf http://localhost:3000/api/health/ready", timeout=10)
        if h and ("ok" in h.lower() or '"status"' in h.lower()):
            ok("Backend ready!")
            return True
        if i % 3 == 0 and i > 0:
            log("  (" + str((i + 1) * 5) + "s)")
    warn("Backend not ready within timeout")
    return False


# -- Main ---------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Deploy KPPDF to Synology/Ubuntu")
    parser.add_argument("--host", default=None)
    parser.add_argument("--user", default=None)
    parser.add_argument("--password", default=None)
    parser.add_argument("--platform", choices=["ubuntu", "synology"], default=None)
    parser.add_argument("--seed", action="store_true")
    parser.add_argument(
        "--wipe",
        action="store_true",
        help="Stop stack and delete REMOTE_DIR + mongo data before deploy (dev/demo only)",
    )
    parser.add_argument("--skip-build", action="store_true")
    parser.add_argument(
        "--no-cache",
        action="store_true",
        help="Docker build --no-cache (slow; only when Dockerfile/deps changed)",
    )
    args = parser.parse_args()

    project_root = Path(__file__).resolve().parent.parent.parent
    cfg = load_config(project_root)
    settings = resolve_settings(args, cfg)
    archive_path = os.path.join(tempfile.gettempdir(), ARCHIVE_NAME)

    print()
    print("=== KPPDF 8.0 - Deploy (" + settings["platform"] + ") ===")
    print("  Host: " + settings["host"])
    print("  App:  " + settings["remote_dir"])
    print("  Data: " + settings["data_dir"])
    if settings["wipe"]:
        print("  Mode: WIPE (clean install)")
    print()

    print("Step 1/8: Verify source code...")
    if not (project_root / "backend" / "src").exists():
        fail("backend/src not found!")
    if not (project_root / "docker-compose.prod.yml").exists():
        fail("docker-compose.prod.yml not found!")
    ok("Source OK")

    if not args.skip_build:
        print()
        print("Step 2/8: Build Angular frontend...")
        build_frontend(project_root)
        inject_desktop_download_url(project_root, settings.get("desktop_download_url"))
    else:
        print()
        print("Step 2/8: Skip frontend build (--skip-build)")
        inject_desktop_download_url(project_root, settings.get("desktop_download_url"))

    print()
    print("Step 3/8: Create archive...")
    create_archive(archive_path, project_root)

    print()
    print("Step 4/8: Connect...")
    remote = RemoteHost(
        settings["host"], settings["user"], settings["password"],
        docker=settings["docker"], ssh_key=settings.get("ssh_key"))
    remote.remote_dir = settings["remote_dir"]
    remote.connect()
    remote.exec("mkdir -p " + settings["remote_dir"])
    if settings["wipe"]:
        wipe_remote(remote, settings)
    ensure_data_dirs(remote, settings)

    print()
    print("Step 5/8: Upload & extract...")
    remote.upload_file(archive_path, settings["remote_dir"])
    os.remove(archive_path)

    env_content = make_env_file(settings)
    remote.upload_text(env_content, settings["remote_dir"] + "/.env")
    ok(".env uploaded (JWT + ADMIN_PASSWORD)")

    r = remote.exec(
        "cd " + settings["remote_dir"] + " && tar xzf " + ARCHIVE_NAME + " && "
        "rm -f " + ARCHIVE_NAME + " && ls -d */",
        timeout=60)
    ok("Extracted: " + r[:120])

    print()
    print("Step 6/8: Docker build & start...")
    # Use $DC set by docker_compose(); never append bare tokens after compose subcommand.
    r = remote.docker_compose(
        settings["remote_dir"],
        # Default: cached layer rebuild (minutes). Use --no-cache only when
        # deps/Dockerfile changed — full rebuild on small Synology VMs is 10–20+ min
        # and parallel deploys fighting --no-cache hang the host.
        "$DC down --remove-orphans 2>/dev/null || true; "
        + ("$DC build --no-cache backend && $DC up -d" if settings.get("no_cache")
           else "$DC build backend && $DC up -d"),
        timeout=900)
    ok("Docker: " + (r[:400] if r else "ok"))
    if r and ("ERR:" in r or "error" in r.lower() or "Error" in r):
        warn("Compose output may contain errors — continuing to health wait")

    # Give mongo-init a moment, then confirm rs0 (critical after --wipe).
    time.sleep(5)
    wait_for_replica_set(remote, max_wait=90)

    backend_ok = wait_for_backend(remote, max_wait=180)

    if not backend_ok:
        logs = remote.exec(
            remote.docker + " logs --tail 80 kppdf-backend 2>&1", timeout=30)
        warn("Backend logs:\n" + (logs[:1500] if logs else "(empty)"))
        remote.close()
        fail("Deploy incomplete")

    if settings["seed"]:
        print()
        print("Step 7/8: Bootstrap (Nest seeds on startup)...")
        ensure_mongodb_running(remote, settings["remote_dir"])
        remote.exec(remote.docker + " restart kppdf-backend", timeout=30)
        time.sleep(5)
        wait_for_backend(remote, max_wait=120)
        ok("Bootstrap restart done")
    else:
        print()
        print("Step 7/8: Bootstrap skipped (use --seed on first deploy)")

    print()
    print("Step 8/8: Verify...")
    h = remote.exec("curl -sf http://localhost:3000/api/health/ready", timeout=10)
    ok("Health: " + (h[:80] if h else "no response"))

    log("Verifying auth...")
    admin_pw = settings["admin_password"].replace("'", "'\\''")
    login = remote.exec(
        "curl -sf -X POST http://localhost:3000/api/auth/login "
        "-H 'Content-Type: application/json' "
        "-d '{\"username\":\"admin\",\"password\":\"" + admin_pw + "\"}'",
        timeout=15,
    )
    if login and ("\"access\"" in login or "access" in login) and "refresh" in login:
        ok("Auth login OK (access + refresh in body)")
    elif login and ("access" in login):
        warn("Auth login returned access but no refresh — check DEPLOY-301 Option A")
        ok("Auth login partial: " + login[:100])
    else:
        warn("Auth verify: " + (login[:200] if login else "no response"))

    log("Verifying frontend...")
    front_status = remote.exec(
        "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/", timeout=10)
    if "200" in front_status:
        ok("Frontend HTTP 200 OK")
    else:
        warn("Frontend: HTTP " + front_status[:10])

    remote.close()

    print()
    print("=== Deploy complete ===")
    print()
    print("  API:      http://" + settings["host"] + ":3000/api/health")
    print("  Frontend: http://" + settings["host"] + ":3000/")
    print("  Prod:     " + settings["cors"])
    print("  Auth:     admin / (see CREDENTIALS.md ADMIN_PASSWORD)")
    print()
    print("  Data:   " + settings["data_dir"] + "/ (mongodb, uploads, backups)")
    print()
    print("  SSH:")
    if settings.get("ssh_key"):
        print("    ssh -i " + settings["ssh_key"] + " " + settings["user"] + "@" + settings["host"])
    else:
        print("    ssh " + settings["user"] + "@" + settings["host"])
    print("    cd " + settings["remote_dir"])
    print("    " + settings["docker"] + " compose -f docker-compose.prod.yml ps|logs")
    print("    bash " + settings["remote_dir"] + "/backup.sh")
    print()


if __name__ == "__main__":
    main()
