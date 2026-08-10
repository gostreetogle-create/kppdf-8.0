/**
 * HTTP MCP host — bind 127.0.0.1 by default (TZD-11).
 * Env: KPPDF_API_BASE_URL, KPPDF_API_KEY, KPPDF_MCP_PORT, KPPDF_MCP_ALLOW_LAN
 */

import { createRequire } from 'node:module';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createMcpExpressApp } from '@modelcontextprotocol/sdk/server/express.js';
import type { Request, Response } from 'express';
import {
  assertAuthConfigured,
  isAuthorized,
  loadRuntimeConfig,
} from './config.js';
import { buildHealthzPayload, createKppdfMcpServer, listRegisteredToolNames } from './tools.js';

const require = createRequire(import.meta.url);
/** Версия пакета @kppdf/desktop-mcp (для /healthz packageVersion). */
const packageJson = require('../package.json') as { version?: string };
const PACKAGE_VERSION = packageJson.version ?? '0.0.0';

async function main(): Promise<void> {
  const cfg = loadRuntimeConfig();
  assertAuthConfigured(cfg);

  if (cfg.allowLan && cfg.host === '0.0.0.0') {
    console.warn(
      '[kppdf-mcp] LAN bind enabled (KPPDF_MCP_ALLOW_LAN). Only use on trusted networks.',
    );
  } else if (cfg.host !== '127.0.0.1' && cfg.host !== 'localhost' && cfg.host !== '::1') {
    console.warn(`[kppdf-mcp] Non-loopback host ${cfg.host} — ensure firewall policy is intentional.`);
  }

  const app = createMcpExpressApp({ host: cfg.host });

  app.post('/mcp', async (req: Request, res: Response) => {
    if (!isAuthorized(cfg, req.headers.authorization)) {
      res.status(401).json({
        error: 'unauthorized',
        message: 'Authorization: Bearer <pairing-jwt> required (must match KPPDF_API_KEY)',
      });
      return;
    }

    const server = createKppdfMcpServer(cfg);
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (err) {
      console.error('[kppdf-mcp] request error', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'internal_error' });
      }
    } finally {
      await transport.close().catch(() => undefined);
      await server.close().catch(() => undefined);
    }
  });

  app.get('/healthz', (_req: Request, res: Response) => {
    res.json(
      buildHealthzPayload({
        port: cfg.port,
        packageVersion: PACKAGE_VERSION,
        hostDir: process.cwd(),
      }),
    );
  });

  app.listen(cfg.port, cfg.host, () => {
    const displayHost = cfg.host === '0.0.0.0' ? '127.0.0.1' : cfg.host;
    const hostDir = process.cwd();
    const toolCount = listRegisteredToolNames().length;
    console.log(`[kppdf-mcp] listening http://${displayHost}:${cfg.port}/mcp`);
    console.log(`[kppdf-mcp] healthz  http://${displayHost}:${cfg.port}/healthz`);
    console.log(`[kppdf-mcp] auth     Bearer token = pairing JWT (KPPDF_API_KEY)`);
    console.log(`[kppdf-mcp] hostDir  ${hostDir}`);
    console.log(`[kppdf-mcp] tools    ${toolCount} registered`);
  });
}

main().catch((err) => {
  console.error('[kppdf-mcp] fatal', err);
  process.exit(1);
});
