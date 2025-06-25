// comprehensive-data-fetcher.js - Advanced data fetching system
const https = require('https');
const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const Parser = require('rss-parser');

// Configure parser with proper headers
const parser = new Parser({
    headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; HumanityCheck/2.0; +https://humanitycheck.org)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*'
    },
    timeout: 20000,
    customFields: {
        item: ['media:content', 'media:thumbnail', 'dc:creator', 'category', 'pubDate', 'published']
    }
});

// Comprehensive source configuration
const SOURCES = {
    health: [
        // Major health organizations
        { url: 'https://www.who.int/feeds/entity/mediacentre/news/en/rss.xml', name: 'WHO', priority: 'high' },
        { url: 'https://www.cdc.gov/media/feeds/rss.xml', name: 'CDC', priority: 'high' },
        { url: 'https://www.nih.gov/news-events/news-releases/feed', name: 'NIH', priority: 'high' },
        { url: 'https://www.ema.europa.eu/en/rss.xml', name: 'EMA', priority: 'medium' },
        
        // Medical journals
        { url: 'https://www.nejm.org/action/showFeed?type=etoc&feed=rss&jc=nejm', name: 'NEJM', priority: 'high' },
        { url: 'https://www.thelancet.com/rssfeed/lancet_current.xml', name: 'The Lancet', priority: 'high' },
        { url: 'https://jamanetwork.com/feeds/site_feeds/jama', name: 'JAMA', priority: 'high' },
        { url: 'https://www.bmj.com/rss', name: 'BMJ', priority: 'medium' },
        { url: 'https://www.nature.com/nm/rss/current', name: 'Nature Medicine', priority: 'high' },
        
        // Specific health topics
        { url: 'https://www.cancer.gov/rss/news.xml', name: 'NCI', priority: 'medium' },
        { url: 'https://www.heart.org/en/rss/rss-news', name: 'AHA', priority: 'medium' }
    ],
    
    technology: [
        // Research institutions
        { url: 'https://news.mit.edu/rss/feed', name: 'MIT News', priority: 'high' },
        { url: 'https://www.sciencedaily.com/rss/top/technology.xml', name: 'ScienceDaily Tech', priority: 'high' },
        { url: 'https://www.nsf.gov/news/news_summ.jsp?cntn_id=rss&org=NSF', name: 'NSF', priority: 'high' },
        
        // Scientific journals
        { url: 'https://feeds.nature.com/nature/rss/current', name: 'Nature', priority: 'high' },
        { url: 'https://www.science.org/action/showFeed?type=etoc&feed=rss&jc=science', name: 'Science', priority: 'high' },
        { url: 'https://feeds.sciencemag.org/rss/current.xml', name: 'Science Magazine', priority: 'high' },
        
        // Tech news
        { url: 'https://www.technologyreview.com/feed/', name: 'MIT Tech Review', priority: 'medium' },
        { url: 'https://spectrum.ieee.org/rss', name: 'IEEE Spectrum', priority: 'medium' },
        { url: 'https://cacm.acm.org/rss', name: 'ACM CACM', priority: 'medium' }
    ],
    
    climate: [
        // Climate organizations
        { url: 'https://climate.nasa.gov/news/rss.xml', name: 'NASA Climate', priority: 'high' },
        { url: 'https://www.ipcc.ch/feed/', name: 'IPCC', priority: 'high' },
        { url: 'https://www.unep.org/rss/news', name: 'UNEP', priority: 'high' },
        { url: 'https://www.noaa.gov/rss.xml', name: 'NOAA', priority: 'high' },
        
        // Climate research
        { url: 'https://www.realclimate.org/index.php/feed/', name: 'RealClimate', priority: 'medium' },
        { url: 'https://www.carbonbrief.org/feed/', name: 'Carbon Brief', priority: 'medium' },
        { url: 'https://insideclimatenews.org/feed/', name: 'Inside Climate News', priority: 'medium' }
    ],
    
    energy: [
        // Energy organizations
        { url: 'https://www.iea.org/feeds/newsroom.xml', name: 'IEA', priority: 'high' },
        { url: 'https://www.irena.org/RSS', name: 'IRENA', priority: 'high' },
        { url: 'https://www.energy.gov/rss/articles.xml', name: 'US DOE', priority: 'medium' },
        
        // Renewable energy
        { url: 'https://www.renewableenergyworld.com/feed/', name: 'RE World', priority: 'medium' },
        { url: 'https://cleantechnica.com/feed/', name: 'CleanTechnica', priority: 'low' }
    ],
    
    education: [
        // Education organizations
        { url: 'https://en.unesco.org/news/feed', name: 'UNESCO', priority: 'high' },
        { url: 'https://www.worldbank.org/en/topic/education/rss.xml', name: 'World Bank Education', priority: 'high' },
        { url: 'https://www.unicef.org/rss/news.xml', name: 'UNICEF', priority: 'high' },
        { url: 'https://www.globalpartnership.org/rss.xml', name: 'GPE', priority: 'medium' },
        
        // Education research
        { url: 'https://www.brookings.edu/topic/education/feed/', name: 'Brookings Education', priority: 'medium' }
    ],
    
    equality: [
        // Human rights organizations
        { url: 'https://www.ohchr.org/en/feeds/news', name: 'UN Human Rights', priority: 'high' },
        { url: 'https://www.unwomen.org/en/rss', name: 'UN Women', priority: 'high' },
        { url: 'https://www.ilo.org/global/about-the-ilo/newsroom/rss/lang--en/index.htm', name: 'ILO', priority: 'high' },
        
        // NGOs
        { url: 'https://www.amnesty.org/en/rss/', name: 'Amnesty International', priority: 'medium' },
        { url: 'https://www.hrw.org/rss', name: 'Human Rights Watch', priority: 'medium' }
    ]
};

