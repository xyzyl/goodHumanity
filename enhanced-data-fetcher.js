// integrity-focused-fetcher.js - Captures real, measurable human progress with integrity
const https = require('https');
const http = require('http');
const fs = require('fs').promises;
const Parser = require('rss-parser');

// Configure parser
const parser = new Parser({
    headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; HumanityCheck/4.0; +https://humanitycheck.org)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*'
    },
    timeout: 20000,
    customFields: {
        item: ['pubDate', 'published', 'updated']
    }
});

// Sources focused on organizations that report measurable progress
const SOURCES = {
    health: [
        { url: 'https://www.who.int/feeds/entity/mediacentre/news/en/rss.xml', name: 'WHO' },
        { url: 'https://www.gatesfoundation.org/ideas/rss', name: 'Gates Foundation' },
        { url: 'https://www.nih.gov/news-events/news-releases/feed', name: 'NIH' },
        { url: 'https://www.cancer.gov/news-events/press-releases/rss', name: 'NCI' },
        { url: 'https://www.gavi.org/programmes-impact/news/rss.xml', name: 'Gavi' },
        { url: 'https://www.theglobalfund.org/en/rss/news/', name: 'Global Fund' },
        { url: 'https://www.nature.com/nm/rss/current', name: 'Nature Medicine' },
        { url: 'https://www.thelancet.com/rssfeed/lancet_current.xml', name: 'The Lancet' }
    ],
    
    climate: [
        { url: 'https://climate.nasa.gov/news/rss.xml', name: 'NASA Climate' },
        { url: 'https://www.ipcc.ch/feed/', name: 'IPCC' },
        { url: 'https://www.unep.org/rss/news', name: 'UNEP' },
        { url: 'https://www.iea.org/feeds/newsroom.xml', name: 'IEA' },
        { url: 'https://www.irena.org/RSS', name: 'IRENA' }
    ],
    
    technology: [
        { url: 'https://news.mit.edu/rss/feed', name: 'MIT News' },
        { url: 'https://www.nsf.gov/news/news_summ.jsp?cntn_id=rss&org=NSF', name: 'NSF' },
        { url: 'https://www.sciencedaily.com/rss/top/technology.xml', name: 'ScienceDaily Tech' },
        { url: 'https://www.nature.com/nature/rss/current', name: 'Nature' }
    ],
    
    development: [
        { url: 'https://www.worldbank.org/en/news/rss.xml', name: 'World Bank' },
        { url: 'https://www.undp.org/rss', name: 'UNDP' },
        { url: 'https://en.unesco.org/news/feed', name: 'UNESCO' },
        { url: 'https://www.unicef.org/rss/press-releases.xml', name: 'UNICEF' },
        { url: 'https://www.wfp.org/rss', name: 'WFP' }
    ]
};

// Measurable progress indicators - what constitutes real progress
const MEASURABLE_INDICATORS = {
    // Quantitative improvements
    percentageImprovement: /(\d+\.?\d*)\s*%\s*(increase|decrease|reduction|improvement|growth|decline|drop|rise)/i,
    numbersSaved: /(\d+[\s,]*\d*)\s*(million|thousand|hundred)?\s*(lives|people|children|patients)\s*(saved|treated|vaccinated|helped)/i,
    milestonesReached: /(\d+[\s,]*\d*)\s*(million|billion|thousand)?\s*(now have|gained|received)\s*access/i,
    
    // Achievement markers
    recordsSet: /record\s+(high|low|number|level)|highest\s+ever|lowest\s+ever/i,
    firstTime: /first\s+time|first\s+ever|world's?\s+first/i,
    approval: /approved|approval\s+for|authorized|green[\s-]?light/i,
    launched: /launch(?:ed|ing)?\s+(?:new|major|global)|roll(?:ed|ing)?\s+out/i,
    
    // Completion indicators
    completed: /complet(?:ed|ion)|finish(?:ed|ing)|achiev(?:ed|ing)|reach(?:ed|ing)\s+goal/i,
    operational: /now\s+operational|begin(?:s|ning)?\s+operation|start(?:ed|ing)\s+delivery/i
};

// What we want to avoid - not forward-looking
const AVOID_PATTERNS = {
    // Future promises without current progress
    futureOnly: /will\s+(?:be|have|create|develop)|plans?\s+to|aims?\s+to|hopes?\s+to|expected\s+to/i,
    
    // Concerns and warnings
    negative: /concern(?:s|ed|ing)?|warn(?:s|ed|ing)?|threat(?:s|en)?|risk(?:s|y)?|fear(?:s|ed)?/i,
    
    // Studies without outcomes
    justResearch: /study\s+(?:finds|shows|suggests)|research(?:ers)?\s+(?:find|found|discover)/i,
    
    // Conditional language
    conditional: /could\s+(?:be|have|help)|may\s+(?:be|have|help)|might\s+(?:be|have|help)/i
};

