// cathedral-fetcher.js - Building a digital cathedral of human progress
const https = require('https');
const http = require('http');
const fs = require('fs').promises;
const Parser = require('rss-parser');

// Configure parser with extended timeout for comprehensive fetching
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

// Comprehensive source collection - casting a wide net for progress
const SOURCES = {
    // HEALTH & MEDICINE - The foundation of human wellbeing
    health: [
        // Global health organizations
        { url: 'https://www.who.int/feeds/entity/mediacentre/news/en/rss.xml', name: 'WHO', tier: 1 },
        { url: 'https://www.gatesfoundation.org/ideas/rss', name: 'Gates Foundation', tier: 1 },
        { url: 'https://www.gavi.org/programmes-impact/news/rss.xml', name: 'Gavi', tier: 1 },
        { url: 'https://www.theglobalfund.org/en/rss/news/', name: 'Global Fund', tier: 1 },
        { url: 'https://www.unaids.org/en/rss', name: 'UNAIDS', tier: 2 },
        { url: 'https://www.msfaccess.org/rss.xml', name: 'MSF Access', tier: 2 },
        { url: 'https://wellcome.org/news/feed', name: 'Wellcome Trust', tier: 1 },
        
        // Research institutions
        { url: 'https://www.nih.gov/news-events/news-releases/feed', name: 'NIH', tier: 1 },
        { url: 'https://www.cancer.gov/news-events/press-releases/rss', name: 'NCI', tier: 1 },
        { url: 'https://www.cdc.gov/media/releases/rss-FeaturedArticles.xml', name: 'CDC', tier: 2 },
        { url: 'https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/fda-newsroom/rss.xml', name: 'FDA', tier: 2 },
        { url: 'https://www.ema.europa.eu/en/rss.xml', name: 'EMA', tier: 2 },
        
        // Medical journals
        { url: 'https://www.nature.com/nm/rss/current', name: 'Nature Medicine', tier: 1 },
        { url: 'https://www.thelancet.com/rssfeed/lancet_current.xml', name: 'The Lancet', tier: 1 },
        { url: 'https://www.nejm.org/action/showFeed?type=etoc&feed=rss&jc=nejm', name: 'NEJM', tier: 1 },
        { url: 'https://jamanetwork.com/feeds/site_feeds/jama', name: 'JAMA', tier: 2 },
        { url: 'https://www.bmj.com/rss', name: 'BMJ', tier: 2 },
        { url: 'https://feeds.plos.org/plosone/PLoSONE', name: 'PLOS ONE', tier: 3 },
        
        // Specific health initiatives
        { url: 'https://polioeradication.org/feed/', name: 'Polio Eradication', tier: 2 },
        { url: 'https://www.path.org/rss/', name: 'PATH', tier: 2 },
        { url: 'https://www.jnj.com/news/rss', name: 'J&J Innovation', tier: 3 }
    ],
    
    // CLIMATE & ENVIRONMENT - Our planetary future
    climate: [
        // Climate science
        { url: 'https://climate.nasa.gov/news/rss.xml', name: 'NASA Climate', tier: 1 },
        { url: 'https://www.ipcc.ch/feed/', name: 'IPCC', tier: 1 },
        { url: 'https://www.noaa.gov/rss.xml', name: 'NOAA', tier: 1 },
        { url: 'https://www.realclimate.org/index.php/feed/', name: 'RealClimate', tier: 2 },
        
        // Environmental organizations
        { url: 'https://www.unep.org/rss/news', name: 'UNEP', tier: 1 },
        { url: 'https://www.worldwildlife.org/rss/news.xml', name: 'WWF', tier: 1 },
        { url: 'https://www.conservation.org/rss.xml', name: 'Conservation Intl', tier: 1 },
        { url: 'https://www.iucn.org/rss.xml', name: 'IUCN', tier: 1 },
        { url: 'https://www.wri.org/feeds/all/rss.xml', name: 'WRI', tier: 2 },
        { url: 'https://e360.yale.edu/feed', name: 'Yale E360', tier: 2 },
        { url: 'https://www.oceanconservancy.org/feed/', name: 'Ocean Conservancy', tier: 2 },
        
        // Climate solutions
        { url: 'https://www.carbonbrief.org/feed/', name: 'Carbon Brief', tier: 2 },
        { url: 'https://insideclimatenews.org/feed/', name: 'Inside Climate News', tier: 3 }
    ],
    
    // ENERGY & INFRASTRUCTURE - Powering progress
    energy: [
        // International energy agencies
        { url: 'https://www.iea.org/feeds/newsroom.xml', name: 'IEA', tier: 1 },
        { url: 'https://www.irena.org/RSS', name: 'IRENA', tier: 1 },
        { url: 'https://www.seforall.org/rss.xml', name: 'SEforALL', tier: 2 },
        
        // Research and innovation
        { url: 'https://www.nrel.gov/news/rss/news.xml', name: 'NREL', tier: 1 },
        { url: 'https://www.energy.gov/rss/articles.xml', name: 'US DOE', tier: 2 },
        { url: 'https://energy.mit.edu/feed/', name: 'MIT Energy', tier: 2 },
        
        // Renewable energy
        { url: 'https://www.solarpowereurope.org/feed/', name: 'SolarPower Europe', tier: 3 },
        { url: 'https://gwec.net/feed/', name: 'GWEC', tier: 3 },
        { url: 'https://www.renewableenergyworld.com/feed/', name: 'RE World', tier: 3 }
    ],
    
    // TECHNOLOGY & INNOVATION - Tools for human flourishing
    technology: [
        // Research institutions
        { url: 'https://news.mit.edu/rss/feed', name: 'MIT News', tier: 1 },
        { url: 'https://news.stanford.edu/feed/', name: 'Stanford News', tier: 1 },
        { url: 'https://www.caltech.edu/about/news/rss', name: 'Caltech', tier: 1 },
        { url: 'https://news.harvard.edu/gazette/feed/', name: 'Harvard Gazette', tier: 2 },
        { url: 'https://news.berkeley.edu/feed/', name: 'UC Berkeley', tier: 2 },
        
        // Science foundations
        { url: 'https://www.nsf.gov/news/news_summ.jsp?cntn_id=rss&org=NSF', name: 'NSF', tier: 1 },
        { url: 'https://www.darpa.mil/rss', name: 'DARPA', tier: 2 },
        
        // Scientific publications
        { url: 'https://www.sciencedaily.com/rss/top/technology.xml', name: 'ScienceDaily Tech', tier: 2 },
        { url: 'https://www.nature.com/nature/rss/current', name: 'Nature', tier: 1 },
        { url: 'https://www.science.org/rss/news_current.xml', name: 'Science', tier: 1 },
        { url: 'https://spectrum.ieee.org/rss', name: 'IEEE Spectrum', tier: 2 },
        { url: 'https://www.technologyreview.com/feed/', name: 'MIT Tech Review', tier: 2 },
        
        // AI for good
        { url: 'https://www.partnershiponai.org/feed/', name: 'Partnership on AI', tier: 2 },
        { url: 'https://blog.google/technology/ai/rss/', name: 'Google AI', tier: 3 },
        { url: 'https://openai.com/blog/rss/', name: 'OpenAI', tier: 3 }
    ],
    
    // HUMAN DEVELOPMENT - Lifting humanity
    development: [
        // UN and multilateral organizations
        { url: 'https://www.worldbank.org/en/news/rss.xml', name: 'World Bank', tier: 1 },
        { url: 'https://www.undp.org/rss', name: 'UNDP', tier: 1 },
        { url: 'https://www.wfp.org/rss', name: 'WFP', tier: 1 },
        { url: 'https://www.ifad.org/en/rss-feeds', name: 'IFAD', tier: 2 },
        { url: 'https://www.adb.org/rss/news', name: 'Asian Development Bank', tier: 2 },
        { url: 'https://www.afdb.org/en/rss-feeds', name: 'African Development Bank', tier: 2 },
        
        // Human rights and dignity
        { url: 'https://www.ohchr.org/en/feeds/news', name: 'UN Human Rights', tier: 1 },
        { url: 'https://www.unwomen.org/en/rss/news-and-events', name: 'UN Women', tier: 1 },
        { url: 'https://www.ilo.org/global/about-the-ilo/newsroom/rss/lang--en/index.htm', name: 'ILO', tier: 2 },
        { url: 'https://www.unhcr.org/rss.xml', name: 'UNHCR', tier: 2 },
        
        // Children and families
        { url: 'https://www.unicef.org/rss/press-releases.xml', name: 'UNICEF', tier: 1 },
        { url: 'https://www.savethechildren.org/us/about-us/media-and-news/feed', name: 'Save the Children', tier: 2 }
    ],
    
    // EDUCATION & KNOWLEDGE - Empowering minds
    education: [
        { url: 'https://en.unesco.org/news/feed', name: 'UNESCO', tier: 1 },
        { url: 'https://www.globalpartnership.org/rss.xml', name: 'GPE', tier: 1 },
        { url: 'https://www.worldbank.org/en/topic/education/rss.xml', name: 'World Bank Education', tier: 2 },
        { url: 'https://www.brookings.edu/topic/education/feed/', name: 'Brookings Education', tier: 2 },
        { url: 'https://www.educationcannotwait.org/feed/', name: 'Education Cannot Wait', tier: 2 },
        { url: 'https://www.roomtoread.org/feed/', name: 'Room to Read', tier: 3 }
    ],
    
    // PEACE & COOPERATION - Building bridges
    peace: [
        { url: 'https://news.un.org/en/rss-feeds/peace-and-security', name: 'UN Peace & Security', tier: 1 },
        { url: 'https://www.usip.org/rss.xml', name: 'US Institute of Peace', tier: 2 },
        { url: 'https://www.crisisgroup.org/feed', name: 'Crisis Group', tier: 2 },
        { url: 'https://www.nobelprize.org/rss/', name: 'Nobel Prize', tier: 2 }
    ],
    
    // FOOD & AGRICULTURE - Feeding the world
    agriculture: [
        { url: 'https://www.fao.org/news/rss/news/en/', name: 'FAO', tier: 1 },
        { url: 'https://www.cgiar.org/feed/', name: 'CGIAR', tier: 1 },
        { url: 'https://www.ifpri.org/rss.xml', name: 'IFPRI', tier: 2 },
        { url: 'https://www.worldfoodinnovation.com/feed/', name: 'Food Innovation', tier: 3 }
    ],
    
    // SPACE & EXPLORATION - Expanding horizons
    space: [
        { url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss', name: 'NASA', tier: 1 },
        { url: 'https://www.esa.int/rssfeed/Our_Activities', name: 'ESA', tier: 1 },
        { url: 'https://spaceflightnow.com/feed/', name: 'Spaceflight Now', tier: 3 }
    ]
};

// Measurable progress indicators - expanded for comprehensive coverage
const PROGRESS_INDICATORS = {
    // Quantitative achievements
    metrics: {
        percentage: /(\d+\.?\d*)\s*%\s*(increase|decrease|reduction|improvement|growth|decline|drop|rise|boost|jump)/i,
        numbers: /(\d+[\s,]*\d*)\s*(million|billion|thousand)?\s*(people|children|patients|families|students|workers)/i,
        scale: /(\d+[\s,]*\d*)\s*(countries|nations|cities|communities|schools|hospitals|clinics)/i,
        time: /(first|fastest|quickest|record)\s+(time|ever|in history|to date)/i
    },
    
    // Action achievements
    actions: {
        completed: /complet(?:ed|ion)|finish(?:ed|ing)|achiev(?:ed|ing)|reach(?:ed|ing)|attain(?:ed|ing)/i,
        launched: /launch(?:ed|ing)|roll(?:ed|ing)\s*out|deploy(?:ed|ing)|implement(?:ed|ing)|start(?:ed|ing)/i,
        approved: /approv(?:ed|al)|authoriz(?:ed|ation)|certif(?:ied|ication)|clear(?:ed|ance)/i,
        delivered: /deliver(?:ed|ing)|distribut(?:ed|ing)|provid(?:ed|ing)|supply(?:ing|ied)/i,
        built: /built|construct(?:ed|ing)|establish(?:ed|ing)|creat(?:ed|ing)|develop(?:ed|ing)/i,
        connected: /connect(?:ed|ing)|link(?:ed|ing)|unit(?:ed|ing)|join(?:ed|ing)/i
    },
    
    // Impact indicators
    impact: {
        saved: /sav(?:ed|ing)\s+(?:lives|people|children)|prevent(?:ed|ing)\s+deaths/i,
        cured: /cur(?:ed|ing)|heal(?:ed|ing)|treat(?:ed|ing)\s+successfully|recover(?:ed|y)/i,
        lifted: /lift(?:ed|ing)\s+(?:out of|from)\s+poverty|escap(?:ed|ing)\s+poverty/i,
        empowered: /empower(?:ed|ing)|enabl(?:ed|ing)|equip(?:ped|ping)/i,
        protected: /protect(?:ed|ing)|conserv(?:ed|ing)|preserv(?:ed|ing)|safeguard(?:ed|ing)/i
    },
    
    // Innovation markers
    innovation: {
        breakthrough: /breakthrough|groundbreaking|revolutionary|game.?changing|paradigm.?shift/i,
        first: /world's?\s+first|first\s+(?:ever|time)|historic\s+first|unprecedented/i,
        record: /record\s+(?:high|low|number|level)|(?:highest|lowest|best|fastest)\s+ever/i,
        discovery: /discover(?:y|ed)|invent(?:ed|ion)|innovat(?:ed|ion)/i
    }
};

// Avoid patterns - refined for better accuracy
const AVOID_PATTERNS = {
    futureOnly: /^(?:will|would|could|may|might|plan(?:s|ned)?|aim(?:s|ed)?|hope(?:s|d)?|expect(?:s|ed)?)\s/i,
    negative: /concern(?:s|ed)?|warn(?:s|ed)?|threat(?:s|en)?|risk(?:s)?|fear(?:s)?|worry|worri(?:es|ed)/i,
    tooConditional: /(?:could|might|may)\s+(?:be|have|help|lead)/i
};

// Cache management
const processedUrls = new Set();
const titleCache = new Map();
const contentHashes = new Set();

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

// Simple hash for content deduplication
function simpleHash(text) {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(36);
}

// Check if content represents measurable progress
function evaluateProgress(title, description) {
    const content = `${title} ${description}`;
    
    // Quick negative checks
    if (AVOID_PATTERNS.negative.test(content)) {
        return { qualifies: false, reason: 'negative_focus' };
    }
    
    // Check if it's only about future plans
    const firstWords = content.substring(0, 50);
    if (AVOID_PATTERNS.futureOnly.test(firstWords) && !content.match(/already|now|has|have/i)) {
        return { qualifies: false, reason: 'future_only' };
    }
    
    // Count conditional language
    const conditionals = (content.match(AVOID_PATTERNS.tooConditional) || []).length;
    if (conditionals > 2) {
        return { qualifies: false, reason: 'too_conditional' };
    }
    
    // Score progress indicators
    let score = 0;
    const matches = [];
    
    // Check all indicator categories
    for (const [category, patterns] of Object.entries(PROGRESS_INDICATORS)) {
        for (const [type, pattern] of Object.entries(patterns)) {
            if (pattern.test(content)) {
                score += 2;
                matches.push(`${category}:${type}`);
            }
        }
    }
    
    // Bonus for concrete data
    if (/\d+\.?\d*\s*%/.test(content)) score += 1;
    if (/\d+[\s,]*\d*\s*(million|billion)/.test(content)) score += 1;
    if (/\$\d+[\s,]*\d*\s*(million|billion)/.test(content)) score += 1;
    
    return {
        qualifies: score >= 3,
        score: score,
        matches: matches,
        hasData: /\d/.test(content)
    };
}

// Deduplicate content
function isDuplicate(title, description) {
    // Create content hash
    const contentKey = `${title} ${description}`.toLowerCase().replace(/[^a-z0-9]/g, '');
    const hash = simpleHash(contentKey.substring(0, 200));
    
    if (contentHashes.has(hash)) return true;
    contentHashes.add(hash);
    
    // Check title similarity
    const titleWords = title.toLowerCase().split(/\s+/).slice(0, 7).join(' ');
    if (titleCache.has(titleWords)) return true;
    
    // Check against existing titles
    for (const [cachedWords] of titleCache.entries()) {
        const overlap = titleWords.split(' ').filter(w => cachedWords.includes(w)).length;
        if (overlap >= 5) return true;
    }
    
    titleCache.set(titleWords, true);
    
    // Manage cache size
    if (titleCache.size > 1000) {
        const entries = Array.from(titleCache.entries());
        entries.slice(0, 200).forEach(([key]) => titleCache.delete(key));
    }
    
    return false;
}

// Fetch RSS feed with tiered processing
async function fetchRSSFeed(source, field) {
    try {
        console.log(`  📡 ${source.name} (Tier ${source.tier})...`);
        const feed = await parser.parseURL(source.url);
        const entries = [];
        
        const items = feed.items || [];
        // Tier 1: check more items, Tier 3: check fewer
        const maxItems = source.tier === 1 ? 40 : source.tier === 2 ? 25 : 15;
        
        let scanned = 0;
        let qualified = 0;
        
        for (let i = 0; i < Math.min(maxItems, items.length); i++) {
            const item = items[i];
            scanned++;
            
            if (processedUrls.has(item.link)) continue;
            
            const title = cleanText(item.title);
            const description = cleanText(item.contentSnippet || item.content || item.summary || '');
            
            // Skip short content
            if (title.length < 20 || description.length < 50) continue;
            
            // Check for duplicates
            if (isDuplicate(title, description)) continue;
            
            // Evaluate progress
            const evaluation = evaluateProgress(title, description);
            if (!evaluation.qualifies) continue;
            
            qualified++;
            
            entries.push({
                title: title.substring(0, 250),
                description: description.substring(0, 600),
                link: item.link || item.guid || '#',
                source: source.name,
                field: field,
                date: formatDate(item.pubDate || item.published || item.updated || item['dc:date'] || new Date()),
                _score: evaluation.score,
                _matches: evaluation.matches,
                _tier: source.tier
            });
            
            processedUrls.add(item.link);
        }
        
        console.log(`     ✓ ${qualified}/${scanned} qualified`);
        return entries;
        
    } catch (error) {
        console.error(`     ✗ Error: ${error.message.substring(0, 50)}...`);
        return [];
    }
}

// Main execution
async function main() {
    console.log('╔═══════════════════════════════════════════════════════════════╗');
    console.log('║          HumanityCheck - Cathedral of Progress                ║');
    console.log('║     Building a comprehensive collection of human progress      ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');
    
    const startTime = Date.now();
    const stats = {
        totalSources: 0,
        successfulSources: 0,
        totalQualified: 0,
        byField: {},
        byTier: { 1: 0, 2: 0, 3: 0 }
    };
    
    let allEntries = [];
    
    // Process all fields
    for (const [field, sources] of Object.entries(SOURCES)) {
        console.log(`\n📂 ${field.toUpperCase()} - ${sources.length} sources`);
        console.log('─'.repeat(50));
        
        stats.byField[field] = 0;
        
        // Process sources by tier
        const tier1 = sources.filter(s => s.tier === 1);
        const tier2 = sources.filter(s => s.tier === 2);
        const tier3 = sources.filter(s => s.tier === 3);
        
        // Fetch tier 1 sources first (most important)
        for (const source of tier1) {
            stats.totalSources++;
            const entries = await fetchRSSFeed(source, field);
            if (entries.length > 0) {
                stats.successfulSources++;
                stats.byField[field] += entries.length;
                stats.byTier[1] += entries.length;
                allEntries = allEntries.concat(entries);
            }
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        // Then tier 2
        for (const source of tier2) {
            stats.totalSources++;
            const entries = await fetchRSSFeed(source, field);
            if (entries.length > 0) {
                stats.successfulSources++;
                stats.byField[field] += entries.length;
                stats.byTier[2] += entries.length;
                allEntries = allEntries.concat(entries);
            }
            await new Promise(resolve => setTimeout(resolve, 250));
        }
        
        // Finally tier 3
        for (const source of tier3) {
            stats.totalSources++;
            const entries = await fetchRSSFeed(source, field);
            if (entries.length > 0) {
                stats.successfulSources++;
                stats.byField[field] += entries.length;
                stats.byTier[3] += entries.length;
                allEntries = allEntries.concat(entries);
            }
            await new Promise(resolve => setTimeout(resolve, 300));
        }
    }
    
    console.log('\n📊 Organizing the cathedral...');
    
    // Sort by score, tier, and recency
    allEntries.sort((a, b) => {
        // Prioritize tier 1 sources
        if (a._tier !== b._tier) return a._tier - b._tier;
        
        // Then by score
        if (Math.abs(b._score - a._score) > 1) return b._score - a._score;
        
        // Then by date
        return new Date(b.date) - new Date(a.date);
    });
    
    // Take a generous amount of entries for the cathedral
    const maxEntries = 1000; // Much more content
    const finalEntries = allEntries.slice(0, maxEntries);
    stats.totalQualified = finalEntries.length;
    
    // Calculate comprehensive metrics
    const metrics = {
        total: finalEntries.length,
        byField: {},
        byType: {},
        withData: finalEntries.filter(e => e._matches.some(m => m.includes('metrics'))).length,
        breakthroughs: finalEntries.filter(e => e._matches.some(m => m.includes('breakthrough'))).length,
        completed: finalEntries.filter(e => e._matches.some(m => m.includes('completed'))).length,
        highImpact: finalEntries.filter(e => e._score >= 6).length
    };
    
    // Count by field
    finalEntries.forEach(entry => {
        metrics.byField[entry.field] = (metrics.byField[entry.field] || 0) + 1;
    });
    
    // Count by match type
    finalEntries.forEach(entry => {
        entry._matches.forEach(match => {
            const [category] = match.split(':');
            metrics.byType[category] = (metrics.byType[category] || 0) + 1;
        });
    });
    
    // Clean entries for output
    const outputEntries = finalEntries.map(({ _score, _matches, _tier, ...entry }) => entry);
    
    // Create output
    const output = {
        date: new Date().toISOString().split('T')[0],
        lastUpdated: new Date().toISOString(),
        cathedral: {
            pillars: Object.keys(SOURCES).length,
            sources: stats.totalSources,
            stories: outputEntries.length,
            message: "A comprehensive collection of humanity's measurable progress"
        },
        metadata: {
            executionTime: `${((Date.now() - startTime) / 1000).toFixed(1)}s`,
            sourcesQueried: stats.totalSources,
            sourcesSuccessful: stats.successfulSources,
            entriesByField: metrics.byField,
            entriesByType: metrics.byType,
            qualityMetrics: {
                withQuantitativeData: metrics.withData,
                breakthroughsReported: metrics.breakthroughs,
                completedProjects: metrics.completed,
                highImpactStories: metrics.highImpact
            }
        },
        entries: outputEntries
    };
    
    // Write output
    console.log('\n💾 Saving the cathedral of progress...');
    await fs.writeFile('news.json', JSON.stringify(output, null, 2));
    
    // Summary
    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║                    ✨ Cathedral Complete ✨                    ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝');
    console.log(`\n📊 Final Statistics:`);
    console.log(`   Sources queried: ${stats.totalSources}`);
    console.log(`   Successful sources: ${stats.successfulSources}`);
    console.log(`   Total stories collected: ${stats.totalQualified}`);
    console.log(`   Execution time: ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
    
    console.log(`\n🏛️  Content by Pillar:`);
    Object.entries(metrics.byField).forEach(([field, count]) => {
        const percentage = ((count / metrics.total) * 100).toFixed(1);
        console.log(`   ${field.padEnd(15)} ${count.toString().padStart(4)} stories (${percentage}%)`);
    });
    
    console.log(`\n⭐ Quality Metrics:`);
    console.log(`   High-impact stories: ${metrics.highImpact}`);
    console.log(`   With quantitative data: ${metrics.withData}`);
    console.log(`   Breakthroughs reported: ${metrics.breakthroughs}`);
    console.log(`   Projects completed: ${metrics.completed}`);
    
    process.exit(0);
}

// Run
main().catch(error => {
    console.error('\n❌ Critical error:', error);
    console.error(error.stack);
    process.exit(1);
});