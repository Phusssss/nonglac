/**
 * Khuyen Nong Service
 * Crawl directly from FE via jina.ai text proxy (no Firebase Function)
 */

const BASE_URL = 'https://khuyennongvn.gov.vn';
const CATEGORY_PATH = '/ky-thuat-trong-trot';
const JINA_PREFIX = 'https://r.jina.ai/http://';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithRetry = async (url, options = {}, retries = 3) => {
  let attempt = 0;
  let lastError = null;

  while (attempt <= retries) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const res = await fetch(url, options);
      if (res.status === 429) {
        const wait = 800 * Math.pow(2, attempt);
        // eslint-disable-next-line no-await-in-loop
        await sleep(wait);
        attempt += 1;
        continue;
      }
      return res;
    } catch (error) {
      lastError = error;
      const wait = 800 * Math.pow(2, attempt);
      // eslint-disable-next-line no-await-in-loop
      await sleep(wait);
      attempt += 1;
    }
  }

  throw lastError || new Error('Fetch failed after retries');
};

const proxyUrl = (url) => `${JINA_PREFIX}${url.replace(/^https?:\/\//, '')}`;

const cleanText = (text = '') => String(text || '').replace(/\s+/g, ' ').trim();

const absoluteUrl = (href = '') => {
  if (!href) return '';
  if (href.startsWith('http')) return href;
  if (href.startsWith('/')) return `${BASE_URL}${href}`;
  return `${BASE_URL}/${href}`;
};

const parseHtml = (html) => {
  const parser = new DOMParser();
  return parser.parseFromString(html, 'text/html');
};

const isMarkdownProxy = (text = '') => text.includes('Markdown Content:');

const extractMarkdownBody = (text = '') => {
  const marker = 'Markdown Content:';
  const idx = text.indexOf(marker);
  if (idx === -1) return text.trim();
  return text.slice(idx + marker.length).trim();
};

const stripMarkdown = (md = '') => {
  return md
    .replace(/!\[[^\]]*]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/\r/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

const extractMarkdownImages = (md = '') => {
  const matches = Array.from(md.matchAll(/!\[[^\]]*]\(([^)]+)\)/g));
  return Array.from(new Set(matches.map((m) => absoluteUrl(m[1]))));
};

const extractPrimaryImageFromMarkdown = (md = '') => {
  const match = md.match(/!\[[^\]]*]\(([^)]+)\)/);
  if (!match) return null;
  const url = absoluteUrl(match[1]);
  return shouldKeepImage(url) ? url : null;
};

const isJunkLine = (line = '') => {
  const lower = line.toLowerCase();
  if (!lower) return true;
  if (lower.length <= 2) return true;
  if (lower === '<' || lower === '>' || lower === 'x' || lower === 'xx') return true;
  if (lower.includes('javascript:')) return true;
  if (lower.startsWith('http://') || lower.startsWith('https://')) return true;
  if (lower.includes('tthlknqg@gmail.com')) return true;
  if (lower.includes('tổ chức') && lower.includes('khuyến nông')) return false;
  if (lower.includes('liên hệ')) return true;
  if (lower.includes('trình duyệt')) return true;
  if (lower.includes('cập nhật lúc')) return true;
  if (lower.includes('thứ ') && lower.includes('gmt')) return true;
  if (lower.includes('đã truy cập')) return true;
  if (lower.includes('đang online')) return true;
  if (lower.includes('bản quyền')) return true;
  if (lower.includes('trung tâm khuyến nông quốc gia')) return true;
  if (lower.includes('national agriculture extension center')) return true;
  if (lower.includes('giấy phép')) return true;
  if (lower.includes('kết nối')) return true;
  if (lower.includes('©')) return true;
  if (lower.includes('khuyennongvn.gov.vn')) return true;
  if (lower.match(/^\*+\s*\d{2,}/)) return true; // phone-like
  if (lower.match(/(\+84|0)\s*\d{2,}/)) return true; // phone-like
  if (lower.match(/\d{1,2}\/\d{1,2}\/\d{4}/)) return true; // date
  return false;
};