// Cache for deduplication
const processedUrls = new Set();
const recentTitles = new Map();

// Helper functions
function cleanText(text) {
    if (!text) return '';
    return text
        .replace(/<[^>]*>/g, '')
        .replace(/&[^;]+;/g, ' ')
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

// Check if content represents real, measurable progress
function isMeasurableProgress(title, description) {
    const content = `${title} ${description}`;
    
    // First, check if it's about future promises only
    const futureMatches = content.match(AVOID_PATTERNS.futureOnly);
    const presentMatches = content.match(/(?:has|have|is|are|now|today|currently)/i);
    
    // If it's only future-focused without present progress, skip
    if (futureMatches && !presentMatches) {
        return { isProgress: false, reason: 'future_only' };
    }
    
    // Check for negative patterns
    if (AVOID_PATTERNS.negative.test(content)) {
        return { isProgress: false, reason: 'negative_focus' };
    }
    
    // Check for just research without outcomes
    if (AVOID_PATTERNS.justResearch.test(content) && !content.match(/breakthrough|treatment|cure|vaccine/i)) {
        return { isProgress: false, reason: 'research_only' };
    }
    
    // Too much conditional language
    const conditionalCount = (content.match(AVOID_PATTERNS.conditional) || []).length;
    if (conditionalCount > 2) {
        return { isProgress: false, reason: 'too_conditional' };
    }
    
    // Now check for measurable progress indicators
    let progressScore = 0;
    let progressTypes = [];
    
    // Check quantitative improvements
    if (MEASURABLE_INDICATORS.percentageImprovement.test(content)) {
        progressScore += 3;
        progressTypes.push('quantitative');
    }
    
    if (MEASURABLE_INDICATORS.numbersSaved.test(content)) {
        progressScore += 3;
        progressTypes.push('lives_impacted');
    }
    
    if (MEASURABLE_INDICATORS.milestonesReached.test(content)) {
        progressScore += 3;
        progressTypes.push('milestone');
    }
    
    // Check achievement markers
    if (MEASURABLE_INDICATORS.recordsSet.test(content)) {
        progressScore += 2;
        progressTypes.push('record');
    }
    
    if (MEASURABLE_INDICATORS.firstTime.test(content)) {
        progressScore += 2;
        progressTypes.push('first');
    }
    
    if (MEASURABLE_INDICATORS.approval.test(content)) {
        progressScore += 2;
        progressTypes.push('approval');
    }
    
    if (MEASURABLE_INDICATORS.launched.test(content)) {
        progressScore += 2;
        progressTypes.push('launched');
    }
    
    // Check completion indicators
    if (MEASURABLE_INDICATORS.completed.test(content)) {
        progressScore += 2;
        progressTypes.push('completed');
    }
    
    if (MEASURABLE_INDICATORS.operational.test(content)) {
        progressScore += 2;
        progressTypes.push('operational');
    }
    
    // Additional checks for concrete evidence
    const hasNumbers = /\d+/.test(content);
    const hasPercentage = /\d+\.?\d*\s*%/.test(content);
    const hasScale = /(million|billion|thousand)/.test(content);
    
    if (hasNumbers) progressScore += 1;
    if (hasPercentage) progressScore += 1;
    if (hasScale) progressScore += 1;
    
    return {
        isProgress: progressScore >= 3,
        score: progressScore,
        types: progressTypes,
        hasData: hasNumbers || hasPercentage
    };
}

// Check for duplicate content
function isDuplicate(title) {
    const words = title.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).slice(0, 8).join(' ');
    
    if (recentTitles.has(words)) return true;
    
    // Check similarity with recent titles
    for (const [recentWords] of recentTitles.entries()) {
        const commonWords = words.split(' ').filter(w => recentWords.includes(w)).length;
        const similarity = commonWords / Math.max(words.split(' ').length, recentWords.split(' ').length);
        if (similarity > 0.7) return true;
    }
    
    recentTitles.set(words, true);
    
    // Keep cache manageable
    if (recentTitles.size > 500) {
        const entries = Array.from(recentTitles.entries());
        entries.slice(0, 100).forEach(([key]) => recentTitles.delete(key));
    }
    
    return false;
}

