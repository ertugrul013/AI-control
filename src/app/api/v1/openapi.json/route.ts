import { openApiDocument } from '@/server/openapi';

export const GET = () => Response.json(openApiDocument());