const shouldKeepImage = (url = '') => {
  const lower = url.toLowerCase();
  if (!lower) return false;
  if (lower.includes('logo')) return false;
  if (lower.includes('favicon')) return false;
  if (lower.includes('web-')) return false;
  if (lower.includes('banner')) return false;
  if (lower.includes('noimages')) return false;
  return true;
};

const extractMarkdownContentAndImages = (md = '', title = '') => {
  const lines = md.replace(/\r/g, '').split('\n');
  const contentLines = [];
  const images = [];
  const leadImages = [];

  let started = false;
  let stopped = false;
  let seenContent = false;
  const maxImages = 1;

  for (let i = 0; i < lines.length; i += 1) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!started) {
      if (title && line.replace(/^#+\s*/, '').trim() === title.trim()) {
        started = true;
      }
      continue;
    }

    if (stopped) break;

    if (/^##\s+/.test(line) && title && line.replace(/^#+\s*/, '').trim() !== title.trim()) {
      stopped = true;
      continue;
    }

    if (/^#{1,6}\s+/.test(line) && title && line.replace(/^#+\s*/, '').trim() !== title.trim()) {
      const header = line.toLowerCase();
      if (
        header.includes('bạn đọc quan tâm') ||
        header.includes('kết nối') ||
        header.includes('liên hệ')
      ) {
        stopped = true;
        continue;
      }
    }

    if (
      line.toLowerCase().includes('bạn đọc quan tâm') ||
      line.toLowerCase().includes('đọc nhiều') ||
      line.toLowerCase().includes('tin liên quan') ||
      line.toLowerCase().includes('có thể bạn quan tâm')
    ) {
      stopped = true;
      continue;
    }

    if (isJunkLine(line)) {
      continue;
    }

    const imgMatch = line.match(/!\[[^\]]*]\(([^)]+)\)/);
    if (imgMatch) {
      const imgUrl = absoluteUrl(imgMatch[1]);
      if (shouldKeepImage(imgUrl)) {
        if (seenContent) {
          if (images.length < maxImages) images.push(imgUrl);
        } else if (leadImages.length < maxImages) {
          leadImages.push(imgUrl);
        }
      }
      continue;
    }

    if (line.startsWith('[') && line.endsWith(')')) {
      // raw link line
      continue;
    }

    if (line) {
      contentLines.push(stripMarkdown(line));
      seenContent = true;
    }

    if (contentLines.length >= 12 || contentLines.join(' ').length > 2000) {
      stopped = true;
    }
  }

  const content = contentLines.join('\n\n').replace(/\n{3,}/g, '\n\n').trim();
  const primaryImages = images.length ? images : leadImages;
  const uniqueImages = Array.from(new Set(primaryImages)).slice(0, 8);

  return { content, images: uniqueImages };
};

const extractMarkdownListItems = (md = '') => {
  const items = [];
  const imageByUrl = new Map();

  const imageLinkRegex = /\[!\[[^\]]*]\(([^)]+)\)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  for (const match of md.matchAll(imageLinkRegex)) {
    const imageUrl = absoluteUrl(match[1]);
    const url = absoluteUrl(match[2]);
    if (url) imageByUrl.set(url, imageUrl);
  }

  const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)(?:\s+"[^"]*")?\)/g;
  const matches = Array.from(md.matchAll(linkRegex));
  const seen = new Set();

  for (let i = 0; i < matches.length; i += 1) {
    const match = matches[i];
    const title = cleanText(match[1]);
    const url = absoluteUrl(match[2]);

    if (!url.startsWith(BASE_URL) || !/\.html($|\?)/.test(url)) {
      continue;
    }
    if (!imageByUrl.has(url)) {
      continue;
    }
    if (seen.has(url)) continue;
    seen.add(url);

    const start = match.index + match[0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : md.length;
    const block = md.slice(start, end);
    const paragraphs = block
      .split(/\n\s*\n/)
      .map((p) => stripMarkdown(p))
      .map((p) => p.trim())
      .filter(Boolean);
    const summary = paragraphs.find((p) => !p.startsWith('[')) || '';

    items.push({
      url,
      title,
      imageUrl: imageByUrl.get(url) || null,
      summary
    });
  }

  return items;
};

