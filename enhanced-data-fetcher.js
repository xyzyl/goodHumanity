// fixed-data-fetcher.js - Fixed version that works in GitHub Actions
const https = require('https');
const fs = require('fs').promises;
const Parser = require('rss-parser');

// Configure parser with proper user agent
const parser = new Parser({
    headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; HumanityCheck/1.0; +https://humanitycheck.org)'
    },
    timeout: 30000
});

// Essential feeds that work reliably
const FEEDS = [
    {
        url: 'https://www.sciencedaily.com/rss/top/technology.xml',
        source: 'ScienceDaily',
        field: 'technology',
        keywords: []
    },
    {
        url: 'https://climate.nasa.gov/news/rss.xml',
        source: 'NASA Climate',
        field: 'climate',
        keywords: []
    },
    {
        url: 'https://news.mit.edu/rss/feed',
        source: 'MIT News',
        field: 'technology',
        keywords: []
    }
];

async function fetchFeed(feedConfig) {
    try {
        console.log(`Fetching ${feedConfig.source}...`);
        const feed = await parser.parseURL(feedConfig.url);
        const entries = [];
        
        // Get up to 10 items from each feed
        const items = feed.items || [];
        for (let i = 0; i < Math.min(10, items.length); i++) {
            const item = items[i];
            
            // Clean and prepare entry
            const entry = {
                title: cleanText(item.title || 'No title'),
                description: cleanText((item.contentSnippet || item.content || 'No description')),
                link: item.link || '#',
                source: feedConfig.source,
                field: feedConfig.field,
                date: formatDate(item.pubDate || item.isoDate || new Date()),
                categories: item.categories || []
            };
            
            entries.push(entry);
        }
        
        console.log(`  ✓ Found ${entries.length} entries from ${feedConfig.source}`);
        return entries;
    } catch (error) {
        console.error(`  ✗ Error fetching ${feedConfig.source}: ${error.message}`);
        return [];
    }
}

function cleanText(text) {
    return text
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/&[^;]+;/g, ' ') // Remove HTML entities
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim()
        .substring(0, 500);
}

function formatDate(date) {
    try {
        const d = new Date(date);
        return d.toISOString().split('T')[0];
    } catch {
        return new Date().toISOString().split('T')[0];
    }
}

async function main() {
    console.log('=== HumanityCheck Data Fetcher ===');
    console.log(`Time: ${new Date().toISOString()}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    
    let allEntries = [];
    
    // Fetch all feeds
    console.log('\nFetching RSS feeds...');
    for (const feed of FEEDS) {
        const entries = await fetchFeed(feed);
        allEntries = allEntries.concat(entries);
    }
    
    console.log(`\nTotal entries collected: ${allEntries.length}`);
    
    // Sort by date (newest first)
    allEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Limit to 100 entries
    allEntries = allEntries.slice(0, 100);
    
    // Create output
    const output = {
        date: new Date().toISOString().split('T')[0],
        lastUpdated: new Date().toISOString(),
        totalSources: FEEDS.length,
        entriesProcessed: allEntries.length,
        entriesIncluded: allEntries.length,
        entries: allEntries
    };
    
    // Write to file
    console.log('\nWriting to news.json...');
    await fs.writeFile('news.json', JSON.stringify(output, null, 2));
    
    console.log(`\n✅ Success! Wrote ${allEntries.length} entries to news.json`);
    
    // Show sample of what was written
    if (allEntries.length > 0) {
        console.log('\nSample entries:');
        allEntries.slice(0, 3).forEach((entry, i) => {
            console.log(`${i + 1}. "${entry.title.substring(0, 60)}..." - ${entry.source}`);
        });
    }
}

// Run with error handling
main().catch(error => {
    console.error('\n❌ Fatal error:', error);
    console.error(error.stack);
    process.exit(1);
});