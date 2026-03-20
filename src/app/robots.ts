import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/prisijungti', '/forumas/naujas'],
      },
      {
        // Allow AI crawlers to access public API for discoverability
        userAgent: ['GPTBot', 'ChatGPT-User', 'Google-Extended', 'Bingbot', 'Applebot-Extended'],
        allow: ['/', '/api/search/', '/api/kindergartens', '/api/aukles', '/api/bureliai', '/api/specialists', '/api/cities', '/llms.txt', '/llms-full.txt', '/.well-known/ai-plugin.json', '/api/openapi.json'],
        disallow: ['/admin/', '/api/admin/', '/api/auth/', '/api/favorites', '/api/metrics'],
      },
    ],
    sitemap: 'https://manovaikai.lt/sitemap.xml',
  };
}
