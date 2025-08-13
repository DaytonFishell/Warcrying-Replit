import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
}

export default function SEOHead({
  title = 'Warcry Companion - Tabletop Gaming App',
  description = 'A comprehensive companion app for Warcry tabletop games. Manage warbands, track battles, and enhance your gaming experience with real-time battle tracking and fighter management.',
  keywords = 'warcry, tabletop gaming, warband management, battle tracker, miniature games, games workshop',
  ogTitle,
  ogDescription
}: SEOHeadProps) {
  useEffect(() => {
    // Update page title
    document.title = title;
    
    // Update meta description
    let descMeta = document.querySelector('meta[name="description"]');
    if (!descMeta) {
      descMeta = document.createElement('meta');
      descMeta.setAttribute('name', 'description');
      document.head.appendChild(descMeta);
    }
    descMeta.setAttribute('content', description);
    
    // Update keywords
    let keywordsMeta = document.querySelector('meta[name="keywords"]');
    if (!keywordsMeta) {
      keywordsMeta = document.createElement('meta');
      keywordsMeta.setAttribute('name', 'keywords');
      document.head.appendChild(keywordsMeta);
    }
    keywordsMeta.setAttribute('content', keywords);
    
    // Update Open Graph tags
    let ogTitleMeta = document.querySelector('meta[property="og:title"]');
    if (!ogTitleMeta) {
      ogTitleMeta = document.createElement('meta');
      ogTitleMeta.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitleMeta);
    }
    ogTitleMeta.setAttribute('content', ogTitle || title);
    
    let ogDescMeta = document.querySelector('meta[property="og:description"]');
    if (!ogDescMeta) {
      ogDescMeta = document.createElement('meta');
      ogDescMeta.setAttribute('property', 'og:description');
      document.head.appendChild(ogDescMeta);
    }
    ogDescMeta.setAttribute('content', ogDescription || description);
    
    // Add Open Graph type
    let ogTypeMeta = document.querySelector('meta[property="og:type"]');
    if (!ogTypeMeta) {
      ogTypeMeta = document.createElement('meta');
      ogTypeMeta.setAttribute('property', 'og:type');
      ogTypeMeta.setAttribute('content', 'website');
      document.head.appendChild(ogTypeMeta);
    }
  }, [title, description, keywords, ogTitle, ogDescription]);
  
  return null;
}