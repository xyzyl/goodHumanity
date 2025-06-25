// enhanced-data-fetcher.js - Comprehensive data fetching script for HumanityCheck
// Runs via GitHub Actions multiple times per day to update news.json

const https = require('https');
const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const Parser = require('rss-parser');
const parser = new Parser({
    timeout: 10000,
    customFields: {
        item: ['media:content', 'media:thumbnail', 'dc:creator', 'category']
    }
});

// Enhanced Configuration
const CONFIG = {
    maxEntries: 1000, // Increased from 500
    outputFile: 'news.json',
    cacheFile: 'cache.json',
    deduplicationWindow: 7, // days
    sources: {
        // Expanded RSS Feeds
        rss: [
            // Health & Medicine
            {
                url: 'https://www.who.int/feeds/entity/mediacentre/news/en/rss.xml',
                source: 'WHO',
                field: 'health',
                keywords: ['vaccine', 'treatment', 'disease', 'health', 'cure', 'therapy', 'breakthrough']
            },
            {
                url: 'https://www.nature.com/nm/rss/current',
                source: 'Nature Medicine',
                field: 'health',
                keywords: ['clinical', 'trial', 'therapy', 'treatment', 'cure']
            },
            {
                url: 'https://www.thelancet.com/rssfeed/lancet_current.xml',
                source: 'The Lancet',
                field: 'health',
                keywords: ['study', 'trial', 'treatment', 'intervention']
            },
            {
                url: 'https://feeds.nejm.org/action/showFeed?type=etoc&feed=rss&jc=nejm',
                source: 'NEJM',
                field: 'health',
                keywords: ['clinical', 'trial', 'therapy', 'efficacy']
            },
            
            // Technology & Innovation
            {
                url: 'https://www.sciencedaily.com/rss/top/technology.xml',
                source: 'ScienceDaily Tech',
                field: 'technology',
                keywords: ['breakthrough', 'innovation', 'discovery', 'advance', 'develop']
            },
            {
                url: 'https://feeds.nature.com/nature/rss/current',
                source: 'Nature',
                field: 'technology',
                keywords: ['quantum', 'computing', 'AI', 'machine learning', 'innovation']
            },
            {
                url: 'https://feeds.sciencemag.org/rss/current.xml',
                source: 'Science',
                field: 'technology',
                keywords: ['research', 'discovery', 'breakthrough', 'advance']
            },
            {
                url: 'https://news.mit.edu/rss/feed',
                source: 'MIT News',
                field: 'technology',
                keywords: ['research', 'innovation', 'develop', 'breakthrough']
            },
            
            // Climate & Environment
            {
                url: 'https://climate.nasa.gov/news/rss.xml',
                source: 'NASA Climate',
                field: 'climate',
                keywords: ['climate', 'renewable', 'carbon', 'sustainable']
            },
            {
                url: 'https://www.ipcc.ch/feed/',
                source: 'IPCC',
                field: 'climate',
                keywords: ['climate', 'mitigation', 'adaptation', 'renewable']
            },
            {
                url: 'https://www.unep.org/rss',
                source: 'UNEP',
                field: 'climate',
                keywords: ['environment', 'sustainable', 'conservation', 'biodiversity']
            },
            
            // Energy
            {
                url: 'https://www.iea.org/feeds/newsroom.xml',
                source: 'IEA',
                field: 'energy',
                keywords: ['renewable', 'solar', 'wind', 'energy', 'sustainable']
            },
            {
                url: 'https://www.irena.org/RSS',
                source: 'IRENA',
                field: 'energy',
                keywords: ['renewable', 'capacity', 'solar', 'wind', 'clean']
            },
            
            // Education
            {
                url: 'https://en.unesco.org/news/feed',
                source: 'UNESCO',
                field: 'education',
                keywords: ['education', 'literacy', 'learning', 'school', 'student']
            },
            {
                url: 'https://www.worldbank.org/en/topic/education/rss.xml',
                source: 'World Bank Education',
                field: 'education',
                keywords: ['education', 'learning', 'literacy', 'school']
            },
            
            // Equality & Human Rights
            {
                url: 'https://www.ohchr.org/en/feeds/news',
                source: 'UN Human Rights',
                field: 'equality',
                keywords: ['rights', 'equality', 'justice', 'freedom', 'dignity']
            },
            {
                url: 'https://www.unwomen.org/en/rss',
                source: 'UN Women',
                field: 'equality',
                keywords: ['gender', 'equality', 'women', 'empowerment', 'rights']
            }
        ],
        
        // Expanded API endpoints
        apis: [
            {
                name: 'OurWorldInData',
                baseUrl: 'https://api.ourworldindata.org/v1',
                source: 'OurWorldInData',
                indicators: [
                    { id: 'renewable-share-energy', field: 'energy' },
                    { id: 'life-expectancy', field: 'health' },
                    { id: 'literacy-rate-adult-total', field: 'education' },
                    { id: 'share-of-population-with-cancer', field: 'health' },
                    { id: 'co2-emissions-per-capita', field: 'climate' },
                    { id: 'gender-wage-gap-oecd', field: 'equality' },
                    { id: 'share-of-population-in-extreme-poverty', field: 'equality' },
                    { id: 'access-to-electricity', field: 'energy' },
                    { id: 'maternal-mortality-ratio', field: 'health' },
                    { id: 'share-deaths-air-pollution', field: 'climate' }
                ]
            },
            {
                name: 'World Bank',
                baseUrl: 'https://api.worldbank.org/v2',
                source: 'World Bank',
                indicators: [
                    { id: 'SP.DYN.IMRT.IN', field: 'health', name: 'Infant mortality rate' },
                    { id: 'SE.ADT.LITR.ZS', field: 'education', name: 'Adult literacy rate' },
                    { id: 'EG.FEC.RNEW.ZS', field: 'energy', name: 'Renewable energy consumption' },
                    { id: 'SL.TLF.CACT.FE.ZS', field: 'equality', name: 'Female labor force participation' }
                ]
            },
            {
                name: 'Global Health Observatory',
                baseUrl: 'https://ghoapi.azureedge.net/api',
                source: 'WHO GHO',
                indicators: [
                    { id: 'WHOSIS_000001', field: 'health', name: 'Life expectancy at birth' },
                    { id: 'MDG_0000000025', field: 'health', name: 'Infant mortality rate' }
                ]
            }
        ],
        
        // Research repositories
        research: [
            {
                name: 'arXiv',
                categories: [
                    { cat: 'cs.AI', field: 'technology', keywords: ['breakthrough', 'novel', 'improve', 'advance'] },
                    { cat: 'cs.LG', field: 'technology', keywords: ['performance', 'accuracy', 'efficient'] },
                    { cat: 'q-bio', field: 'health', keywords: ['treatment', 'therapy', 'cure', 'diagnostic'] },
                    { cat: 'physics.soc-ph', field: 'equality', keywords: ['social', 'inequality', 'fairness'] },
                    { cat: 'physics.app-ph', field: 'technology', keywords: ['application', 'device', 'innovation'] },
                    { cat: 'stat.AP', field: 'technology', keywords: ['method', 'improve', 'accuracy'] }
                ]
            },
            {
                name: 'bioRxiv',
                baseUrl: 'https://connect.biorxiv.org',
                field: 'health',
                collections: ['neuroscience', 'bioinformatics', 'genetics']
            },
            {
                name: 'medRxiv',
                baseUrl: 'https://connect.medrxiv.org',
                field: 'health',
                collections: ['health-sciences', 'epidemiology', 'public-health']
            }
        ],
        
        // Government & NGO sources
        organizations: [
            {
                name: 'Gates Foundation',
                url: 'https://www.gatesfoundation.org/ideas/rss',
                source: 'Gates Foundation',
                fields: ['health', 'education', 'equality']
            },
            {
                name: 'NIH',
                url: 'https://www.nih.gov/news-events/news-releases/feed',
                source: 'NIH',
                field: 'health'
            },
            {
                name: 'NSF',
                url: 'https://www.nsf.gov/news/news_summ.jsp?cntn_id=rss&org=NSF',
                source: 'NSF',
                fields: ['technology', 'education']
            }
        ]
    },
    
    // Enhanced filtering and scoring
    scoring: {
        keywords: {
            high: ['breakthrough', 'cure', 'eradicate', 'eliminate', 'first-ever', 'record', 'historic'],
            medium: ['improve', 'advance', 'progress', 'develop', 'increase', 'reduce', 'success'],
            low: ['study', 'research', 'report', 'analysis', 'finding']
        },
        minScore: 2, // Minimum score to include entry
        boostRecent: true, // Boost scores for very recent items
        penalizeOld: true // Penalize scores for older items
    }
};

