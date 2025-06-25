// working-comprehensive-fetcher.js - Comprehensive fetcher that works in GitHub Actions
const https = require('https');
const http = require('http');
const fs = require('fs').promises;
const Parser = require('rss-parser');

// Configure parser
const parser = new Parser({
    headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; HumanityCheck/2.0; +https://humanitycheck.org)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*'
    },
    timeout: 15000,
    customFields: {
        item: ['media:content', 'media:thumbnail', 'dc:creator', 'category', 'pubDate', 'published']
    }
});

// Comprehensive source list
const SOURCES = {
    health: [
        // Major health organizations
        { url: 'https://www.who.int/feeds/entity/mediacentre/news/en/rss.xml', name: 'WHO', priority: 'high' },
        { url: 'https://www.nih.gov/news-events/news-releases/feed', name: 'NIH', priority: 'high' },
        { url: 'https://www.cdc.gov/media/releases/rss-FeaturedArticles.xml', name: 'CDC', priority: 'high' },
        
        // Medical journals (simplified URLs that work)
        { url: 'https://www.nature.com/nm/rss/current', name: 'Nature Medicine', priority: 'high' },
        { url: 'https://www.thelancet.com/rssfeed/lancet_current.xml', name: 'The Lancet', priority: 'high' },
        { url: 'https://www.bmj.com/rss', name: 'BMJ', priority: 'medium' },
        
        // Disease-specific
        { url: 'https://www.cancer.gov/rss/news', name: 'NCI', priority: 'medium' },
        { url: 'https://www.gatesfoundation.org/ideas/rss', name: 'Gates Foundation', priority: 'high' }
    ],
    
    technology: [
        // Research institutions
        { url: 'https://news.mit.edu/rss/feed', name: 'MIT News', priority: 'high' },
        { url: 'https://www.sciencedaily.com/rss/top/technology.xml', name: 'ScienceDaily Tech', priority: 'high' },
        { url: 'https://www.nsf.gov/news/news_summ.jsp?cntn_id=rss&org=NSF', name: 'NSF', priority: 'high' },
        { url: 'https://news.stanford.edu/feed/', name: 'Stanford News', priority: 'high' },
        
        // Scientific journals
        { url: 'https://feeds.nature.com/nature/rss/current', name: 'Nature', priority: 'high' },
        { url: 'https://www.science.org/rss/news_current.xml', name: 'Science', priority: 'high' },
        
        // Tech news
        { url: 'https://www.technologyreview.com/feed/', name: 'MIT Tech Review', priority: 'medium' },
        { url: 'https://spectrum.ieee.org/rss', name: 'IEEE Spectrum', priority: 'medium' }
    ],
    
    climate: [
        // Climate organizations
        { url: 'https://climate.nasa.gov/news/rss.xml', name: 'NASA Climate', priority: 'high' },
        { url: 'https://www.ipcc.ch/feed/', name: 'IPCC', priority: 'high' },
        { url: 'https://www.unep.org/rss/news', name: 'UNEP', priority: 'high' },
        { url: 'https://www.noaa.gov/rss.xml', name: 'NOAA', priority: 'high' },
        
        // Climate research
        { url: 'https://www.carbonbrief.org/feed/', name: 'Carbon Brief', priority: 'medium' },
        { url: 'https://e360.yale.edu/feed', name: 'Yale E360', priority: 'medium' }
    ],
    
    energy: [
        // Energy organizations
        { url: 'https://www.iea.org/feeds/newsroom.xml', name: 'IEA', priority: 'high' },
        { url: 'https://www.irena.org/RSS', name: 'IRENA', priority: 'high' },
        { url: 'https://www.energy.gov/rss/articles.xml', name: 'US DOE', priority: 'medium' },
        { url: 'https://www.nrel.gov/news/rss/news.xml', name: 'NREL', priority: 'high' }
    ],
    
    education: [
        // UN and international
        { url: 'https://en.unesco.org/news/feed', name: 'UNESCO', priority: 'high' },
        { url: 'https://www.unicef.org/rss/press-releases.xml', name: 'UNICEF', priority: 'high' },
        { url: 'https://www.brookings.edu/topic/education/feed/', name: 'Brookings Education', priority: 'medium' }
    ],
    
    equality: [
        // UN organizations
        { url: 'https://www.ohchr.org/en/feeds/news', name: 'UN Human Rights', priority: 'high' },
        { url: 'https://www.unwomen.org/en/rss/news-and-events', name: 'UN Women', priority: 'high' },
        { url: 'https://www.amnesty.org/en/rss/', name: 'Amnesty International', priority: 'medium' }
    ]
};