// Keywords for filtering and scoring
const KEYWORDS = {
    breakthrough: ['breakthrough', 'first-ever', 'revolutionary', 'game-changing', 'historic', 'unprecedented'],
    positive: ['cure', 'eradicate', 'eliminate', 'solve', 'success', 'achievement', 'milestone'],
    progress: ['improve', 'advance', 'progress', 'develop', 'increase', 'reduce', 'effective'],
    research: ['study', 'research', 'findings', 'results', 'evidence', 'data'],
    negative: ['failure', 'setback', 'concern', 'warning', 'threat', 'risk']
};

// API configurations for additional data
const APIs = {
    ourWorldInData: {
        baseUrl: 'https://api.ourworldindata.org/v1',
        indicators: [
            { id: 'life-expectancy', field: 'health' },
            { id: 'renewable-share-energy', field: 'energy' },
            { id: 'literacy-rate-adult-total', field: 'education' },
            { id: 'co2-emissions-per-capita', field: 'climate' },
            { id: 'share-of-population-in-extreme-poverty', field: 'equality' }
        ]
    }
};

// Cache management
class SimpleCache {
    constructor() {
        this.data = {
            processedUrls: new Set(),
            lastUpdate: null
        };
    }
    
    async load() {
        try {
            const cacheData = await fs.readFile('cache.json', 'utf8');
            const parsed = JSON.parse(cacheData);
            this.data.processedUrls = new Set(parsed.processedUrls || []);
            this.data.lastUpdate = parsed.lastUpdate;
        } catch (error) {
            // Cache doesn't exist, use defaults
        }
    }
    
    async save() {
        const cacheData = {
            processedUrls: Array.from(this.data.processedUrls).slice(-1000), // Keep last 1000
            lastUpdate: new Date().toISOString()
        };
        await fs.writeFile('cache.json', JSON.stringify(cacheData, null, 2));
    }
    
    isProcessed(url) {
        return this.data.processedUrls.has(url);
    }
    
    markProcessed(url) {
        this.data.processedUrls.add(url);
    }
}

// Utility functions
function cleanText(text) {
    if (!text) return '';
    return text
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/&[^;]+;/g, ' ') // Remove HTML entities
        .replace(/\[\[READMORE\]\]/g, '') // Remove common artifacts
        .replace(/\s+/g, ' ') // Normalize whitespace
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

// Fetch RSS feed with error handling
async function fetchRSSFeed(source, field, cache) {
    try {
        console.log(`  Fetching ${source.name}...`);
        const feed = await parser.parseURL(source.url);
        const entries = [];
        
        const items = feed.items || [];
        for (let i = 0; i < Math.min(15, items.length); i++) {
            const item = items[i];
            
            // Skip if already processed
            if (cache && cache.isProcessed(item.link)) continue;
            
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
                if (cache) cache.markProcessed(entry.link);
            }
        }
        
        console.log(`    ✓ Found ${entries.length} qualifying entries`);
        return entries;
    } catch (error) {
        console.error(`    ✗ Error with ${source.name}: ${error.message}`);
        return [];
    }
}