// Fetch and filter RSS feed for real progress
async function fetchRSSFeed(source, field) {
    try {
        console.log(`  Fetching ${source.name}...`);
        const feed = await parser.parseURL(source.url);
        const progressEntries = [];
        
        const items = feed.items || [];
        let scanned = 0;
        let qualified = 0;
        
        for (let i = 0; i < Math.min(30, items.length); i++) {
            const item = items[i];
            scanned++;
            
            // Skip if already processed
            if (processedUrls.has(item.link)) continue;
            
            const title = cleanText(item.title);
            const description = cleanText(item.contentSnippet || item.content || '');
            
            // Skip if duplicate
            if (isDuplicate(title)) continue;
            
            // Check if it represents measurable progress
            const progressCheck = isMeasurableProgress(title, description);
            if (!progressCheck.isProgress) continue;
            
            qualified++;
            
            // Create entry
            const entry = {
                title: title.substring(0, 200),
                description: description.substring(0, 500),
                link: item.link || item.guid || '#',
                source: source.name,
                field: field,
                date: formatDate(item.pubDate || item.published || item.updated || new Date())
            };
            
            progressEntries.push({
                ...entry,
                _internal: {
                    score: progressCheck.score,
                    types: progressCheck.types,
                    hasData: progressCheck.hasData
                }
            });
            
            processedUrls.add(item.link);
        }
        
        console.log(`    ✓ Found ${qualified}/${scanned} stories with measurable progress`);
        return progressEntries;
        
    } catch (error) {
        console.error(`    ✗ Error with ${source.name}: ${error.message}`);
        return [];
    }
}

// Main execution
async function main() {
    console.log('=== HumanityCheck Integrity-Focused Fetcher ===');
    console.log('Finding real breakthroughs and measurable improvements...\n');
    
    const startTime = Date.now();
    const stats = {
        totalSources: 0,
        successfulSources: 0,
        totalScanned: 0,
        measurableProgress: 0
    };
    
    let allEntries = [];
    
    // Process each field
    for (const [field, sources] of Object.entries(SOURCES)) {
        console.log(`\n📊 Checking ${field.toUpperCase()} progress...`);
        
        for (const source of sources) {
            stats.totalSources++;
            const entries = await fetchRSSFeed(source, field);
            
            if (entries.length > 0) {
                stats.successfulSources++;
                stats.measurableProgress += entries.length;
                allEntries = allEntries.concat(entries);
            }
            
            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, 300));
        }
    }
    
    // Sort by score and recency
    allEntries.sort((a, b) => {
        // Prioritize entries with data
        if (a._internal.hasData !== b._internal.hasData) {
            return b._internal.hasData ? 1 : -1;
        }
        
        // Then by score
        if (Math.abs(b._internal.score - a._internal.score) > 1) {
            return b._internal.score - a._internal.score;
        }
        
        // Then by date
        return new Date(b.date) - new Date(a.date);
    });
    
    // Take top entries
    const maxEntries = 300;
    const finalEntries = allEntries.slice(0, maxEntries);
    
    // Calculate metrics
    const metrics = {
        totalEntries: finalEntries.length,
        withQuantitativeData: finalEntries.filter(e => e._internal.types.includes('quantitative')).length,
        livesImpacted: finalEntries.filter(e => e._internal.types.includes('lives_impacted')).length,
        milestonesReached: finalEntries.filter(e => e._internal.types.includes('milestone')).length,
        firstTimeAchievements: finalEntries.filter(e => e._internal.types.includes('first')).length,
        newTreatments: finalEntries.filter(e => e._internal.types.includes('approval')).length,
        completedProjects: finalEntries.filter(e => e._internal.types.includes('completed')).length
    };
    
    // Remove internal fields from output
    const outputEntries = finalEntries.map(({ _internal, ...entry }) => entry);
    
    // Create output
    const output = {
        date: new Date().toISOString().split('T')[0],
        lastUpdated: new Date().toISOString(),
        metadata: {
            totalSources: stats.totalSources,
            successfulSources: stats.successfulSources,
            measurableProgressFound: stats.measurableProgress,
            executionTime: `${((Date.now() - startTime) / 1000).toFixed(1)}s`,
            progressMetrics: metrics
        },
        entries: outputEntries
    };
    
    // Write output
    console.log('\n💾 Saving verified progress...');
    await fs.writeFile('news.json', JSON.stringify(output, null, 2));
    
    // Summary
    console.log('\n✅ Collection Complete');
    console.log(`   ${metrics.totalEntries} stories with measurable progress`);
    console.log(`   ${metrics.withQuantitativeData} with quantitative data`);
    console.log(`   ${metrics.livesImpacted} showing lives impacted`);
    console.log(`   ${metrics.firstTimeAchievements} first-time achievements`);
    console.log(`   ${metrics.newTreatments} new treatments/approvals`);
    
    // Show examples
    if (finalEntries.length > 0) {
        console.log('\n📈 Sample measurable progress:');
        finalEntries.slice(0, 5).forEach((entry, i) => {
            console.log(`${i + 1}. "${entry.title.substring(0, 70)}..."`);
            console.log(`   Progress types: ${entry._internal.types.join(', ')}`);
        });
    }
    
    process.exit(0);
}

// Run
main().catch(error => {
    console.error('\n❌ Critical error:', error);
    console.error(error.stack);
    process.exit(1);
});