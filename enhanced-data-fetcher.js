// hope-focused-fetcher.js - Fetches only genuinely hopeful, transformative human progress
const https = require('https');
const http = require('http');
const fs = require('fs').promises;
const Parser = require('rss-parser');

// Configure parser
const parser = new Parser({
    headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; HumanityCheck/3.0; +https://humanitycheck.org)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*'
    },
    timeout: 20000,
    customFields: {
        item: ['media:content', 'media:thumbnail', 'dc:creator', 'category', 'pubDate', 'published', 'updated']
    }
});

// Hope-focused sources - curated for positive impact
const SOURCES = {
    health: [
        { url: 'https://www.who.int/feeds/entity/mediacentre/news/en/rss.xml', name: 'WHO', priority: 'critical' },
        { url: 'https://www.gatesfoundation.org/ideas/rss', name: 'Gates Foundation', priority: 'critical' },
        { url: 'https://www.nih.gov/news-events/news-releases/feed', name: 'NIH', priority: 'critical' },
        { url: 'https://www.cancer.gov/news-events/press-releases/rss', name: 'NCI', priority: 'high' },
        { url: 'https://www.gavi.org/programmes-impact/news/rss.xml', name: 'Gavi', priority: 'high' },
        { url: 'https://www.nature.com/nm/rss/current', name: 'Nature Medicine', priority: 'high' }
    ],
    
    equality: [
        { url: 'https://www.worldbank.org/en/news/rss.xml', name: 'World Bank', priority: 'critical' },
        { url: 'https://www.undp.org/rss', name: 'UNDP', priority: 'critical' },
        { url: 'https://www.wfp.org/rss', name: 'WFP', priority: 'critical' },
        { url: 'https://www.unicef.org/rss/press-releases.xml', name: 'UNICEF', priority: 'critical' },
        { url: 'https://www.unwomen.org/en/rss/news-and-events', name: 'UN Women', priority: 'high' }
    ],
    
    climate: [
        { url: 'https://climate.nasa.gov/news/rss.xml', name: 'NASA Climate', priority: 'critical' },
        { url: 'https://www.unep.org/rss/news', name: 'UNEP', priority: 'critical' },
        { url: 'https://www.worldwildlife.org/rss/news.xml', name: 'WWF', priority: 'high' },
        { url: 'https://www.conservation.org/rss.xml', name: 'Conservation Intl', priority: 'high' }
    ],
    
    energy: [
        { url: 'https://www.irena.org/RSS', name: 'IRENA', priority: 'critical' },
        { url: 'https://www.iea.org/feeds/newsroom.xml', name: 'IEA', priority: 'critical' },
        { url: 'https://www.nrel.gov/news/rss/news.xml', name: 'NREL', priority: 'high' }
    ],
    
    education: [
        { url: 'https://en.unesco.org/news/feed', name: 'UNESCO', priority: 'critical' },
        { url: 'https://www.globalpartnership.org/rss.xml', name: 'GPE', priority: 'high' }
    ],
    
    technology: [
        { url: 'https://news.mit.edu/rss/feed', name: 'MIT News', priority: 'high' },
        { url: 'https://www.nsf.gov/news/news_summ.jsp?cntn_id=rss&org=NSF', name: 'NSF', priority: 'high' }
    ]
};

