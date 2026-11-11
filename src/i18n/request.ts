import { cookies } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';

// Routes carry no locale prefix: the language lives in a cookie, Dutch is the default.
export default getRequestConfig(async () => {
  const locale = (await cookies()).get('locale')?.value === 'en' ? 'en' : 'nl';
  return { locale, messages: (await import(`../../messages/${locale}.json`)).default };
});
