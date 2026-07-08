// enhanced-data-fetcher-v2.js - Improved categorization and data integrity
const https = require('https');
const http = require('http');
const fs = require('fs').promises;
const Parser = require('rss-parser');
const crypto = require('crypto');

// Configure parser
const parser = new Parser({
    headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; HumanityCheck/5.0; +https://humanitycheck.org)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*'
    },
    timeout: 30000,
    customFields: {
        item: ['pubDate', 'published', 'updated', 'dc:date']
    }
});

// Enhanced categorization rules with weighted keywords
const CATEGORY_RULES = {
    health: {
        priority: 1,
        keywords: {
            strong: ['vaccine', 'treatment', 'cure', 'therapy', 'disease', 'patient', 'clinical', 'medical', 'cancer', 'virus', 'pandemic', 'epidemic', 'diagnosis', 'medicine', 'pharmaceutical', 'drug', 'FDA', 'WHO', 'health'],
            medium: ['hospital', 'doctor', 'nurse', 'healthcare', 'mortality', 'morbidity', 'symptom', 'prevention', 'wellness'],
            weak: ['study', 'research', 'trial', 'test']
        },
        sources: ['WHO', 'NIH', 'CDC', 'FDA', 'Gates Foundation', 'NEJM', 'Lancet', 'JAMA', 'BMJ', 'Nature Medicine', 'MSF', 'GAVI', 'Global Fund', 'UN News Health', 'Polio Eradication']
    },
    climate: {
        priority: 2,
        keywords: {
            strong: ['climate', 'carbon', 'emission', 'greenhouse', 'warming', 'temperature', 'weather', 'renewable', 'sustainable', 'environment', 'conservation', 'biodiversity', 'ocean', 'forest', 'deforestation'],
            medium: ['pollution', 'clean', 'green', 'eco', 'nature', 'wildlife', 'ecosystem', 'habitat'],
            weak: ['impact', 'change', 'future']
        },
        sources: ['NASA Climate', 'IPCC', 'UNEP', 'NOAA', 'WWF', 'Conservation International', 'IUCN', 'Carbon Brief', 'Yale E360', 'UN News Climate']
    },
    energy: {
        priority: 3,
        keywords: {
            strong: ['solar', 'wind', 'renewable', 'energy', 'power', 'electricity', 'battery', 'grid', 'nuclear', 'hydrogen', 'fossil', 'coal', 'oil', 'gas'],
            medium: ['megawatt', 'kilowatt', 'capacity', 'generation', 'storage', 'efficiency', 'transition'],
            weak: ['clean', 'green', 'sustainable']
        },
        sources: ['IEA', 'IRENA', 'NREL', 'US DOE', 'SEforALL', 'SolarPower Europe', 'GWEC']
    },
    technology: {
        priority: 4,
        keywords: {
            strong: ['AI', 'artificial intelligence', 'quantum', 'computing', 'algorithm', 'software', 'hardware', 'robot', 'automation', 'digital', 'cyber', 'internet', 'data', 'machine learning', 'neural'],
            medium: ['innovation', 'breakthrough', 'discovery', 'invention', 'research', 'development', 'engineering'],
            weak: ['system', 'solution', 'platform', 'tool']
        },
        sources: ['MIT', 'Stanford', 'Caltech', 'Harvard', 'Berkeley', 'Nature', 'Science', 'IEEE', 'DARPA', 'NSF']
    },
    education: {
        priority: 5,
        keywords: {
            strong: ['education', 'school', 'student', 'learning', 'literacy', 'teacher', 'university', 'college', 'curriculum', 'diploma', 'degree', 'scholarship'],
            medium: ['classroom', 'lesson', 'teaching', 'academic', 'knowledge', 'skill'],
            weak: ['study', 'program', 'training']
        },
        sources: ['UNESCO', 'UNICEF', 'GPE', 'World Bank Education', 'Brookings Education', 'UN News Education']
    },
    development: {
        priority: 6,
        keywords: {
            strong: ['poverty', 'economic', 'development', 'infrastructure', 'investment', 'growth', 'GDP', 'income', 'employment', 'job', 'microfinance', 'entrepreneur'],
            medium: ['finance', 'fund', 'loan', 'grant', 'aid', 'assistance', 'support'],
            weak: ['project', 'program', 'initiative']
        },
        sources: ['World Bank', 'UNDP', 'ADB', 'African Development Bank', 'IFC', 'IFAD', 'UN News Development', 'UN News SDGs', 'Our World in Data']
    },
    peace: {
        priority: 7,
        keywords: {
            strong: ['peace', 'war', 'conflict', 'treaty', 'agreement', 'ceasefire', 'reconciliation', 'diplomacy', 'negotiation', 'resolution'],
            medium: ['cooperation', 'dialogue', 'unity', 'harmony', 'mediation'],
            weak: ['discussion', 'meeting', 'summit']
        },
        sources: ['UN Peace & Security', 'USIP', 'US Institute of Peace', 'Crisis Group', 'Nobel Prize']
    },
    agriculture: {
        priority: 8,
        keywords: {
            strong: ['agriculture', 'farming', 'food', 'crop', 'harvest', 'nutrition', 'farmer', 'irrigation', 'fertilizer', 'seed', 'livestock', 'hunger'],
            medium: ['rural', 'yield', 'production', 'cultivation', 'plantation'],
            weak: ['land', 'soil', 'water']
        },
        sources: ['FAO', 'CGIAR', 'IFPRI', 'WFP']
    },
    space: {
        priority: 9,
        keywords: {
            strong: ['space', 'satellite', 'rocket', 'mission', 'astronaut', 'planet', 'orbit', 'launch', 'NASA', 'ESA', 'spacecraft', 'telescope', 'mars', 'moon'],
            medium: ['astronomy', 'cosmic', 'stellar', 'galaxy', 'universe'],
            weak: ['exploration', 'discovery', 'research']
        },
        sources: ['NASA', 'ESA', 'SpaceX', 'Spaceflight Now']
    }
};