// Hope indicators - what we're looking for
const HOPE_PATTERNS = {
    // Transformative breakthroughs
    breakthroughs: {
        patterns: [
            /breakthrough\s+(?:treatment|therapy|vaccine|cure|method|technology)/i,
            /first[\s-]?(?:ever|time|successful)?\s+(?:treatment|cure|vaccine)/i,
            /historic\s+(?:achievement|milestone|breakthrough|success)/i,
            /revolutionary\s+(?:treatment|therapy|approach|technology)/i,
            /game[\s-]?changing\s+(?:discovery|treatment|approach)/i
        ],
        weight: 5,
        required: ['breakthrough', 'first', 'cure', 'revolutionary']
    },
    
    // Lives saved or transformed
    livesSaved: {
        patterns: [
            /(?:save|saved|saving)\s+(?:up to\s+)?(\d+[\s,]*)+(?:million|thousand)?\s*lives/i,
            /(\d+[\s,]*)+(?:million|thousand)\s+(?:people|children|patients)\s+(?:helped|treated|cured|saved)/i,
            /prevent\s+(\d+[\s,]*)+(?:million|thousand)?\s*deaths/i,
            /(?:help|helping)\s+(\d+[\s,]*)+(?:million|billion)\s+people/i
        ],
        weight: 5,
        required: ['save', 'lives', 'help', 'prevent', 'million']
    },
    
    // Disease eradication
    eradication: {
        patterns: [
            /(?:eradicat|eliminat)(?:e|ed|ing|ion)\s+(?:disease|malaria|polio|cancer)/i,
            /(?:cure|cured|curing)\s+(?:for|of)?\s*(?:cancer|HIV|AIDS|malaria)/i,
            /(?:end|ending|ended)\s+(?:pandemic|epidemic|outbreak)/i,
            /disease[\s-]?free\s+(?:world|region|country)/i
        ],
        weight: 5,
        required: ['eradicate', 'eliminate', 'cure', 'end']
    },
    
    // Access and opportunity
    access: {
        patterns: [
            /(?:gain|gained|provide|providing)\s+access\s+to\s+(?:education|healthcare|electricity|water)/i,
            /(\d+[\s,]*)+(?:million|billion)\s+(?:now have|gained|receive)\s+access/i,
            /universal\s+(?:access|healthcare|education|coverage)/i,
            /bring(?:ing)?\s+(?:electricity|internet|healthcare|education)\s+to\s+(\d+)/i
        ],
        weight: 4,
        required: ['access', 'universal', 'million', 'education', 'healthcare']
    },
    
    // Environmental recovery
    recovery: {
        patterns: [
            /(?:restore|restored|restoring)\s+(\d+[\s,]*)+(?:hectares|acres|square)/i,
            /species\s+(?:saved|recovered|recovering)\s+from\s+extinction/i,
            /(?:plant|planted|planting)\s+(\d+[\s,]*)+(?:million|billion)?\s*trees/i,
            /(?:clean|cleaned|cleaning)\s+(?:ocean|river|air|water)/i,
            /renewable\s+energy\s+(?:surpass|exceed|overtake)/i
        ],
        weight: 4,
        required: ['restore', 'save', 'recover', 'clean', 'renewable']
    },
    
    // Poverty reduction
    poverty: {
        patterns: [
            /(\d+[\s,]*)+(?:million|thousand)\s+(?:lifted|escaped|moved)\s+(?:out of|from)\s+poverty/i,
            /poverty\s+rate\s+(?:fall|fell|drops|dropped|decrease)/i,
            /(?:create|created|creating)\s+(\d+[\s,]*)+(?:million|thousand)?\s*jobs/i,
            /income\s+(?:increase|increased|rise|rose)\s+(?:by|for)\s+(\d+)/i
        ],
        weight: 4,
        required: ['poverty', 'lifted', 'jobs', 'income']
    },
    
    // Global cooperation
    cooperation: {
        patterns: [
            /(?:countries|nations)\s+(?:unite|united|agree|agreed)\s+to/i,
            /global\s+(?:partnership|agreement|coalition|cooperation)/i,
            /peace\s+(?:agreement|treaty|accord)\s+(?:signed|reached)/i,
            /(?:end|ended|ending)\s+(?:conflict|war|hostilities)/i
        ],
        weight: 3,
        required: ['unite', 'agreement', 'peace', 'global']
    }
};

// Negative patterns to avoid
const NEGATIVE_PATTERNS = [
    /(?:warn|warning|warns)\s+(?:of|about|that)/i,
    /(?:threat|threaten|threatening)\s+(?:to|of)/i,
    /(?:crisis|disaster|catastrophe|emergency)/i,
    /(?:fear|fears|feared|fearing)\s+(?:of|that|about)/i,
    /(?:concern|concerned|concerning)\s+(?:about|over|that)/i,
    /(?:risk|risks|risky)\s+(?:of|to|that)/i,
    /(?:fail|failed|failing|failure)\s+(?:to|of)/i,
    /(?:worse|worsen|worsening|deteriorat)/i,
    /(?:conflict|war|violence|attack)/i,
    /(?:shortage|scarcity|lack)\s+(?:of|in)/i
];

// Cache for deduplication
const processedUrls = new Set();
const seenTitles = new Map();

