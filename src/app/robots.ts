import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/prisijungti', '/forumas/naujas'],
      },
    ],
    sitemap: 'https://manovaikai.lt/sitemap.xml',
  };
}
