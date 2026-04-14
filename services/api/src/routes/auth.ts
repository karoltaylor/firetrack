import type { PrismaClient } from '@prisma/client';
import type { FastifyInstance } from 'fastify';

import {
  generateAccessToken,
  generateRefreshToken,
  hashPassword,
} from '../services/auth.service.js';

interface RegisterBody {
  email: string;
  password: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REFRESH_TOKEN_COOKIE = 'refresh_token';
const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60;

export async function authRoutes(
  app: FastifyInstance,
  opts: { prisma: PrismaClient },
): Promise<void> {
  const { prisma } = opts;

  app.post<{ Body: RegisterBody }>('/auth/register', async (request, reply) => {
    const { email, password } = request.body;

    if (typeof password !== 'string' || password.length < 12) {
      return reply.status(400).send({ error: 'Password must be at least 12 characters' });
    }

    if (typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
      return reply.status(400).send({ error: 'Invalid email address' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return reply.status(409).send({ error: 'Email already registered' });
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: { email, passwordHash },
    });

    const [accessToken, refreshToken] = await Promise.all([
      generateAccessToken(user.id),
      generateRefreshToken(user.id),
    ]);

    reply.setCookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env['NODE_ENV'] === 'production',
      maxAge: REFRESH_TOKEN_MAX_AGE,
      path: '/',
    });

    return reply.status(201).send({ accessToken });
  });
}