// Cache management
class CacheManager {
    constructor(cacheFile) {
        this.cacheFile = cacheFile;
        this.cache = null;
    }
    
    async load() {
        try {
            const data = await fs.readFile(this.cacheFile, 'utf8');
            this.cache = JSON.parse(data);
        } catch (error) {
            this.cache = {
                processedUrls: new Set(),
                lastFetch: {},
                deduplication: []
            };
        }
    }
    
    async save() {
        const cacheData = {
            processedUrls: Array.from(this.cache.processedUrls || []),
            lastFetch: this.cache.lastFetch,
            deduplication: this.cache.deduplication
        };
        await fs.writeFile(this.cacheFile, JSON.stringify(cacheData, null, 2));
    }
    
    isProcessed(url) {
        return this.cache.processedUrls.has(url);
    }
    
    markProcessed(url) {
        if (!this.cache.processedUrls) {
            this.cache.processedUrls = new Set();
        }
        this.cache.processedUrls.add(url);
    }
    
    isDuplicate(title, date) {
        const titleLower = title.toLowerCase();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - CONFIG.deduplicationWindow);
        
        // Clean old entries
        this.cache.deduplication = this.cache.deduplication.filter(
            entry => new Date(entry.date) > cutoffDate
        );
        
        // Check for duplicate
        const isDupe = this.cache.deduplication.some(entry => 
            similarity(entry.title.toLowerCase(), titleLower) > 0.85
        );
        
