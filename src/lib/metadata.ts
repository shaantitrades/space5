import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { tools } from '@/config/tools';

export function generateToolMetadata(toolId: string, locale: string = 'fr'): Metadata {
  const tool = tools.find(t => t.id === toolId);
  
  if (!tool) {
    return {
      title: 'Outil non trouvé | Multi Convert',
      description: 'L\'outil demandé n\'existe pas.',
    };
  }

  const title = `${tool.name} - Convertisseur en ligne gratuit | Multi Convert`;
  const description = tool.description || `Utilisez notre ${tool.name.toLowerCase()} en ligne. Gratuit, rapide, et sécurisé. Conversion locale sans envoi de données sur nos serveurs.`;
  
  const url = `${siteConfig.url}/${locale}/${tool.href}`;

  return {
    title,
    description,
    keywords: [
      tool.name,
      `${tool.name} en ligne`,
      `convertir ${tool.name}`,
      tool.category,
      ...siteConfig.keywords,
    ],
    authors: siteConfig.authors,
    creator: siteConfig.creator,
    openGraph: {
      type: 'website',
      locale: locale,
      url: url,
      title: title,
      description: description,
      siteName: siteConfig.name,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: tool.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: [siteConfig.ogImage],
      creator: '@Multi Convert',
    },
    alternates: {
      canonical: url,
      languages: {
        'fr': `${siteConfig.url}/fr/${tool.href}`,
        'en': `${siteConfig.url}/en/${tool.href}`,
        'es': `${siteConfig.url}/es/${tool.href}`,
        'de': `${siteConfig.url}/de/${tool.href}`,
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export function generateCategoryMetadata(category: string, locale: string = 'fr'): Metadata {
  const categoryNames: Record<string, string> = {
    'transformation': 'Transformation',
    'assemblage': 'Assemblage', 
    'authentification': 'Authentification',
    'conversion': 'Conversion',
    'optimisation': 'Optimisation',
    'personnalisation': 'Personnalisation',
    'production': 'Production',
    'reparation': 'Réparation',
  };

  const categoryName = categoryNames[category] || category;
  const title = `Outils de ${categoryName} | Multi Convert`;
  const description = `Découvrez nos outils de ${categoryName.toLowerCase()} en ligne. Gratuits, rapides, et sécurisés.`;
  const url = `${siteConfig.url}/${locale}/tools?category=${category}`;

  return {
    title,
    description,
    keywords: [categoryName, `outils ${categoryName}`, ...siteConfig.keywords],
    authors: siteConfig.authors,
    creator: siteConfig.creator,
    openGraph: {
      type: 'website',
      locale: locale,
      url: url,
      title: title,
      description: description,
      siteName: siteConfig.name,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: categoryName,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: [siteConfig.ogImage],
      creator: '@Multi Convert',
    },
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}
