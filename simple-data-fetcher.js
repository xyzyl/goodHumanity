// simple-data-fetcher.js - Simplified data fetcher for testing
const https = require('https');
const fs = require('fs').promises;
const Parser = require('rss-parser');
const parser = new Parser();

// Simple configuration
const FEEDS = [
    {
        url: 'https://www.sciencedaily.com/rss/top/technology.xml',
        source: 'ScienceDaily',
        field: 'technology'
    },
    {
        url: 'https://climate.nasa.gov/news/rss.xml',
        source: 'NASA Climate',
        field: 'climate'
    },
    {
        url: 'https://www.who.int/feeds/entity/mediacentre/news/en/rss.xml',
        source: 'WHO',
        field: 'health'
    }
];

async function fetchFeed(feedConfig) {
    try {
        console.log(`Fetching ${feedConfig.source}...`);
        const feed = await parser.parseURL(feedConfig.url);
        const entries = [];
        
        // Get first 5 items from each feed
        for (const item of feed.items.slice(0, 5)) {
            entries.push({
                title: item.title || 'No title',
                description: (item.contentSnippet || item.content || 'No description').substring(0, 300),
                link: item.link || '#',
                source: feedConfig.source,
                field: feedConfig.field,
                date: item.pubDate ? new Date(item.pubDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
            });
        }
        
        console.log(`  Found ${entries.length} entries`);
        return entries;
    } catch (error) {
        console.error(`  Error fetching ${feedConfig.source}:`, error.message);
        return [];
    }
}

async function main() {
    console.log('Starting simple data fetch...');
    let allEntries = [];
    
    // Fetch all feeds
    for (const feed of FEEDS) {
        const entries = await fetchFeed(feed);
        allEntries = allEntries.concat(entries);
    }
    
    // Sort by date
    allEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
    
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
    await fs.writeFile('news.json', JSON.stringify(output, null, 2));
    
    console.log(`\nSuccess! Wrote ${allEntries.length} entries to news.json`);
}

// Run
main().catch(error => {
    console.error('Error:', error);
    process.exit(1);
});