        if (!isDupe) {
            this.cache.deduplication.push({ title, date });
        }
        
        return isDupe;
    }
}

// Text similarity function (simple implementation)
function similarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
}

function levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    
    return matrix[str2.length][str1.length];
}

// Score entry based on keywords and recency
function scoreEntry(entry) {
    let score = 0;
    const content = `${entry.title} ${entry.description}`.toLowerCase();
    
    // Keyword scoring
    CONFIG.scoring.keywords.high.forEach(kw => {
        if (content.includes(kw)) score += 3;
    });
    
    CONFIG.scoring.keywords.medium.forEach(kw => {
        if (content.includes(kw)) score += 2;
    });
    
    CONFIG.scoring.keywords.low.forEach(kw => {
        if (content.includes(kw)) score += 1;
    });
    
    // Recency scoring
    const daysSincePublish = (new Date() - new Date(entry.date)) / (1000 * 60 * 60 * 24);
    
    if (CONFIG.scoring.boostRecent && daysSincePublish < 1) {
        score += 2;
    } else if (daysSincePublish < 3) {
        score += 1;
    } else if (CONFIG.scoring.penalizeOld && daysSincePublish > 7) {
        score -= 1;
    }
    
    // Field-specific boosts
    if (['health', 'climate', 'energy'].includes(entry.field)) {
        score += 0.5;
    }
    
    return score;
}