// ═══════════════════════════════════════════════════════════════
// CONTENT INTEGRITY FILTERS — the heart of the evolved methodology
// ═══════════════════════════════════════════════════════════════

// Content-type patterns that should NEVER pass through the pipeline.
// These are structurally not "progress" regardless of source quality.
const CONTENT_TYPE_EXCLUSIONS = [
    /\[obituary\]/i,
    /\[clinical rounds\]/i,
    /\[correspondence\]/i,
    /\[seminar\]/i,
    /\[perspectives\]/i,
    /\[comment\]/i,
    /\[editorial\]/i,
    /\[world report\]/i,
    /\[review\]/i,
    /\[viewpoint\]/i,
    /job\s+(posting|opening|vacancy|identification)/i,
    /\[closed\]/i,
    /apply\s+before/i,
    /deadline:\s*to\s+apply/i,
    /case\s+\d+-\d+:/i,
    /how\s+to\s+tell\s+the\s+difference/i,
    /check\s+against\s+delivery/i,
    /opening\s+remarks\s+by/i,
    /born\s+on\s+.*died\s+/i,
    /rss\s*feed/i,
];

// Negative framing indicators — content describing problems, not solutions.
// An entry with negative signals AND no hope signals is rejected.
// Word-boundary patterns: a bare substring like 'war' would wrongly match
// "warming", "award", "software"; stems keep a trailing wildcard on purpose.
const NEGATIVE_PATTERNS = [
    /\bthreat/i, /\brisk/i, /\bdanger/i, /\bcrisis\b/i, /\bcrises\b/i,
    /\bdisaster/i, /\bcollapse/i, /\bfail(s|ed|ing|ure)?\b/i, /\bworse/i,
    /\bdeclin/i, /\bconflict/i, /\bwars?\b/i, /\bwarfare\b/i, /\battack/i,
    /\bplight\b/i, /\bperil/i, /\bdamag/i, /\bdestroy/i, /\bdevastat/i,
    /\bdeath toll\b/i, /\bcasualt/i, /\bairstrike/i, /\bbombing/i,
    /\bcomplacency\b/i, /\berosion\b/i, /\beroded\b/i,
    /\bwarn(s|ed|ing)?\b/i, /\burgent (need|action)\b/i,
    /\bstill lack/i, /\bliving without\b/i,
    /\boutbreak/i, /\b(cases|deaths|infections) (top|surge|soar|climb|rise)/i
];

// Hope/progress indicators — at least one must be present to pass filtering
const HOPE_INDICATORS = [
    'breakthrough', 'cure', 'success', 'achieve', 'progress',
    'improve', 'advance', 'solution', 'overcome', 'milestone',
    'eradicat', 'eliminat', 'vaccine', 'treatment', 'protect',
    'restore', 'recover', 'innovation', 'discover', 'record',
    'launch', 'deploy', 'expand', 'increase', 'save',
    'renewable', 'clean energy', 'access', 'literacy',
    'cooperation', 'peace', 'agreement', 'partnership',
    'ceasefire', 'treaty', 'truce', 'accord', 'reconciliation'
];

