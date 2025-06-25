// mission-sources-config.js - Curated sources for transformative human progress
// Each source is selected for its focus on solutions, breakthroughs, and hope

module.exports = {
    // Core mission statement for source selection
    mission: {
        statement: "To showcase humanity's most meaningful advances - the breakthroughs that save lives, lift people from poverty, protect our planet, and bring us together.",
        principles: [
            "Focus on solutions, not problems",
            "Highlight transformative change over incremental progress",
            "Emphasize human impact - millions helped, diseases cured, barriers broken",
            "Celebrate cooperation and unity across borders",
            "Share evidence-based hope that inspires action"
        ]
    },

    // Curated RSS sources
    sources: {
        // HEALTH: Conquering disease and extending life
        health: {
            description: "Medical breakthroughs and global health victories",
            feeds: [
                {
                    url: 'https://www.who.int/feeds/entity/mediacentre/news/en/rss.xml',
                    name: 'WHO',
                    priority: 'critical',
                    focus: 'global health milestones',
                    keywords: ['eradicat', 'eliminat', 'vaccine', 'cure', 'breakthrough', 'lives saved']
                },
                {
                    url: 'https://www.gatesfoundation.org/ideas/rss',
                    name: 'Gates Foundation',
                    priority: 'critical',
                    focus: 'disease eradication',
                    keywords: ['eradicat', 'vaccine', 'malaria', 'polio', 'tuberculosis']
                },
                {
                    url: 'https://www.nih.gov/news-events/news-releases/feed',
                    name: 'NIH',
                    priority: 'critical',
                    focus: 'medical research breakthroughs',
                    keywords: ['breakthrough', 'cure', 'treatment', 'clinical trial', 'success']
                },
                {
                    url: 'https://www.cancer.gov/news-events/press-releases/rss',
                    name: 'National Cancer Institute',
                    priority: 'high',
                    focus: 'cancer breakthroughs',
                    keywords: ['breakthrough', 'treatment', 'survival', 'cure', 'remission']
                },
                {
                    url: 'https://www.gavi.org/programmes-impact/news/rss.xml',
                    name: 'Gavi',
                    priority: 'high',
                    focus: 'vaccine access worldwide',
                    keywords: ['vaccine', 'immuniz', 'children', 'lives saved', 'protect']
                },
                {
                    url: 'https://www.theglobalfund.org/en/rss/news/',
                    name: 'Global Fund',
                    priority: 'high',
                    focus: 'fighting AIDS, TB, malaria',
                    keywords: ['lives saved', 'treatment', 'prevent', 'eliminate']
                },
                {
                    url: 'https://www.unaids.org/en/rss',
                    name: 'UNAIDS',
                    priority: 'high',
                    focus: 'ending AIDS epidemic',
                    keywords: ['treatment', 'prevent', 'lives saved', 'access']
                },
                {
                    url: 'https://www.msfaccess.org/rss.xml',
                    name: 'MSF Access',
                    priority: 'medium',
                    focus: 'medicine access for all',
                    keywords: ['access', 'treatment', 'affordable', 'lives']
                }
            ]
        },

        // POVERTY & HUNGER: Lifting humanity up
        poverty: {
            description: "Economic empowerment and ending hunger",
            feeds: [
                {
                    url: 'https://www.worldbank.org/en/news/rss.xml',
                    name: 'World Bank',
                    priority: 'critical',
                    focus: 'poverty reduction',
                    keywords: ['poverty', 'lifted', 'opportunity', 'development', 'growth']
                },
                {
                    url: 'https://www.undp.org/rss',
                    name: 'UNDP',
                    priority: 'critical',
                    focus: 'human development',
                    keywords: ['development', 'progress', 'improve', 'opportunity', 'empower']
                },
                {
                    url: 'https://www.wfp.org/rss',
                    name: 'World Food Programme',
                    priority: 'critical',
                    focus: 'ending hunger',
                    keywords: ['hunger', 'nutrition', 'food security', 'children', 'save']
                },
                {
                    url: 'https://www.ifad.org/en/rss-feeds',
                    name: 'IFAD',
                    priority: 'high',
                    focus: 'rural poverty',
                    keywords: ['farmer', 'income', 'rural', 'opportunity', 'transform']
                },
                {
                    url: 'https://www.one.org/rss/',
                    name: 'ONE Campaign',
                    priority: 'medium',
                    focus: 'extreme poverty',
                    keywords: ['poverty', 'opportunity', 'education', 'health']
                }
            ]
        },

        // CLIMATE & NATURE: Healing our planet
        climate: {
            description: "Environmental victories and climate solutions",
            feeds: [
                {
                    url: 'https://climate.nasa.gov/news/rss.xml',
                    name: 'NASA Climate',
                    priority: 'critical',
                    focus: 'climate solutions',
                    keywords: ['solution', 'breakthrough', 'technology', 'reduce', 'protect']
                },
                {
                    url: 'https://www.unep.org/rss/news',
                    name: 'UN Environment',
                    priority: 'critical',
                    focus: 'environmental protection',
                    keywords: ['restore', 'protect', 'conservation', 'success', 'agreement']
                },
                {
                    url: 'https://www.worldwildlife.org/rss/news.xml',
                    name: 'WWF',
                    priority: 'high',
                    focus: 'species recovery',
                    keywords: ['recover', 'protect', 'conservation', 'success', 'increase']
                },
                {
                    url: 'https://www.conservation.org/rss.xml',
                    name: 'Conservation International',
                    priority: 'high',
                    focus: 'ecosystem restoration',
                    keywords: ['restore', 'protect', 'conserve', 'success', 'community']
                },
                {
                    url: 'https://www.iucn.org/rss.xml',
                    name: 'IUCN',
                    priority: 'high',
                    focus: 'nature conservation',
                    keywords: ['conservation', 'species', 'protect', 'recover', 'success']
                },
                {
                    url: 'https://www.oceanconservancy.org/feed/',
                    name: 'Ocean Conservancy',
                    priority: 'medium',
                    focus: 'ocean health',
                    keywords: ['ocean', 'marine', 'protect', 'clean', 'restore']
                }
            ]
        },

        // CLEAN ENERGY: Powering a sustainable future
        energy: {
            description: "Renewable energy breakthroughs and access",
            feeds: [
                {
                    url: 'https://www.irena.org/RSS',
                    name: 'IRENA',
                    priority: 'critical',
                    focus: 'renewable energy milestones',
                    keywords: ['renewable', 'record', 'solar', 'wind', 'clean', 'access']
                },
                {
                    url: 'https://www.iea.org/feeds/newsroom.xml',
                    name: 'IEA',
                    priority: 'critical',
                    focus: 'energy transition',
                    keywords: ['renewable', 'transition', 'clean', 'record', 'achieve']
                },
                {
                    url: 'https://www.seforall.org/rss.xml',
                    name: 'SEforALL',
                    priority: 'high',
                    focus: 'energy access for all',
                    keywords: ['access', 'electricity', 'rural', 'connect', 'light']
                },
                {
                    url: 'https://www.nrel.gov/news/rss/news.xml',
                    name: 'NREL',
                    priority: 'high',
                    focus: 'clean tech innovation',
                    keywords: ['breakthrough', 'innovation', 'efficiency', 'clean', 'advance']
                }
            ]
        },

        // EDUCATION: Empowering every mind
        education: {
            description: "Education access and literacy victories",
            feeds: [
                {
                    url: 'https://en.unesco.org/news/feed',
                    name: 'UNESCO',
                    priority: 'critical',
                    focus: 'education for all',
                    keywords: ['education', 'literacy', 'school', 'children', 'learn', 'access']
                },
                {
                    url: 'https://www.globalpartnership.org/rss.xml',
                    name: 'Global Partnership for Education',
                    priority: 'high',
                    focus: 'education in developing countries',
                    keywords: ['education', 'school', 'children', 'learn', 'opportunity']
                },
                {
                    url: 'https://www.unicef.org/rss/press-releases.xml',
                    name: 'UNICEF',
                    priority: 'critical',
                    focus: 'children welfare and education',
                    keywords: ['children', 'education', 'protect', 'health', 'opportunity']
                },
                {
                    url: 'https://www.roomtoread.org/feed/',
                    name: 'Room to Read',
                    priority: 'medium',
                    focus: 'literacy and gender equality',
                    keywords: ['literacy', 'girls', 'education', 'school', 'read']
                }
            ]
        },

        // HUMAN RIGHTS: Dignity for all
        rights: {
            description: "Human rights advances and equality",
            feeds: [
                {
                    url: 'https://www.ohchr.org/en/feeds/news',
                    name: 'UN Human Rights',
                    priority: 'high',
                    focus: 'human dignity advances',
                    keywords: ['rights', 'dignity', 'justice', 'protect', 'achieve']
                },
                {
                    url: 'https://www.unwomen.org/en/rss/news-and-events',
                    name: 'UN Women',
                    priority: 'high',
                    focus: 'gender equality progress',
                    keywords: ['equality', 'women', 'girls', 'empower', 'achieve']
                },
                {
                    url: 'https://www.ilo.org/global/about-the-ilo/newsroom/rss/lang--en/index.htm',
                    name: 'ILO',
                    priority: 'high',
                    focus: 'decent work for all',
                    keywords: ['work', 'rights', 'protect', 'improve', 'opportunity']
                },
                {
                    url: 'https://www.unhcr.org/rss.xml',
                    name: 'UNHCR',
                    priority: 'high',
                    focus: 'refugee protection',
                    keywords: ['protect', 'refugee', 'resettle', 'integrate', 'opportunity']
                }
            ]
        },

        // PEACE & COOPERATION: Building bridges
        peace: {
            description: "Peacebuilding and international cooperation",
            feeds: [
                {
                    url: 'https://news.un.org/en/rss-feeds/peace-and-security',
                    name: 'UN Peace & Security',
                    priority: 'high',
                    focus: 'conflict resolution',
                    keywords: ['peace', 'agreement', 'reconcil', 'cooperat', 'unity']
                },
                {
                    url: 'https://www.usip.org/rss.xml',
                    name: 'US Institute of Peace',
                    priority: 'medium',
                    focus: 'peacebuilding',
                    keywords: ['peace', 'reconcil', 'dialogue', 'cooperat', 'build']
                }
            ]
        },

        // INNOVATION: Technology for good
        innovation: {
            description: "Technology serving humanity",
            feeds: [
                {
                    url: 'https://www.partnershiponai.org/feed/',
                    name: 'Partnership on AI',
                    priority: 'high',
                    focus: 'ethical AI for good',
                    keywords: ['AI', 'benefit', 'ethic', 'help', 'improve']
                },
                {
                    url: 'https://news.mit.edu/rss/topic/social-innovation',
                    name: 'MIT Social Innovation',
                    priority: 'high',
                    focus: 'tech for social good',
                    keywords: ['innovation', 'social', 'impact', 'solution', 'help']
                },
                {
                    url: 'https://www.xprize.org/rss.xml',
                    name: 'XPRIZE',
                    priority: 'medium',
                    focus: 'breakthrough innovations',
                    keywords: ['breakthrough', 'innovation', 'solution', 'prize', 'achieve']
                }
            ]
        }
    },

    // Impact scoring configuration
    scoring: {
        // Keywords that indicate transformative change
        transformative: {
            keywords: ['eradicate', 'eliminate', 'cure', 'end', 'first-ever', 'breakthrough', 'historic'],
            weight: 5,
            examples: ['cure for', 'eradicate disease', 'end poverty', 'first-ever treatment']
        },
        
        // Major progress indicators
        majorProgress: {
            keywords: ['milestone', 'record', 'achievement', 'success', 'victory', 'overcome'],
            weight: 4,
            examples: ['reached milestone', 'record low poverty', 'major achievement']
        },
        
        // Scale of impact
        scale: {
            keywords: ['million', 'billion', 'global', 'worldwide', 'universal', 'all'],
            weight: 3,
            examples: ['million people', 'global access', 'universal healthcare']
        },
        
        // Positive outcomes
        positive: {
            keywords: ['save', 'protect', 'improve', 'increase', 'expand', 'strengthen'],
            weight: 2,
            examples: ['lives saved', 'protect children', 'improve access']
        },
        
        // Cooperation and unity
        cooperation: {
            keywords: ['together', 'partnership', 'cooperation', 'unite', 'collaborate'],
            weight: 2,
            examples: ['work together', 'global partnership', 'nations unite']
        }
    },

    // Themes we want to highlight
    themes: {
        'Disease Eradication': {
            keywords: ['eradicat', 'eliminat', 'cure', 'vaccine', 'immuniz'],
            importance: 'critical'
        },
        'Poverty Alleviation': {
            keywords: ['poverty', 'income', 'opportunity', 'microfinance', 'develop'],
            importance: 'critical'
        },
        'Clean Energy Access': {
            keywords: ['renewable', 'solar', 'wind', 'clean energy', 'electrif'],
            importance: 'high'
        },
        'Education for All': {
            keywords: ['education', 'literacy', 'school', 'learning', 'student'],
            importance: 'high'
        },
        'Environmental Recovery': {
            keywords: ['restore', 'conservation', 'species', 'forest', 'ocean'],
            importance: 'high'
        },
        'Medical Breakthroughs': {
            keywords: ['treatment', 'therapy', 'clinical', 'FDA', 'approval'],
            importance: 'high'
        },
        'Human Rights Progress': {
            keywords: ['rights', 'equality', 'justice', 'dignity', 'freedom'],
            importance: 'high'
        },
        'Global Cooperation': {
            keywords: ['partnership', 'agreement', 'treaty', 'unite', 'peace'],
            importance: 'medium'
        }
    },

    // Content filters
    filters: {
        // Avoid fear-based or negative content
        negative: [
            'threat', 'risk', 'danger', 'crisis', 'disaster', 'collapse',
            'fail', 'worse', 'decline', 'conflict', 'war', 'attack'
        ],
        
        // Require at least one hope indicator
        hopeIndicators: [
            'breakthrough', 'cure', 'success', 'achieve', 'progress',
            'improve', 'advance', 'solution', 'overcome', 'milestone'
        ]
    },

    // API endpoints for supplemental data
    apis: {
        ourWorldInData: {
            description: 'Global development indicators showing positive trends',
            endpoints: [
                {
                    indicator: 'life-expectancy',
                    name: 'Global Life Expectancy',
                    field: 'health',
                    unit: 'years',
                    goodDirection: 'up'
                },
                {
                    indicator: 'child-mortality',
                    name: 'Child Mortality Rate',
                    field: 'health',
                    unit: 'per 1,000',
                    goodDirection: 'down'
                },
                {
                    indicator: 'extreme-poverty-share-world',
                    name: 'Extreme Poverty Rate',
                    field: 'poverty',
                    unit: '%',
                    goodDirection: 'down'
                },
                {
                    indicator: 'literacy-rate-adult-total',
                    name: 'Global Literacy Rate',
                    field: 'education',
                    unit: '%',
                    goodDirection: 'up'
                },
                {
                    indicator: 'renewable-share-energy',
                    name: 'Renewable Energy Share',
                    field: 'energy',
                    unit: '%',
                    goodDirection: 'up'
                },
                {
                    indicator: 'access-to-electricity',
                    name: 'Electricity Access',
                    field: 'energy',
                    unit: '%',
                    goodDirection: 'up'
                }
            ]
        }
    }
};