// Keywords for scoring
const KEYWORDS = {
    breakthrough: ['breakthrough', 'first-ever', 'revolutionary', 'game-changing', 'historic', 'unprecedented'],
    positive: ['cure', 'eradicate', 'eliminate', 'solve', 'success', 'achievement', 'milestone', 'record'],
    progress: ['improve', 'advance', 'progress', 'develop', 'increase', 'reduce', 'effective', 'efficient'],
    research: ['study', 'research', 'findings', 'results', 'evidence', 'data', 'trial', 'clinical'],
    negative: ['failure', 'setback', 'concern', 'warning', 'threat', 'risk', 'challenge', 'problem']
};

// Simple in-memory cache to avoid duplicates within this run
const processedUrls = new Set();

// Utility functions
function cleanText(text) {
    if (!text) return '';
    return text
        .replace(/<[^>]*>/g, '')
        .replace(/&[^;]+;/g, ' ')
        .replace(/\[\[READMORE\]\]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 1000);
}

function formatDate(date) {
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) throw new Error('Invalid date');
        return d.toISOString().split('T')[0];
    } catch {
        return new Date().toISOString().split('T')[0];
    }
}

// Score entries based on keywords
function scoreEntry(entry) {
    let score = 0;
    const content = `${entry.title} ${entry.description}`.toLowerCase();
    
    // Keyword scoring
    KEYWORDS.breakthrough.forEach(kw => {
        if (content.includes(kw)) score += 3;
    });
    
    KEYWORDS.positive.forEach(kw => {
        if (content.includes(kw)) score += 2;
    });
    
    KEYWORDS.progress.forEach(kw => {
        if (content.includes(kw)) score += 1;
    });
    
    KEYWORDS.research.forEach(kw => {
        if (content.includes(kw)) score += 0.5;
    });
    
    KEYWORDS.negative.forEach(kw => {
        if (content.includes(kw)) score -= 1;
    });
    
    // Recency boost
    const daysSincePublish = (new Date() - new Date(entry.date)) / (1000 * 60 * 60 * 24);
    if (daysSincePublish < 1) score += 2;
    else if (daysSincePublish < 3) score += 1;
    else if (daysSincePublish > 7) score -= 1;
    
    // Field priority
    if (['health', 'climate', 'energy'].includes(entry.field)) {
        score += 0.5;
    }
    
    // Source priority
    if (entry.priority === 'high') score += 1;
    else if (entry.priority === 'low') score -= 0.5;
    
    return Math.max(0, score);
}

// Fetch RSS feed
async function fetchRSSFeed(source, field) {
    try {
        console.log(`  Fetching ${source.name}...`);
        const feed = await parser.parseURL(source.url);
        const entries = [];
        
        const items = feed.items || [];
        for (let i = 0; i < Math.min(15, items.length); i++) {
            const item = items[i];
            
            // Skip if already processed
            if (processedUrls.has(item.link)) continue;
            
            const entry = {
                title: cleanText(item.title),
                description: cleanText(item.contentSnippet || item.content || ''),
                link: item.link || item.guid || '#',
                source: source.name,
                field: field,
                date: formatDate(item.pubDate || item.published || item.isoDate || new Date()),
                priority: source.priority
            };
            
            // Calculate score
            entry.score = scoreEntry(entry);
            
            // Include if score is sufficient
            if (entry.score >= 1) {
                entries.push(entry);
                processedUrls.add(entry.link);
            }
        }
        
        console.log(`    ✓ Found ${entries.length} qualifying entries`);
        return entries;
    } catch (error) {
        console.error(`    ✗ Error with ${source.name}: ${error.message}`);
        return [];
    }
}

