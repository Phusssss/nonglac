import React from 'react';
import { Helmet } from 'react-helmet-async';

const AdvancedSEO = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  article = null,
  product = null,
  breadcrumbs = [],
  faq = [],
  reviews = []
}) => {
  const siteUrl = 'https://nonglac.com';
  const fullUrl = url?.startsWith('http') ? url : `${siteUrl}${url || ''}`;
  const fullImage = image?.startsWith('http') ? image : `${siteUrl}${image || '/logo192.png'}`;

  // Generate structured data
  const generateStructuredData = () => {
    const baseData = {
      "@context": "https://schema.org",
      "@type": type === 'article' ? 'Article' : 'WebPage',
      "url": fullUrl,
      "headline": title,
      "description": description,
      "image": fullImage,
      "publisher": {
        "@type": "Organization",
        "name": "NôngLạc",
        "logo": {
          "@type": "ImageObject",
          "url": `${siteUrl}/logo192.png`
        }
      }
    };

    // Add article-specific data
    if (article && type === 'article') {
      baseData.author = {
        "@type": "Person",
        "name": article.author || "NôngLạc Team"
      };
      baseData.datePublished = article.publishedTime;
      baseData.dateModified = article.modifiedTime || article.publishedTime;
      baseData.mainEntityOfPage = fullUrl;
    }

    // Add product-specific data
    if (product && type === 'product') {
      baseData["@type"] = "Product";
      baseData.name = product.name;
      baseData.brand = {
        "@type": "Brand",
        "name": product.brand || "NôngLạc"
      };
      if (product.price) {
        baseData.offers = {
          "@type": "Offer",
          "price": product.price,
          "priceCurrency": "VND",
          "availability": "https://schema.org/InStock"
        };
      }
    }

    // Add breadcrumbs
    if (breadcrumbs.length > 0) {
      baseData.breadcrumb = {
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((crumb, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": crumb.name,
          "item": crumb.url?.startsWith('http') ? crumb.url : `${siteUrl}${crumb.url}`
        }))
      };
    }

    // Add FAQ
    if (faq.length > 0) {
      baseData.mainEntity = {
        "@type": "FAQPage",
        "mainEntity": faq.map(item => ({
          "@type": "Question",
          "name": item.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": item.answer
          }
        }))
      };
    }

    // Add reviews
    if (reviews.length > 0) {
      baseData.aggregateRating = {
        "@type": "AggregateRating",
        "ratingValue": reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length,
        "reviewCount": reviews.length
      };
      baseData.review = reviews.map(review => ({
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": review.author
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": review.rating
        },
        "reviewBody": review.text
      }));
    }

    return baseData;
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="NôngLạc Team" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="NôngLạc" />
      <meta property="og:locale" content="vi_VN" />
      
      {/* Article specific OG tags */}
      {article && (
        <>
          <meta property="article:author" content={article.author || "NôngLạc Team"} />
          <meta property="article:published_time" content={article.publishedTime} />
          <meta property="article:modified_time" content={article.modifiedTime || article.publishedTime} />
          <meta property="article:section" content={article.section || "Nông nghiệp"} />
          {article.tags && article.tags.map(tag => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:site" content="@nonglac" />

      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#4CAF50" />
      <meta name="msapplication-TileColor" content="#4CAF50" />
      <meta name="application-name" content="NôngLạc" />
      <meta name="geo.region" content="VN" />
      <meta name="geo.country" content="Vietnam" />
      <meta name="language" content="Vietnamese" />
      <meta name="distribution" content="global" />
      <meta name="rating" content="general" />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(generateStructuredData())}
      </script>

      {/* Preload critical resources */}
      <link rel="preload" href={fullImage} as="image" />
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//www.google-analytics.com" />
    </Helmet>
  );
};

export default AdvancedSEO;