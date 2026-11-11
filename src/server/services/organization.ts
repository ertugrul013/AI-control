import bcrypt from 'bcryptjs';
import type { z } from 'zod';
import type { organizationSchema, setupSchema } from '@/lib/schemas';
import { audit, changes, type Actor } from '../audit';
import { db } from '../db';
import { HttpError } from '../errors';

export const BCRYPT_COST = 12;

export const organizationExists = async () => (await db.organization.count()) > 0;

export const getOrganization = () => db.organization.findFirstOrThrow();

export async function updateOrganization(actor: Actor, input: z.infer<typeof organizationSchema>) {
  return db.$transaction(async (tx) => {
    const before = await tx.organization.findFirstOrThrow();
    const organization = await tx.organization.update({ where: { id: before.id }, data: input });
    await audit(tx, actor, 'Organization', organization.id, 'UPDATE', changes(before, input));
    return organization;
  });
}

/** First-run onboarding: creates the organization and its first admin. Only works on an empty install. */
export async function setupOrganization(input: z.infer<typeof setupSchema>) {
  const passwordHash = await bcrypt.hash(input.admin.password, BCRYPT_COST);
  return db.$transaction(async (tx) => {
    if ((await tx.organization.count()) > 0) throw new HttpError(409, 'conflict');
    const organization = await tx.organization.create({ data: input.organization });
    const admin = await tx.user.create({
      data: {
        name: input.admin.name,
        email: input.admin.email,
        passwordHash,
        mustChangePassword: false,
        role: 'ADMIN',
        locale: input.organization.defaultLocale,
      },
    });
    await audit(tx, admin, 'Organization', organization.id, 'CREATE', { name: organization.name });
    await audit(tx, admin, 'User', admin.id, 'CREATE', { email: admin.email, role: admin.role });
    return { ok: true };
  });
}