// Progress indicators with scoring
const PROGRESS_INDICATORS = {
    breakthrough: {
        patterns: [
            /breakthrough|groundbreaking|revolutionary|game.?changing|paradigm.?shift|transform/i,
            /world.?first|first.?ever|historic.?first|unprecedented|never.?before/i,
            /major.?advance|significant.?progress|landmark|milestone/i
        ],
        score: 5
    },
    quantitative: {
        patterns: [
            /(\d+\.?\d*)\s*%\s*(increase|decrease|reduction|improvement|growth)/i,
            /(\d+[\s,]*\d*)\s*(million|billion)\s*(people|patients|students)/i,
            /save[ds]?\s+(\d+[\s,]*\d*)\s*lives/i,
            /\$(\d+[\s,]*\d*)\s*(million|billion)/i
        ],
        score: 4
    },
    achievement: {
        patterns: [
            /achiev|accomplish|complet|succeed|reach|attain|realiz/i,
            /launch|deploy|implement|establish|introduc/i,
            /approv|authoriz|certif|clear/i
        ],
        score: 3
    },
    positive_impact: {
        patterns: [
            /improve|enhance|boost|strengthen|expand|increase/i,
            /reduce|decrease|cut|lower|minimize/i,
            /protect|preserve|conserve|safeguard/i
        ],
        score: 2
    }
};

