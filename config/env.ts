import fs from 'node:fs';
import path from 'node:path';
import { Role } from '../utils/types';

const root = path.resolve(__dirname, '..');

const credentialKeys = {
  admin: { username: 'ADMIN_USERNAME', password: 'ADMIN_PASSWORD' },
} as const;

export function baseUrl(): string {
  const url = process.env.BASE_URL;
  if (!url) throw new Error('Missing BASE_URL. Copy .env.example to .env.');
  return url.endsWith('/') ? url : `${url}/`;
}

export function credentialsForAdmin(): { username: string; password: string } {
  const keys = credentialKeys.admin;
  const username = process.env[keys.username];
  const password = process.env[keys.password];

  if (!username || !password) {
    throw new Error(`Missing ${keys.username} or ${keys.password}. Copy .env.example to .env.`);
  }

  return { username, password };
}

export function authStatePath(role: Role): string {
  return path.join(root, 'playwright', '.auth', `${role}.json`);
}

export function authCookiePath(role: Role): string {
  return path.join(root, 'playwright', '.auth', `${role}.cookie`);
}

export function saveAuthCookie(role: Role, value: string): void {
  fs.writeFileSync(authCookiePath(role), value);
}

export function readAuthCookie(role: Role): string {
  const cookie = fs.readFileSync(authCookiePath(role), 'utf8').trim();
  if (!cookie) {
    throw new Error(`Missing orangehrm cookie for ${role}. Run the setup project.`);
  }
  return cookie;
}

export function ensureAuthDir(): void {
  fs.mkdirSync(path.join(root, 'playwright', '.auth'), { recursive: true });
}
