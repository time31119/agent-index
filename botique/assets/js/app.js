/* BOTIQUE — shared storefront runtime: header, cart, currency, search, i18n. */
(function (global) {
  'use strict';

  const DATA = global.BOTIQUE_DATA;
  const ART = global.BOTIQUE_ART;
  const KEY = 'botique.store.v1';
  const FREE_SHIP = 150;
  const CONFIG = global.BOTIQUE_CONFIG || {};

  const RATES = {
    USD: { rate: 1, symbol: '$', locale: 'en-US', label: 'United States Dollar' },
    EUR: { rate: 0.92, locale: 'de-DE', label: 'Euro' },
    GBP: { rate: 0.79, locale: 'en-GB', label: 'British Pound' },
    CAD: { rate: 1.37, locale: 'en-CA', label: 'Canadian Dollar' },
    AUD: { rate: 1.53, locale: 'en-AU', label: 'Australian Dollar' },
    JPY: { rate: 151, locale: 'ja-JP', label: 'Japanese Yen' },
    CNY: { rate: 7.21, locale: 'zh-CN', label: 'Chinese Yuan' },
    SGD: { rate: 1.34, locale: 'en-SG', label: 'Singapore Dollar' },
    AED: { rate: 3.67, locale: 'en-AE', label: 'UAE Dirham' }
  };

  const SHIPPING = {
    US: { name: 'United States', zone: 'US', rate: 9, express: 24, eta: [3, 5], expressEta: [2, 3] },
    CA: { name: 'Canada', zone: 'CA', rate: 12, express: 29, eta: [5, 8], expressEta: [3, 4] },
    GB: { name: 'United Kingdom', zone: 'UK', rate: 10, express: 28, eta: [3, 5], expressEta: [2, 3] },
    DE: { name: 'Germany', zone: 'EU', rate: 10, express: 28, eta: [3, 6], expressEta: [2, 4] },
    FR: { name: 'France', zone: 'EU', rate: 10, express: 28, eta: [3, 6], expressEta: [2, 4] },
    NL: { name: 'Netherlands', zone: 'EU', rate: 10, express: 28, eta: [3, 6], expressEta: [2, 4] },
    ES: { name: 'Spain', zone: 'EU', rate: 10, express: 28, eta: [3, 6], expressEta: [2, 4] },
    IT: { name: 'Italy', zone: 'EU', rate: 10, express: 28, eta: [3, 6], expressEta: [2, 4] },
    AU: { name: 'Australia', zone: 'AU', rate: 14, express: 34, eta: [6, 9], expressEta: [3, 5] },
    NZ: { name: 'New Zealand', zone: 'AU', rate: 14, express: 34, eta: [6, 9], expressEta: [3, 5] },
    JP: { name: 'Japan', zone: 'ASIA', rate: 12, express: 30, eta: [4, 7], expressEta: [2, 4] },
    KR: { name: 'South Korea', zone: 'ASIA', rate: 12, express: 30, eta: [4, 7], expressEta: [2, 4] },
    SG: { name: 'Singapore', zone: 'ASIA', rate: 12, express: 30, eta: [4, 7], expressEta: [2, 4] },
    AE: { name: 'United Arab Emirates', zone: 'ME', rate: 15, express: 35, eta: [5, 8], expressEta: [2, 4] },
    OTHER: { name: 'Rest of world', zone: 'ROW', rate: 19, express: 45, eta: [7, 12], expressEta: [4, 7] }
  };

  const I18N = {
    en: {
      'announce.1': 'Free standard shipping over $150',
      'announce.2': '30-day returns · 2-year warranty',
      'announce.3': 'Duties & taxes included · no surprise fees',
      'announce.4': 'New: the 2026 Top 100 is live',
      'nav.shop': 'Shop all', 'nav.available': 'Available now', 'nav.ranking': 'The 100', 'nav.guide': 'Field guide', 'nav.search': 'Search',
      'nav.bag': 'Bag', 'nav.menu': 'Menu', 'nav.close': 'Close', 'nav.companions': 'Companions',
      'nav.pets': 'Pets & plush', 'nav.stem': 'STEM', 'nav.drones': 'Drones & RC',
      'header.currency': 'Currency', 'header.language': 'Language', 'header.account': 'Account',
      'search.title': 'Find your next little friend', 'search.placeholder': 'Search 100 bots, brands or moods…',
      'search.popular': 'Popular right now', 'search.noresults': 'No bots found. Try “dog”, “plush” or a brand.',
      'search.viewall': 'View all results', 'search.hint': 'Type to search. Press Esc to close.',
      'cart.title': 'Your bag', 'cart.empty': 'Your bag is empty. Let’s fix that.',
      'cart.emptyCta': 'Shop available now', 'cart.subtotal': 'Subtotal', 'cart.shippingNote': 'Shipping and taxes calculated at checkout.',
      'cart.checkout': 'Checkout', 'cart.continue': 'Keep shopping', 'cart.freeProgress': '{amount} away from free shipping',
      'cart.freeUnlocked': 'You unlocked free standard shipping', 'cart.remove': 'Remove', 'cart.qty': 'Qty',
      'wish.title': 'Saved bots', 'wish.empty': 'Nothing saved yet. Tap the heart on anything you like.',
      'wish.emptyCta': 'Browse available now', 'wish.add': 'Add to bag', 'wish.saved': 'Saved',
      'common.add': 'Add to bag', 'common.added': 'Added to bag', 'common.reviews': 'reviews', 'common.est': 'est. units/mo',
      'card.indexOnly': 'Index only', 'product.indexTitle': 'Index only — not yet open for checkout',
      'product.indexBody': 'This bot is in the BOTIQUE 100, but we have not cleared authorized photography and stock yet. Leave your email and we will open checkout when it is ready.',
      'product.notify': 'Notify me', 'product.notifyDone': 'You are on the list. We will email you when this bot clears.',
      'product.notifyEmail': 'Enter a valid email address.',
      'shop.availableChip': 'Available now', 'shop.launchH1': 'Available now',
      'shop.launchLede': 'Photo-ready bots with cleared stock. The other 88 stay in the index until their assets are authorized.',
      'common.sold': 'units / month', 'common.view': 'View', 'common.from': 'From', 'common.loading': 'Loading…',
      'common.email': 'Email address', 'common.subscribe': 'Join the list', 'common.subscribed': 'You’re in. Check your inbox for WELCOME10.',
      'common.error': 'Something went wrong. Try again.', 'common.close': 'Close', 'common.new': 'New', 'common.sale': 'Sale',
      'common.rank': 'Rank', 'common.price': 'Price', 'common.rating': 'Rating', 'common.category': 'Category',
      'common.platform': 'Platform', 'common.all': 'All', 'common.showing': 'Showing {n} of {total}', 'common.more': 'Load more',
      'common.sort': 'Sort', 'common.filters': 'Filters', 'common.clear': 'Clear all', 'common.apply': 'Apply',
      'footer.tagline': 'Small robots. Big feelings. One carefully curated shelf.',
      'footer.shop': 'Shop', 'footer.company': 'Company', 'footer.support': 'Support', 'footer.follow': 'Follow',
      'footer.all': 'All 100 bots', 'footer.best': 'Bestsellers', 'footer.new': 'New arrivals', 'footer.gift': 'Gift finder',
      'footer.standard': 'Our standard', 'footer.method': 'How we rank', 'footer.guide': 'Field guide', 'footer.contact': 'Contact',
      'footer.shipping': 'Shipping', 'footer.returns': 'Returns', 'footer.warranty': 'Warranty', 'footer.track': 'Track order',
      'footer.privacy': 'Privacy', 'footer.terms': 'Terms', 'footer.cookies': 'Cookies', 'footer.access': 'Accessibility',
      'footer.rights': '© 2026 BOTIQUE. An independent curatorial concept store.',
      'footer.disclaimer': 'Product names and marks belong to their respective owners. Sales ranks are estimates from public marketplace signals, not official platform data. Prices shown in USD; conversions are indicative.',
      'footer.payments': 'Secure checkout with',
      'home.kicker': 'The BOTIQUE 100 · 2026 edition',
      'home.h1a': 'Small robots.', 'home.h1b': 'Big feelings.',
      'home.lede': 'One hundred little machines that talk back, follow you around, or just sit there being adorable. Ranked by what the world is actually buying.',
      'home.cta': 'Shop available now', 'home.cta2': 'How we rank',
      'home.stat1': 'curated bots', 'home.stat2': 'brands', 'home.stat3': 'avg. rating',
      'home.trust1': 'Free shipping over $150', 'home.trust2': '30-day returns', 'home.trust3': '2-year warranty', 'home.trust4': 'Duties included',
      'home.catsKicker': 'Shop by personality', 'home.catsTitle': 'What kind of little weirdo are you looking for?',
      'home.catsLink': 'All categories',
      'home.topKicker': 'The demand index', 'home.topTitle': 'This week’s Top 10', 'home.topLink': 'See all 100',
      'home.topNote': 'Estimated 30-day units across Amazon, TikTok Shop and Meta Shops.',
      'home.bannerKicker': 'The full ranking', 'home.bannerTitle': 'All 100, ranked<br>by real demand.',
      'home.bannerBody': 'Every bot gets a rank, a price, a platform trail and a reason to exist. No sponsored slots. No pay-to-play.',
      'home.bannerCta': 'Open the index',
      'home.stdKicker': 'The BOTIQUE standard', 'home.stdTitle': 'Less hype. More homework.',
      'home.std1t': 'Demand, not sponsorship', 'home.std1b': 'We combine public bestseller signals, review velocity and marketplace availability into one estimated demand score. Nobody can buy a higher rank.',
      'home.std2t': 'No subscription traps', 'home.std2b': 'Every recurring fee is flagged before checkout. If a bot needs a monthly plan to be useful, we say so in plain language.',
      'home.std3t': 'Small robots, real support', 'home.std3b': '30 days to change your mind, a 2-year hardware warranty, and a human on email within one business day.',
      'home.featKicker': 'Editor’s pick', 'home.featTitle': 'The $140 desk bot that outsells the $3,300 one.',
      'home.featBody': 'Eilik has no camera, no cloud and no subscription. It has 1,000 expressions, four servo-driven arms and a personality that somehow fills a room. In a category obsessed with intelligence, it wins by being alive.',
      'home.featCta': 'Meet Eilik',
      'home.giftKicker': 'Gift mode', 'home.giftTitle': 'Three questions. One perfect little weirdo.',
      'home.giftBody': 'Tell us who it’s for, what you want to spend, and the vibe. We’ll pull three picks from the Top 100.',
      'home.giftCta': 'Find a gift',
      'home.newsKicker': 'The good stuff', 'home.newsTitle': 'New bots, honest notes, zero spam.',
      'home.newsBody': 'Join the robot-curious. Get the monthly drop list and 10% off your first order.',
      'home.newsFine': 'By subscribing you agree to our Privacy Policy. Unsubscribe anytime.',
      'home.journalKicker': 'From the field guide', 'home.journalTitle': 'Read before you buy a robot with feelings.',
      'home.journal1t': 'Local AI vs. cloud AI: which bot survives the company?', 'home.journal1b': 'The shutdown test every companion robot should pass.',
      'home.journal2t': 'The subscription math nobody shows you', 'home.journal2b': 'A $199 robot can cost $1,000 over four years. Here’s how to spot it.',
      'home.journal3t': 'Best first robots by age', 'home.journal3b': 'From age 3 to 93, without the tears or the landfill.',
      'shop.kicker': 'The complete index', 'shop.h1': 'The Top 100', 'shop.lede': 'Every small robot worth knowing in 2026, ranked by estimated demand. Filter by mood, budget, platform or category.',
      'shop.updated': 'Updated November 2026', 'shop.rankNote': 'Ranks are editorial estimates, not official platform charts.',
      'shop.search': 'Search the 100…', 'shop.results': '{n} bots', 'shop.empty': 'No bots match those filters. Try clearing one.',
      'shop.sortRank': 'Rank: best sellers', 'shop.sortPriceLow': 'Price: low to high', 'shop.sortPriceHigh': 'Price: high to low', 'shop.sortRating': 'Rating: highest', 'shop.sortNew': 'Newest first',
      'shop.price': 'Price', 'shop.priceAll': 'Any price', 'shop.price1': 'Under $50', 'shop.price2': '$50 – $150', 'shop.price3': '$150 – $300', 'shop.price4': '$300 – $1,000', 'shop.price5': '$1,000+',
      'shop.platform': 'Platform', 'shop.platformAll': 'All platforms', 'shop.categoryAll': 'All categories',
      'shop.loadMore': 'Load more bots', 'shop.end': 'That’s all 100. You’re officially fluent in small robots.',
      'product.breadcrumb': 'Shop', 'product.rank': 'Rank #{rank} of 100', 'product.why': 'Why it’s on the list',
      'product.highlights': 'The short version', 'product.specs': 'The details', 'product.shipping': 'Shipping & returns',
      'product.add': 'Add to bag', 'product.buy': 'Buy it now', 'product.qty': 'Quantity', 'product.inStock': 'In stock · ships in 1–2 business days',
      'product.lowStock': 'Low stock · ships in 1–2 business days', 'product.delivery': 'Est. delivery', 'product.duties': 'Duties & taxes included',
      'product.sub': 'Subscription', 'product.warranty': 'Warranty', 'product.age': 'Recommended age', 'product.battery': 'Battery', 'product.connect': 'Connectivity',
      'product.reviews': 'public reviews', 'product.reviewNote': 'Rating and review count are a snapshot of public listings, not a BOTIQUE review score.',
      'product.pair': 'More like this', 'product.recent': 'Recently viewed', 'product.share': 'Share', 'product.copied': 'Link copied',
      'product.accordion1': 'What’s in the box', 'product.accordion1b': 'Robot, USB-C charging cable, quick-start card, BOTIQUE care card. Retail packaging may vary by batch.',
      'product.accordion2': 'Shipping & returns', 'product.accordion2b': 'Free standard shipping over $150. Express options at checkout. 30-day returns on unused items; 2-year hardware warranty. Duties and taxes are included for US, EU and UK orders.',
      'product.accordion3': 'The fine print', 'product.accordion3b': 'BOTIQUE is an independent curator. This product is manufactured by its brand owner; warranty support is provided jointly by BOTIQUE and the maker. Subscription features, where listed, are optional unless stated.',
      'product.whyBody': 'We rank by demand, then edit by hand. This one made the cut because it does something the others copy but rarely nail: it feels alive within thirty seconds.',
      'checkout.title': 'Checkout', 'checkout.contact': 'Contact', 'checkout.shipping': 'Shipping address', 'checkout.delivery': 'Delivery',
      'checkout.payment': 'Payment', 'checkout.summary': 'Order summary', 'checkout.email': 'Email', 'checkout.first': 'First name', 'checkout.last': 'Last name',
      'checkout.address': 'Address', 'checkout.apartment': 'Apartment, suite, etc. (optional)', 'checkout.city': 'City', 'checkout.state': 'State / Province',
      'checkout.postal': 'Postal code', 'checkout.country': 'Country / Region', 'checkout.phone': 'Phone (optional)',
      'checkout.standard': 'Standard', 'checkout.express': 'Express', 'checkout.free': 'Free', 'checkout.discount': 'Discount code',
      'checkout.apply': 'Apply', 'checkout.subtotal': 'Subtotal', 'checkout.shippingLine': 'Shipping', 'checkout.total': 'Total',
      'checkout.pay': 'Pay now', 'checkout.demo': 'Preview checkout — payments run in demo mode. Connect Stripe in config.js to accept real orders.',
      'checkout.secure': 'Secure 256-bit checkout · PCI DSS', 'checkout.terms': 'By placing your order you agree to our Terms and Privacy Policy.',
      'checkout.successTitle': 'Order confirmed.', 'checkout.successBody': 'Thanks — your robot is officially on its way. A confirmation is headed to your inbox.',
      'checkout.order': 'Order', 'checkout.continue': 'Back to the shop', 'checkout.empty': 'Your bag is empty. Add a bot before checking out.',
      'checkout.required': 'Please complete the highlighted fields.', 'checkout.emailBad': 'Enter a valid email address.',
      'checkout.card': 'Card number', 'checkout.exp': 'MM / YY', 'checkout.cvc': 'CVC', 'checkout.nameCard': 'Name on card',
      'checkout.testNote': 'Demo mode: use any values. No card is charged.',
      'rank.kicker': 'Methodology & data', 'rank.h1': 'How the 100 are ranked', 'rank.lede': 'A transparent, repeatable attempt to answer a simple question: which small robots are people actually buying right now?',
      'rank.kpi1': 'products ranked', 'rank.kpi2': 'brands tracked', 'rank.kpi3': 'platforms scanned', 'rank.kpi4': 'categories',
      'rank.platformTitle': 'Platform footprint', 'rank.platformBody': 'Share of the Top 100 with a public retail or shop signal on each platform.',
      'rank.catTitle': 'Category mix', 'rank.priceTitle': 'Price bands', 'rank.tableTitle': 'The full data table',
      'rank.method': 'Methodology', 'rank.methodBody1': 'We start with public bestseller pages on Amazon, TikTok Shop and Meta Shops, then cross-check review velocity, listing age, stock status and third-party sales estimates. Where platforms publish no sales data, we model a range from review count and category velocity, then take the midpoint.',
      'rank.methodBody2': 'The result is an estimated 30-day unit figure. It is directional, not audited. We refresh the list monthly and keep a changelog. No brand can pay for placement; affiliate links, where present, never affect rank.',
      'rank.caveat': 'Important caveat', 'rank.caveatBody': 'Amazon, Meta and TikTok do not publish official category sales rankings. Every unit number here is an estimate. Treat the order as a useful map, not a receipt.',
      'rank.sources': 'Sources & further reading',
      'rank.download': 'Download the data (CSV)', 'rank.search': 'Search the table…', 'rank.updated': 'Snapshot: 1 November 2026'
    },
    zh: {
      'announce.1': '满 $150 免标准运费', 'announce.2': '30 天退货 · 2 年保修', 'announce.3': '关税与税费已含 · 无隐藏费用', 'announce.4': '2026 年度 Top 100 已上线',
      'nav.shop': '全部商品', 'nav.available': '现货可买', 'nav.ranking': 'TOP 100', 'nav.guide': '选购指南', 'nav.search': '搜索', 'nav.bag': '购物袋', 'nav.menu': '菜单', 'nav.close': '关闭',
      'nav.companions': '桌面陪伴', 'nav.pets': '宠物与毛绒', 'nav.stem': 'STEM 编程', 'nav.drones': '无人机与遥控',
      'header.currency': '货币', 'header.language': '语言', 'header.account': '账户',
      'search.title': '找到你的下一个小伙伴', 'search.placeholder': '搜索 100 款机器人、品牌或风格…', 'search.popular': '正在流行',
      'search.noresults': '没有找到，试试“机器狗”“毛绒”或品牌名。', 'search.viewall': '查看全部结果', 'search.hint': '输入即可搜索，按 Esc 关闭。',
      'cart.title': '购物袋', 'cart.empty': '购物袋还是空的，先装一只小可爱吧。', 'cart.emptyCta': '选购现货', 'cart.subtotal': '小计',
      'cart.shippingNote': '运费与税费将在结账时计算。', 'cart.checkout': '去结账', 'cart.continue': '继续购物',
      'cart.freeProgress': '再买 {amount} 即享免运费', 'cart.freeUnlocked': '已解锁免费标准配送', 'cart.remove': '移除', 'cart.qty': '数量',
      'wish.title': '我的收藏', 'wish.empty': '还没有收藏，点一下爱心即可保存。', 'wish.emptyCta': '浏览现货', 'wish.add': '加入购物袋', 'wish.saved': '已收藏',
      'common.add': '加入购物袋', 'common.added': '已加入购物袋', 'common.reviews': '条评价', 'common.est': '估算月销量', 'common.sold': '件/月',
      'card.indexOnly': '仅榜单', 'product.indexTitle': '仅收录，暂未开售',
      'product.indexBody': '这款产品在 BOTIQUE 100 榜单中，但授权商品图和库存尚未确认。留下邮箱，开售时我们会通知你。',
      'product.notify': '到货通知', 'product.notifyDone': '已加入通知名单，开售后我们会发邮件。',
      'product.notifyEmail': '请输入有效邮箱。',
      'shop.availableChip': '现货可买', 'shop.launchH1': '现货可买',
      'shop.launchLede': '已有真实商品图、库存可确认的机器人。其余 88 款继续留在榜单，等授权素材到位后再开售。',
      'common.view': '查看', 'common.from': '起', 'common.loading': '加载中…', 'common.email': '邮箱地址', 'common.subscribe': '订阅',
      'common.subscribed': '订阅成功，WELCOME10 已发送到你的邮箱。', 'common.error': '出了点问题，请重试。', 'common.close': '关闭',
      'common.new': '新品', 'common.sale': '特价', 'common.rank': '排名', 'common.price': '价格', 'common.rating': '评分', 'common.category': '分类',
      'common.platform': '平台', 'common.all': '全部', 'common.showing': '显示 {n} / {total}', 'common.more': '加载更多',
      'common.sort': '排序', 'common.filters': '筛选', 'common.clear': '清除全部', 'common.apply': '应用',
      'footer.tagline': '小机器人，大情绪。一个认真挑选的货架。', 'footer.shop': '选购', 'footer.company': '关于', 'footer.support': '支持', 'footer.follow': '关注',
      'footer.all': '全部 100 款', 'footer.best': '热销榜', 'footer.new': '新品', 'footer.gift': '礼物助手', 'footer.standard': '我们的标准',
      'footer.method': '排名方法', 'footer.guide': '选购指南', 'footer.contact': '联系我们', 'footer.shipping': '配送', 'footer.returns': '退货',
      'footer.warranty': '保修', 'footer.track': '查询订单', 'footer.privacy': '隐私', 'footer.terms': '条款', 'footer.cookies': 'Cookie',
      'footer.access': '无障碍', 'footer.rights': '© 2026 BOTIQUE. 独立策展概念店。',
      'footer.disclaimer': '产品名称与商标归各自所有者。销量排名基于公开市场信号的估算，并非平台官方数据。价格以美元计，换算仅供参考。', 'footer.payments': '安全支付支持',
      'home.kicker': 'BOTIQUE 100 · 2026 年度版', 'home.h1a': '小机器人。', 'home.h1b': '大情绪。',
      'home.lede': '一百台会顶嘴、会跟着你跑、或者只是安静卖萌的小机器。按全球真实销量趋势排名。',
      'home.cta': '选购现货', 'home.cta2': '排名方法', 'home.stat1': '款精选机器人', 'home.stat2': '个品牌', 'home.stat3': '平均评分',
      'home.trust1': '满 $150 免运费', 'home.trust2': '30 天退货', 'home.trust3': '2 年保修', 'home.trust4': '含关税税费',
      'home.catsKicker': '按性格选购', 'home.catsTitle': '你今天想找哪种小怪东西？', 'home.catsLink': '全部分类',
      'home.topKicker': '需求指数', 'home.topTitle': '本周 TOP 10', 'home.topLink': '查看全部 100 款',
      'home.topNote': '基于 Amazon、TikTok Shop 与 Meta Shops 的估算 30 天销量。',
      'home.bannerKicker': '完整榜单', 'home.bannerTitle': '100 款，全部<br>按真实需求排名。',
      'home.bannerBody': '每一款都有排名、价格、平台足迹和入选理由。没有赞助位，没有付费上榜。', 'home.bannerCta': '打开榜单',
      'home.stdKicker': 'BOTIQUE 标准', 'home.stdTitle': '少一点炒作，多一点功课。',
      'home.std1t': '看需求，不看赞助', 'home.std1b': '我们综合公开畅销信号、评价增速与市场供货情况，形成估算需求分。没有人可以买到更高的排名。',
      'home.std2t': '拒绝订阅陷阱', 'home.std2b': '所有周期性费用都会在结账前标出。需要月费才好用的产品，我们会用大白话说明。',
      'home.std3t': '小机器人，真服务', 'home.std3b': '30 天反悔期、2 年硬件保修，工作日 24 小时内真人邮件回复。',
      'home.featKicker': '编辑推荐', 'home.featTitle': '这台 $140 的桌宠，卖得比 $3,300 的还好。',
      'home.featBody': 'Eilik 没有摄像头、不连云端、没有订阅。它有 1,000 种表情、四条舵机手臂，以及一种能填满房间的性格。在一个痴迷“智能”的品类里，它靠“活着”赢了。',
      'home.featCta': '认识 Eilik', 'home.giftKicker': '礼物模式', 'home.giftTitle': '三个问题，找到完美的小怪东西。',
      'home.giftBody': '告诉我们送给谁、预算多少、想要什么气质，我们从 TOP 100 里挑三款。', 'home.giftCta': '帮我挑礼物',
      'home.newsKicker': '好东西', 'home.newsTitle': '新机器人、真心话、零垃圾邮件。',
      'home.newsBody': '加入机器人好奇者的行列。每月新品清单 + 首单 9 折。', 'home.newsFine': '订阅即表示同意隐私政策，可随时退订。',
      'home.journalKicker': '选购指南', 'home.journalTitle': '买一台有情绪的机器人之前，先读这些。',
      'home.journal1t': '本地 AI vs 云端 AI：哪台机器人能活过公司倒闭？', 'home.journal1b': '每台陪伴机器人都该通过的“关机测试”。',
      'home.journal2t': '没人告诉你的订阅数学', 'home.journal2b': '一台 $199 的机器人，四年可能花掉 $1,000。', 'home.journal3t': '按年龄选第一台机器人', 'home.journal3b': '从 3 岁到 93 岁，不流泪也不进垃圾场。',
      'shop.kicker': '完整榜单', 'shop.h1': 'TOP 100', 'shop.lede': '2026 年值得认识的全部小型机器人，按估算需求排名。按风格、预算、平台或分类筛选。',
      'shop.updated': '2026 年 11 月更新', 'shop.rankNote': '排名为编辑估算，并非平台官方榜单。', 'shop.search': '搜索 100 款…',
      'shop.results': '{n} 款', 'shop.empty': '没有符合筛选的产品，试试清除一个条件。',
      'shop.sortRank': '排名：热销优先', 'shop.sortPriceLow': '价格：从低到高', 'shop.sortPriceHigh': '价格：从高到低', 'shop.sortRating': '评分：最高', 'shop.sortNew': '最新上市',
      'shop.price': '价格', 'shop.priceAll': '不限价格', 'shop.price1': '$50 以下', 'shop.price2': '$50 – $150', 'shop.price3': '$150 – $300', 'shop.price4': '$300 – $1,000', 'shop.price5': '$1,000 以上',
      'shop.platform': '平台', 'shop.platformAll': '全部平台', 'shop.categoryAll': '全部分类', 'shop.loadMore': '加载更多', 'shop.end': '100 款全部看完，你已经是小型机器人专家了。',
      'product.breadcrumb': '商店', 'product.rank': '第 {rank} / 100 名', 'product.why': '为什么入选', 'product.highlights': '一句话总结',
      'product.specs': '详细参数', 'product.shipping': '配送与退货', 'product.add': '加入购物袋', 'product.buy': '立即购买', 'product.qty': '数量',
      'product.inStock': '现货 · 1–2 个工作日发货', 'product.lowStock': '库存不多 · 1–2 个工作日发货', 'product.delivery': '预计送达',
      'product.duties': '关税与税费已含', 'product.sub': '订阅', 'product.warranty': '保修', 'product.age': '建议年龄', 'product.battery': '电池',
      'product.connect': '连接方式', 'product.reviews': '条公开评价', 'product.reviewNote': '评分与评价数为公开页面快照，并非 BOTIQUE 评分。',
      'product.pair': '相似推荐', 'product.recent': '最近浏览', 'product.share': '分享', 'product.copied': '链接已复制',
      'product.accordion1': '包装清单', 'product.accordion1b': '机器人、USB-C 充电线、快速入门卡、BOTIQUE 关怀卡。零售包装可能因批次不同。',
      'product.accordion2': '配送与退货', 'product.accordion2b': '满 $150 免标准运费，结账可选加急。未使用商品 30 天退货，2 年硬件保修。美国、欧盟与英国订单含关税税费。',
      'product.accordion3': '细则', 'product.accordion3b': 'BOTIQUE 是独立策展方。产品由品牌方制造，保修由 BOTIQUE 与厂商共同支持。标注的订阅功能除特别说明外均为可选。',
      'product.whyBody': '我们先按需求排名，再人工筛选。它入选的原因是：它做到了别人都在抄却很少做对的事——30 秒内就让你觉得它活着。',
      'checkout.title': '结账', 'checkout.contact': '联系方式', 'checkout.shipping': '收货地址', 'checkout.delivery': '配送方式', 'checkout.payment': '支付',
      'checkout.summary': '订单摘要', 'checkout.email': '邮箱', 'checkout.first': '名', 'checkout.last': '姓', 'checkout.address': '地址',
      'checkout.apartment': '公寓、楼层等（选填）', 'checkout.city': '城市', 'checkout.state': '州 / 省', 'checkout.postal': '邮编',
      'checkout.country': '国家 / 地区', 'checkout.phone': '电话（选填）', 'checkout.standard': '标准', 'checkout.express': '加急', 'checkout.free': '免费',
      'checkout.discount': '折扣码', 'checkout.apply': '使用', 'checkout.subtotal': '小计', 'checkout.shippingLine': '运费', 'checkout.total': '合计',
      'checkout.pay': '立即支付', 'checkout.demo': '预览结账 — 当前为演示模式。在 config.js 接入 Stripe 即可接受真实订单。',
      'checkout.secure': '256 位安全结账 · PCI DSS', 'checkout.terms': '下单即表示同意我们的条款与隐私政策。',
      'checkout.successTitle': '订单已确认。', 'checkout.successBody': '谢谢，你的机器人已准备出发。确认邮件正在路上。',
      'checkout.order': '订单', 'checkout.continue': '继续逛逛', 'checkout.empty': '购物袋是空的，先加一只机器人吧。',
      'checkout.required': '请填写标红的必填项。', 'checkout.emailBad': '请输入有效邮箱。', 'checkout.card': '卡号', 'checkout.exp': '月 / 年',
      'checkout.cvc': '安全码', 'checkout.nameCard': '持卡人姓名', 'checkout.testNote': '演示模式：随便填，不会扣款。',
      'rank.kicker': '方法与数据', 'rank.h1': '这 100 款是怎么排的', 'rank.lede': '一个透明、可复现的尝试，回答一个简单问题：现在人们真正在买哪些小型机器人？',
      'rank.kpi1': '款产品', 'rank.kpi2': '个品牌', 'rank.kpi3': '个平台', 'rank.kpi4': '个分类', 'rank.platformTitle': '平台覆盖',
      'rank.platformBody': 'TOP 100 中，在各平台拥有公开零售或店铺信号的比例。', 'rank.catTitle': '分类构成', 'rank.priceTitle': '价格带',
      'rank.tableTitle': '完整数据表', 'rank.method': '方法说明',
      'rank.methodBody1': '我们从 Amazon、TikTok Shop 与 Meta Shops 的公开畅销页面出发，交叉核对评价增速、上架时间、库存状态与第三方销量估算。平台不公开销量时，我们用评价数与品类增速建模，取区间中值。',
      'rank.methodBody2': '最终得到的是估算 30 天销量，只代表方向，未经审计。榜单每月更新并保留变更记录。品牌无法付费购买排名；联盟链接不会影响排名。',
      'rank.caveat': '重要说明', 'rank.caveatBody': 'Amazon、Meta 与 TikTok 均不发布官方品类销量榜。这里的每个数字都是估算。请把排序当作地图，而不是收据。',
      'rank.sources': '来源与延伸阅读', 'rank.download': '下载数据（CSV）', 'rank.search': '搜索表格…', 'rank.updated': '快照：2026 年 11 月 1 日'
    }
  };

  const lang = function () { return state.lang; };
  function t(key, vars) {
    let s = (I18N[lang()] && I18N[lang()][key]) || I18N.en[key] || key;
    if (vars) Object.keys(vars).forEach(function (k) { s = s.replace('{' + k + '}', vars[k]); });
    return s;
  }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }

  let state = { cart: [], wishlist: [], currency: 'USD', lang: 'en' };
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
    if (saved && typeof saved === 'object') {
      state.cart = Array.isArray(saved.cart) ? saved.cart.filter(function (l) { const p = DATA.byId(l.id); return p && p.launch && l.qty > 0; }) : [];
      state.wishlist = Array.isArray(saved.wishlist) ? saved.wishlist.filter(function (id) { return DATA.byId(id); }) : [];
      if (RATES[saved.currency]) state.currency = saved.currency;
      if (I18N[saved.lang]) state.lang = saved.lang;
    }
  } catch (e) { /* private mode */ }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* noop */ }
    document.dispatchEvent(new CustomEvent('botique:change', { detail: { cart: cartCount(), currency: state.currency, lang: state.lang } }));
  }
  function setState(patch) { Object.assign(state, patch); save(); }

  function money(usd) {
    const r = RATES[state.currency] || RATES.USD;
    const value = usd * r.rate;
    const digits = state.currency === 'JPY' ? 0 : 2;
    try {
      return new Intl.NumberFormat(r.locale, { style: 'currency', currency: state.currency, minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);
    } catch (e) {
      return '$' + value.toFixed(2);
    }
  }

  function cartLines() {
    return state.cart.map(function (line) {
      const p = DATA.byId(line.id);
      return p && p.launch ? { p: p, qty: line.qty } : null;
    }).filter(Boolean);
  }
  function cartCount() { return cartLines().reduce(function (n, l) { return n + l.qty; }, 0); }
  function cartTotal() { return cartLines().reduce(function (n, l) { return n + l.p.price * l.qty; }, 0); }

  function isWished(id) { return state.wishlist.indexOf(id) > -1; }

  function addToCart(id, qty, opts) {
    const p = DATA.byId(id);
    if (!p) return;
    if (!p.launch) {
      toast(p.name + ' — ' + t('card.indexOnly'), { href: 'shop.html?launch=1', label: t('nav.available') });
      return;
    }
    qty = Math.max(1, parseInt(qty || 1, 10));
    const found = state.cart.filter(function (l) { return l.id === id; })[0];
    if (found) found.qty = Math.min(20, found.qty + qty);
    else state.cart.push({ id: id, qty: qty });
    save();
    renderCart();
    updateBadges();
    bumpCart();
    if (!opts || opts.open !== false) openDrawer('cart');
    toast(p.name + ' — ' + t('common.added'));
  }

  function setQty(id, qty) {
    qty = parseInt(qty, 10);
    if (isNaN(qty) || qty < 1) { removeFromCart(id); return; }
    const line = state.cart.filter(function (l) { return l.id === id; })[0];
    if (line) { line.qty = Math.min(20, qty); save(); renderCart(); updateBadges(); }
  }
  function removeFromCart(id) {
    state.cart = state.cart.filter(function (l) { return l.id !== id; });
    save(); renderCart(); updateBadges();
  }
  function toggleWish(id) {
    if (isWished(id)) state.wishlist = state.wishlist.filter(function (x) { return x !== id; });
    else state.wishlist.push(id);
    save();
    document.querySelectorAll('[data-wish="' + id + '"]').forEach(function (b) {
      b.classList.toggle('is-on', isWished(id));
      b.setAttribute('aria-pressed', isWished(id) ? 'true' : 'false');
    });
    renderWishlist();
    updateBadges();
    toast(isWished(id) ? '♥ ' + t('wish.saved') : '♡');
  }

  function updateBadges() {
    const cc = cartCount();
    document.querySelectorAll('[data-cart-count]').forEach(function (el) { el.textContent = cc; el.classList.toggle('is-zero', cc === 0); });
    document.querySelectorAll('[data-wish-count]').forEach(function (el) { el.textContent = state.wishlist.length; el.classList.toggle('is-zero', state.wishlist.length === 0); });
    const cur = document.querySelectorAll('[data-currency-label]');
    cur.forEach(function (el) { el.textContent = state.currency; });
    const langBtn = document.querySelectorAll('[data-lang-label]');
    langBtn.forEach(function (el) { el.textContent = state.lang === 'en' ? '中文' : 'EN'; });
    document.querySelectorAll('[data-currency-option]').forEach(function (b) {
      b.classList.toggle('is-active', b.getAttribute('data-currency-option') === state.currency);
    });
    document.querySelectorAll('[data-currency-select]').forEach(function (s) { s.value = state.currency; });
  }

  function bumpCart() {
    document.querySelectorAll('[data-open-cart]').forEach(function (el) {
      el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
    });
  }

  let toastTimer = null;
  function toast(msg, action) {
    let el = document.getElementById('toast');
    if (!el) return;
    el.innerHTML = '<span>' + esc(msg) + '</span>' + (action ? '<a href="' + action.href + '">' + esc(action.label) + '</a>' : '');
    el.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('is-on'); }, 3200);
  }

  function icon(name, cls) {
    const icons = {
      search: '<circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/>',
      bag: '<path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
      heart: '<path d="M12 20s-7-4.4-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.6-7 9-7 9Z"/>',
      close: '<path d="m6 6 12 12M18 6 6 18"/>',
      plus: '<path d="M12 5v14M5 12h14"/>',
      minus: '<path d="M5 12h14"/>',
      arrow: '<path d="M4 12h16M14 6l6 6-6 6"/>',
      chevron: '<path d="m8 10 4 4 4-4"/>',
      menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
      truck: '<path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/>',
      shield: '<path d="M12 3 5 6v5c0 4 3 7.4 7 9 4-1.6 7-5 7-9V6l-7-3Z"/><path d="m9 12 2 2 4-4"/>',
      return: '<path d="M4 10h10a5 5 0 0 1 0 10H8"/><path d="m8 6-4 4 4 4"/>',
      globe: '<circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c2.5 2.4 3.6 5.2 3.6 8s-1.1 5.6-3.6 8c-2.5-2.4-3.6-5.2-3.6-8S9.5 6.4 12 4Z"/>',
      star: '<path d="m12 3 2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L3.4 9.3l6-.8L12 3Z"/>',
      check: '<path d="m5 12 4 4L19 6"/>',
      spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/>',
      play: '<path d="m8 5 11 7-11 7V5Z"/>',
      info: '<circle cx="12" cy="12" r="8"/><path d="M12 11v5M12 8h.01"/>',
      filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
      share: '<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="m8.2 11 7.6-3.8M8.2 13l7.6 3.8"/>',
      trash: '<path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12"/>'
    };
    return '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (icons[name] || '') + '</svg>';
  }

  function platformDots(p) {
    return '<span class="plats">' + p.platforms.map(function (id) {
      return '<span class="plat plat-' + id + '" title="' + DATA.platforms[id].name + '">' + DATA.platforms[id].short + '</span>';
    }).join('') + '</span>';
  }

  function ratingStars(r) {
    return '<span class="stars" aria-label="' + r + ' out of 5">' + icon('star') + '<b>' + r.toFixed(1) + '</b></span>';
  }

  function priceHTML(p) {
    return '<span class="price">' + money(p.price) + '</span>' +
      (p.compareAt ? '<s class="was">' + money(p.compareAt) + '</s>' : '');
  }

  function productCard(p, opts) {
    opts = opts || {};
    const tone = DATA.tones[p.tone];
    const photoMeta = ART.credit(p);
    return '<article class="product-card ' + (opts.className || '') + (p.launch ? '' : ' is-index') + (ART.hasPhoto(p) ? ' has-photo' : '') + (ART.layout(p) === 'lifestyle' ? ' photo-lifestyle' : '') + '" style="--tone-bg:' + tone.bg + ';--tone:' + tone.body + ';--tone-deep:' + tone.deep + ';--photo-bg:' + ((photoMeta && photoMeta.bg) || '#F7F3EA') + '">' +
      '<div class="card-art">' +
      '<a class="art-link" href="product.html?id=' + p.id + '" aria-label="' + esc(p.name) + '"></a>' +
      '<span class="rank-badge">' + (opts.bigRank ? '<i>No.</i>' + String(p.rank).padStart(2, '0') : '#' + p.rank) + '</span>' +
      platformDots(p) +
      '<button class="wish ' + (isWished(p.id) ? 'is-on' : '') + '" data-wish="' + p.id + '" aria-label="Save ' + esc(p.name) + '" aria-pressed="' + isWished(p.id) + '">' + icon('heart') + '</button>' +
      ART.art(p) +
      '</div>' +
      '<div class="card-body">' +
      '<div class="card-meta"><span class="brand">' + esc(p.brand) + '</span>' + ratingStars(p.rating) + '</div>' +
      '<h3 class="card-name"><a href="product.html?id=' + p.id + '">' + esc(p.name) + '</a></h3>' +
      '<p class="card-tagline">' + esc(p.tagline) + '</p>' +
      '<div class="card-foot">' +
      '<div class="card-price">' + priceHTML(p) + '</div>' +
      (p.launch
        ? '<button class="add-mini" data-add="' + p.id + '" aria-label="Add ' + esc(p.name) + ' to bag">' + icon('plus') + '</button>'
        : '<span class="index-flag">' + t('card.indexOnly') + '</span>') +
      '</div>' +
      '<div class="card-demand"><span>' + icon('spark') + ' ' + p.units.toLocaleString('en-US') + ' ' + t('common.sold') + '</span><span>' + p.year + '</span></div>' +
      '</div>' +
      '</article>';
  }

  function headerHTML() {
    const path = (location.pathname.split('/').pop() || 'index.html');
    const link = function (href, key, extra) {
      const parts = href.split('?');
      const active = parts[0] === path && (!parts[1] || location.search.indexOf(parts[1]) > -1) ? ' aria-current="page"' : '';
      return '<a href="' + href + '"' + active + (extra || '') + '>' + t(key) + '</a>';
    };
    return '<a class="skip" href="#main">Skip to content</a>' +
      '<div class="announce"><div class="marquee" aria-hidden="true"><div class="marquee-track">' +
      [1, 2, 3, 4, 1, 2, 3, 4].map(function (i) { return '<span>' + icon('spark') + t('announce.' + i) + '</span>'; }).join('') +
      '</div></div></div>' +
      '<header class="site-header">' +
      '<a class="brand" href="index.html" aria-label="BOTIQUE home"><span class="brand-word">BOTIQUE</span><span class="brand-dot"></span><sup>®</sup></a>' +
      '<nav class="main-nav" aria-label="Primary">' +
      link('shop.html?launch=1', 'nav.available') +
      link('ranking.html', 'nav.ranking') +
      '<a href="shop.html?cat=companion">' + t('nav.companions') + '</a>' +
      '<a href="shop.html?cat=pets">' + t('nav.pets') + '</a>' +
      '<a href="shop.html?cat=stem">' + t('nav.stem') + '</a>' +
      '<a href="shop.html?cat=rc">' + t('nav.drones') + '</a>' +
      '</nav>' +
      '<div class="header-actions">' +
      '<button class="icon-btn search-btn" data-open-search aria-label="' + t('nav.search') + '">' + icon('search') + '<span class="hide-sm">' + t('nav.search') + '</span></button>' +
      '<div class="pop-wrap"><button class="pill-btn" data-open-pop="currency" aria-label="' + t('header.currency') + '"><span data-currency-label>' + state.currency + '</span>' + icon('chevron') + '</button>' +
      '<div class="pop" data-pop="currency"><p class="pop-title">' + t('header.currency') + '</p><div class="currency-grid">' +
      Object.keys(RATES).map(function (c) { return '<button data-currency-option="' + c + '" class="currency-opt"><b>' + c + '</b><span>' + RATES[c].label + '</span></button>'; }).join('') +
      '</div><p class="pop-fine">Rates are indicative · updated Nov 2026</p></div></div>' +
      '<button class="pill-btn lang-btn" data-toggle-lang aria-label="' + t('header.language') + '"><span data-lang-label>' + (state.lang === 'en' ? '中文' : 'EN') + '</span></button>' +
      '<button class="icon-btn wish-btn" data-open-wishlist aria-label="' + t('wish.title') + '">' + icon('heart') + '<span class="count" data-wish-count>' + state.wishlist.length + '</span></button>' +
      '<button class="bag-btn" data-open-cart aria-label="' + t('cart.title') + '">' + icon('bag') + '<span class="hide-sm">' + t('nav.bag') + '</span><span class="count" data-cart-count>' + cartCount() + '</span></button>' +
      '<button class="icon-btn menu-btn" data-open-menu aria-label="' + t('nav.menu') + '">' + icon('menu') + '</button>' +
      '</div></header>';
  }

  function footerHTML() {
    return '<footer class="site-footer">' +
      '<div class="footer-top">' +
      '<div class="footer-brand"><a class="brand" href="index.html"><span class="brand-word">BOTIQUE</span><span class="brand-dot"></span><sup>®</sup></a>' +
      '<p>' + t('footer.tagline') + '</p><div class="footer-socials"><a href="#" aria-label="TikTok">TikTok</a><a href="#" aria-label="Instagram">Instagram</a><a href="#" aria-label="YouTube">YouTube</a></div></div>' +
      '<div class="footer-col"><h4>' + t('footer.shop') + '</h4><a href="shop.html">' + t('footer.all') + '</a><a href="shop.html?sort=rank">' + t('footer.best') + '</a><a href="shop.html?sort=new">' + t('footer.new') + '</a><a href="index.html#gift">' + t('footer.gift') + '</a></div>' +
      '<div class="footer-col"><h4>' + t('footer.company') + '</h4><a href="index.html#standard">' + t('footer.standard') + '</a><a href="ranking.html">' + t('footer.method') + '</a><a href="guide.html">' + t('footer.guide') + '</a><a href="mailto:hello@botique.shop">' + t('footer.contact') + '</a></div>' +
      '<div class="footer-col"><h4>' + t('footer.support') + '</h4><a href="policies.html?p=shipping">' + t('footer.shipping') + '</a><a href="policies.html?p=returns">' + t('footer.returns') + '</a><a href="policies.html?p=warranty">' + t('footer.warranty') + '</a><a href="policies.html?p=track">' + t('footer.track') + '</a></div>' +
      '</div>' +
      '<div class="footer-mid"><div class="foot-locale"><span class="select-pill">' + icon('globe') + '<select class="currency-select" data-currency-select aria-label="' + t('header.currency') + '">' +
      Object.keys(RATES).map(function (c) { return '<option value="' + c + '"' + (state.currency === c ? ' selected' : '') + '>' + c + '</option>'; }).join('') +
      '</select></span><button class="pill-btn" data-toggle-lang><span data-lang-label>' + (state.lang === 'en' ? '中文' : 'EN') + '</span></button></div>' +
      '<div class="pay-row"><span>' + t('footer.payments') + '</span><i>VISA</i><i>Mastercard</i><i>AMEX</i><i>PayPal</i><i>Apple Pay</i><i>Klarna</i></div></div>' +
      '<div class="footer-legal"><p>' + t('footer.rights') + '</p><nav><a href="policies.html?p=privacy">' + t('footer.privacy') + '</a><a href="policies.html?p=terms">' + t('footer.terms') + '</a><a href="policies.html?p=cookies">' + t('footer.cookies') + '</a><a href="policies.html?p=access">' + t('footer.access') + '</a></nav></div>' +
      '<p class="footer-disclaimer">' + t('footer.disclaimer') + '</p>' +
      '</footer>';
  }

  function overlaysHTML() {
    return '<div class="scrim" data-scrim></div>' +
      '<aside class="drawer" id="cart-drawer" aria-label="' + t('cart.title') + '" aria-hidden="true">' +
      '<div class="drawer-head"><h2>' + t('cart.title') + ' <span class="drawer-count" data-cart-count>' + cartCount() + '</span></h2><button class="icon-btn" data-close-drawer aria-label="' + t('common.close') + '">' + icon('close') + '</button></div>' +
      '<div class="drawer-body" id="cart-body"></div></aside>' +
      '<aside class="drawer" id="wish-drawer" aria-label="' + t('wish.title') + '" aria-hidden="true">' +
      '<div class="drawer-head"><h2>' + t('wish.title') + ' <span class="drawer-count" data-wish-count>' + state.wishlist.length + '</span></h2><button class="icon-btn" data-close-drawer aria-label="' + t('common.close') + '">' + icon('close') + '</button></div>' +
      '<div class="drawer-body" id="wish-body"></div></aside>' +
      '<div class="search-overlay" id="search-overlay" aria-hidden="true"><div class="search-inner">' +
      '<div class="search-top"><span class="kicker">' + t('search.title') + '</span><button class="icon-btn" data-close-search aria-label="' + t('common.close') + '">' + icon('close') + '</button></div>' +
      '<div class="search-field">' + icon('search') + '<input id="search-input" type="search" placeholder="' + t('search.placeholder') + '" autocomplete="off" aria-label="' + t('nav.search') + '"><kbd>Esc</kbd></div>' +
      '<div class="search-results" id="search-results"></div></div></div>' +
      '<div class="menu-overlay" id="menu-overlay" aria-hidden="true"><div class="menu-panel">' +
      '<div class="menu-head"><a class="brand" href="index.html"><span class="brand-word">BOTIQUE</span><span class="brand-dot"></span></a><button class="icon-btn" data-close-menu aria-label="' + t('common.close') + '">' + icon('close') + '</button></div>' +
      '<nav class="menu-links"><a href="shop.html?launch=1">' + t('nav.available') + ' <span>' + DATA.launchCount + '</span></a><a href="shop.html">' + t('nav.shop') + ' <span>100</span></a><a href="ranking.html">' + t('nav.ranking') + ' <span>Data</span></a>' +
      '<a href="#" data-open-wishlist>' + t('wish.title') + ' <span data-wish-count>' + state.wishlist.length + '</span></a>' +
      DATA.categories.map(function (c) { return '<a href="shop.html?cat=' + c.id + '">' + (state.lang === 'zh' ? c.zh : c.name) + ' <span>' + DATA.byCat(c.id).length + '</span></a>'; }).join('') +
      '<a href="guide.html">' + t('nav.guide') + '</a></nav>' +
      '<div class="menu-foot"><button class="pill-btn" data-toggle-lang><span data-lang-label>' + (state.lang === 'en' ? '中文' : 'EN') + '</span></button><span class="select-pill">' + icon('globe') + '<select class="currency-select" data-currency-select aria-label="' + t('header.currency') + '">' +
      Object.keys(RATES).map(function (c) { return '<option value="' + c + '"' + (state.currency === c ? ' selected' : '') + '>' + c + '</option>'; }).join('') +
      '</select></span></div>' +
      '</div></div>' +
      '<div class="toast" id="toast" role="status" aria-live="polite"></div>' +
      '<div class="gift-modal" id="gift-modal" aria-hidden="true"></div>';
  }

  function renderCart() {
    const body = document.getElementById('cart-body');
    if (!body) return;
    const lines = cartLines();
    const total = cartTotal();
    if (!lines.length) {
      body.innerHTML = '<div class="empty-state">' + ART.art(DATA.products[2]) + '<h3>' + t('cart.empty') + '</h3><a class="btn btn-dark" href="shop.html?launch=1" data-close-drawer>' + t('cart.emptyCta') + '</a></div>';
      return;
    }
    const rest = Math.max(0, FREE_SHIP - total);
    body.innerHTML = '<div class="ship-meter"><div class="ship-track"><span style="width:' + Math.min(100, (total / FREE_SHIP) * 100) + '%"></span></div><p>' +
      (rest > 0 ? t('cart.freeProgress', { amount: money(rest) }) : icon('check') + ' ' + t('cart.freeUnlocked')) + '</p></div>' +
      '<div class="cart-lines">' + lines.map(function (l) {
        const tone = DATA.tones[l.p.tone];
        return '<div class="cart-line"><a class="cart-thumb" href="product.html?id=' + l.p.id + '" style="background:' + tone.bg + '">' + ART.art(l.p) + '</a>' +
          '<div class="cart-info"><a class="cart-name" href="product.html?id=' + l.p.id + '">' + esc(l.p.name) + '</a><span class="cart-brand">' + esc(l.p.brand) + '</span>' +
          '<div class="cart-row"><div class="qty" data-qty-wrap="' + l.p.id + '"><button data-qty="' + (l.qty - 1) + '" data-id="' + l.p.id + '" aria-label="Decrease">' + icon('minus') + '</button><span>' + l.qty + '</span><button data-qty="' + (l.qty + 1) + '" data-id="' + l.p.id + '" aria-label="Increase">' + icon('plus') + '</button></div>' +
          '<b class="cart-price">' + money(l.p.price * l.qty) + '</b></div></div>' +
          '<button class="remove" data-remove="' + l.p.id + '" aria-label="' + t('cart.remove') + '">' + icon('trash') + '</button></div>';
      }).join('') + '</div>' +
      '<div class="cart-foot"><div class="cart-sub"><span>' + t('cart.subtotal') + '</span><b>' + money(total) + '</b></div><p class="fine">' + t('cart.shippingNote') + '</p>' +
      '<a class="btn btn-lime btn-full" href="checkout.html">' + t('cart.checkout') + ' ' + icon('arrow') + '</a>' +
      '<button class="link-btn" data-close-drawer>' + t('cart.continue') + '</button>' +
      '<div class="pay-mini">VISA · Mastercard · AMEX · PayPal · Apple Pay</div></div>';
  }

  function renderWishlist() {
    const body = document.getElementById('wish-body');
    if (!body) return;
    const items = state.wishlist.map(function (id) { return DATA.byId(id); }).filter(Boolean);
    if (!items.length) {
      body.innerHTML = '<div class="empty-state">' + ART.art(DATA.products[5]) + '<h3>' + t('wish.empty') + '</h3><a class="btn btn-dark" href="shop.html?launch=1" data-close-drawer>' + t('wish.emptyCta') + '</a></div>';
      return;
    }
    body.innerHTML = '<div class="wish-list">' + items.map(function (p) {
      const tone = DATA.tones[p.tone];
      return '<div class="wish-line"><a class="cart-thumb" href="product.html?id=' + p.id + '" style="background:' + tone.bg + '">' + ART.art(p) + '</a>' +
        '<div class="cart-info"><a class="cart-name" href="product.html?id=' + p.id + '">' + esc(p.name) + '</a><span class="cart-brand">' + esc(p.brand) + '</span><b class="cart-price">' + money(p.price) + '</b></div>' +
        '<div class="wish-actions"><button class="btn btn-dark btn-xs" data-add="' + p.id + '">' + t('wish.add') + '</button><button class="remove" data-wish="' + p.id + '" aria-label="' + t('cart.remove') + '">' + icon('close') + '</button></div></div>';
    }).join('') + '</div>';
  }

  function openDrawer(which) {
    closeAll();
    const el = document.getElementById(which === 'wish' ? 'wish-drawer' : 'cart-drawer');
    if (!el) return;
    el.classList.add('is-open');
    el.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    const scrim = document.querySelector('[data-scrim]');
    if (scrim) scrim.classList.add('is-on');
    if (which === 'wish') renderWishlist();
  }
  function closeAll() {
    document.querySelectorAll('.drawer.is-open').forEach(function (el) { el.classList.remove('is-open'); el.setAttribute('aria-hidden', 'true'); });
    document.querySelectorAll('.pop.is-open').forEach(function (el) { el.classList.remove('is-open'); });
    const scrim = document.querySelector('[data-scrim]');
    if (scrim) scrim.classList.remove('is-on');
    const so = document.getElementById('search-overlay');
    if (so) { so.classList.remove('is-open'); so.setAttribute('aria-hidden', 'true'); }
    const mo = document.getElementById('menu-overlay');
    if (mo) { mo.classList.remove('is-open'); mo.setAttribute('aria-hidden', 'true'); }
    const gm = document.getElementById('gift-modal');
    if (gm) { gm.classList.remove('is-open'); gm.setAttribute('aria-hidden', 'true'); }
    document.body.classList.remove('no-scroll');
  }

  function openSearch() {
    closeAll();
    const so = document.getElementById('search-overlay');
    if (!so) return;
    so.classList.add('is-open');
    so.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    const input = document.getElementById('search-input');
    setTimeout(function () { if (input) input.focus(); }, 30);
    renderSearch('');
  }
  function closeSearch() {
    const so = document.getElementById('search-overlay');
    if (so) { so.classList.remove('is-open'); so.setAttribute('aria-hidden', 'true'); }
    document.body.classList.remove('no-scroll');
  }

  function searchProducts(q) {
    q = (q || '').trim().toLowerCase();
    if (!q) return [];
    const words = q.split(/\s+/).filter(Boolean);
    return DATA.products.map(function (p) {
      const hay = (p.name + ' ' + p.brand + ' ' + p.tagline + ' ' + p.cat + ' ' + (DATA.tones[p.tone] || {}).name).toLowerCase();
      let score = 0;
      words.forEach(function (w) {
        if (p.name.toLowerCase().indexOf(w) > -1) score += 6;
        if (p.brand.toLowerCase().indexOf(w) > -1) score += 4;
        if (hay.indexOf(w) > -1) score += 2;
      });
      if (hay.indexOf(q) > -1) score += 3;
      return { p: p, score: score };
    }).filter(function (x) { return x.score > 0; }).sort(function (a, b) { return b.score - a.score || a.p.rank - b.p.rank; }).map(function (x) { return x.p; });
  }

  function renderSearch(q) {
    const box = document.getElementById('search-results');
    if (!box) return;
    const results = searchProducts(q);
    if (!q) {
      box.innerHTML = '<p class="search-label">' + t('search.popular') + '</p><div class="search-chips">' +
        ['Eilik', 'Robot dog', 'Under $100', 'Plush', 'STEM', 'TikTok'].map(function (x) { return '<button data-search-chip="' + x + '">' + x + '</button>'; }).join('') + '</div>' +
        '<div class="search-feature">' + DATA.top(3).map(function (p) {
          return '<a href="product.html?id=' + p.id + '"><span>#' + p.rank + '</span><b>' + esc(p.name) + '</b><em>' + money(p.price) + '</em></a>';
        }).join('') + '</div>';
      return;
    }
    if (!results.length) { box.innerHTML = '<p class="search-empty">' + t('search.noresults') + '</p>'; return; }
    box.innerHTML = '<div class="search-list">' + results.slice(0, 7).map(function (p) {
      return '<a class="search-row" href="product.html?id=' + p.id + '"><span class="search-rank">#' + p.rank + '</span><span class="search-art" style="background:' + DATA.tones[p.tone].bg + '">' + ART.art(p) + '</span><span class="search-txt"><b>' + esc(p.name) + '</b><em>' + esc(p.brand) + ' · ' + esc(p.tagline) + '</em></span><span class="search-price">' + money(p.price) + '</span></a>';
    }).join('') + '</div>' +
      '<a class="search-all" href="shop.html?q=' + encodeURIComponent(q) + '">' + t('search.viewall') + ' ' + icon('arrow') + '</a>';
  }

  function toggleLang() {
    closeAll();
    state.lang = state.lang === 'en' ? 'zh' : 'en';
    save();
    document.documentElement.lang = state.lang === 'zh' ? 'zh-CN' : 'en';
    translatePage();
    renderHeader();
    renderFooter();
    const si = document.getElementById('search-input');
    if (si) si.setAttribute('placeholder', t('search.placeholder'));
    const st = document.querySelector('.search-top .kicker');
    if (st) st.textContent = t('search.title');
    renderCart();
    renderWishlist();
    updateBadges();
    toast(state.lang === 'zh' ? '已切换为中文' : 'Switched to English');
    document.dispatchEvent(new CustomEvent('botique:lang', { detail: { lang: state.lang } }));
  }

  function setCurrency(c) {
    if (!RATES[c]) return;
    state.currency = c;
    save();
    updateBadges();
    renderCart();
    renderWishlist();
    closeAll();
    document.dispatchEvent(new CustomEvent('botique:currency', { detail: { currency: c } }));
    toast(c + ' · ' + RATES[c].label);
  }

  function translatePage() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      const key = el.getAttribute('data-i18n');
      const val = t(key);
      if (val !== key) el.innerHTML = val;
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
      el.setAttribute('placeholder', t(el.getAttribute('data-i18n-ph')));
    });
  }

  function hydrateIcons(root) {
    (root || document).querySelectorAll('[data-icon]').forEach(function (el) {
      const name = el.getAttribute('data-icon');
      el.innerHTML = icon(name);
      el.removeAttribute('data-icon');
    });
  }

  function renderHeader() {
    const host = document.getElementById('site-header');
    if (!host) return;
    host.innerHTML = headerHTML();
    hydrateIcons(host);
    updateBadges();
  }
  function renderFooter() {
    const host = document.getElementById('site-footer');
    if (host) {
      host.innerHTML = footerHTML();
      hydrateIcons(host);
    }
  }

  function init() {
    const query = new URLSearchParams(location.search);
    if (I18N[query.get('lang')]) state.lang = query.get('lang');
    if (RATES[query.get('currency')]) state.currency = query.get('currency');
    const header = document.getElementById('site-header');
    if (header) header.innerHTML = headerHTML();
    renderFooter();
    if (!document.getElementById('cart-drawer')) {
      const div = document.createElement('div');
      div.innerHTML = overlaysHTML();
      while (div.firstChild) document.body.appendChild(div.firstChild);
    }
    document.documentElement.lang = state.lang === 'zh' ? 'zh-CN' : 'en';
    translatePage();
    hydrateIcons(document);
    renderCart();
    renderWishlist();
    bind();
    const preview = new URLSearchParams(location.search).get('preview');
    if (preview === 'cart') {
      if (!state.cart.length) {
        state.cart = [{ id: 'eilik', qty: 1 }, { id: 'moflin', qty: 1 }];
        save(); renderCart(); updateBadges();
      }
      setTimeout(function () { openDrawer('cart'); }, 80);
    }
    if (new URLSearchParams(location.search).get('search') === '1') {
      setTimeout(openSearch, 80);
    }
  }

  let bound = false;
  function bind() {
    if (bound) return;
    bound = true;
    document.addEventListener('click', function (e) {
      const add = e.target.closest('[data-add]');
      if (add) { e.preventDefault(); addToCart(add.getAttribute('data-add'), 1); return; }
      const wish = e.target.closest('[data-wish]');
      if (wish && !wish.hasAttribute('data-add')) { e.preventDefault(); toggleWish(wish.getAttribute('data-wish')); return; }
      const rm = e.target.closest('[data-remove]');
      if (rm) { e.preventDefault(); removeFromCart(rm.getAttribute('data-remove')); return; }
      const qty = e.target.closest('[data-qty]');
      if (qty) { e.preventDefault(); setQty(qty.getAttribute('data-id'), qty.getAttribute('data-qty')); return; }
      if (e.target.closest('[data-open-cart]')) { e.preventDefault(); openDrawer('cart'); return; }
      if (e.target.closest('[data-open-wishlist]')) { e.preventDefault(); openDrawer('wish'); return; }
      if (e.target.closest('[data-open-search]')) { e.preventDefault(); openSearch(); return; }
      if (e.target.closest('[data-close-search]')) { closeSearch(); return; }
      if (e.target.closest('[data-close-drawer]')) { closeAll(); return; }
      if (e.target.closest('[data-open-menu]')) { e.preventDefault(); closeAll(); document.getElementById('menu-overlay').classList.add('is-open'); document.getElementById('menu-overlay').setAttribute('aria-hidden', 'false'); document.body.classList.add('no-scroll'); return; }
      if (e.target.closest('[data-close-menu]')) { closeAll(); return; }
      if (e.target.closest('[data-toggle-lang]')) { e.preventDefault(); toggleLang(); return; }
      if (e.target.closest('[data-scrim]')) { closeAll(); return; }
      const popBtn = e.target.closest('[data-open-pop]');
      if (popBtn) {
        e.preventDefault();
        const name = popBtn.getAttribute('data-open-pop');
        const pop = document.querySelector('.pop[data-pop="' + name + '"]');
        const was = pop && pop.classList.contains('is-open');
        document.querySelectorAll('.pop.is-open').forEach(function (x) { x.classList.remove('is-open'); });
        if (pop && !was) pop.classList.add('is-open');
        return;
      }
      const cur = e.target.closest('[data-currency-option]');
      if (cur) { setCurrency(cur.getAttribute('data-currency-option')); return; }
      const chip = e.target.closest('[data-search-chip]');
      if (chip) {
        const v = chip.getAttribute('data-search-chip');
        if (v === 'Under $100') { location.href = 'shop.html?max=100'; return; }
        if (v === 'Robot dog') { location.href = 'shop.html?cat=dogs'; return; }
        if (v === 'Plush') { location.href = 'shop.html?cat=pets'; return; }
        if (v === 'STEM') { location.href = 'shop.html?cat=stem'; return; }
        if (v === 'TikTok') { location.href = 'shop.html?platform=tiktok'; return; }
        const input = document.getElementById('search-input');
        if (input) { input.value = v; renderSearch(v); }
        return;
      }
    });
    document.addEventListener('input', function (e) {
      if (e.target && e.target.id === 'search-input') renderSearch(e.target.value);
    });
    document.addEventListener('change', function (e) {
      if (e.target && e.target.matches('[data-currency-select]')) setCurrency(e.target.value);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeAll(); closeSearch(); }
      if (e.key === '/' && !/input|textarea|select/i.test(document.activeElement.tagName)) { e.preventDefault(); openSearch(); }
      if (e.key === 'Enter' && document.activeElement && document.activeElement.id === 'search-input') {
        const q = document.activeElement.value.trim();
        if (q) location.href = 'shop.html?q=' + encodeURIComponent(q);
      }
    });
    document.querySelectorAll('form[data-newsletter]').forEach(function (f) {
      f.addEventListener('submit', function (e) { e.preventDefault(); f.reset(); toast(t('common.subscribed')); });
    });
  }

  function initNewsletter() {
    document.querySelectorAll('[data-newsletter]').forEach(function (form) {
      form.addEventListener('submit', function (e) { e.preventDefault(); form.reset(); toast(t('common.subscribed')); });
    });
  }

  // Shipping helper shared by product + checkout
  function shippingFor(code, subtotal) {
    const s = SHIPPING[code] || SHIPPING.US;
    const free = subtotal >= FREE_SHIP;
    return {
      code: code,
      standard: free ? 0 : s.rate,
      express: s.express,
      eta: s.eta,
      expressEta: s.expressEta,
      free: free,
      zone: s.zone
    };
  }
  function deliveryWindow(days) {
    const fmt = function (d) { return d.toLocaleDateString(state.lang === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric' }); };
    const a = new Date(); a.setDate(a.getDate() + days[0]);
    const b = new Date(); b.setDate(b.getDate() + days[1]);
    return fmt(a) + ' – ' + fmt(b);
  }

  function emptyArt() { return ART.art(DATA.products[2]); }

  global.BOTIQUE = {
    init: init,
    t: t,
    money: money,
    esc: esc,
    icon: icon,
    art: ART.art,
    productCard: productCard,
    platformDots: platformDots,
    ratingStars: ratingStars,
    priceHTML: priceHTML,
    addToCart: addToCart,
    setQty: setQty,
    removeFromCart: removeFromCart,
    toggleWish: toggleWish,
    isWished: isWished,
    openDrawer: openDrawer,
    closeAll: closeAll,
    openSearch: openSearch,
    toast: toast,
    cartLines: cartLines,
    cartCount: cartCount,
    cartTotal: cartTotal,
    cartTotalUSD: cartTotal,
    isLaunch: function (p) { return !!(p && p.launch); },
    FREE_SHIP: FREE_SHIP,
    shippingFor: shippingFor,
    deliveryWindow: deliveryWindow,
    moneyRate: function () { return RATES[state.currency].rate; },
    state: state,
    save: save,
    renderCart: renderCart,
    renderWishlist: renderWishlist,
    updateBadges: updateBadges,
    renderHeader: renderHeader,
    translatePage: translatePage,
    searchProducts: searchProducts,
    initNewsletter: initNewsletter,
    SHIPPING: SHIPPING,
    RATES: RATES,
    CONFIG: CONFIG
  };
})(typeof window !== 'undefined' ? window : globalThis);