// Enhanced source configuration
// Feed list verified 2026-07-08: every URL below returned HTTP 200.
// Removed feeds that are gone (404) or hard bot-blocked (403: NIH, UNDP,
// UNEP, IEA, IRENA, WWF, JAMA, BMJ, Stanford, AfDB, CGIAR — these block
// non-browser clients and will also fail from CI runners).
const SOURCES = {
    health: [
        { url: 'https://www.who.int/rss-feeds/news-english.xml', name: 'WHO', tier: 1, credibility: 10 },
        { url: 'https://news.un.org/feed/subscribe/en/news/topic/health/feed/rss.xml', name: 'UN News Health', tier: 1, credibility: 9 },
        { url: 'https://www.nature.com/nm/rss/current', name: 'Nature Medicine', tier: 1, credibility: 10 },
        { url: 'https://www.thelancet.com/rssfeed/lancet_current.xml', name: 'The Lancet', tier: 1, credibility: 10 },
        { url: 'https://www.nejm.org/action/showFeed?type=etoc&feed=rss&jc=nejm', name: 'NEJM', tier: 1, credibility: 10 },
        { url: 'https://polioeradication.org/feed/', name: 'Polio Eradication', tier: 2, credibility: 8 }
    ],
    climate: [
        { url: 'https://climate.nasa.gov/news/rss.xml', name: 'NASA Climate', tier: 1, credibility: 10 },
        { url: 'https://www.ipcc.ch/feed/', name: 'IPCC', tier: 1, credibility: 10 },
        { url: 'https://news.un.org/feed/subscribe/en/news/topic/climate-change/feed/rss.xml', name: 'UN News Climate', tier: 1, credibility: 9 },
        { url: 'https://www.noaa.gov/rss.xml', name: 'NOAA', tier: 1, credibility: 10 },
        { url: 'https://www.iucn.org/rss.xml', name: 'IUCN', tier: 1, credibility: 8 },
        { url: 'https://e360.yale.edu/feed.xml', name: 'Yale E360', tier: 2, credibility: 7 },
        { url: 'https://www.carbonbrief.org/feed/', name: 'Carbon Brief', tier: 2, credibility: 7 }
    ],
    energy: [
        { url: 'https://www.seforall.org/rss.xml', name: 'SEforALL', tier: 2, credibility: 7 },
        { url: 'https://energy.mit.edu/feed/', name: 'MIT Energy', tier: 2, credibility: 8 }
    ],
    technology: [
        { url: 'https://news.mit.edu/rss/feed', name: 'MIT News', tier: 1, credibility: 9 },
        { url: 'https://www.caltech.edu/about/news/rss', name: 'Caltech', tier: 1, credibility: 9 },
        { url: 'https://news.harvard.edu/gazette/feed/', name: 'Harvard Gazette', tier: 2, credibility: 8 },
        { url: 'https://news.berkeley.edu/feed/', name: 'UC Berkeley', tier: 2, credibility: 8 },
        { url: 'https://www.nsf.gov/news/news_summ.jsp?cntn_id=rss&org=NSF', name: 'NSF', tier: 1, credibility: 9 },
        { url: 'https://www.nature.com/nature/rss/current', name: 'Nature', tier: 1, credibility: 10 },
        { url: 'https://www.science.org/rss/news_current.xml', name: 'Science', tier: 1, credibility: 10 },
        { url: 'https://spectrum.ieee.org/rss', name: 'IEEE Spectrum', tier: 2, credibility: 8 },
        { url: 'https://www.sciencedaily.com/rss/top/technology.xml', name: 'ScienceDaily Tech', tier: 2, credibility: 7 },
        { url: 'https://www.technologyreview.com/feed/', name: 'MIT Tech Review', tier: 2, credibility: 8 }
    ],
    education: [
        { url: 'https://en.unesco.org/news/feed', name: 'UNESCO', tier: 1, credibility: 9 },
        { url: 'https://news.un.org/feed/subscribe/en/news/topic/culture-and-education/feed/rss.xml', name: 'UN News Education', tier: 1, credibility: 9 },
        { url: 'https://www.globalpartnership.org/rss.xml', name: 'GPE', tier: 1, credibility: 8 },
        { url: 'https://www.worldbank.org/en/topic/education/rss.xml', name: 'World Bank Education', tier: 2, credibility: 8 },
        { url: 'https://www.brookings.edu/topic/education/feed/', name: 'Brookings Education', tier: 2, credibility: 7 }
    ],
    development: [
        { url: 'https://www.worldbank.org/en/news/rss.xml', name: 'World Bank', tier: 1, credibility: 9 },
        { url: 'https://news.un.org/feed/subscribe/en/news/topic/economic-development/feed/rss.xml', name: 'UN News Development', tier: 1, credibility: 9 },
        { url: 'https://news.un.org/feed/subscribe/en/news/topic/sdgs/feed/rss.xml', name: 'UN News SDGs', tier: 1, credibility: 9 },
        { url: 'https://ourworldindata.org/atom.xml', name: 'Our World in Data', tier: 1, credibility: 9 },
        { url: 'https://www.adb.org/rss/news', name: 'Asian Development Bank', tier: 2, credibility: 8 }
    ],
    peace: [
        { url: 'https://news.un.org/feed/subscribe/en/news/topic/peace-and-security/feed/rss.xml', name: 'UN Peace & Security', tier: 1, credibility: 9 },
        { url: 'https://www.usip.org/publications/rss', name: 'US Institute of Peace', tier: 2, credibility: 7 },
        { url: 'https://www.nobelprize.org/rss/', name: 'Nobel Prize', tier: 2, credibility: 9 }
    ],
    agriculture: [
        { url: 'https://www.fao.org/feeds/fao-newsroom-rss', name: 'FAO', tier: 1, credibility: 9 }
    ],
    space: [
        { url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss', name: 'NASA', tier: 1, credibility: 10 },
        { url: 'https://www.esa.int/rssfeed/Our_Activities', name: 'ESA', tier: 1, credibility: 9 },
        { url: 'https://spaceflightnow.com/feed/', name: 'Spaceflight Now', tier: 3, credibility: 7 }
    ]
};

// Cache and deduplication
const processedUrls = new Set();
const contentHashes = new Map();
const categoryCache = new Map();

// Helper functions
function cleanText(text) {
    if (!text) return '';
    return text
        .replace(/<[^>]*>/g, '')
        .replace(/&[^;]+;/g, ' ')
        .replace(/\r?\n/g, ' ')
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

// Create content hash for deduplication
function createContentHash(text) {
    return crypto.createHash('sha256').update(text).digest('hex').substring(0, 16);
}

// Enhanced categorization with multiple signals
function categorizeEntry(entry, sourceField) {
    const content = `${entry.title} ${entry.description}`.toLowerCase();
    const source = entry.source.toLowerCase();
    
    // Check cache first
    const cacheKey = createContentHash(content.substring(0, 200));
    if (categoryCache.has(cacheKey)) {
        return categoryCache.get(cacheKey);
    }
    
    const scores = {};
    
    // Analyze each category
    for (const [category, rules] of Object.entries(CATEGORY_RULES)) {
        let score = 0;
        
        // Check source match (highest weight)
        if (rules.sources.some(s => source.includes(s.toLowerCase()))) {
            score += 10;
        }
        
        // Check keywords
        rules.keywords.strong.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'i');
            if (regex.test(content)) score += 3;
            if (regex.test(entry.title)) score += 2; // Bonus for title match
        });
        
        rules.keywords.medium.forEach(keyword => {
            if (content.includes(keyword)) score += 2;
        });
        
        rules.keywords.weak.forEach(keyword => {
            if (content.includes(keyword)) score += 1;
        });
        
        // Consider the source field as a signal
        if (sourceField === category) score += 5;
        
        scores[category] = score;
    }
    
    // Find best match
    let bestCategory = sourceField || 'technology';
    let highestScore = 0;
    
    for (const [category, score] of Object.entries(scores)) {
        if (score > highestScore) {
            highestScore = score;
            bestCategory = category;
        }
    }
    
    // Cache the result
    categoryCache.set(cacheKey, bestCategory);
    
    // Clean cache if too large
    if (categoryCache.size > 5000) {
        const entries = Array.from(categoryCache.entries());
        entries.slice(0, 1000).forEach(([key]) => categoryCache.delete(key));
    }
    
    return bestCategory;
}