// Fetch data from APIs
async function fetchAPIData(cache) {
    const entries = [];
    
    console.log('\n📊 Fetching API data...');
    
    // OurWorldInData indicators
    for (const indicator of APIs.ourWorldInData.indicators) {
        try {
            const url = `${APIs.ourWorldInData.baseUrl}/indicators/${indicator.id}?time=latest`;
            const data = await fetchJSON(url);
            
            if (data && data.data && data.data.length > 0) {
                const latest = data.data[0];
                const entry = {
                    title: `${formatIndicatorName(indicator.id)}: ${latest.value}${latest.unit || ''}`,
                    description: `Latest global data shows ${formatIndicatorName(indicator.id)} at ${latest.value}${latest.unit || ''}.`,
                    link: `https://ourworldindata.org/grapher/${indicator.id}`,
                    source: 'OurWorldInData',
                    field: indicator.field,
                    date: formatDate(new Date()),
                    score: 3
                };
                entries.push(entry);
            }
        } catch (error) {
            console.error(`    ✗ Error fetching ${indicator.id}: ${error.message}`);
        }
    }
    
    console.log(`    ✓ Found ${entries.length} API data points`);
    return entries;
}

// Fetch JSON helper
function fetchJSON(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        
        client.get(url, {
            headers: {
                'User-Agent': 'HumanityCheck/2.0',
                'Accept': 'application/json'
            },
            timeout: 10000
        }, (res) => {
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

function formatIndicatorName(id) {
    return id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// Deduplicate entries by similarity
function deduplicateEntries(entries) {
    const seen = new Map();
    const unique = [];
    
    for (const entry of entries) {
        const key = entry.title.toLowerCase().substring(0, 50);
        const existing = seen.get(key);
        
        if (!existing || entry.score > existing.score) {
            seen.set(key, entry);
        }
    }
    
    return Array.from(seen.values());
}

// Main execution
async function main() {
    console.log('=== HumanityCheck Comprehensive Data Fetcher ===');
    console.log(`Time: ${new Date().toISOString()}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}\n`);
    
    const cache = new SimpleCache();
    await cache.load();
    
    let allEntries = [];
    let successCount = 0;
    let totalSources = 0;
    
    // Fetch RSS feeds by category
    for (const [field, sources] of Object.entries(SOURCES)) {
        console.log(`\n📰 Fetching ${field.toUpperCase()} sources...`);
        
        for (const source of sources) {
            totalSources++;
            const entries = await fetchRSSFeed(source, field, cache);
            if (entries.length > 0) {
                successCount++;
                allEntries = allEntries.concat(entries);
            }
            
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    
    // Fetch API data
    const apiEntries = await fetchAPIData(cache);
    allEntries = allEntries.concat(apiEntries);
    
    console.log(`\n📈 Collection Summary:`);
    console.log(`   Sources attempted: ${totalSources}`);
    console.log(`   Sources successful: ${successCount}`);
    console.log(`   Total entries collected: ${allEntries.length}`);
    
    // Process entries
    allEntries = deduplicateEntries(allEntries);
    console.log(`   After deduplication: ${allEntries.length}`);
    
    // Sort by score and date
    allEntries.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return new Date(b.date) - new Date(a.date);
    });
    
    // Limit to top entries
    const maxEntries = 500;
    allEntries = allEntries.slice(0, maxEntries);
    
    // Remove score from output
    const outputEntries = allEntries.map(({ score, priority, ...entry }) => entry);
    
    // Create output
    const output = {
        date: new Date().toISOString().split('T')[0],
        lastUpdated: new Date().toISOString(),
        metadata: {
            totalSources: totalSources,
            successfulSources: successCount,
            entriesProcessed: allEntries.length,
            scoreDistribution: {
                high: allEntries.filter(e => e.score > 5).length,
                medium: allEntries.filter(e => e.score >= 3 && e.score <= 5).length,
                low: allEntries.filter(e => e.score < 3).length
            }
        },
        entries: outputEntries
    };
    
    // Write to file
    console.log('\n💾 Writing to news.json...');
    await fs.writeFile('news.json', JSON.stringify(output, null, 2));
    
    // Save cache
    await cache.save();
    
    console.log(`\n✅ Success! Wrote ${outputEntries.length} entries to news.json`);
    
    // Show top entries
    if (outputEntries.length > 0) {
        console.log('\n🏆 Top entries by score:');
        allEntries.slice(0, 5).forEach((entry, i) => {
            console.log(`${i + 1}. [${entry.score.toFixed(1)}] "${entry.title.substring(0, 60)}..." - ${entry.source}`);
        });
    }
}

// Run with error handling
main().catch(error => {
    console.error('\n❌ Fatal error:', error);
    console.error(error.stack);
    process.exit(1);
});