// Deduplicate entries
function deduplicateEntries(entries) {
    const seen = new Map();
    
    for (const entry of entries) {
        const key = entry.link || entry.title.substring(0, 50);
        const existing = seen.get(key);
        
        if (!existing || entry.score > existing.score) {
            seen.set(key, entry);
        }
    }
    
    return Array.from(seen.values());
}

// Main execution
async function main() {
    console.log('=== HumanityCheck Working Comprehensive Fetcher ===');
    console.log(`Time: ${new Date().toISOString()}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}\n`);
    
    const startTime = Date.now();
    let allEntries = [];
    let successCount = 0;
    let totalSources = 0;
    
    // Process RSS feeds by field
    for (const [field, sources] of Object.entries(SOURCES)) {
        console.log(`\n📰 Processing ${field.toUpperCase()} sources...`);
        
        for (const source of sources) {
            totalSources++;
            const entries = await fetchRSSFeed(source, field);
            if (entries.length > 0) {
                successCount++;
                allEntries = allEntries.concat(entries);
            }
            
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    }
    
    console.log(`\n📈 Collection Summary:`);
    console.log(`   Sources attempted: ${totalSources}`);
    console.log(`   Sources successful: ${successCount}`);
    console.log(`   Total entries collected: ${allEntries.length}`);
    
    // Deduplicate
    allEntries = deduplicateEntries(allEntries);
    console.log(`   After deduplication: ${allEntries.length}`);
    
    // Sort by score and date
    allEntries.sort((a, b) => {
        if (Math.abs(b.score - a.score) > 0.1) return b.score - a.score;
        return new Date(b.date) - new Date(a.date);
    });
    
    // Limit to top entries
    const maxEntries = 500;
    allEntries = allEntries.slice(0, maxEntries);
    
    // Remove internal fields from output
    const outputEntries = allEntries.map(({ score, priority, ...entry }) => entry);
    
    // Score distribution
    const scoreDistribution = {
        high: allEntries.filter(e => e.score > 5).length,
        medium: allEntries.filter(e => e.score >= 3 && e.score <= 5).length,
        low: allEntries.filter(e => e.score < 3).length
    };
    
    // Create output
    const output = {
        date: new Date().toISOString().split('T')[0],
        lastUpdated: new Date().toISOString(),
        metadata: {
            totalSources: totalSources,
            successfulSources: successCount,
            entriesProcessed: allEntries.length,
            executionTime: `${((Date.now() - startTime) / 1000).toFixed(1)}s`,
            scoreDistribution: scoreDistribution
        },
        entries: outputEntries
    };
    
    // Write output
    console.log('\n💾 Writing results to news.json...');
    await fs.writeFile('news.json', JSON.stringify(output, null, 2));
    
    console.log(`\n✅ Success! Wrote ${outputEntries.length} entries to news.json`);
    console.log(`   Execution time: ${output.metadata.executionTime}`);
    console.log(`   Score distribution: High=${scoreDistribution.high}, Medium=${scoreDistribution.medium}, Low=${scoreDistribution.low}`);
    
    // Show top entries
    if (allEntries.length > 0) {
        console.log('\n🏆 Top entries:');
        allEntries.slice(0, 5).forEach((entry, i) => {
            console.log(`${i + 1}. [${entry.score.toFixed(1)}] "${entry.title.substring(0, 60)}..." - ${entry.source}`);
        });
    }
    
    // IMPORTANT: Exit explicitly to prevent hanging
    console.log('\n✨ Data fetching complete!');
    process.exit(0);
}

// Run with error handling
main().catch(error => {
    console.error('\n❌ Fatal error:', error);
    console.error(error.stack);
    process.exit(1);
});