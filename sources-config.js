// sources-config.js - Centralized source configuration
module.exports = {
    // RSS feed sources organized by field
    rssSources: {
        health: [
            // WHO and major health organizations
            { url: 'https://www.who.int/feeds/entity/mediacentre/news/en/rss.xml', name: 'WHO', priority: 'high' },
            { url: 'https://www.cdc.gov/media/feeds/rss.xml', name: 'CDC', priority: 'high' },
            { url: 'https://www.nih.gov/news-events/news-releases/feed', name: 'NIH', priority: 'high' },
            { url: 'https://www.ema.europa.eu/en/rss.xml', name: 'EMA', priority: 'medium' },
            { url: 'https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/fda-newsroom/rss.xml', name: 'FDA', priority: 'medium' },
            
            // Major medical journals
            { url: 'https://www.nejm.org/action/showFeed?type=etoc&feed=rss&jc=nejm', name: 'NEJM', priority: 'high' },
            { url: 'https://www.thelancet.com/rssfeed/lancet_current.xml', name: 'The Lancet', priority: 'high' },
            { url: 'https://jamanetwork.com/feeds/site_feeds/jama', name: 'JAMA', priority: 'high' },
            { url: 'https://www.bmj.com/rss', name: 'BMJ', priority: 'medium' },
            { url: 'https://www.nature.com/nm/rss/current', name: 'Nature Medicine', priority: 'high' },
            { url: 'https://feeds.plos.org/plosone/PLoSONE', name: 'PLOS ONE', priority: 'medium' },
            
            // Disease-specific organizations
            { url: 'https://www.cancer.gov/rss/news.xml', name: 'NCI', priority: 'medium' },
            { url: 'https://www.heart.org/en/rss/rss-news', name: 'AHA', priority: 'medium' },
            { url: 'https://www.alz.org/rss/rss.asp', name: 'Alzheimer\'s Association', priority: 'medium' },
            
            // Global health initiatives
            { url: 'https://www.gatesfoundation.org/ideas/rss', name: 'Gates Foundation', priority: 'high' },
            { url: 'https://wellcome.org/news/feed', name: 'Wellcome Trust', priority: 'high' },
            { url: 'https://www.gavi.org/programmes-impact/news/rss.xml', name: 'Gavi', priority: 'medium' }
        ],
        
        technology: [
            // Research institutions
            { url: 'https://news.mit.edu/rss/feed', name: 'MIT News', priority: 'high' },
            { url: 'https://www.sciencedaily.com/rss/top/technology.xml', name: 'ScienceDaily Tech', priority: 'high' },
            { url: 'https://www.nsf.gov/news/news_summ.jsp?cntn_id=rss&org=NSF', name: 'NSF', priority: 'high' },
            { url: 'https://news.stanford.edu/feed/', name: 'Stanford News', priority: 'high' },
            { url: 'https://www.caltech.edu/about/news/rss', name: 'Caltech', priority: 'high' },
            
            // Scientific journals
            { url: 'https://feeds.nature.com/nature/rss/current', name: 'Nature', priority: 'high' },
            { url: 'https://www.science.org/action/showFeed?type=etoc&feed=rss&jc=science', name: 'Science', priority: 'high' },
            { url: 'https://feeds.sciencemag.org/rss/current.xml', name: 'Science Magazine', priority: 'high' },
            { url: 'https://www.pnas.org/action/showFeed?type=etoc&feed=rss&jc=pnas', name: 'PNAS', priority: 'high' },
            
            // Tech publications
            { url: 'https://www.technologyreview.com/feed/', name: 'MIT Tech Review', priority: 'medium' },
            { url: 'https://spectrum.ieee.org/rss', name: 'IEEE Spectrum', priority: 'medium' },
            { url: 'https://cacm.acm.org/rss', name: 'ACM CACM', priority: 'medium' },
            { url: 'https://arstechnica.com/feed/', name: 'Ars Technica', priority: 'low' },
            
            // AI/ML specific
            { url: 'https://blog.google/technology/ai/rss/', name: 'Google AI Blog', priority: 'high' },
            { url: 'https://openai.com/blog/rss/', name: 'OpenAI Blog', priority: 'high' },
            { url: 'https://www.deepmind.com/blog/rss.xml', name: 'DeepMind', priority: 'high' }
        ],
        
        climate: [
            // Major climate organizations
            { url: 'https://climate.nasa.gov/news/rss.xml', name: 'NASA Climate', priority: 'high' },
            { url: 'https://www.ipcc.ch/feed/', name: 'IPCC', priority: 'high' },
            { url: 'https://www.unep.org/rss/news', name: 'UNEP', priority: 'high' },
            { url: 'https://www.noaa.gov/rss.xml', name: 'NOAA', priority: 'high' },
            { url: 'https://unfccc.int/process-and-meetings/feed', name: 'UNFCCC', priority: 'high' },
            
            // Climate research
            { url: 'https://www.realclimate.org/index.php/feed/', name: 'RealClimate', priority: 'medium' },
            { url: 'https://www.carbonbrief.org/feed/', name: 'Carbon Brief', priority: 'medium' },
            { url: 'https://insideclimatenews.org/feed/', name: 'Inside Climate News', priority: 'medium' },
            { url: 'https://e360.yale.edu/feed', name: 'Yale E360', priority: 'medium' },
            
            // Environmental organizations
            { url: 'https://www.wri.org/feeds/all/rss.xml', name: 'WRI', priority: 'medium' },
            { url: 'https://www.conservation.org/rss.xml', name: 'Conservation International', priority: 'medium' }
        ],
        
        energy: [
            // International energy agencies
            { url: 'https://www.iea.org/feeds/newsroom.xml', name: 'IEA', priority: 'high' },
            { url: 'https://www.irena.org/RSS', name: 'IRENA', priority: 'high' },
            { url: 'https://www.energy.gov/rss/articles.xml', name: 'US DOE', priority: 'medium' },
            
            // Renewable energy
            { url: 'https://www.nrel.gov/news/news.rss', name: 'NREL', priority: 'high' },
            { url: 'https://www.renewableenergyworld.com/feed/', name: 'RE World', priority: 'medium' },
            { url: 'https://www.solarpowereurope.org/feed/', name: 'SolarPower Europe', priority: 'medium' },
            { url: 'https://gwec.net/feed/', name: 'GWEC', priority: 'medium' },
            
            // Clean tech
            { url: 'https://cleantechnica.com/feed/', name: 'CleanTechnica', priority: 'low' },
            { url: 'https://www.greentechmedia.com/feeds/all', name: 'Greentech Media', priority: 'medium' }
        ],
        
        education: [
            // UN and international organizations
            { url: 'https://en.unesco.org/news/feed', name: 'UNESCO', priority: 'high' },
            { url: 'https://www.worldbank.org/en/topic/education/rss.xml', name: 'World Bank Education', priority: 'high' },
            { url: 'https://www.unicef.org/rss/news.xml', name: 'UNICEF', priority: 'high' },
            { url: 'https://www.globalpartnership.org/rss.xml', name: 'GPE', priority: 'medium' },
            
            // Education research
            { url: 'https://www.brookings.edu/topic/education/feed/', name: 'Brookings Education', priority: 'medium' },
            { url: 'https://www.rand.org/topics/education-and-literacy.xml', name: 'RAND Education', priority: 'medium' },
            { url: 'https://www.educationnext.org/feed/', name: 'Education Next', priority: 'low' },
            
            // Higher education
            { url: 'https://www.insidehighered.com/rss.xml', name: 'Inside Higher Ed', priority: 'low' },
            { url: 'https://www.chronicle.com/section/News/6/rss', name: 'Chronicle Higher Ed', priority: 'low' }
        ],
        
        equality: [
            // UN organizations
            { url: 'https://www.ohchr.org/en/feeds/news', name: 'UN Human Rights', priority: 'high' },
            { url: 'https://www.unwomen.org/en/rss', name: 'UN Women', priority: 'high' },
            { url: 'https://www.ilo.org/global/about-the-ilo/newsroom/rss/lang--en/index.htm', name: 'ILO', priority: 'high' },
            { url: 'https://www.unhcr.org/rss.xml', name: 'UNHCR', priority: 'high' },
            
            // Human rights NGOs
            { url: 'https://www.amnesty.org/en/rss/', name: 'Amnesty International', priority: 'medium' },
            { url: 'https://www.hrw.org/rss', name: 'Human Rights Watch', priority: 'medium' },
            { url: 'https://www.freedomhouse.org/rss.xml', name: 'Freedom House', priority: 'medium' },
            
            // Development organizations
            { url: 'https://www.oxfam.org/en/rss.xml', name: 'Oxfam', priority: 'medium' },
            { url: 'https://www.care.org/rss/', name: 'CARE', priority: 'medium' }
        ]
    },
    
    // API configurations
    apis: {
        ourWorldInData: {
            baseUrl: 'https://api.ourworldindata.org/v1',
            indicators: [
                // Health indicators
                { id: 'life-expectancy', field: 'health', name: 'Life Expectancy' },
                { id: 'child-mortality', field: 'health', name: 'Child Mortality' },
                { id: 'maternal-mortality-ratio', field: 'health', name: 'Maternal Mortality' },
                { id: 'malaria-death-rates', field: 'health', name: 'Malaria Death Rate' },
                { id: 'tuberculosis-death-rates', field: 'health', name: 'TB Death Rate' },
                
                // Energy indicators
                { id: 'renewable-share-energy', field: 'energy', name: 'Renewable Energy Share' },
                { id: 'access-to-electricity', field: 'energy', name: 'Electricity Access' },
                { id: 'energy-intensity', field: 'energy', name: 'Energy Intensity' },
                
                // Education indicators
                { id: 'literacy-rate-adult-total', field: 'education', name: 'Adult Literacy Rate' },
                { id: 'primary-completion-rate', field: 'education', name: 'Primary Completion Rate' },
                { id: 'expected-years-of-schooling', field: 'education', name: 'Expected Years of Schooling' },
                
                // Climate indicators
                { id: 'co2-emissions-per-capita', field: 'climate', name: 'CO2 per Capita' },
                { id: 'share-deaths-air-pollution', field: 'climate', name: 'Air Pollution Deaths' },
                { id: 'renewable-electricity-per-capita', field: 'climate', name: 'Renewable Electricity per Capita' },
                
                // Equality indicators
                { id: 'share-of-population-in-extreme-poverty', field: 'equality', name: 'Extreme Poverty Rate' },
                { id: 'gender-wage-gap-oecd', field: 'equality', name: 'Gender Wage Gap' },
                { id: 'women-in-parliament', field: 'equality', name: 'Women in Parliament' }
            ]
        },
        
        worldBank: {
            baseUrl: 'https://api.worldbank.org/v2',
            indicators: [
                { id: 'SP.DYN.IMRT.IN', field: 'health', name: 'Infant Mortality Rate' },
                { id: 'SE.ADT.LITR.ZS', field: 'education', name: 'Adult Literacy Rate' },
                { id: 'EG.FEC.RNEW.ZS', field: 'energy', name: 'Renewable Energy Consumption' },
                { id: 'EN.ATM.CO2E.PC', field: 'climate', name: 'CO2 Emissions per Capita' },
                { id: 'SL.TLF.CACT.FE.ZS', field: 'equality', name: 'Female Labor Force Participation' }
            ]
        }
    },
    
    // Research paper sources
    research: {
        arxiv: {
            baseUrl: 'http://export.arxiv.org/api/query',
            categories: [
                { cat: 'cs.AI', field: 'technology', maxResults: 10 },
                { cat: 'cs.LG', field: 'technology', maxResults: 10 },
                { cat: 'q-bio.QM', field: 'health', maxResults: 10 },
                { cat: 'physics.soc-ph', field: 'equality', maxResults: 5 },
                { cat: 'stat.AP', field: 'technology', maxResults: 5 }
            ]
        },
        
        pubmed: {
            baseUrl: 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils',
            searches: [
                { term: 'breakthrough[Title] AND therapy[Title]', field: 'health', maxResults: 10 },
                { term: 'vaccine[Title] AND efficacy[Title]', field: 'health', maxResults: 10 },
                { term: 'cure[Title] OR eradicate[Title]', field: 'health', maxResults: 5 }
            ]
        }
    },
    
    // Scoring configuration
    scoring: {
        keywords: {
            breakthrough: ['breakthrough', 'first-ever', 'revolutionary', 'game-changing', 'historic', 'unprecedented', 'groundbreaking'],
            positive: ['cure', 'eradicate', 'eliminate', 'solve', 'success', 'achievement', 'milestone', 'record'],
            progress: ['improve', 'advance', 'progress', 'develop', 'increase', 'boost', 'enhance', 'accelerate'],
            research: ['study', 'research', 'findings', 'results', 'evidence', 'data', 'analysis'],
            negative: ['failure', 'setback', 'concern', 'warning', 'threat', 'risk', 'challenge']
        },
        
        weights: {
            breakthrough: 3,
            positive: 2,
            progress: 1,
            research: 0.5,
            negative: -1
        },
        
        recencyBoost: {
            hours_0_24: 2,
            hours_24_72: 1,
            hours_72_168: 0,
            older: -1
        },
        
        fieldPriority: {
            health: 0.5,
            climate: 0.5,
            energy: 0.5,
            technology: 0,
            education: 0,
            equality: 0
        },
        
        minimumScore: 1
    }
};