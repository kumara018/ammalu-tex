import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api/', '/account', '/orders', '/cart', '/checkout'],
    },
    sitemap: ['https://ammalutex.com/sitemap.xml', 'https://www.ammalutex.com/sitemap.xml'],
  };
}