// Helper functions
function cleanText(text) {
    if (!text) return '';
    return text
        .replace(/<[^>]*>/g, '')
        .replace(/&[^;]+;/g, ' ')
        .replace(/\[\[.*?\]\]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
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

// Check if content is genuinely hopeful
function isHopefulContent(title, description) {
    const content = `${title} ${description}`.toLowerCase();
    
    // Check for negative patterns first
    let negativeCount = 0;
    for (const pattern of NEGATIVE_PATTERNS) {
        if (pattern.test(content)) {
            negativeCount++;
        }
    }
    
    // Too much negativity - skip
    if (negativeCount > 1) return { isHopeful: false, score: 0 };
    
    // Check for hope patterns
    let hopeScore = 0;
    let matchedCategories = [];
    
    for (const [category, config] of Object.entries(HOPE_PATTERNS)) {
        let categoryMatched = false;
        
        for (const pattern of config.patterns) {
            if (pattern.test(content)) {
                hopeScore += config.weight;
                categoryMatched = true;
                break;
            }
        }
        
        // Also check for required keywords
        if (!categoryMatched && config.required) {
            for (const keyword of config.required) {
                if (content.includes(keyword)) {
                    hopeScore += 1;
                    categoryMatched = true;
                    break;
                }
            }
        }
        
        if (categoryMatched) {
            matchedCategories.push(category);
        }
    }
    
    // Additional hope keywords
    const hopeKeywords = [
        'success', 'achieve', 'milestone', 'victory', 'overcome',
        'solution', 'solve', 'improve', 'better', 'progress',
        'record', 'highest', 'best', 'most', 'unprecedented'
    ];
    
    hopeKeywords.forEach(keyword => {
        if (content.includes(keyword)) hopeScore += 0.5;
    });
    
    // Boost for scale of impact
    if (content.match(/\b(million|billion)\s+(people|lives|children)/i)) {
        hopeScore += 2;
    }
    
    // Boost for concrete numbers
    if (content.match(/\d+[\s,]*\d*\s*%\s*(increase|decrease|improvement|reduction)/i)) {
        hopeScore += 1;
    }
    
    return {
        isHopeful: hopeScore >= 3,
        score: hopeScore,
        categories: matchedCategories
    };
}

// Check for duplicate content
function isDuplicate(title) {
    const normalizedTitle = title.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
    const words = normalizedTitle.split(/\s+/).slice(0, 10).join(' ');
    
    // Check exact duplicates
    if (seenTitles.has(words)) return true;
    
    // Check similar titles
    for (const [seenWords, seenTitle] of seenTitles.entries()) {
        const similarity = calculateSimilarity(words, seenWords);
        if (similarity > 0.8) return true;
    }
    
    seenTitles.set(words, title);
    
    // Keep cache size manageable
    if (seenTitles.size > 1000) {
        const entries = Array.from(seenTitles.entries());
        entries.slice(0, 200).forEach(([key]) => seenTitles.delete(key));
    }
    
    return false;
}

// Calculate similarity between two strings
function calculateSimilarity(str1, str2) {
    const words1 = new Set(str1.split(/\s+/));
    const words2 = new Set(str2.split(/\s+/));
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    return union.size > 0 ? intersection.size / union.size : 0;
}

// Fetch and filter RSS feed
async function fetchRSSFeed(source, field) {
    try {
        console.log(`  Fetching ${source.name}...`);
        const feed = await parser.parseURL(source.url);
        const hopefulEntries = [];
        
        const items = feed.items || [];
        for (let i = 0; i < Math.min(30, items.length); i++) {
            const item = items[i];
            
            // Skip if already processed
            if (processedUrls.has(item.link)) continue;
            
            const title = cleanText(item.title);
            const description = cleanText(item.contentSnippet || item.content || '');
            
            // Skip if duplicate
            if (isDuplicate(title)) continue;
            
            // Check if content is hopeful
            const hopeCheck = isHopefulContent(title, description);
            if (!hopeCheck.isHopeful) continue;
            
            // Create entry
            const entry = {
                title: title.substring(0, 200),
                description: description.substring(0, 500),
                link: item.link || item.guid || '#',
                source: source.name,
                field: field,
                date: formatDate(item.pubDate || item.published || item.updated || new Date()),
                hopeScore: hopeCheck.score,
                impactCategories: hopeCheck.categories
            };
            
            hopefulEntries.push(entry);
            processedUrls.add(item.link);
        }
        
        console.log(`    ✓ Found ${hopefulEntries.length} hopeful stories`);
        return hopefulEntries;
        
    } catch (error) {
        console.error(`    ✗ Error with ${source.name}: ${error.message}`);
        return [];
    }
}

// Main execution
async function main() {
    console.log('=== HumanityCheck Hope-Focused Fetcher ===');
    console.log('Finding stories that inspire hope and show real progress...\n');
    
    const startTime = Date.now();
    const stats = {
        totalSources: 0,
        successfulSources: 0,
        totalEntriesScanned: 0,
        hopefulEntriesFound: 0
    };
    
    let allEntries = [];
    
    // Process each field
    for (const [field, sources] of Object.entries(SOURCES)) {
        console.log(`\n🌟 Searching for hopeful ${field.toUpperCase()} stories...`);
        
        for (const source of sources) {
            stats.totalSources++;
            const entries = await fetchRSSFeed(source, field);
            
            if (entries.length > 0) {
                stats.successfulSources++;
                stats.hopefulEntriesFound += entries.length;
                allEntries = allEntries.concat(entries);
            }
            
            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, 300));
        }
    }
    
    // Sort by hope score and date
    allEntries.sort((a, b) => {
        if (Math.abs(b.hopeScore - a.hopeScore) > 1) {
            return b.hopeScore - a.hopeScore;
        }
        return new Date(b.date) - new Date(a.date);
    });
    
    // Take the most hopeful entries
    const maxEntries = 300;
    const finalEntries = allEntries.slice(0, maxEntries);
    
    // Calculate hope metrics
    const hopeMetrics = calculateHopeMetrics(finalEntries);
    
    // Remove internal fields from output
    const outputEntries = finalEntries.map(({ hopeScore, impactCategories, ...entry }) => entry);
    
    // Create output
    const output = {
        date: new Date().toISOString().split('T')[0],
        lastUpdated: new Date().toISOString(),
        message: "Every story here represents real progress and hope for humanity.",
        metadata: {
            totalSources: stats.totalSources,
            successfulSources: stats.successfulSources,
            hopefulEntriesFound: stats.hopefulEntriesFound,
            executionTime: `${((Date.now() - startTime) / 1000).toFixed(1)}s`,
            hopeMetrics
        },
        entries: outputEntries
    };
    
    // Write output
    console.log('\n💾 Saving hopeful progress stories...');
    await fs.writeFile('news.json', JSON.stringify(output, null, 2));
    
    // Summary
    console.log('\n✨ Hope Collection Complete!');
    console.log(`   ${stats.hopefulEntriesFound} hopeful stories found`);
    console.log(`   ${hopeMetrics.breakthroughs} breakthroughs`);
    console.log(`   ${hopeMetrics.livesSavedStories} life-saving advances`);
    console.log(`   ${hopeMetrics.millionsHelped} stories impacting millions`);
    console.log(`   Average hope score: ${hopeMetrics.averageHopeScore.toFixed(1)}`);
    
    // Show most hopeful stories
    if (finalEntries.length > 0) {
        console.log('\n🏆 Most hopeful stories:');
        finalEntries.slice(0, 5).forEach((entry, i) => {
            console.log(`${i + 1}. "${entry.title.substring(0, 70)}..."`);
            console.log(`   Hope score: ${entry.hopeScore.toFixed(1)} | Categories: ${entry.impactCategories.join(', ')}`);
        });
    }
    
    process.exit(0);
}

