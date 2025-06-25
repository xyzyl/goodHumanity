// data-fetcher.js - Automated data fetching script for HumanityCheck
// Runs via GitHub Actions or cron job to update news.json

const https = require('https');
const fs = require('fs').promises;
const path = require('path');
const Parser = require('rss-parser');
const parser = new Parser();

// Configuration
const CONFIG = {
    maxEntries: 500,
    outputFile: 'news.json',
    sources: {
        // RSS Feeds
        rss: [
            {
                url: 'https://www.who.int/feeds/entity/mediacentre/news/en/rss.xml',
                source: 'WHO',
                field: 'health',
                keywords: ['vaccine', 'treatment', 'disease', 'health']
            },
            {
                url: 'https://www.sciencedaily.com/rss/top/technology.xml',
                source: 'ScienceDaily',
                field: 'technology',
                keywords: ['breakthrough', 'innovation', 'discovery']
            },
            {
                url: 'https://climate.nasa.gov/news/rss.xml',
                source: 'NASA Climate',
                field: 'climate',
                keywords: ['climate', 'renewable', 'carbon']
            }
        ],
        // API endpoints
        apis: [
            {
                name: 'OurWorldInData',
                endpoint: 'https://api.ourworldindata.org/v1/indicators',
                source: 'OurWorldInData',
                field: 'various'
            },
            {
                name: 'World Bank',
                endpoint: 'https://api.worldbank.org/v2/indicator',
                source: 'World Bank',
                field: 'development'
            }
        ]
    }
};

// Fetch RSS feed
async function fetchRSSFeed(feedConfig) {
    try {
        const feed = await parser.parseURL(feedConfig.url);
        const entries = [];
        
        for (const item of feed.items.slice(0, 10)) {
            // Basic keyword filtering
            const content = `${item.title} ${item.contentSnippet || ''}`.toLowerCase();
            const hasKeyword = feedConfig.keywords.some(kw => content.includes(kw));
            
            if (hasKeyword || feedConfig.keywords.length === 0) {
                entries.push({
                    title: cleanText(item.title),
                    description: cleanText(item.contentSnippet || item.content || ''),
                    link: item.link,
                    source: feedConfig.source,
                    field: feedConfig.field,
                    date: formatDate(item.pubDate || item.isoDate || new Date())
                });
            }
        }
        
        return entries;
    } catch (error) {
        console.error(`Error fetching RSS feed ${feedConfig.url}:`, error.message);
        return [];
    }
}

// Fetch from OurWorldInData API
async function fetchOurWorldInData() {
    const entries = [];
    const indicators = [
        { id: 'renewable-share-energy', field: 'energy' },
        { id: 'life-expectancy', field: 'health' },
        { id: 'literacy-rate-adult-total', field: 'education' }
    ];
    
    for (const indicator of indicators) {
        try {
            const data = await fetchJSON(
                `https://api.ourworldindata.org/v1/indicators/${indicator.id}?time=latest`
            );
            
            if (data && data.data && data.data.length > 0) {
                const latest = data.data[0];
                entries.push({
                    title: `${formatIndicatorName(indicator.id)}: ${latest.value}${latest.unit || ''}`,
                    description: `Latest global data shows ${formatIndicatorName(indicator.id)} at ${latest.value}${latest.unit || ''}, reflecting continued progress in ${indicator.field}.`,
                    link: `https://ourworldindata.org/grapher/${indicator.id}`,
                    source: 'OurWorldInData',
                    field: indicator.field,
                    date: formatDate(new Date())
                });
            }
        } catch (error) {
            console.error(`Error fetching indicator ${indicator.id}:`, error.message);
        }
    }
    
    return entries;
}

// Fetch arXiv papers
async function fetchArxivPapers() {
    const entries = [];
    const categories = [
        { cat: 'cs.AI', field: 'technology' },
        { cat: 'q-bio', field: 'health' },
        { cat: 'physics.soc-ph', field: 'equality' }
    ];
    
    for (const category of categories) {
        try {
            const url = `http://export.arxiv.org/api/query?search_query=cat:${category.cat}&sortBy=submittedDate&sortOrder=descending&max_results=5`;
            const feed = await parser.parseURL(url);
            
            for (const item of feed.items) {
                // Filter for papers with positive/breakthrough keywords
                const abstract = item.contentSnippet || '';
                if (abstract.match(/breakthrough|novel|significant|improvement|advance/i)) {
                    entries.push({
                        title: cleanText(item.title),
                        description: cleanText(abstract.substring(0, 200) + '...'),
                        link: item.link,
                        source: 'arXiv',
                        field: category.field,
                        date: formatDate(item.pubDate || new Date())
                    });
                }
            }
        } catch (error) {
            console.error(`Error fetching arXiv category ${category.cat}:`, error.message);
        }
    }
    
    return entries;
}

// Utility functions
function fetchJSON(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

function cleanText(text) {
    return text
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim()
        .substring(0, 500); // Limit length
}

function formatDate(date) {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
}

function formatIndicatorName(id) {
    return id
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Main execution
async function main() {
    console.log('Starting HumanityCheck data fetch...');
    
    let allEntries = [];
    
    // Fetch from RSS feeds
    console.log('Fetching RSS feeds...');
    for (const feedConfig of CONFIG.sources.rss) {
        const entries = await fetchRSSFeed(feedConfig);
        allEntries = allEntries.concat(entries);
        console.log(`  - ${feedConfig.source}: ${entries.length} entries`);
    }
    
    // Fetch from APIs
    console.log('Fetching from APIs...');
    const owdEntries = await fetchOurWorldInData();
    allEntries = allEntries.concat(owdEntries);
    console.log(`  - OurWorldInData: ${owdEntries.length} entries`);
    
    const arxivEntries = await fetchArxivPapers();
    allEntries = allEntries.concat(arxivEntries);
    console.log(`  - arXiv: ${arxivEntries.length} entries`);
    
    // Sort by date (newest first)
    allEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Limit to max entries
    allEntries = allEntries.slice(0, CONFIG.maxEntries);
    
    // Create output
    const output = {
        date: new Date().toISOString().split('T')[0],
        lastUpdated: new Date().toISOString(),
        entries: allEntries
    };
    
    // Write to file
    await fs.writeFile(
        path.join(__dirname, CONFIG.outputFile),
        JSON.stringify(output, null, 2)
    );
    
    console.log(`\nSuccess! Wrote ${allEntries.length} entries to ${CONFIG.outputFile}`);
}

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = { main };