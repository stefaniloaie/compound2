// SEO metadata and Schema.org JSON-LD management utility

export interface SEOConfig {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  ogType?: 'website' | 'article';
  schema?: Record<string, any>;
}

export function updatePageSEO(config: SEOConfig) {
  // 1. Update Title
  const fullTitle = config.title.includes('COMPOUND') 
    ? config.title 
    : `${config.title} | COMPOUND — The Exponential World`;
  document.title = fullTitle;

  // 2. Canonical URL
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://compound.world';
  const canonicalUrl = `${origin}${config.path.startsWith('/') ? config.path : `/${config.path}`}`;

  // Helper to set or create meta tag
  const setMeta = (name: string, content: string, isProperty = false) => {
    const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
    let element = document.querySelector(selector) as HTMLMetaElement | null;
    if (!element) {
      element = document.createElement('meta');
      if (isProperty) {
        element.setAttribute('property', name);
      } else {
        element.setAttribute('name', name);
      }
      document.head.appendChild(element);
    }
    element.setAttribute('content', content);
  };

  // 3. Update Standard Meta Tags
  setMeta('description', config.description);
  if (config.keywords && config.keywords.length > 0) {
    setMeta('keywords', config.keywords.join(', '));
  }
  setMeta('robots', 'index, follow');

  // 4. OpenGraph Meta Tags
  setMeta('og:title', fullTitle, true);
  setMeta('og:description', config.description, true);
  setMeta('og:url', canonicalUrl, true);
  setMeta('og:type', config.ogType || 'website', true);
  setMeta('og:site_name', 'COMPOUND — The Exponential World', true);

  // 5. Twitter Card Meta Tags
  setMeta('twitter:card', 'summary_large_image');
  setMeta('twitter:title', fullTitle);
  setMeta('twitter:description', config.description);

  // 6. Canonical Link Tag
  let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', canonicalUrl);

  // 7. Inject / Update Schema.org JSON-LD Structured Data
  let schemaScript = document.getElementById('schema-jsonld') as HTMLScriptElement | null;
  if (!schemaScript) {
    schemaScript = document.createElement('script');
    schemaScript.id = 'schema-jsonld';
    schemaScript.type = 'application/ld+json';
    document.head.appendChild(schemaScript);
  }

  const defaultSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'COMPOUND — The Exponential World',
    'url': origin,
    'description': 'An interactive exploration platform of exponential growth across finance, biology, technology, energy, and civilization.',
  };

  schemaScript.textContent = JSON.stringify(config.schema || defaultSchema, null, 2);
}
