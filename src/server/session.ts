import { forbidden, redirect } from 'next/navigation';
import { cache } from 'react';
import { auth } from '@/auth';
import { authorize, type Action } from './authorize';
import { db } from './db';

/** The signed-in user, read fresh from the database so role changes apply immediately. */
export const currentUser = cache(async () => {
  const id = (await auth())?.user?.id;
  if (!id) return null;
  return db.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, department: true, mustChangePassword: true },
  });
});

export type SessionUser = NonNullable<Awaited<ReturnType<typeof currentUser>>>;

/**
 * Guards a page: signed-out visitors go to the login page, and roles without permission
 * get a 403 (or are sent to `fallback` when one is given).
 */
export async function requirePage(action: Action, fallback?: string): Promise<SessionUser> {
  const user = await currentUser();
  if (!user) redirect('/login');
  if (user.mustChangePassword) redirect('/login/change-password');
  if (!authorize(user.role, action)) {
    if (fallback) redirect(fallback);
    forbidden();
  }
  return user;
}
