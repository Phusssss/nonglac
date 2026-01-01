import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({
  title = 'NôngLạc - Mạng xã hội nông nghiệp hàng đầu Việt Nam | Cộng đồng nông dân 4.0',
  description = 'NôngLạc - Mạng xã hội nông nghiệp hàng đầu Việt Nam. Kết nối nông dân, chia sẻ kinh nghiệm trồng trọt, chăn nuôi, cập nhật giá nông sản realtime. Cộng đồng nông nghiệp thông minh 4.0.',
  keywords = 'nông nghiệp việt nam, nông dân, giá nông sản, mạng xã hội nông nghiệp, trồng trọt, chăn nuôi, nông nghiệp 4.0, công nghệ nông nghiệp, diễn đàn nông nghiệp, nonglac, nông lạc, giá cà phê, giá lúa gạo',
  image = '/logo192.png',
  url = window.location.href,
  type = 'website'
}) => {
  const siteUrl = 'https://nonglac.com';
  const fullUrl = url.startsWith('http') ? url : `${siteUrl}${url}`;
  const fullImage = image.startsWith('http') ? image : `${siteUrl}${image}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="NôngLạc Team" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="NôngLạc" />
      <meta property="og:locale" content="vi_VN" />

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
      
      {/* Favicon and Icons */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/logo192.png" />
      <link rel="manifest" href="/manifest.json" />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "NôngLạc",
          "description": description,
          "url": siteUrl,
          "logo": {
            "@type": "ImageObject",
            "url": fullImage,
            "width": 192,
            "height": 192
          },
          "sameAs": [
            "https://facebook.com/nonglac",
            "https://twitter.com/nonglac",
            "https://youtube.com/@nonglac",
            "https://zalo.me/nonglac"
          ],
          "potentialAction": {
            "@type": "SearchAction",
            "target": `${siteUrl}/search?q={search_term_string}`,
            "query-input": "required name=search_term_string"
          }
        })}
      </script>
    </Helmet>
  );
};

export default SEO;