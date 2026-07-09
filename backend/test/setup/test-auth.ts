import request from 'supertest';
import type { INestApplication } from '@nestjs/common';

export interface AuthTokens {
  access: string;
  refresh: string;
  user: { id: string; username: string; email: string; role: string };
}

export async function loginAsAdmin(app: INestApplication): Promise<AuthTokens> {
  const username = process.env.ADMIN_USERNAME ?? 'admin';
  // Must match the password set in test-db.ts createTestApp()
  const password = process.env.ADMIN_PASSWORD ?? 'admin123456';
  const res = await request(app.getHttpServer())
    .post('/api/auth/login')
    .send({ username, password })
    .expect((r) => {
      if (r.status !== 200 && r.status !== 201) {
        throw new Error(`Login failed: ${r.status} ${JSON.stringify(r.body)}`);
      }
    });
  return {
    access: res.body.access,
    refresh: res.body.refresh,
    user: res.body.user,
  };
}

export function authHeader(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}
