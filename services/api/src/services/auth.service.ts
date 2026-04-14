import { argon2id, hash as argon2Hash, verify as argon2Verify } from 'argon2';
import { SignJWT } from 'jose';

const ARGON2_OPTIONS = {
  type: argon2id,
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 4,
};

export async function hashPassword(password: string): Promise<string> {
  return argon2Hash(password, ARGON2_OPTIONS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return argon2Verify(hash, plain);
}

export async function generateAccessToken(userId: string): Promise<string> {
  const secret = new TextEncoder().encode(process.env['JWT_SECRET']!);
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('15m')
    .setIssuedAt()
    .sign(secret);
}

export async function generateRefreshToken(userId: string): Promise<string> {
  const secret = new TextEncoder().encode(process.env['JWT_REFRESH_SECRET']!);
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .setIssuedAt()
    .sign(secret);
}