// Enhanced RSS fetching with better error handling
async function fetchRSSFeed(feedConfig, cache) {
    try {
        console.log(`  Fetching ${feedConfig.source}...`);
        const feed = await parser.parseURL(feedConfig.url);
        const entries = [];
        
        for (const item of feed.items.slice(0, 20)) {
            // Skip if already processed
            if (cache.isProcessed(item.link)) continue;
            
            // Enhanced keyword filtering
            const content = `${item.title} ${item.contentSnippet || item.content || ''}`.toLowerCase();
            const hasKeyword = feedConfig.keywords.length === 0 || 
                              feedConfig.keywords.some(kw => content.includes(kw));
            
            if (hasKeyword) {
                const entry = {
                    title: cleanText(item.title),
                    description: cleanText(item.contentSnippet || item.content || ''),
                    link: item.link,
                    source: feedConfig.source,
                    field: feedConfig.field,
                    date: formatDate(item.pubDate || item.isoDate || new Date()),
                    categories: item.categories || [],
                    author: item.creator || item['dc:creator'] || null
                };
                
                // Calculate score
                entry.score = scoreEntry(entry);
                
                // Only include if meets minimum score and not duplicate
                if (entry.score >= CONFIG.scoring.minScore && 
                    !cache.isDuplicate(entry.title, entry.date)) {
                    entries.push(entry);
                    cache.markProcessed(item.link);
                }
            }
        }
        
        console.log(`    Found ${entries.length} qualifying entries`);
        return entries;
    } catch (error) {
        console.error(`  Error fetching RSS feed ${feedConfig.url}:`, error.message);
        return [];
    }
}

// Fetch from OurWorldInData API with more indicators
async function fetchOurWorldInData(cache) {
    const entries = [];
    const config = CONFIG.sources.apis.find(api => api.name === 'OurWorldInData');
    
    console.log('  Fetching OurWorldInData indicators...');
    
    for (const indicator of config.indicators) {
        try {
            // Check cache to avoid too frequent requests
            const cacheKey = `owd_${indicator.id}`;
            const lastFetch = cache.cache.lastFetch[cacheKey];
            if (lastFetch && (Date.now() - lastFetch) < 3600000) continue; // Skip if fetched within hour
            
            const data = await fetchJSON(
                `${config.baseUrl}/indicators/${indicator.id}?time=latest`
            );
            
            if (data && data.data && data.data.length > 0) {
                const latest = data.data[0];
                const entry = {
                    title: `${formatIndicatorName(indicator.id)}: ${latest.value}${latest.unit || ''}`,
                    description: `Latest global data shows ${formatIndicatorName(indicator.id)} at ${latest.value}${latest.unit || ''}, reflecting continued progress in ${indicator.field}.`,
                    link: `https://ourworldindata.org/grapher/${indicator.id}`,
                    source: 'OurWorldInData',
                    field: indicator.field,
                    date: formatDate(new Date()),
                    score: 3 // Data updates get good score
                };
                
                if (!cache.isDuplicate(entry.title, entry.date)) {
                    entries.push(entry);
                    cache.cache.lastFetch[cacheKey] = Date.now();
                }
            }
        } catch (error) {
            console.error(`    Error fetching indicator ${indicator.id}:`, error.message);
        }
    }
    
    console.log(`    Found ${entries.length} indicator updates`);
    return entries;
}

