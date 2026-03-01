import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/prisijungti'],
      },
    ],
    sitemap: 'https://vaikai.lt/sitemap.xml',
  };
}
