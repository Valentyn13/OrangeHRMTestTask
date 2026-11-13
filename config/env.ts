import fs from 'node:fs';
import path from 'node:path';
import { Role } from '../utils/types';



const credentialKeys = {
  admin: { username: 'ADMIN_USERNAME', password: 'ADMIN_PASSWORD' },
  ess: { username: 'ESS_USERNAME', password: 'ESS_PASSWORD' },
} as const;

export function credentialsFor(role: Role): { username: string; password: string } {
  const keys = credentialKeys[role];
  const username = process.env[keys.username];
  const password = process.env[keys.password];

  if (!username || !password) {
    throw new Error(`Missing ${keys.username} or ${keys.password}. Copy .env.example to .env.`);
  }

  return { username, password };
}

export function authStatePath(role: Role): string {
  return path.join(process.cwd(), 'playwright', '.auth', `${role}.json`);
}

export function ensureAuthDir(): void {
  fs.mkdirSync(path.join(process.cwd(), 'playwright', '.auth'), { recursive: true });
}
