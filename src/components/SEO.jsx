import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_URL = 'https://siteon-agency.vercel.app';

const SEO = ({ title, description, keywords, type = 'website', article = null }) => {
  const location = useLocation();
  const canonicalUrl = `${SITE_URL}${location.pathname}`;

  useEffect(() => {
    // Dynamic document title
    document.title = title
      ? `${title} | Siteon Agency - Web Dev, App Dev & Brand Design`
      : 'Siteon | Best Web Dev, App Dev & Brand Design Agency in Jamshedpur';

    // Helper to set/create meta tags
    const setMeta = (attr, key, value) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', value);
    };

    // Description
    const desc = description ||
      'Siteon is a global agency and the best agency in Jamshedpur, Adityapur, Jharkhand, India. We specialize in content marketing, web dev, app dev, brand design, brand design id, social media ads, growth of brands, and content apps.';
    setMeta('name', 'description', desc);

    // Keywords
    const kw = keywords ||
      'content marketing, web dev, app dev, brand design, brand design id, ads, growth of brands, content app, best agency jamshedpur, best agency adityapur, best agency jharkhand, best agency india, global siteon, website design agency, website development agency, social media agency, social media marketing agency, branding agency';
    setMeta('name', 'keywords', kw);

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    // Open Graph Tags
    setMeta('property', 'og:title', document.title);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:url', canonicalUrl);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:site_name', 'Siteon Agency');
    setMeta('property', 'og:locale', 'en_IN');

    // Twitter Card
    setMeta('name', 'twitter:title', document.title);
    setMeta('name', 'twitter:description', desc);

    // Article-specific structured data
    if (article) {
      let scriptTag = document.querySelector('#article-jsonld');
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = 'article-jsonld';
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        description: article.excerpt,
        datePublished: article.dateISO || '2026-06-22',
        dateModified: article.dateISO || '2026-06-22',
        author: {
          '@type': 'Person',
          name: 'Aditya Sharma',
          url: 'https://aadi-sharma.dev/'
        },
        publisher: {
          '@type': 'Organization',
          name: 'Siteon Agency',
          url: SITE_URL
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': canonicalUrl
        },
        keywords: article.keywords ? article.keywords.join(', ') : ''
      });
    }

    // BreadcrumbList structured data
    const pathParts = location.pathname.split('/').filter(Boolean);
    if (pathParts.length > 0) {
      const breadcrumbs = [
        { name: 'Home', url: SITE_URL }
      ];
      let currentPath = '';
      pathParts.forEach((part, i) => {
        currentPath += `/${part}`;
        breadcrumbs.push({
          name: part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' '),
          url: `${SITE_URL}${currentPath}`
        });
      });

      let breadcrumbScript = document.querySelector('#breadcrumb-jsonld');
      if (!breadcrumbScript) {
        breadcrumbScript = document.createElement('script');
        breadcrumbScript.id = 'breadcrumb-jsonld';
        breadcrumbScript.type = 'application/ld+json';
        document.head.appendChild(breadcrumbScript);
      }
      breadcrumbScript.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((b, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: b.name,
          item: b.url
        }))
      });
    }

    // Cleanup on unmount
    return () => {
      const articleScript = document.querySelector('#article-jsonld');
      if (articleScript) articleScript.remove();
    };
  }, [location.pathname, title, description, keywords, type, article, canonicalUrl]);

  return null;
};

export default SEO;