// Fetch World Bank data
async function fetchWorldBankData(cache) {
    const entries = [];
    const config = CONFIG.sources.apis.find(api => api.name === 'World Bank');
    
    console.log('  Fetching World Bank indicators...');
    
    for (const indicator of config.indicators) {
        try {
            const cacheKey = `wb_${indicator.id}`;
            const lastFetch = cache.cache.lastFetch[cacheKey];
            if (lastFetch && (Date.now() - lastFetch) < 3600000) continue;
            
            const url = `${config.baseUrl}/country/WLD/indicator/${indicator.id}?format=json&per_page=1&date=2020:2025`;
            const data = await fetchJSON(url);
            
            if (data && data[1] && data[1].length > 0) {
                const latest = data[1][0];
                if (latest.value) {
                    const entry = {
                        title: `${indicator.name}: ${latest.value.toFixed(2)}`,
                        description: `World Bank data shows global ${indicator.name} at ${latest.value.toFixed(2)} as of ${latest.date}.`,
                        link: `https://data.worldbank.org/indicator/${indicator.id}`,
                        source: 'World Bank',
                        field: indicator.field,
                        date: formatDate(new Date()),
                        score: 3
                    };
                    
                    if (!cache.isDuplicate(entry.title, entry.date)) {
                        entries.push(entry);
                        cache.cache.lastFetch[cacheKey] = Date.now();
                    }
                }
            }
        } catch (error) {
            console.error(`    Error fetching indicator ${indicator.id}:`, error.message);
        }
    }
    
    console.log(`    Found ${entries.length} indicator updates`);
    return entries;
}

// Enhanced arXiv fetching
async function fetchArxivPapers(cache) {
    const entries = [];
    const config = CONFIG.sources.research.find(r => r.name === 'arXiv');
    
    console.log('  Fetching arXiv papers...');
    
    for (const category of config.categories) {
        try {
            const url = `http://export.arxiv.org/api/query?search_query=cat:${category.cat}&sortBy=submittedDate&sortOrder=descending&max_results=10`;
            const feed = await parser.parseURL(url);
            
            for (const item of feed.items) {
                if (cache.isProcessed(item.link)) continue;
                
                const abstract = item.contentSnippet || '';
                const content = `${item.title} ${abstract}`.toLowerCase();
                
                // Check for positive keywords
                const hasKeyword = category.keywords.some(kw => content.includes(kw));
                
                if (hasKeyword) {
                    const entry = {
                        title: cleanText(item.title),
                        description: cleanText(abstract.substring(0, 300) + '...'),
                        link: item.link,
                        source: 'arXiv',
                        field: category.field,
                        date: formatDate(item.pubDate || new Date()),
                        categories: [category.cat]
                    };
                    
                    entry.score = scoreEntry(entry);
                    
                    if (entry.score >= CONFIG.scoring.minScore && 
                        !cache.isDuplicate(entry.title, entry.date)) {
                        entries.push(entry);
                        cache.markProcessed(item.link);
                    }
                }
            }
        } catch (error) {
            console.error(`    Error fetching arXiv category ${category.cat}:`, error.message);
        }
    }
    
    console.log(`    Found ${entries.length} relevant papers`);
    return entries;
}

// Fetch bioRxiv/medRxiv preprints
async function fetchBioMedRxiv(source, cache) {
    const entries = [];
    const config = CONFIG.sources.research.find(r => r.name === source);
    
    console.log(`  Fetching ${source} preprints...`);
    
    for (const collection of config.collections) {
        try {
            const url = `${config.baseUrl}/relate/collection_json.php?grp=${collection}`;
            const data = await fetchJSON(url);
            
            if (data && data.rels) {
                for (const paper of data.rels.slice(0, 10)) {
                    if (cache.isProcessed(paper.rel_link)) continue;
                    
                    const entry = {
                        title: cleanText(paper.rel_title),
                        description: cleanText(paper.rel_abs || '').substring(0, 300) + '...',
                        link: paper.rel_link,
                        source: source,
                        field: config.field,
                        date: formatDate(paper.rel_date || new Date()),
                        categories: [collection]
                    };
                    
                    entry.score = scoreEntry(entry);
                    
                    if (entry.score >= CONFIG.scoring.minScore && 
                        !cache.isDuplicate(entry.title, entry.date)) {
                        entries.push(entry);
                        cache.markProcessed(paper.rel_link);
                    }
                }
            }
        } catch (error) {
            console.error(`    Error fetching ${collection}:`, error.message);
        }
    }
    
    console.log(`    Found ${entries.length} relevant preprints`);
    return entries;
}

