export const siteConfig = {
  name: 'Multi Convert',
  description: 'The Universal Conversion Suite. All formats, one platform. Convert PDF, images, videos, audio and documents instantly.',,
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://multi-convert.com',
  ogImage: '/og-image.png',
  links: {
    twitter: 'https://twitter.com/multiconvert',
    github: 'https://github.com/multiconvert',
  },
  keywords: [
    'file conversion',
    'PDF converter',
    'image converter', 
    'video converter',
    'audio converter',
    'document converter',
    'online converter',
    'free converter',
    'batch conversion',
    'file compression',
    'PDF tools',
    'image optimization',
    'video editing',
    'audio extraction',
    'format conversion',
  ],
  creator: 'Multi Convert Team',
  authors: [{ name: 'Multi Convert Team' }],
}

export type SiteConfig = typeof siteConfig
