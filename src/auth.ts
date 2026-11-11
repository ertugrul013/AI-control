import bcrypt from 'bcryptjs';
import NextAuth, { type NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { loginSchema } from '@/lib/schemas';
import { db } from '@/server/db';
import { clearFailures, isBlocked, recordFailure } from '@/server/rateLimit';

export const oidcEnabled = Boolean(
  process.env.OIDC_ISSUER && process.env.OIDC_CLIENT_ID && process.env.OIDC_CLIENT_SECRET,
);

// Compared against when the email is unknown, so the response time does not reveal which emails exist.
const DUMMY_HASH = '$2b$12$1SmPQO7v/LoU86twDK5m1ee.sXKnd.feFUwqUiyESLiJ.J9vLskU2';

const config: NextAuthConfig = {
  trustHost: true,
  session: { strategy: 'jwt', maxAge: 8 * 60 * 60 },
  pages: { signIn: '/login', error: '/login' },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;
        if (isBlocked(email)) return null;
        const user = await db.user.findUnique({ where: { email } });
        const valid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
        if (!user || !valid) {
          recordFailure(email);
          return null;
        }
        clearFailures(email);
        return { id: user.id, name: user.name, email: user.email };
      },
    }),
    ...(oidcEnabled
      ? [
          {
            id: 'oidc',
            name: process.env.OIDC_NAME || 'Single sign-on',
            type: 'oidc' as const,
            issuer: process.env.OIDC_ISSUER,
            clientId: process.env.OIDC_CLIENT_ID,
            clientSecret: process.env.OIDC_CLIENT_SECRET,
          },
        ]
      : []),
  ],
  callbacks: {
    // OIDC only signs in people an admin has already added to AIControl.
    async signIn({ user, account }) {
      if (account?.provider !== 'oidc') return true;
      if (!user.email) return false;
      return (await db.user.count({ where: { email: user.email.toLowerCase() } })) === 1;
    },
    // The token only carries the AIControl user id; role and status are read from the database per request.
    async jwt({ token, user, account }) {
      if (user?.email && account?.provider === 'oidc') {
        const known = await db.user.findUnique({ where: { email: user.email.toLowerCase() } });
        token.sub = known?.id;
      }
      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);
