import { download, route } from '@/server/api';
import { authorize } from '@/server/authorize';
import { renderPolicyPdf } from '@/server/pdf';
import { getPolicy } from '@/server/services/policy';

// ?format=pdf (default) or ?format=md
export const GET = route('policy:read', null, async ({ user, params, req }) => {
  const policy = await getPolicy(params.id, authorize(user.role, 'policy:write'));
  const name = `ai-policy-v${policy.version}-${policy.locale}`;
  if (new URL(req.url).searchParams.get('format') === 'md') {
    return download(policy.contentMarkdown, 'text/markdown; charset=utf-8', `${name}.md`);
  }
  return download(new Uint8Array(await renderPolicyPdf(policy)), 'application/pdf', `${name}.pdf`);
});
