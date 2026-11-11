import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { authorize, type Action } from './authorize';
import { HttpError } from './errors';
import { currentUser, type SessionUser } from './session';

type Params = Record<string, string>;
type RouteContext = { params: Promise<Params> };
type Body<S> = S extends z.ZodType ? z.infer<S> : undefined;

async function respond(req: Request, handler: () => Promise<unknown>): Promise<Response> {
  try {
    // Defence in depth on top of the SameSite session cookie: refuse cross-origin writes.
    const origin = req.headers.get('origin');
    const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host');
    if (req.method !== 'GET' && origin && new URL(origin).host !== host)
      throw new HttpError(403, 'forbidden');

    const result = await handler();
    return result instanceof Response ? result : Response.json(result ?? { ok: true });
  } catch (error) {
    if (error instanceof HttpError) return Response.json({ error: error.code }, { status: error.status });
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'validation', issues: error.issues }, { status: 400 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') return Response.json({ error: 'notFound' }, { status: 404 });
      if (error.code === 'P2002') return Response.json({ error: 'conflict' }, { status: 409 });
    }
    console.error(error);
    return Response.json({ error: 'unknown' }, { status: 500 });
  }
}

async function parseBody<S extends z.ZodType | null>(req: Request, schema: S): Promise<Body<S>> {
  if (!schema) return undefined as Body<S>;
  const raw: unknown = await req.json().catch(() => {
    throw new HttpError(400, 'validation');
  });
  return schema.parse(raw) as Body<S>;
}

/**
 * Wraps an /api/v1 handler: checks the session and the role, validates the JSON body with Zod,
 * and turns results and errors into JSON responses.
 */
export function route<S extends z.ZodType | null>(
  action: Action,
  schema: S,
  handler: (ctx: { user: SessionUser; body: Body<S>; params: Params; req: Request }) => Promise<unknown>,
) {
  return (req: Request, context: RouteContext) =>
    respond(req, async () => {
      const user = await currentUser();
      if (!user) throw new HttpError(401, 'unauthenticated');
      if (!authorize(user.role, action)) throw new HttpError(403, 'forbidden');
      return handler({ user, body: await parseBody(req, schema), params: await context.params, req });
    });
}

/** Like `route`, for the few endpoints that work without a session. */
export function publicRoute<S extends z.ZodType | null>(
  schema: S,
  handler: (ctx: { body: Body<S>; req: Request }) => Promise<unknown>,
) {
  return (req: Request) => respond(req, async () => handler({ body: await parseBody(req, schema), req }));
}

/** A file download response. */
export function download(body: string | Uint8Array<ArrayBuffer>, contentType: string, filename: string) {
  return new Response(body, {
    headers: { 'content-type': contentType, 'content-disposition': `attachment; filename="${filename}"` },
  });
}