const extractSummary = (doc) => {
  const meta =
    doc.querySelector('meta[name="description"]')?.getAttribute('content') ||
    doc.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
    '';
  return cleanText(meta);
};

const extractImages = (container) => {
  const images = new Set();
  container.querySelectorAll('img').forEach((img) => {
    const src = cleanText(img.getAttribute('src') || '');
    if (src) images.add(absoluteUrl(src));
  });
  return Array.from(images);
};

const extractContentText = (container) => {
  const blocks = [];
  const seen = new Set();

  container.querySelectorAll('h2,h3,h4,p,li').forEach((el) => {
    const text = cleanText(el.textContent || '');
    if (!text || seen.has(text)) return;
    seen.add(text);
    blocks.push(el.tagName.toLowerCase() === 'li' ? `- ${text}` : text);
  });

  return blocks.join('\n\n').trim();
};

const extractDetail = async (url) => {
  const res = await fetchWithRetry(proxyUrl(url));
  if (!res.ok) throw new Error(`HTTP ${res.status} when fetching detail`);
  const text = await res.text();

  if (isMarkdownProxy(text)) {
    const md = extractMarkdownBody(text);
    const title = cleanText(
      (text.match(/^Title:\s*(.+)$/m) || [])[1] ||
      (md.match(/^#\s+(.+)$/m) || [])[1] ||
      (md.match(/^##\s+(.+)$/m) || [])[1] ||
      ''
    );
    const extracted = extractMarkdownContentAndImages(md, title);
    const primaryImage = extractPrimaryImageFromMarkdown(md);
    const images = primaryImage ? [primaryImage] : [];
    const plain = extracted.content || stripMarkdown(md);
    const paragraphs = plain.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
    const summary = paragraphs[0] || '';

    return {
      title,
      content: plain || summary || title,
      summary,
      categoryLabel: '',
      publishedAt: null,
      images,
      imageUrl: images[0] || null,
    };
  }

  const doc = parseHtml(text);

  const title = cleanText(
    doc.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
    doc.querySelector('meta[itemprop="headline"]')?.getAttribute('content') ||
    doc.querySelector('h1')?.textContent ||
    doc.querySelector('h2')?.textContent ||
    ''
  );

  const categoryLabel = cleanText(
    doc.querySelector('meta[property="article:section"]')?.getAttribute('content') || ''
  );

  const publishedAt = cleanText(
    doc.querySelector('meta[property="article:published_time"]')?.getAttribute('content') || ''
  );

  const contentContainer =
    doc.querySelector('.post-content .noidung') ||
    doc.querySelector('.post-content') ||
    doc.body;

  const content = extractContentText(contentContainer);
  const summary = extractSummary(doc);

  const metaImages = [
    doc.querySelector('meta[property="og:image"]')?.getAttribute('content'),
    doc.querySelector('meta[itemprop="image"]')?.getAttribute('content'),
    doc.querySelector('meta[itemprop="thumbnailUrl"]')?.getAttribute('content'),
  ].filter(Boolean).map(absoluteUrl);

  const contentImages = extractImages(contentContainer);
  const images = Array.from(new Set([...metaImages, ...contentImages]));

  return {
    title,
    content: content || summary || title,
    summary,
    categoryLabel,
    publishedAt: publishedAt || null,
    images,
    imageUrl: images[0] || null,
  };
};

const collectArticle = (items, item, seen) => {
  if (!item?.url) return;
  if (seen.has(item.url)) return;
  seen.add(item.url);
  items.push(item);
};

const extractListFromHtml = (html) => {
  if (isMarkdownProxy(html)) {
    const md = extractMarkdownBody(html);
    const items = extractMarkdownListItems(md);
    return items;
  }

  const doc = parseHtml(html);
  const scope = doc.querySelector('.ctpn .col-sm-8') || doc.body;
  const items = [];
  const seen = new Set();

  scope.querySelectorAll('.topnewstow').forEach((el) => {
    const link = el.querySelector('a[href*=".html"]');
    const url = absoluteUrl(link?.getAttribute('href') || '');
    const title = cleanText(link?.getAttribute('title') || link?.textContent || '');
    const imageUrl = absoluteUrl(el.querySelector('img')?.getAttribute('src') || '');
    const summary = cleanText(el.querySelector('p')?.textContent || '');
    collectArticle(items, { url, title, imageUrl, summary }, seen);
  });

  scope.querySelectorAll('article').forEach((el) => {
    const link = el.querySelector('a[href*=".html"]');
    const url = absoluteUrl(link?.getAttribute('href') || '');
    const title = cleanText(
      link?.getAttribute('title') ||
      el.querySelector('h2,h3,h4,.kntitle,.title')?.textContent ||
      link?.textContent ||
      ''
    );
    const imageUrl = absoluteUrl(el.querySelector('img')?.getAttribute('src') || '');
    const summary = cleanText(el.querySelector('p:not(.kntitle)')?.textContent || '');
    collectArticle(items, { url, title, imageUrl, summary }, seen);
  });

  const preferCategory = items.filter((item) => item.url.includes(`${CATEGORY_PATH}/`));
  return preferCategory.length ? preferCategory : items;
};

const mapLimit = async (items, limit, mapper) => {
  const results = [];
  let index = 0;
  const concurrency = Math.max(1, limit);

  const workers = Array.from({ length: concurrency }, async () => {
    while (index < items.length) {
      const current = items[index];
      index += 1;
      try {
        // eslint-disable-next-line no-await-in-loop
        const mapped = await mapper(current);
        results.push(mapped);
      } catch (error) {
        results.push({ ...current, error: error?.message || 'Failed to fetch detail' });
      }
      // eslint-disable-next-line no-await-in-loop
      await sleep(150);
    }
  });

  await Promise.all(workers);
  return results;
};

const buildListUrls = (pages = 1) => {
  const count = Math.max(1, Math.min(parseInt(pages, 10) || 1, 10));
  const urls = [`${BASE_URL}${CATEGORY_PATH}`];
  for (let i = 2; i <= count; i += 1) {
    urls.push(`${BASE_URL}${CATEGORY_PATH}/p/${i}`);
  }
  return urls;
};

export const crawlKhuyenNongPosts = async ({ pages = 3, maxItems = 20 } = {}) => {
  const listUrls = buildListUrls(pages);
  const listItems = [];
  const seen = new Set();

  for (const url of listUrls) {
    const res = await fetchWithRetry(proxyUrl(url));
    if (!res.ok) throw new Error(`HTTP ${res.status} when fetching list`);
    const html = await res.text();
    const items = extractListFromHtml(html);
    items.forEach((item) => collectArticle(listItems, item, seen));
    await sleep(200);
  }

  const limited = listItems.slice(0, Math.max(1, Math.min(parseInt(maxItems, 10) || 20, 50)));

  const withDetails = await mapLimit(limited, 2, async (item) => {
    const detail = await extractDetail(item.url);
    const fallbackImages = item.imageUrl ? [item.imageUrl] : [];
    const resolvedImages = detail.images && detail.images.length > 0 ? detail.images : fallbackImages;
    return {
      ...item,
      ...detail,
      images: resolvedImages,
      imageUrl: resolvedImages[0] || detail.imageUrl || item.imageUrl || null,
      source: 'Khuyến nông',
      scrapedAt: new Date().toISOString(),
    };
  });

  return {
    source: 'khuyennongvn.gov.vn',
    category: 'Ky thuat trong trot',
    total: withDetails.length,
    items: withDetails,
  };
};

export default {
  crawlKhuyenNongPosts
};