// Utility functions
function fetchJSON(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        
        client.get(url, {
            headers: {
                'User-Agent': 'HumanityCheck/1.0 (https://humanitycheck.org)',
                'Accept': 'application/json'
            }
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

function cleanText(text) {
    return text
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/&[^;]+;/g, ' ') // Remove HTML entities
        .replace(/\s+/g, ' ') // Normalize whitespace
        .replace(/[^\w\s.,!?-]/g, '') // Remove special characters
        .trim()
        .substring(0, 1000); // Increased limit
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

// Merge and deduplicate entries
function mergeEntries(allEntries) {
    // Sort by score first, then by date
    allEntries.sort((a, b) => {
        if (b.score !== a.score) {
            return b.score - a.score;
        }
        return new Date(b.date) - new Date(a.date);
    });
    
    // Take top entries up to max limit
    return allEntries.slice(0, CONFIG.maxEntries);
}

// Main execution
async function main() {
    console.log('Starting HumanityCheck comprehensive data fetch...');
    console.log(`Time: ${new Date().toISOString()}`);
    
    // Initialize cache
    const cache = new CacheManager(path.join(__dirname, CONFIG.cacheFile));
    await cache.load();
    
    let allEntries = [];
    
    // Fetch from RSS feeds
    console.log('\nFetching RSS feeds...');
    for (const feedConfig of CONFIG.sources.rss) {
        const entries = await fetchRSSFeed(feedConfig, cache);
        allEntries = allEntries.concat(entries);
    }
    
    // Fetch from APIs
    console.log('\nFetching from APIs...');
    const owdEntries = await fetchOurWorldInData(cache);
    allEntries = allEntries.concat(owdEntries);
    
    const wbEntries = await fetchWorldBankData(cache);
    allEntries = allEntries.concat(wbEntries);
    
    // Fetch research papers
    console.log('\nFetching research papers...');
    const arxivEntries = await fetchArxivPapers(cache);
    allEntries = allEntries.concat(arxivEntries);
    
    // Commented out for now - these require different parsing
    // const bioRxivEntries = await fetchBioMedRxiv('bioRxiv', cache);
    // allEntries = allEntries.concat(bioRxivEntries);
    
    // Fetch from organizations
    console.log('\nFetching from organizations...');
    for (const org of CONFIG.sources.organizations) {
        const entries = await fetchRSSFeed({
            url: org.url,
            source: org.source,
            field: org.field || org.fields[0],
            keywords: []
        }, cache);
        allEntries = allEntries.concat(entries);
    }
    
    // Merge and process entries
    const finalEntries = mergeEntries(allEntries);
    
    // Create output
    const output = {
        date: new Date().toISOString().split('T')[0],
        lastUpdated: new Date().toISOString(),
        totalSources: CONFIG.sources.rss.length + CONFIG.sources.apis.length + CONFIG.sources.organizations.length,
        entriesProcessed: allEntries.length,
        entriesIncluded: finalEntries.length,
        entries: finalEntries.map(({ score, ...entry }) => entry) // Remove score from output
    };
    
    // Write to file
    await fs.writeFile(
        path.join(__dirname, CONFIG.outputFile),
        JSON.stringify(output, null, 2)
    );
    
    // Save cache
    await cache.save();
    
    console.log(`\n✅ Success! Processed ${allEntries.length} entries, included ${finalEntries.length} in output`);
    console.log(`📊 Score distribution: High (>5): ${finalEntries.filter(e => e.score > 5).length}, Medium (3-5): ${finalEntries.filter(e => e.score >= 3 && e.score <= 5).length}, Low (<3): ${finalEntries.filter(e => e.score < 3).length}`);
}

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = { main };