// Check if content is structurally excluded (obituaries, job postings, etc.)
function isExcludedContentType(title, description) {
    const content = `${title} ${description}`;
    return CONTENT_TYPE_EXCLUSIONS.some(pattern => pattern.test(content));
}

// Check negative/hope balance — reject entries with negative framing and no hope signal
function passesContentFilter(title, description) {
    const content = `${title} ${description}`;
    const contentLower = content.toLowerCase();
    const titleLower = title.toLowerCase();

    // The headline carries the framing: a negative headline is a problem story
    // even if the body mentions solutions (e.g. "Cancer cases could double by
    // 2050 ... urged to strengthen treatment"). Only a strong hope word in the
    // headline itself rescues it — weak ones like 'access' or 'record' appear
    // in doom headlines too ("record number of cases").
    const STRONG_TITLE_HOPE = [
        'breakthrough', 'cure', 'success', 'achieve', 'progress', 'improve',
        'advance', 'solution', 'overcome', 'milestone', 'eradicat', 'eliminat',
        'restore', 'recover', 'innovation', 'discover', 'save', 'protect',
        'vaccine', 'treatment', 'peace', 'agreement', 'ceasefire', 'treaty'
    ];
    const titleNegative = NEGATIVE_PATTERNS.some(pattern => pattern.test(title));
    const titleHope = STRONG_TITLE_HOPE.some(word => titleLower.includes(word));
    if (titleNegative && !titleHope) return false;

    const hasNegativeSignal = NEGATIVE_PATTERNS.some(pattern => pattern.test(content));
    const hasHopeSignal = HOPE_INDICATORS.some(word => contentLower.includes(word));

    // If negative and no hope: reject
    if (hasNegativeSignal && !hasHopeSignal) return false;

    // If no negative: pass (hope signal not strictly required at this stage,
    // the scoring threshold will handle neutral content)
    return true;
}

// Score entry for progress/impact
function scoreEntry(entry) {
    const content = `${entry.title} ${entry.description}`;
    let totalScore = 0;
    const matches = [];
    
    for (const [type, indicator] of Object.entries(PROGRESS_INDICATORS)) {
        for (const pattern of indicator.patterns) {
            if (pattern.test(content)) {
                totalScore += indicator.score;
                matches.push(type);
                break; // Only count each indicator type once
            }
        }
    }
    
    // Bonus for source credibility (reduced weight — credibility alone shouldn't qualify)
    const sourceData = Object.values(SOURCES).flat().find(s => s.name === entry.source);
    if (sourceData) {
        totalScore += sourceData.credibility * 0.3;
    }
    
    // Temporal freshness decay — strongly prefer recent content
    const daysSincePublished = (new Date() - new Date(entry.date)) / (1000 * 60 * 60 * 24);
    if (daysSincePublished <= 1) totalScore += 3;
    else if (daysSincePublished <= 3) totalScore += 2;
    else if (daysSincePublished <= 7) totalScore += 1;
    else if (daysSincePublished > 30) totalScore -= 2; // Penalize stale content
    
    return {
        score: totalScore,
        matches: matches,
        // EVOLVED: Require both a minimum score AND at least one progress indicator match
        qualifies: totalScore >= 6 && matches.length >= 1
    };
}

