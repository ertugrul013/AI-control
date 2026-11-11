import bcrypt from 'bcryptjs';
import type { z } from 'zod';
import type { passwordSchema, userCreateSchema, userUpdateSchema } from '@/lib/schemas';
import { audit, changes, type Actor } from '../audit';
import { db } from '../db';
import { HttpError } from '../errors';
import { BCRYPT_COST } from './organization';

// The password hash never leaves the service layer.
const publicFields = {
  id: true,
  name: true,
  email: true,
  role: true,
  department: true,
  mustChangePassword: true,
  createdAt: true,
} as const;

export const listUsers = () => db.user.findMany({ select: publicFields, orderBy: { name: 'asc' } });

export async function createUser(actor: Actor, input: z.infer<typeof userCreateSchema>) {
  const { password, ...data } = input;
  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
  return db.$transaction(async (tx) => {
    const user = await tx.user.create({ data: { ...data, passwordHash }, select: publicFields });
    await audit(tx, actor, 'User', user.id, 'CREATE', { email: user.email, role: user.role });
    return user;
  });
}

export async function updateUser(actor: Actor, id: string, input: z.infer<typeof userUpdateSchema>) {
  const { password, ...data } = input;
  const passwordHash = password ? await bcrypt.hash(password, BCRYPT_COST) : undefined;
  return db.$transaction(async (tx) => {
    const before = await tx.user.findUniqueOrThrow({ where: { id } });
    // Without an admin nobody can manage users or settings any more.
    if (before.role === 'ADMIN' && data.role && data.role !== 'ADMIN') {
      if ((await tx.user.count({ where: { role: 'ADMIN' } })) === 1) throw new HttpError(409, 'lastAdmin');
    }
    const user = await tx.user.update({
      where: { id },
      data: { ...data, ...(passwordHash && { passwordHash, mustChangePassword: true }) },
      select: publicFields,
    });
    await audit(tx, actor, 'User', id, 'UPDATE', {
      ...changes(before, data),
      ...(passwordHash && { passwordReset: true }),
    });
    return user;
  });
}

export async function changeOwnPassword(actor: Actor, input: z.infer<typeof passwordSchema>) {
  const user = await db.user.findUniqueOrThrow({ where: { id: actor.id } });
  if (!(await bcrypt.compare(input.currentPassword, user.passwordHash)))
    throw new HttpError(400, 'wrongPassword');
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_COST);
  await db.$transaction(async (tx) => {
    await tx.user.update({ where: { id: actor.id }, data: { passwordHash, mustChangePassword: false } });
    await audit(tx, actor, 'User', actor.id, 'UPDATE', { passwordChanged: true });
  });
  return { ok: true };
}
