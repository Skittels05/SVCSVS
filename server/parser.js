const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');

async function parseQuotes(url) {
  try {
    const response = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const $ = cheerio.load(response.data);
    const quotes = [];

    $('.quote').each((i, el) => {
      const text = $(el).find('.text').text().trim();
      const author = $(el).find('.author').text().trim();
      const tags = [];
      $(el).find('.tag').each((j, tagEl) => {
        tags.push($(tagEl).text().trim());
      });

      quotes.push({ text, author, tags });
    });

    return quotes;
  } catch (error) {
    console.error(`Ошибка при парсинге ${url}:`, error.message);
    return [];
  }
}

async function processData() {
  const loveUrl = 'https://quotes.toscrape.com/tag/love/';
  const lifeUrl = 'https://quotes.toscrape.com/tag/life/';

  const [loveQuotes, lifeQuotes] = await Promise.all([
    parseQuotes(loveUrl),
    parseQuotes(lifeUrl)
  ]);

  const quoteMap = new Map();
  [...loveQuotes, ...lifeQuotes].forEach(q => {
    quoteMap.set(q.text, q);
  });
  const allQuotes = Array.from(quoteMap.values());

  const categorized = allQuotes.map(quote => {
    const hasLove = quote.tags.includes('love');
    const hasLife = quote.tags.includes('life');

    let category = '';
    if (hasLove && hasLife) category = 'оба';
    else if (hasLove) category = 'love';
    else if (hasLife) category = 'life';

    return { ...quote, category };
  });

  const onlyLove = categorized.filter(q => q.category === 'love').length;
  const onlyLife = categorized.filter(q => q.category === 'life').length;
  const both = categorized.filter(q => q.category === 'оба').length;

  const stats = {
    onlyLove,
    onlyLife,
    both,
    total: categorized.length,
    topAuthorsLove: getTopAuthors(categorized.filter(q => q.category === 'love'), 5),
    topAuthorsLife: getTopAuthors(categorized.filter(q => q.category === 'life'), 5),
    topAuthorsBoth: getTopAuthors(categorized.filter(q => q.category === 'оба'), 5),
    tagCloudLove: getTagCloud(categorized.filter(q => q.category === 'love' || q.category === 'оба')),
    tagCloudLife: getTagCloud(categorized.filter(q => q.category === 'life' || q.category === 'оба'))
  };

  const result = { quotes: categorized, stats };

  const dataDir = path.join(__dirname, 'data');
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(
    path.join(dataDir, 'data.json'),
    JSON.stringify(result, null, 2),
    'utf-8'
  );

  return result;
}

function getTopAuthors(quotes, limit = 5) {
  const countMap = {};
  quotes.forEach(q => {
    countMap[q.author] = (countMap[q.author] || 0) + 1;
  });

  return Object.entries(countMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([author, count]) => ({ author, count }));
}

function getTagCloud(quotes) {
  const countMap = {};
  quotes.forEach(q => {
    q.tags.forEach(tag => {
      if (tag !== 'love' && tag !== 'life') {
        countMap[tag] = (countMap[tag] || 0) + 1;
      }
    });
  });

  return Object.entries(countMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15);
}

module.exports = { processData };