// Check for duplicate content
function isDuplicate(title, description, link) {
    // Check URL first
    if (processedUrls.has(link)) return true;
    
    // Create content hash
    const contentKey = `${title} ${description}`.toLowerCase().replace(/[^a-z0-9]/g, '');
    const hash = createContentHash(contentKey);
    
    if (contentHashes.has(hash)) return true;
    
    // Check for similar titles
    const titleWords = title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    for (const [existingHash, existingTitle] of contentHashes.entries()) {
        const existingWords = existingTitle.split(/\s+/);
        const commonWords = titleWords.filter(w => existingWords.includes(w));
        if (commonWords.length >= Math.min(titleWords.length, existingWords.length) * 0.7) {
            return true;
        }
    }
    
    // Not a duplicate
    processedUrls.add(link);
    contentHashes.set(hash, title.toLowerCase());
    
    // Manage cache size
    if (contentHashes.size > 2000) {
        const entries = Array.from(contentHashes.entries());
        entries.slice(0, 500).forEach(([key]) => contentHashes.delete(key));
    }
    
    return false;
}

// Parse a feed URL, retrying once — UN News and journal feeds intermittently
// rate-limit parallel requests, and a single retry recovers most of them
async function parseFeedWithRetry(url) {
    try {
        return await parser.parseURL(url);
    } catch (firstError) {
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));
        return parser.parseURL(url);
    }
}

// Fetch RSS feed with enhanced processing
async function fetchRSSFeed(source, field) {
    try {
        console.log(`  📡 ${source.name} (Tier ${source.tier}, Credibility ${source.credibility})...`);
        const feed = await parseFeedWithRetry(source.url);
        const entries = [];
        
        const items = feed.items || [];
        const maxItems = source.tier === 1 ? 30 : source.tier === 2 ? 20 : 10;
        
        let scanned = 0;
        let qualified = 0;
        let excluded = { type: 0, filter: 0, score: 0, short: 0, dup: 0 };
        
        for (let i = 0; i < Math.min(maxItems, items.length); i++) {
            const item = items[i];
            scanned++;
            
            const link = item.link || item.guid || '#';
            const title = cleanText(item.title);
            const description = cleanText(item.contentSnippet || item.content || item.summary || '');
            
            // Skip short content
            if (title.length < 20 || description.length < 50) { excluded.short++; continue; }
            
            // EVOLVED: Content-type exclusion (obituaries, job postings, case reports, etc.)
            if (isExcludedContentType(title, description)) { excluded.type++; continue; }
            
            // EVOLVED: Negative/hope content filter
            if (!passesContentFilter(title, description)) { excluded.filter++; continue; }
            
            // Check for duplicates
            if (isDuplicate(title, description, link)) { excluded.dup++; continue; }
            
            // Score the entry (with raised threshold and progress-match requirement)
            const scoring = scoreEntry({ title, description, source: source.name, date: item.pubDate });
            if (!scoring.qualifies) { excluded.score++; continue; }
            
            // Categorize with high integrity
            const category = categorizeEntry({ title, description, source: source.name }, field);
            
            qualified++;
            
            entries.push({
                title: title.substring(0, 250),
                description: description.substring(0, 600),
                link: link,
                source: source.name,
                field: category,
                date: formatDate(item.pubDate || item.published || item.updated || item['dc:date'] || new Date()),
                _score: scoring.score,
                _matches: scoring.matches,
                _tier: source.tier,
                _credibility: source.credibility
            });
        }
        
        const excludeDetails = Object.entries(excluded).filter(([,v]) => v > 0).map(([k,v]) => `${k}:${v}`).join(', ');
        console.log(`     ✓ ${qualified}/${scanned} qualified (${field} → ${entries.filter(e => e.field === field).length} in-category) [filtered: ${excludeDetails}]`);
        return entries;
        
    } catch (error) {
        console.error(`     ✗ Error: ${error.message.substring(0, 50)}...`);
        return null; // null = fetch failed; [] = fetched fine but nothing new qualified
    }
}

// Save state for persistence
async function saveState() {
    const state = {
        processedUrls: Array.from(processedUrls).slice(-1000),
        contentHashes: Array.from(contentHashes.entries()).slice(-500),
        timestamp: new Date().toISOString()
    };
    
    try {
        await fs.writeFile('cache.json', JSON.stringify(state, null, 2));
    } catch (error) {
        console.error('Failed to save state:', error.message);
    }
}

// Load previous state
async function loadState() {
    try {
        const data = await fs.readFile('cache.json', 'utf8');
        const state = JSON.parse(data);
        
        // Only load recent URLs (last 24 hours)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        if (new Date(state.timestamp) > oneDayAgo) {
            state.processedUrls.forEach(url => processedUrls.add(url));
            state.contentHashes.forEach(([hash, title]) => contentHashes.set(hash, title));
            console.log(`📁 Loaded state: ${processedUrls.size} URLs, ${contentHashes.size} content hashes`);
        }
    } catch (error) {
        console.log('📁 No previous state found, starting fresh');
    }
}

