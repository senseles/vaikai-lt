import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/forumas'],
        disallow: ['/api/', '/admin/', '/prisijungti', '/forumas/naujas'],
      },
    ],
    sitemap: 'https://vaikai.lt/sitemap.xml',
  };
}