// Calculate metrics about hope
function calculateHopeMetrics(entries) {
    const metrics = {
        totalEntries: entries.length,
        breakthroughs: 0,
        livesSavedStories: 0,
        millionsHelped: 0,
        environmentalWins: 0,
        diseaseProgress: 0,
        educationAccess: 0,
        averageHopeScore: 0
    };
    
    let totalScore = 0;
    
    entries.forEach(entry => {
        totalScore += entry.hopeScore;
        
        // Count by impact category
        if (entry.impactCategories.includes('breakthroughs')) metrics.breakthroughs++;
        if (entry.impactCategories.includes('livesSaved')) metrics.livesSavedStories++;
        if (entry.impactCategories.includes('recovery')) metrics.environmentalWins++;
        if (entry.impactCategories.includes('eradication')) metrics.diseaseProgress++;
        if (entry.impactCategories.includes('access')) metrics.educationAccess++;
        
        // Check for scale
        const content = `${entry.title} ${entry.description}`;
        if (content.match(/million|billion/i)) metrics.millionsHelped++;
    });
    
    metrics.averageHopeScore = entries.length > 0 ? totalScore / entries.length : 0;
    
    // Field distribution
    const fieldCounts = {};
    entries.forEach(entry => {
        fieldCounts[entry.field] = (fieldCounts[entry.field] || 0) + 1;
    });
    metrics.fieldDistribution = fieldCounts;
    
    return metrics;
}

// Run
main().catch(error => {
    console.error('\n❌ Critical error:', error);
    console.error(error.stack);
    process.exit(1);
});