// Main execution
async function main() {
    console.log('╔═══════════════════════════════════════════════════════════════╗');
    console.log('║       HumanityCheck Enhanced Data Fetcher v3.0                ║');
    console.log('║       Evolved methodology — stricter curation pipeline         ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');
    
    const startTime = Date.now();
    
    // Load previous state
    await loadState();
    
    const stats = {
        totalSources: 0,
        successfulSources: 0,
        totalQualified: 0,
        byField: {},
        categoryIntegrity: {}
    };
    
    let allEntries = [];
    
    // Process all fields
    for (const [field, sources] of Object.entries(SOURCES)) {
        console.log(`\n📂 ${field.toUpperCase()} - ${sources.length} sources`);
        console.log('─'.repeat(50));
        
        stats.byField[field] = 0;
        stats.categoryIntegrity[field] = { kept: 0, changed: 0 };
        
        // Process sources by tier
        const sortedSources = sources.sort((a, b) => {
            if (a.tier !== b.tier) return a.tier - b.tier;
            return b.credibility - a.credibility;
        });
        
        // Fetch all sources for this category in parallel
        const fetchPromises = sortedSources.map(async (source) => {
            stats.totalSources++;
            const entries = await fetchRSSFeed(source, field);
            return { source, entries };
        });
        
        const results = await Promise.all(fetchPromises);
        
        // Process results (entries === null means the fetch itself failed)
        for (const { source, entries } of results) {
            if (entries !== null) {
                stats.successfulSources++;

                // Track category integrity
                entries.forEach(entry => {
                    if (entry.field === field) {
                        stats.categoryIntegrity[field].kept++;
                    } else {
                        stats.categoryIntegrity[field].changed++;
                    }
                    stats.byField[entry.field] = (stats.byField[entry.field] || 0) + 1;
                });

                allEntries = allEntries.concat(entries);
            }
        }
    }
    
    console.log('\n📊 Processing and ranking entries...');
    
    // Merge new entries with previous entries to prevent data wipe
    try {
        const data = await fs.readFile('news.json', 'utf8');
        const parsed = JSON.parse(data);
        if (parsed && parsed.entries) {
            const oldEntries = parsed.entries.map(entry => {
                // Re-score old entries to sort them properly
                const scoring = scoreEntry({ title: entry.title, description: entry.description, source: entry.source, date: entry.date });
                const sourceData = Object.values(SOURCES).flat().find(s => s.name === entry.source);
                return {
                    ...entry,
                    _score: scoring.score,
                    _matches: scoring.matches,
                    _tier: sourceData ? sourceData.tier : 3,
                    _credibility: sourceData ? sourceData.credibility : 5
                };
            });
            // Keep old entries that pass the content filters and are recent enough.
            // Deliberately NOT re-applying the score threshold here: aging lowers
            // scores (freshness decay) while the dedup cache blocks the same story
            // from re-qualifying, so a score re-check slowly drains the dataset.
            // Age is the retirement criterion; scores still drive sorting.
            const MAX_AGE_DAYS = 45;
            const newLinks = new Set(allEntries.map(e => e.link));
            const validOldEntries = oldEntries.filter(e => {
                const ageDays = (Date.now() - new Date(e.date).getTime()) / (1000 * 60 * 60 * 24);
                return ageDays <= MAX_AGE_DAYS &&
                    !isExcludedContentType(e.title, e.description) &&
                    passesContentFilter(e.title, e.description) &&
                    !newLinks.has(e.link);
            });
            
            allEntries = allEntries.concat(validOldEntries);
            console.log(`📁 Loaded and re-verified ${validOldEntries.length} previous entries from news.json`);
        }
    } catch (e) {
        console.log('📁 No previous news.json found or failed to load');
    }
    
    // Sort by score, credibility, and recency
    allEntries.sort((a, b) => {
        // Primary: score
        if (Math.abs(b._score - a._score) > 2) return b._score - a._score;
        
        // Secondary: source credibility
        if (a._credibility !== b._credibility) return b._credibility - a._credibility;
        
        // Tertiary: tier
        if (a._tier !== b._tier) return a._tier - b._tier;
        
        // Quaternary: date
        return new Date(b.date) - new Date(a.date);
    });
    
    // EVOLVED: Tighter category balance with more aggressive caps
    const maxEntries = 400;
    const finalEntries = [];
    const numCategories = Object.keys(CATEGORY_RULES).length;
    const perCategoryTarget = Math.floor(maxEntries / numCategories);
    const perCategoryCap = Math.ceil(perCategoryTarget * 1.5); // No category gets more than 1.5x its fair share
    const fieldQuotas = {};
    
    // Set balanced quotas per field
    Object.keys(CATEGORY_RULES).forEach(field => {
        fieldQuotas[field] = Math.max(15, perCategoryTarget);
    });
    
    // Fill quotas first — each category gets its fair share
    for (const field of Object.keys(fieldQuotas)) {
        const fieldEntries = allEntries.filter(e => e.field === field);
        finalEntries.push(...fieldEntries.slice(0, fieldQuotas[field]));
    }
    
    // Fill remaining slots with best entries, but respect category caps
    const remaining = allEntries.filter(e => !finalEntries.includes(e));
    for (const entry of remaining) {
        if (finalEntries.length >= maxEntries) break;
        const currentFieldCount = finalEntries.filter(e => e.field === entry.field).length;
        if (currentFieldCount < perCategoryCap) {
            finalEntries.push(entry);
        }
    }
    
    stats.totalQualified = finalEntries.length;
    
    // Calculate metrics
    const metrics = {
        total: finalEntries.length,
        byField: {},
        byType: {},
        highScore: finalEntries.filter(e => e._score >= 10).length,
        topTier: finalEntries.filter(e => e._tier === 1).length,
        highCredibility: finalEntries.filter(e => e._credibility >= 8).length
    };
    
    // Count by field
    finalEntries.forEach(entry => {
        metrics.byField[entry.field] = (metrics.byField[entry.field] || 0) + 1;
    });
    
    // Clean entries for output
    const outputEntries = finalEntries.map(({ _score, _matches, _tier, _credibility, ...entry }) => entry);
    
    // Create output
    const output = {
        date: new Date().toISOString().split('T')[0],
        lastUpdated: new Date().toISOString(),
        metadata: {
            version: '3.0',
            executionTime: `${((Date.now() - startTime) / 1000).toFixed(1)}s`,
            sourcesQueried: stats.totalSources,
            sourcesSuccessful: stats.successfulSources,
            totalCandidates: allEntries.length,
            totalSelected: outputEntries.length,
            entriesByField: metrics.byField,
            categoryIntegrity: stats.categoryIntegrity,
            qualityMetrics: {
                highScoreEntries: metrics.highScore,
                topTierSources: metrics.topTier,
                highCredibilitySources: metrics.highCredibility
            }
        },
        entries: outputEntries
    };
    
    // Write output
    console.log('\n💾 Saving curated data...');
    await fs.writeFile('news.json', JSON.stringify(output, null, 2));
    
    // Save state
    await saveState();
    
    // Summary
    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║                    ✨ Curation Complete ✨                     ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝');
    console.log(`\n📊 Final Statistics:`);
    console.log(`   Sources queried: ${stats.totalSources}`);
    console.log(`   Successful sources: ${stats.successfulSources}`);
    console.log(`   Total candidates evaluated: ${allEntries.length}`);
    console.log(`   Final stories selected: ${stats.totalQualified}`);
    console.log(`   Execution time: ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
    
    console.log(`\n📂 Content Distribution:`);
    Object.entries(metrics.byField).forEach(([field, count]) => {
        const percentage = ((count / metrics.total) * 100).toFixed(1);
        console.log(`   ${field.padEnd(15)} ${count.toString().padStart(4)} stories (${percentage}%)`);
    });
    
    console.log(`\n🎯 Category Integrity:`);
    Object.entries(stats.categoryIntegrity).forEach(([field, integrity]) => {
        const total = integrity.kept + integrity.changed;
        if (total > 0) {
            const percentage = ((integrity.kept / total) * 100).toFixed(1);
            console.log(`   ${field.padEnd(15)} ${percentage}% stayed in original category`);
        }
    });
    
    console.log(`\n⭐ Quality Metrics:`);
    console.log(`   High-score entries: ${metrics.highScore} (score ≥ 10)`);
    console.log(`   Top-tier sources: ${metrics.topTier}`);
    console.log(`   High-credibility sources: ${metrics.highCredibility}`);
    
    process.exit(0);
}

// Run
main().catch(error => {
    console.error('\n❌ Critical error:', error);
    console.error(error.stack);
    process.exit(1);
});