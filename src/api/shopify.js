let cachedProducts = null

// ---- Helper Utilities (from Pro Guides) ----
function getDiscountedPrice(basePrice, discountPercentage) {
  if (!discountPercentage) return null
  const originalPrice = basePrice / (1 - discountPercentage / 100)
  return parseFloat(originalPrice.toFixed(2))
}

const IMAGE_POOLS = {
  tops: [
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518',
    'https://images.unsplash.com/photo-1598033129183-c4f50c717658',
    'https://images.unsplash.com/photo-1614252235316-8c8ec6d812ce',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f',
    'https://images.unsplash.com/photo-1554568218-0f1715e72254',
    'https://images.unsplash.com/photo-1503341455253-bfe4b6138d48'
  ],
  bottoms: [
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246',
    'https://images.unsplash.com/photo-1552902865-b72c031ac5ea',
    'https://images.unsplash.com/photo-1583337130417-3346a1be7dee',
    'https://images.unsplash.com/photo-1624372333716-2f046184bb7d',
    'https://images.unsplash.com/photo-1506629082925-27632669619a'
  ],
  dresses: [
    'https://images.unsplash.com/photo-1496747611176-843222e1e57c',
    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1',
    'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2'
  ],
  outerwear: [
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea',
    'https://images.unsplash.com/photo-1539109136881-3be0616acf4b',
    'https://images.unsplash.com/photo-1604176354204-926873ff3da9',
    'https://images.unsplash.com/photo-1591195853828-11db59a44f6b'
  ],
  general: [
    'https://images.unsplash.com/photo-1483985988355-763728e1935b',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d',
    'https://images.unsplash.com/photo-1445205170230-053b830c6050'
  ]
}

export function getFallbackImage(seed = '1', category = 'general') {
  const pool = IMAGE_POOLS[category] || IMAGE_POOLS.general
  // Stable random selection based on seed string
  let hash = 0
  const str = String(seed)
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  const index = Math.abs(hash) % pool.length
  return `${pool[index]}?w=800&q=80`
}

// ---- API 1: DummyJSON (Professional Logic) ----
async function fetchFromDummyJSON() {
  const categories = ['womens-dresses', 'womens-tops', 'mens-shirts', 'tops']
  const results = await Promise.all(
    categories.map(cat =>
      fetch(`https://dummyjson.com/products/category/${cat}?limit=10`)
        .then(r => r.json()).then(d => d.products || []).catch(() => [])
    )
  )
  const all = results.flat()
  if (all.length === 0) throw new Error('DummyJSON failed')

  return all.map(item => normalizeProduct('dummyjson', item.id, {
    title: item.title,
    description: item.description,
    brand: item.brand || 'DRIP',
    price: item.price,
    compareAtPrice: getDiscountedPrice(item.price, item.discountPercentage),
    rating: item.rating,
    stock: item.stock,
    category: item.category?.includes('women') ? 'dresses' : 'tops',
    tag: item.stock < 10 ? 'limited' : (item.rating > 4.5 ? 'bestseller' : 'new'),
    images: [...(item.images || []), item.thumbnail].filter(Boolean),
  }))
}

// ---- API 2: Fake Store (Pro Aggregation) ----
async function fetchFromFakeStore() {
  const categories = ["women's clothing", "men's clothing"]
  const results = await Promise.all(
    categories.map(cat =>
      fetch(`https://fakestoreapi.com/products/category/${cat}`)
        .then(r => r.json()).catch(() => [])
    )
  )
  const all = results.flat()
  if (all.length === 0) throw new Error('FakeStore failed')

  return all.map(item => normalizeProduct('fakestore', item.id, {
    title: item.title,
    description: item.description,
    brand: 'DRIP',
    price: item.price,
    compareAtPrice: (item.price * 1.3).toFixed(2), // Pro-rated markup
    rating: item.rating?.rate || 4.2,
    stock: item.rating?.count || 50,
    category: item.category?.includes('women') ? 'dresses' : 'tops',
    tag: item.rating?.rate > 4.0 ? 'bestseller' : 'new',
    images: [item.image],
  }))
}

// ---- API 3: Platzi Fake Store ----
async function fetchFromPlatzi() {
  const res = await fetch('https://api.escuelajs.co/api/v1/products/?offset=0&limit=20')
  const data = await res.json()
  if (!Array.isArray(data) || data.length === 0) throw new Error('Platzi failed')
  const keywords = ['shirt', 'dress', 'jacket', 'top', 'coat', 'trouser', 'pant', 'blouse', 'skirt', 'sweater', 'hoodie']
  const filtered = data.filter(item =>
    keywords.some(kw =>
      item.title?.toLowerCase().includes(kw) ||
      item.category?.name?.toLowerCase().includes(kw)
    )
  )
  const items = filtered.length > 0 ? filtered : data.slice(0, 10)
  return items.map(item => normalizeProduct('platzi', item.id, {
    title: item.title,
    description: item.description,
    brand: 'DRIP',
    price: parseFloat(item.price),
    compareAtPrice: null,
    rating: (Math.random() * 1.5 + 3.5).toFixed(1),
    stock: Math.floor(Math.random() * 50) + 10,
    category: 'tops',
    tag: 'new',
    images: [
      ...(item.images || []),
      item.thumbnail
    ].filter(Boolean).map(url => url.replace(/[\[\]"\\]/g, '')),
  }))
}

// ---- API 4: GitHub Fashion API ----
async function fetchFromGitHubFashion() {
  const res = await fetch('https://raw.githubusercontent.com/madiha2323/Api/main/data.json')
  const data = await res.json()
  if (!data || typeof data !== 'object') throw new Error('GitHub Fashion API failed')

  const baseUrl = 'https://raw.githubusercontent.com/madiha2323/Api/main/'
  const allItems = []

  // Categorize and fix images
  for (const [key, items] of Object.entries(data)) {
    if (!Array.isArray(items)) continue
    items.forEach(item => {
      let category = 'tops'
      if (key.toLowerCase().includes('pant')) category = 'bottoms'
      if (key.toLowerCase().includes('jacket')) category = 'outerwear'
      if (key.toLowerCase().includes('shoes') || key.toLowerCase().includes('watche')) category = 'accessories'

      let img = item.image || item.img || item.photo
      if (img && img.startsWith('.')) {
        img = baseUrl + img.replace(/^\.\//, '')
      }

      allItems.push({ ...item, category, img })
    })
  }

  if (allItems.length === 0) throw new Error('GitHub Fashion API empty')

  return allItems.map((item, i) => normalizeProduct('github', i, {
    title: item.name || item.title || `Fashion Item ${i + 1}`,
    description: item.description || item.details || 'A carefully crafted fashion piece.',
    brand: item.brand || 'DRIP',
    price: parseFloat(String(item.price).replace('$', '') || 59.99),
    compareAtPrice: null,
    rating: item.rating || (Math.random() * 1.5 + 3.5).toFixed(1),
    stock: item.stock || Math.floor(Math.random() * 50) + 10,
    category: item.category,
    tag: i % 2 === 0 ? 'new' : 'bestseller',
    images: [item.img || getFallbackImage(i, item.category)],
  }))
}

// ---- Normalize all APIs into one consistent shape ----
function normalizeProduct(source, rawId, data) {
  const handle = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')

  // Flatten and clean images
  const rawImages = Array.isArray(data.images) ? data.images : [data.images]
  let cleanImages = rawImages
    .flat()
    .filter(Boolean)
    .map(url => String(url).replace(/[\[\]"\\]/g, '').trim())

  // High-probability check for broken relative links (like GitHub's ./img/...)
  if (cleanImages.length === 0 || cleanImages.some(u => u.startsWith('http://localhost') || u.startsWith('./'))) {
    cleanImages = [getFallbackImage(rawId, data.category)]
  }

  return {
    id: `${source}-${rawId}`,
    title: data.title,
    handle,
    description: data.description,
    brand: data.brand,
    tags: [data.category, data.tag],
    priceRange: {
      minVariantPrice: {
        amount: parseFloat(data.price || 0).toFixed(2),
        currencyCode: 'USD',
      }
    },
    compareAtPrice: data.compareAtPrice ? parseFloat(data.compareAtPrice).toFixed(2) : null,
    rating: parseFloat(data.rating || 0).toFixed(1),
    stock: data.stock || 0,
    images: {
      edges: cleanImages.map(url => ({
        node: { url, altText: data.title }
      }))
    },
    variants: {
      edges: ['XS', 'S', 'M', 'L', 'XL'].map(size => ({
        node: {
          id: `${source}-${rawId}-${size}`,
          title: `${size} / Default`,
          price: {
            amount: parseFloat(data.price || 0).toFixed(2),
            currencyCode: 'USD'
          }
        }
      }))
    },
    source,
  }
}

// ---- Beautiful hardcoded fallback (last resort) ----
const FALLBACK_PRODUCTS = [
  // ---- JACKETS ----
  { id: 'f1', title: 'Soft Wool Coat', handle: 'soft-wool-coat', description: 'A beautifully draped wool-blend coat with a relaxed silhouette.', brand: 'DRIP', tags: ['outerwear', 'new'], priceRange: { minVariantPrice: { amount: '189.00', currencyCode: 'USD' } }, compareAtPrice: '240.00', rating: '4.8', stock: 5, images: { edges: [{ node: { url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&q=80', altText: 'Soft Wool Coat' } }] }, variants: { edges: ['S', 'M', 'L'].map(s => ({ node: { id: `f1-${s}`, title: `${s} / Camel`, price: { amount: '189.00', currencyCode: 'USD' } } })) }, source: 'fallback' },

  // ---- PREMIUM OUTERWEAR COLLECTION (Pexels Editorial) ----
  {
    id: 'f-out-1',
    title: 'Cobalt Leather Muse',
    handle: 'cobalt-leather-muse',
    description: 'A striking cobalt blue leather jacket that redefines modern edge and editorial sophistication.',
    brand: 'DRIP',
    tags: ['outerwear', 'new'],
    priceRange: { minVariantPrice: { amount: '325.00', currencyCode: 'USD' } },
    compareAtPrice: '420.00',
    rating: '5.0',
    stock: 6,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/35970489/pexels-photo-35970489.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Cobalt Leather Muse' } }] },
    variants: { edges: ['S', 'M', 'L'].map(s => ({ node: { id: `fo1-${s}`, title: `${s} / Cobalt`, price: { amount: '325.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },
  {
    id: 'f-out-2',
    title: 'Midnight Winter Puffer',
    handle: 'midnight-winter-puffer',
    description: 'Ultra-warm, premium winter jacket with a sleek matte finish and architectural quilting.',
    brand: 'DRIP',
    tags: ['outerwear', 'bestseller'],
    priceRange: { minVariantPrice: { amount: '285.00', currencyCode: 'USD' } },
    compareAtPrice: '350.00',
    rating: '4.9',
    stock: 10,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/36018377/pexels-photo-36018377.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Midnight Winter Puffer' } }] },
    variants: { edges: ['S', 'M', 'L', 'XL'].map(s => ({ node: { id: `fo2-${s}`, title: `${s} / Onyx`, price: { amount: '285.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },
  {
    id: 'f-out-3',
    title: 'Colombia City Lights Puffer',
    handle: 'colombia-city-lights-puffer',
    description: 'Inspired by the vibrant nights of Colombia. A stylish yet functional urban outerwear piece.',
    brand: 'DRIP',
    tags: ['outerwear', 'new'],
    priceRange: { minVariantPrice: { amount: '245.00', currencyCode: 'USD' } },
    compareAtPrice: null,
    rating: '4.8',
    stock: 14,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/36520018/pexels-photo-36520018.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Colombia City Lights Puffer' } }] },
    variants: { edges: ['XS', 'S', 'M', 'L'].map(s => ({ node: { id: `fo3-${s}`, title: `${s} / City Glow`, price: { amount: '245.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },
  {
    id: 'f-out-4',
    title: 'Clear Sky Trench',
    handle: 'clear-sky-trench',
    description: 'A minimalist trench coat designed for clarity and confidence under open skies.',
    brand: 'DRIP',
    tags: ['outerwear', 'new'],
    priceRange: { minVariantPrice: { amount: '310.00', currencyCode: 'USD' } },
    compareAtPrice: '380.00',
    rating: '4.9',
    stock: 8,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/35925182/pexels-photo-35925182.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Clear Sky Trench' } }] },
    variants: { edges: ['S', 'M', 'L'].map(s => ({ node: { id: `fo4-${s}`, title: `${s} / Sandstone`, price: { amount: '310.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },
  {
    id: 'f-out-5',
    title: 'Field Leather Overcoat',
    handle: 'field-leather-overcoat',
    description: 'Rugged elegance. A long-line leather overcoat that blends nature with high fashion.',
    brand: 'DRIP',
    tags: ['outerwear', 'bestseller'],
    priceRange: { minVariantPrice: { amount: '450.00', currencyCode: 'USD' } },
    compareAtPrice: '580.00',
    rating: '5.0',
    stock: 4,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/6406387/pexels-photo-6406387.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Field Leather Overcoat' } }] },
    variants: { edges: ['S', 'M', 'L'].map(s => ({ node: { id: `fo5-${s}`, title: `${s} / Mahogany`, price: { amount: '450.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },
  {
    id: 'f-out-6',
    title: 'Aviator Onyx Jacket',
    handle: 'aviator-onyx-jacket',
    description: 'Classic aviator silhouette in premium black leather with bold hardware details.',
    brand: 'DRIP',
    tags: ['outerwear', 'new'],
    priceRange: { minVariantPrice: { amount: '345.00', currencyCode: 'USD' } },
    compareAtPrice: null,
    rating: '4.9',
    stock: 12,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/5696666/pexels-photo-5696666.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Aviator Onyx Jacket' } }] },
    variants: { edges: ['XS', 'S', 'M', 'L'].map(s => ({ node: { id: `fo6-${s}`, title: `${s} / Onyx`, price: { amount: '345.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },
  {
    id: 'f-out-7',
    title: 'Bar-Side Wool Mix',
    handle: 'bar-side-wool-mix',
    description: 'A sophisticated wool-blend coat perfect for transition from day to evening bar-side settings.',
    brand: 'DRIP',
    tags: ['outerwear', 'new'],
    priceRange: { minVariantPrice: { amount: '225.00', currencyCode: 'USD' } },
    compareAtPrice: '290.00',
    rating: '4.8',
    stock: 18,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/5987664/pexels-photo-5987664.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Bar-Side Wool Mix' } }] },
    variants: { edges: ['S', 'M', 'L'].map(s => ({ node: { id: `fo7-${s}`, title: `${s} / Charcoal`, price: { amount: '225.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },
  {
    id: 'f-out-8',
    title: 'Noir Sheen Leather',
    handle: 'noir-sheen-leather',
    description: 'High-gloss black leather coat with a distinctive editorial sheen.',
    brand: 'DRIP',
    tags: ['outerwear', 'bestseller'],
    priceRange: { minVariantPrice: { amount: '395.00', currencyCode: 'USD' } },
    compareAtPrice: '480.00',
    rating: '5.0',
    stock: 5,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/6497713/pexels-photo-6497713.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Noir Sheen Leather' } }] },
    variants: { edges: ['XS', 'S', 'M'].map(s => ({ node: { id: `fo8-${s}`, title: `${s} / Raven`, price: { amount: '395.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },
  {
    id: 'f-out-9',
    title: 'Charcoal Editorial Wrap',
    handle: 'charcoal-editorial-wrap',
    description: 'A versatile wrap coat in premium charcoal wool, designed for layered luxury.',
    brand: 'DRIP',
    tags: ['outerwear', 'new'],
    priceRange: { minVariantPrice: { amount: '265.00', currencyCode: 'USD' } },
    compareAtPrice: null,
    rating: '4.8',
    stock: 15,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/6131198/pexels-photo-6131198.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Charcoal Editorial Wrap' } }] },
    variants: { edges: ['S', 'M', 'L'].map(s => ({ node: { id: `fo9-${s}`, title: `${s} / Charcoal`, price: { amount: '265.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },
  {
    id: 'f-out-10',
    title: 'Arctic White Overcoat',
    handle: 'arctic-white-overcoat',
    description: 'A brilliant white structured coat that brings pure elegance to the coldest days.',
    brand: 'DRIP',
    tags: ['outerwear', 'new'],
    priceRange: { minVariantPrice: { amount: '315.00', currencyCode: 'USD' } },
    compareAtPrice: '395.00',
    rating: '4.9',
    stock: 7,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/5970628/pexels-photo-5970628.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Arctic White Overcoat' } }] },
    variants: { edges: ['XS', 'S', 'M', 'L'].map(s => ({ node: { id: `fo10-${s}`, title: `${s} / Arctic`, price: { amount: '315.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },
  {
    id: 'f-out-11',
    title: 'Structured City Coat',
    handle: 'structured-city-coat',
    description: 'Modern lines and premium wool-blend fabric for the discerning city dweller.',
    brand: 'DRIP',
    tags: ['outerwear', 'bestseller'],
    priceRange: { minVariantPrice: { amount: '245.00', currencyCode: 'USD' } },
    compareAtPrice: null,
    rating: '4.7',
    stock: 20,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/6899100/pexels-photo-6899100.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Structured City Coat' } }] },
    variants: { edges: ['S', 'M', 'L', 'XL'].map(s => ({ node: { id: `fo11-${s}`, title: `${s} / Stone`, price: { amount: '245.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },
  {
    id: 'f-out-12',
    title: 'Coastal Sand Trench',
    handle: 'coastal-sand-trench',
    description: 'Airy, longline beige coat with a coastal aesthetic and effortless drape.',
    brand: 'DRIP',
    tags: ['outerwear', 'new'],
    priceRange: { minVariantPrice: { amount: '195.00', currencyCode: 'USD' } },
    compareAtPrice: '250.00',
    rating: '4.9',
    stock: 11,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/7760649/pexels-photo-7760649.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Coastal Sand Trench' } }] },
    variants: { edges: ['XS', 'S', 'M', 'L'].map(s => ({ node: { id: `fo12-${s}`, title: `${s} / Sand`, price: { amount: '195.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },
  {
    id: 'f-out-13',
    title: 'Sunlight Roadside Jacket',
    handle: 'sunlight-roadside-jacket',
    description: 'A light, stylish jacket perfect for catching the afternoon sun.',
    brand: 'DRIP',
    tags: ['outerwear', 'new'],
    priceRange: { minVariantPrice: { amount: '180.00', currencyCode: 'USD' } },
    compareAtPrice: '210.00',
    rating: '4.8',
    stock: 15,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/5131016/pexels-photo-5131016.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Sunlight Roadside Jacket' } }] },
    variants: { edges: ['S', 'M', 'L'].map(s => ({ node: { id: `fo13-${s}`, title: `${s} / Default`, price: { amount: '180.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },
  {
    id: 'f-out-14',
    title: 'Blue Walkway Blazer',
    handle: 'blue-walkway-blazer',
    description: 'A sharp blue blazer that pairs effortlessly with denim for a smart-casual city look.',
    brand: 'DRIP',
    tags: ['outerwear', 'bestseller'],
    priceRange: { minVariantPrice: { amount: '220.00', currencyCode: 'USD' } },
    compareAtPrice: null,
    rating: '4.9',
    stock: 8,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/5498137/pexels-photo-5498137.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Blue Walkway Blazer' } }] },
    variants: { edges: ['XS', 'S', 'M', 'L'].map(s => ({ node: { id: `fo14-${s}`, title: `${s} / Blue`, price: { amount: '220.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },

  // ---- PREMIUM BOTTOMS COLLECTION (Pexels Editorial) ----
  {
    id: 'f-bot-1',
    title: 'Flare Denim Luxe',
    handle: 'flare-denim-luxe',
    description: 'High-waisted flare denim jeans with a vintage blue wash and premium stretch.',
    brand: 'DRIP',
    tags: ['bottoms', 'new'],
    priceRange: { minVariantPrice: { amount: '145.00', currencyCode: 'USD' } },
    compareAtPrice: '185.00',
    rating: '4.9',
    stock: 12,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/6856271/pexels-photo-6856271.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Flare Denim Luxe' } }] },
    variants: { edges: ['24', '26', '28', '30'].map(s => ({ node: { id: `fb1-${s}`, title: `W${s} / Indigo`, price: { amount: '145.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },
  {
    id: 'f-bot-2',
    title: 'Pathway Stride Trouser',
    handle: 'pathway-stride-trouser',
    description: 'Tailored trousers designed for elegant movement and a refined silhouette.',
    brand: 'DRIP',
    tags: ['bottoms', 'bestseller'],
    priceRange: { minVariantPrice: { amount: '125.00', currencyCode: 'USD' } },
    compareAtPrice: null,
    rating: '4.8',
    stock: 20,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/2343661/pexels-photo-2343661.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Pathway Stride Trouser' } }] },
    variants: { edges: ['XS', 'S', 'M', 'L'].map(s => ({ node: { id: `fb2-${s}`, title: `${s} / Earth`, price: { amount: '125.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },
  {
    id: 'f-bot-3',
    title: 'Editorial Denim Straight',
    handle: 'editorial-denim-straight',
    description: 'Classic straight-leg denim that anchors any high-fashion editorial look.',
    brand: 'DRIP',
    tags: ['bottoms', 'new'],
    priceRange: { minVariantPrice: { amount: '135.00', currencyCode: 'USD' } },
    compareAtPrice: '165.00',
    rating: '4.7',
    stock: 15,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/7760002/pexels-photo-7760002.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Editorial Denim Straight' } }] },
    variants: { edges: ['24', '26', '28', '30'].map(s => ({ node: { id: `fb3-${s}`, title: `W${s} / Vintage`, price: { amount: '135.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },
  {
    id: 'f-bot-4',
    title: 'Casual Core Denim',
    handle: 'casual-core-denim',
    description: 'The foundation of a modern wardrobe. Perfectly washed blue denim with a relaxed fit.',
    brand: 'DRIP',
    tags: ['bottoms', 'bestseller'],
    priceRange: { minVariantPrice: { amount: '110.00', currencyCode: 'USD' } },
    compareAtPrice: null,
    rating: '4.9',
    stock: 35,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/6834095/pexels-photo-6834095.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Casual Core Denim' } }] },
    variants: { edges: ['26', '28', '30', '32'].map(s => ({ node: { id: `fb4-${s}`, title: `W${s} / Sky`, price: { amount: '110.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },
  {
    id: 'f-bot-5',
    title: 'Noir Leather Editorial',
    handle: 'noir-leather-editorial',
    description: 'Bold leather-look pants that demand attention and exude confidence.',
    brand: 'DRIP',
    tags: ['bottoms', 'new'],
    priceRange: { minVariantPrice: { amount: '165.00', currencyCode: 'USD' } },
    compareAtPrice: '210.00',
    rating: '5.0',
    stock: 8,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/5978296/pexels-photo-5978296.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Noir Leather Editorial' } }] },
    variants: { edges: ['XS', 'S', 'M'].map(s => ({ node: { id: `fb5-${s}`, title: `${s} / Onyx`, price: { amount: '165.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },
  {
    id: 'f-bot-6',
    title: 'Gotham Night Slacks',
    handle: 'gotham-night-slacks',
    description: 'Sleek black slacks with a modern taper, designed for city nights.',
    brand: 'DRIP',
    tags: ['bottoms', 'new'],
    priceRange: { minVariantPrice: { amount: '130.00', currencyCode: 'USD' } },
    compareAtPrice: '175.00',
    rating: '4.8',
    stock: 14,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/5152302/pexels-photo-5152302.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Gotham Night Slacks' } }] },
    variants: { edges: ['S', 'M', 'L'].map(s => ({ node: { id: `fb6-${s}`, title: `${s} / Black`, price: { amount: '130.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },
  {
    id: 'f-bot-7',
    title: 'Urban Trend Trouser',
    handle: 'urban-trend-trouser',
    description: 'Versatile trousers with a focus on street-style proportions and comfort.',
    brand: 'DRIP',
    tags: ['bottoms', 'bestseller'],
    priceRange: { minVariantPrice: { amount: '115.00', currencyCode: 'USD' } },
    compareAtPrice: null,
    rating: '4.7',
    stock: 22,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/6211621/pexels-photo-6211621.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Urban Trend Trouser' } }] },
    variants: { edges: ['XS', 'S', 'M', 'L'].map(s => ({ node: { id: `fb7-${s}`, title: `${s} / Charcoal`, price: { amount: '115.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },
  {
    id: 'f-bot-8',
    title: 'Editorial Pleated Skirt',
    handle: 'editorial-pleated-skirt',
    description: 'A masterpiece of movement. Pleated to perfection for a high-end editorial finish.',
    brand: 'DRIP',
    tags: ['bottoms', 'new'],
    priceRange: { minVariantPrice: { amount: '140.00', currencyCode: 'USD' } },
    compareAtPrice: '190.00',
    rating: '4.9',
    stock: 10,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/4663319/pexels-photo-4663319.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Editorial Pleated Skirt' } }] },
    variants: { edges: ['XS', 'S', 'M'].map(s => ({ node: { id: `fb8-${s}`, title: `${s} / Cream`, price: { amount: '140.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },
  {
    id: 'f-bot-9',
    title: 'Peony Muse Skirt',
    handle: 'peony-muse-skirt',
    description: 'A vibrant pink skirt that captures the essence of floral elegance.',
    brand: 'DRIP',
    tags: ['bottoms', 'new'],
    priceRange: { minVariantPrice: { amount: '105.00', currencyCode: 'USD' } },
    compareAtPrice: null,
    rating: '4.8',
    stock: 18,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/7782021/pexels-photo-7782021.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Peony Muse Skirt' } }] },
    variants: { edges: ['XS', 'S', 'M'].map(s => ({ node: { id: `fb9-${s}`, title: `${s} / Pink`, price: { amount: '105.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },
  {
    id: 'f-bot-10',
    title: 'Ornamental Frame Skirt',
    handle: 'ornamental-frame-skirt',
    description: 'A structured skirt with unique artistic framing, designed for the avant-garde.',
    brand: 'DRIP',
    tags: ['bottoms', 'new'],
    priceRange: { minVariantPrice: { amount: '155.00', currencyCode: 'USD' } },
    compareAtPrice: '200.00',
    rating: '4.9',
    stock: 6,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/5211986/pexels-photo-5211986.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Ornamental Frame Skirt' } }] },
    variants: { edges: ['S', 'M', 'L'].map(s => ({ node: { id: `fb10-${s}`, title: `${s} / Art Print`, price: { amount: '155.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },
  {
    id: 'f-bot-11',
    title: 'Pavement Presence Pants',
    handle: 'pavement-presence-pants',
    description: 'Bold, wide-leg pants that command attention on every metropolitan sidewalk.',
    brand: 'DRIP',
    tags: ['bottoms', 'new'],
    priceRange: { minVariantPrice: { amount: '150.00', currencyCode: 'USD' } },
    compareAtPrice: '195.00',
    rating: '4.8',
    stock: 9,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/4434395/pexels-photo-4434395.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Pavement Presence Pants' } }] },
    variants: { edges: ['XS', 'S', 'M', 'L'].map(s => ({ node: { id: `fb11-${s}`, title: `${s} / Steel`, price: { amount: '150.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },
  {
    id: 'f-bot-12',
    title: 'Stool Muse Editorial',
    handle: 'stool-muse-editorial',
    description: 'A high-fashion editorial piece featuring a unique seated silhouette and premium tailoring.',
    brand: 'DRIP',
    tags: ['bottoms', 'new'],
    priceRange: { minVariantPrice: { amount: '155.00', currencyCode: 'USD' } },
    compareAtPrice: '195.00',
    rating: '5.0',
    stock: 5,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/7205905/pexels-photo-7205905.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Stool Muse Editorial' } }] },
    variants: { edges: ['S', 'M', 'L'].map(s => ({ node: { id: `fb12-${s}`, title: `${s} / Editorial`, price: { amount: '155.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },
  {
    id: 'f-bot-13',
    title: 'Slate Wall Stride',
    handle: 'slate-wall-stride',
    description: 'Minimalist black pants paired with a crisp white shirt for a timeless and professional gray-wall aesthetic.',
    brand: 'DRIP',
    tags: ['bottoms', 'bestseller'],
    priceRange: { minVariantPrice: { amount: '145.00', currencyCode: 'USD' } },
    compareAtPrice: null,
    rating: '4.9',
    stock: 11,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/1006991/pexels-photo-1006991.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Slate Wall Stride' } }] },
    variants: { edges: ['XS', 'S', 'M', 'L'].map(s => ({ node: { id: `fb13-${s}`, title: `${s} / Slate`, price: { amount: '145.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },
  {
    id: 'f-bot-14',
    title: 'Crimson Sparkle Gala',
    handle: 'crimson-sparkle-gala',
    description: 'Shimmering elegance. A red gala piece that commands attention with every step.',
    brand: 'DRIP',
    tags: ['bottoms', 'new'],
    priceRange: { minVariantPrice: { amount: '425.00', currencyCode: 'USD' } },
    compareAtPrice: '550.00',
    rating: '5.0',
    stock: 2,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/5713296/pexels-photo-5713296.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Crimson Sparkle Gala' } }] },
    variants: { edges: ['S', 'M', 'L'].map(s => ({ node: { id: `f17b-${s}`, title: `${s} / Crimson`, price: { amount: '425.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },
  {
    id: 'f-bot-15',
    title: 'Brunette Crop & Skirt',
    handle: 'brunette-crop-skirt',
    description: 'A beautiful look featuring a stylish crop top and sleek skirt.',
    brand: 'DRIP',
    tags: ['bottoms', 'new'],
    priceRange: { minVariantPrice: { amount: '135.00', currencyCode: 'USD' } },
    compareAtPrice: null,
    rating: '4.8',
    stock: 14,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/20155763/pexels-photo-20155763.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Brunette Crop & Skirt' } }] },
    variants: { edges: ['XS', 'S', 'M'].map(s => ({ node: { id: `fb15-${s}`, title: `${s} / Default`, price: { amount: '135.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },
  {
    id: 'f-bot-16',
    title: 'Editorial Handbag Look',
    handle: 'editorial-handbag-look',
    description: 'Elevated fashion with a statement handbag and premium bottoms.',
    brand: 'DRIP',
    tags: ['bottoms', 'bestseller'],
    priceRange: { minVariantPrice: { amount: '185.00', currencyCode: 'USD' } },
    compareAtPrice: '220.00',
    rating: '4.9',
    stock: 8,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/16154678/pexels-photo-16154678.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Editorial Handbag Look' } }] },
    variants: { edges: ['S', 'M', 'L'].map(s => ({ node: { id: `fb16-${s}`, title: `${s} / Default`, price: { amount: '185.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },
  {
    id: 'f-bot-17',
    title: 'Pink Leather Skirt',
    handle: 'pink-leather-skirt',
    description: 'A bold, vibrant pink leather skirt that stands out in any crowd.',
    brand: 'DRIP',
    tags: ['bottoms', 'new'],
    priceRange: { minVariantPrice: { amount: '160.00', currencyCode: 'USD' } },
    compareAtPrice: null,
    rating: '5.0',
    stock: 5,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/9725167/pexels-photo-9725167.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Pink Leather Skirt' } }] },
    variants: { edges: ['XS', 'S', 'M'].map(s => ({ node: { id: `fb17-${s}`, title: `${s} / Pink`, price: { amount: '160.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },
  {
    id: 'f-bot-18',
    title: 'Blue Contrast Skirt',
    handle: 'blue-contrast-skirt',
    description: 'Classic styling featuring a stunning blue skirt paired for everyday elegance.',
    brand: 'DRIP',
    tags: ['bottoms', 'bestseller'],
    priceRange: { minVariantPrice: { amount: '125.00', currencyCode: 'USD' } },
    compareAtPrice: '150.00',
    rating: '4.7',
    stock: 12,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/1007018/pexels-photo-1007018.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Blue Contrast Skirt' } }] },
    variants: { edges: ['S', 'M', 'L'].map(s => ({ node: { id: `fb18-${s}`, title: `${s} / Blue`, price: { amount: '125.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },
  {
    id: 'f-bot-19',
    title: 'Street Style Pants',
    handle: 'street-style-pants',
    description: 'Stylish, relaxed fit bottoms offering the ultimate street-style aesthetic.',
    brand: 'DRIP',
    tags: ['bottoms', 'new'],
    priceRange: { minVariantPrice: { amount: '110.00', currencyCode: 'USD' } },
    compareAtPrice: null,
    rating: '4.8',
    stock: 20,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/5619416/pexels-photo-5619416.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Street Style Pants' } }] },
    variants: { edges: ['XS', 'S', 'M', 'L'].map(s => ({ node: { id: `fb19-${s}`, title: `${s} / Default`, price: { amount: '110.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },

  // ---- PREMIUM TOPS COLLECTION (Pexels Editorial) ----
  {
    id: 'f-top-1',
    title: 'Silky Walnut Blouse',
    handle: 'silky-walnut-blouse',
    description: 'A luxurious brown silky top that flows with elegance and grace.',
    brand: 'DRIP',
    tags: ['tops', 'new'],
    priceRange: { minVariantPrice: { amount: '125.00', currencyCode: 'USD' } },
    compareAtPrice: '160.00',
    rating: '4.9',
    stock: 12,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/7710710/pexels-photo-7710710.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Silky Walnut Blouse' } }] },
    variants: { edges: ['XS', 'S', 'M', 'L'].map(s => ({ node: { id: `ft1-${s}`, title: `${s} / Walnut`, price: { amount: '125.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },
  {
    id: 'f-top-2',
    title: 'Midnight Ribbed Tank',
    handle: 'midnight-ribbed-tank',
    description: 'A sleek black tank top with a premium ribbed finish for the ultimate clean aesthetic.',
    brand: 'DRIP',
    tags: ['tops', 'bestseller'],
    priceRange: { minVariantPrice: { amount: '85.00', currencyCode: 'USD' } },
    compareAtPrice: null,
    rating: '4.8',
    stock: 25,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/5365527/pexels-photo-5365527.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Midnight Ribbed Tank' } }] },
    variants: { edges: ['XS', 'S', 'M'].map(s => ({ node: { id: `ft2-${s}`, title: `${s} / Black`, price: { amount: '85.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },
  {
    id: 'f-top-3',
    title: 'Floral Whisper Camisole',
    handle: 'floral-whisper-camisole',
    description: 'Delicate floral prints on a soft, airy camisole designed for summer evenings.',
    brand: 'DRIP',
    tags: ['tops', 'new'],
    priceRange: { minVariantPrice: { amount: '95.00', currencyCode: 'USD' } },
    compareAtPrice: '120.00',
    rating: '4.7',
    stock: 15,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/7742972/pexels-photo-7742972.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Floral Whisper Camisole' } }] },
    variants: { edges: ['S', 'M', 'L'].map(s => ({ node: { id: `ft3-${s}`, title: `${s} / Floral`, price: { amount: '95.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },
  {
    id: 'f-top-4',
    title: 'Minimalist Ivory Tank',
    handle: 'minimalist-ivory-tank',
    description: 'The redefined white tank top. Essential, premium, and perfectly tailored.',
    brand: 'DRIP',
    tags: ['tops', 'bestseller'],
    priceRange: { minVariantPrice: { amount: '75.00', currencyCode: 'USD' } },
    compareAtPrice: null,
    rating: '4.9',
    stock: 40,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/6263622/pexels-photo-6263622.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Minimalist Ivory Tank' } }] },
    variants: { edges: ['XS', 'S', 'M', 'L'].map(s => ({ node: { id: `ft4-${s}`, title: `${s} / Ivory`, price: { amount: '75.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },
  {
    id: 'f-top-5',
    title: 'Pink Peony Knit',
    handle: 'pink-peony-knit',
    description: 'A charming pink top with a soft-touch knit for a cozy yet polished look.',
    brand: 'DRIP',
    tags: ['tops', 'new'],
    priceRange: { minVariantPrice: { amount: '110.00', currencyCode: 'USD' } },
    compareAtPrice: '145.00',
    rating: '4.8',
    stock: 18,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/7564400/pexels-photo-7564400.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Pink Peony Knit' } }] },
    variants: { edges: ['S', 'M'].map(s => ({ node: { id: `ft5-${s}`, title: `${s} / Pink`, price: { amount: '110.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },
  {
    id: 'f-top-6',
    title: 'Azure Bloom Blouse',
    handle: 'azure-bloom-blouse',
    description: 'Stunning blue and white floral patterns on a billowy, elegant top.',
    brand: 'DRIP',
    tags: ['tops', 'new'],
    priceRange: { minVariantPrice: { amount: '120.00', currencyCode: 'USD' } },
    compareAtPrice: '155.00',
    rating: '4.9',
    stock: 9,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/2781411/pexels-photo-2781411.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Azure Bloom Blouse' } }] },
    variants: { edges: ['XS', 'S', 'M', 'L'].map(s => ({ node: { id: `ft6-${s}`, title: `${s} / Blue Floral`, price: { amount: '120.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },
  {
    id: 'f-top-7',
    title: 'Noir Long-Sleeve Crop',
    handle: 'noir-long-sleeve-crop',
    description: 'A bold, long-sleeve black crop top that defines modern sophistication.',
    brand: 'DRIP',
    tags: ['tops', 'bestseller'],
    priceRange: { minVariantPrice: { amount: '95.00', currencyCode: 'USD' } },
    compareAtPrice: null,
    rating: '4.7',
    stock: 22,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/5385740/pexels-photo-5385740.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Noir Long-Sleeve Crop' } }] },
    variants: { edges: ['XS', 'S', 'M'].map(s => ({ node: { id: `ft7-${s}`, title: `${s} / Black`, price: { amount: '95.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },
  {
    id: 'f-top-8',
    title: 'Pink Aura Editorial',
    handle: 'pink-aura-editorial',
    description: 'A high-fashion pink outfit top designed for runway impacts and gallery nights.',
    brand: 'DRIP',
    tags: ['tops', 'new'],
    priceRange: { minVariantPrice: { amount: '135.00', currencyCode: 'USD' } },
    compareAtPrice: '180.00',
    rating: '5.0',
    stock: 6,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/36639607/pexels-photo-36639607.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Pink Aura Editorial' } }] },
    variants: { edges: ['S', 'M', 'L'].map(s => ({ node: { id: `ft8-${s}`, title: `${s} / Pink`, price: { amount: '135.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },
  {
    id: 'f-top-9',
    title: 'Ethereal Blue Tube',
    handle: 'ethereal-blue-tube',
    description: 'A minimalist blue tube top that offers a sleek, modern silhouette.',
    brand: 'DRIP',
    tags: ['tops', 'new'],
    priceRange: { minVariantPrice: { amount: '65.00', currencyCode: 'USD' } },
    compareAtPrice: null,
    rating: '4.6',
    stock: 30,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/14035099/pexels-photo-14035099.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Ethereal Blue Tube' } }] },
    variants: { edges: ['XS', 'S', 'M'].map(s => ({ node: { id: `ft9-${s}`, title: `${s} / Blue`, price: { amount: '65.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },
  {
    id: 'f-top-10',
    title: 'Urban Chic Crop',
    handle: 'urban-chic-crop',
    description: 'The ultimate urban crop top, perfectly paired with high-waisted denim.',
    brand: 'DRIP',
    tags: ['tops', 'bestseller'],
    priceRange: { minVariantPrice: { amount: '88.00', currencyCode: 'USD' } },
    compareAtPrice: '110.00',
    rating: '4.8',
    stock: 14,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/27817093/pexels-photo-27817093.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Urban Chic Crop' } }] },
    variants: { edges: ['XS', 'S', 'M', 'L'].map(s => ({ node: { id: `ft10-${s}`, title: `${s} / Black`, price: { amount: '88.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },
  {
    id: 'f-top-11',
    title: 'Flowing Curtains Silk',
    handle: 'flowing-curtains-silk',
    description: 'A majestic silk top inspired by flowing silhouettes and movement.',
    brand: 'DRIP',
    tags: ['tops', 'new'],
    priceRange: { minVariantPrice: { amount: '145.00', currencyCode: 'USD' } },
    compareAtPrice: '190.00',
    rating: '4.9',
    stock: 8,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/36706598/pexels-photo-36706598.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Flowing Curtains Silk' } }] },
    variants: { edges: ['S', 'M', 'L'].map(s => ({ node: { id: `ft11-${s}`, title: `${s} / Cream`, price: { amount: '145.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },
  {
    id: 'f-top-12',
    title: 'Artisanal Ink Top',
    handle: 'artisanal-ink-top',
    description: 'A unique top designed for comfort and self-expression.',
    brand: 'DRIP',
    tags: ['tops', 'new'],
    priceRange: { minVariantPrice: { amount: '92.00', currencyCode: 'USD' } },
    compareAtPrice: null,
    rating: '4.7',
    stock: 18,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/4821363/pexels-photo-4821363.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Artisanal Ink Top' } }] },
    variants: { edges: ['XS', 'S', 'M', 'L'].map(s => ({ node: { id: `ft12-${s}`, title: `${s} / Natural`, price: { amount: '92.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },

  // ---- PREMIUM DRESS COLLECTION (Pexels Editorial) ----
  {
    id: 'f-dress-1',
    title: 'Emerald Grace Gown',
    handle: 'emerald-grace-gown',
    description: 'A stunning emerald green floor-length gown with a sophisticated brown-tone backdrop aesthetic.',
    brand: 'DRIP',
    tags: ['dresses', 'new'],
    priceRange: { minVariantPrice: { amount: '245.00', currencyCode: 'USD' } },
    compareAtPrice: '320.00',
    rating: '4.9',
    stock: 5,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/36235350/pexels-photo-36235350.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Emerald Grace Gown' } }] },
    variants: { edges: ['XS', 'S', 'M', 'L'].map(s => ({ node: { id: `f6-${s}`, title: `${s} / Emerald`, price: { amount: '245.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },
  {
    id: 'f-dress-2',
    title: 'Crimson Night Gala',
    handle: 'crimson-night-gala',
    description: 'Elegant red evening gown paired with a luxury clutch for high-end events.',
    brand: 'DRIP',
    tags: ['dresses', 'bestseller'],
    priceRange: { minVariantPrice: { amount: '295.00', currencyCode: 'USD' } },
    compareAtPrice: '380.00',
    rating: '5.0',
    stock: 3,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/36253168/pexels-photo-36253168.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Crimson Night Gala' } }] },
    variants: { edges: ['S', 'M', 'L'].map(s => ({ node: { id: `f9-${s}`, title: `${s} / Red`, price: { amount: '295.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },
  {
    id: 'f-dress-3',
    title: 'Midnight Noir Gown',
    handle: 'midnight-noir-gown',
    description: 'Classic black evening gown with an editorial silhouette.',
    brand: 'DRIP',
    tags: ['dresses', 'new'],
    priceRange: { minVariantPrice: { amount: '210.00', currencyCode: 'USD' } },
    compareAtPrice: null,
    rating: '4.8',
    stock: 7,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/36001588/pexels-photo-36001588.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Midnight Noir Gown' } }] },
    variants: { edges: ['XS', 'S', 'M'].map(s => ({ node: { id: `f10-${s}`, title: `${s} / Black`, price: { amount: '210.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },
  {
    id: 'f-dress-4',
    title: 'Street Chic Noir',
    handle: 'street-chic-noir',
    description: 'A versatile black midi dress designed for urban elegance.',
    brand: 'DRIP',
    tags: ['dresses', 'new'],
    priceRange: { minVariantPrice: { amount: '135.00', currencyCode: 'USD' } },
    compareAtPrice: '170.00',
    rating: '4.7',
    stock: 12,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/36041576/pexels-photo-36041576.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Street Chic Noir' } }] },
    variants: { edges: ['XS', 'S', 'M', 'L'].map(s => ({ node: { id: `f11-${s}`, title: `${s} / Black`, price: { amount: '135.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },
  {
    id: 'f-dress-5',
    title: 'Meadow Muse Dress',
    handle: 'meadow-muse-dress',
    description: 'Effortless and airy dress perfect for garden parties and meadow strolls.',
    brand: 'DRIP',
    tags: ['dresses', 'bestseller'],
    priceRange: { minVariantPrice: { amount: '155.00', currencyCode: 'USD' } },
    compareAtPrice: null,
    rating: '4.9',
    stock: 8,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/5518804/pexels-photo-5518804.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Meadow Muse Dress' } }] },
    variants: { edges: ['S', 'M', 'L'].map(s => ({ node: { id: `f12-${s}`, title: `${s} / White`, price: { amount: '155.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },
  {
    id: 'f-dress-6',
    title: 'Restaurant Royale',
    handle: 'restaurant-royale-dress',
    description: 'Sophisticated evening dress for fine dining and formal occasions.',
    brand: 'DRIP',
    tags: ['dresses', 'new'],
    priceRange: { minVariantPrice: { amount: '185.00', currencyCode: 'USD' } },
    compareAtPrice: '220.00',
    rating: '4.8',
    stock: 6,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/6877233/pexels-photo-6877233.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Restaurant Royale Dress' } }] },
    variants: { edges: ['XS', 'S', 'M', 'L'].map(s => ({ node: { id: `f13_d-${s}`, title: `${s} / Cream`, price: { amount: '185.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },
  {
    id: 'f-dress-7',
    title: 'Scarlet Serenity',
    handle: 'scarlet-serenity-dress',
    description: 'A vibrant red dress that captures passion and elegance.',
    brand: 'DRIP',
    tags: ['dresses', 'bestseller'],
    priceRange: { minVariantPrice: { amount: '165.00', currencyCode: 'USD' } },
    compareAtPrice: null,
    rating: '4.9',
    stock: 10,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/4450694/pexels-photo-4450694.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Scarlet Serenity Dress' } }] },
    variants: { edges: ['S', 'M', 'L'].map(s => ({ node: { id: `f14_d-${s}`, title: `${s} / Scarlet`, price: { amount: '165.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },
  {
    id: 'f-dress-8',
    title: 'Floral Wall Muse',
    handle: 'floral-wall-muse',
    description: 'A delicate floral dress captured in a serene editorial setting.',
    brand: 'DRIP',
    tags: ['dresses', 'new'],
    priceRange: { minVariantPrice: { amount: '225.00', currencyCode: 'USD' } },
    compareAtPrice: '280.00',
    rating: '4.8',
    stock: 9,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/7716488/pexels-photo-7716488.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Floral Wall Muse' } }] },
    variants: { edges: ['XS', 'S', 'M', 'L'].map(s => ({ node: { id: `f8d-${s}`, title: `${s} / Floral`, price: { amount: '225.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },
  {
    id: 'f-dress-9',
    title: 'Pink Floral Breeze',
    handle: 'pink-floral-breeze',
    description: 'Soft pink tones and a light, airy fabric make this floral dress a summer essential.',
    brand: 'DRIP',
    tags: ['dresses', 'new'],
    priceRange: { minVariantPrice: { amount: '195.00', currencyCode: 'USD' } },
    compareAtPrice: null,
    rating: '4.9',
    stock: 14,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/7131254/pexels-photo-7131254.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Pink Floral Breeze' } }] },
    variants: { edges: ['XS', 'S', 'M', 'L'].map(s => ({ node: { id: `f9d-${s}`, title: `${s} / Pink`, price: { amount: '195.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },
  {
    id: 'f-dress-10',
    title: 'Blossom Garden Gown',
    handle: 'blossom-garden-gown',
    description: 'A stunning gown adorned with blossoms, perfect for garden weddings and elegant soirées.',
    brand: 'DRIP',
    tags: ['dresses', 'bestseller'],
    priceRange: { minVariantPrice: { amount: '345.00', currencyCode: 'USD' } },
    compareAtPrice: '420.00',
    rating: '5.0',
    stock: 4,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/2088140/pexels-photo-2088140.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Blossom Garden Gown' } }] },
    variants: { edges: ['S', 'M', 'L'].map(s => ({ node: { id: `f10d-${s}`, title: `${s} / Blossom`, price: { amount: '345.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },
  {
    id: 'f-dress-11',
    title: 'Ivory Silk Slip',
    handle: 'ivory-silk-slip',
    description: 'Minimalist luxury. A classic ivory silk slip dress that drapes beautifully.',
    brand: 'DRIP',
    tags: ['dresses', 'new'],
    priceRange: { minVariantPrice: { amount: '175.00', currencyCode: 'USD' } },
    compareAtPrice: '210.00',
    rating: '4.8',
    stock: 11,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/1651412/pexels-photo-1651412.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Ivory Silk Slip' } }] },
    variants: { edges: ['XS', 'S', 'M'].map(s => ({ node: { id: `f11d-${s}`, title: `${s} / Ivory`, price: { amount: '175.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },
  {
    id: 'f-dress-12',
    title: 'Celestial Gold Gown',
    handle: 'celestial-gold-gown',
    description: 'A breathtaking long dress that exudes celestial radiance and high-fashion elegance.',
    brand: 'DRIP',
    tags: ['dresses', 'bestseller'],
    priceRange: { minVariantPrice: { amount: '395.00', currencyCode: 'USD' } },
    compareAtPrice: '500.00',
    rating: '5.0',
    stock: 3,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/4614893/pexels-photo-4614893.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Celestial Gold Gown' } }] },
    variants: { edges: ['XS', 'S', 'M', 'L'].map(s => ({ node: { id: `f12d-${s}`, title: `${s} / Gold`, price: { amount: '395.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },
  {
    id: 'f-dress-13',
    title: 'Blush Harmony Dress',
    handle: 'blush-harmony-dress',
    description: 'A soft blush and pink composition that brings harmony to any wardrobe.',
    brand: 'DRIP',
    tags: ['dresses', 'new'],
    priceRange: { minVariantPrice: { amount: '210.00', currencyCode: 'USD' } },
    compareAtPrice: null,
    rating: '4.7',
    stock: 8,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/6371773/pexels-photo-6371773.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Blush Harmony Dress' } }] },
    variants: { edges: ['S', 'M', 'L'].map(s => ({ node: { id: `f13d-${s}`, title: `${s} / Blush`, price: { amount: '210.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },
  {
    id: 'f-dress-14',
    title: 'Slate Stone Midi',
    handle: 'slate-stone-midi',
    description: 'Sophisticated and grounded. A slate grey midi dress with a modern wall-side aesthetic.',
    brand: 'DRIP',
    tags: ['dresses', 'new'],
    priceRange: { minVariantPrice: { amount: '185.00', currencyCode: 'USD' } },
    compareAtPrice: '230.00',
    rating: '4.8',
    stock: 15,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/2478624/pexels-photo-2478624.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Slate Stone Midi' } }] },
    variants: { edges: ['XS', 'S', 'M', 'L'].map(s => ({ node: { id: `f14d-${s}`, title: `${s} / Slate`, price: { amount: '185.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },
  {
    id: 'f-dress-15',
    title: 'Summer Smile Maxi',
    handle: 'summer-smile-maxi',
    description: 'Bright and cheerful. A crisp white maxi dress designed for sun-filled days.',
    brand: 'DRIP',
    tags: ['dresses', 'bestseller'],
    priceRange: { minVariantPrice: { amount: '165.00', currencyCode: 'USD' } },
    compareAtPrice: null,
    rating: '4.9',
    stock: 20,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/1537494/pexels-photo-1537494.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Summer Smile Maxi' } }] },
    variants: { edges: ['XS', 'S', 'M', 'L'].map(s => ({ node: { id: `f15d-${s}`, title: `${s} / White`, price: { amount: '165.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },
  {
    id: 'f-dress-16',
    title: 'Azure Sleeveless Flare',
    handle: 'azure-sleeveless-flare',
    description: 'A vibrant blue sleeveless dress with a playful flare for an effortless chic look.',
    brand: 'DRIP',
    tags: ['dresses', 'new'],
    priceRange: { minVariantPrice: { amount: '145.00', currencyCode: 'USD' } },
    compareAtPrice: '190.00',
    rating: '4.7',
    stock: 12,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/1007011/pexels-photo-1007011.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Azure Sleeveless Flare' } }] },
    variants: { edges: ['XS', 'S', 'M'].map(s => ({ node: { id: `f16d-${s}`, title: `${s} / Azure`, price: { amount: '145.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },
  {
    id: 'f-dress-18',
    title: 'Velvet Red Siren',
    handle: 'velvet-red-siren',
    description: 'Bold velvet red dress for a dramatic and unforgettable evening presence.',
    brand: 'DRIP',
    tags: ['dresses', 'bestseller'],
    priceRange: { minVariantPrice: { amount: '275.00', currencyCode: 'USD' } },
    compareAtPrice: '340.00',
    rating: '4.9',
    stock: 5,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/6799644/pexels-photo-6799644.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Velvet Red Siren' } }] },
    variants: { edges: ['XS', 'S', 'M', 'L'].map(s => ({ node: { id: `f18d-${s}`, title: `${s} / Velvet Red`, price: { amount: '275.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },
  {
    id: 'f-dress-19',
    title: 'White Off-Shoulder Gown',
    handle: 'white-off-shoulder-gown',
    description: 'An elegant white off-shoulder gown perfect for botanical settings and special occasions.',
    brand: 'DRIP',
    tags: ['dresses', 'new'],
    priceRange: { minVariantPrice: { amount: '350.00', currencyCode: 'USD' } },
    compareAtPrice: '400.00',
    rating: '5.0',
    stock: 7,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/756577/pexels-photo-756577.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'White Off-Shoulder Gown' } }] },
    variants: { edges: ['S', 'M', 'L'].map(s => ({ node: { id: `f19d-${s}`, title: `${s} / White`, price: { amount: '350.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },
  {
    id: 'f-dress-20',
    title: 'Terrace Elegance Dress',
    handle: 'terrace-elegance-dress',
    description: 'A beautiful flowing dress that captures the essence of summer terrace lounging.',
    brand: 'DRIP',
    tags: ['dresses', 'bestseller'],
    priceRange: { minVariantPrice: { amount: '185.00', currencyCode: 'USD' } },
    compareAtPrice: null,
    rating: '4.8',
    stock: 14,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/5518796/pexels-photo-5518796.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Terrace Elegance Dress' } }] },
    variants: { edges: ['XS', 'S', 'M'].map(s => ({ node: { id: `f20d-${s}`, title: `${s} / Default`, price: { amount: '185.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },
  {
    id: 'f-dress-21',
    title: 'Blue Ruffled Gala',
    handle: 'blue-ruffled-gala',
    description: 'An exquisite blue ruffled dress designed for striking indoor portraits and events.',
    brand: 'DRIP',
    tags: ['dresses', 'new'],
    priceRange: { minVariantPrice: { amount: '295.00', currencyCode: 'USD' } },
    compareAtPrice: '350.00',
    rating: '4.9',
    stock: 9,
    images: { edges: [{ node: { url: 'https://images.pexels.com/photos/36605754/pexels-photo-36605754.jpeg?auto=compress&cs=tinysrgb&w=1600', altText: 'Blue Ruffled Gala' } }] },
    variants: { edges: ['S', 'M', 'L'].map(s => ({ node: { id: `f21d-${s}`, title: `${s} / Blue`, price: { amount: '295.00', currencyCode: 'USD' } } })) },
    source: 'fallback'
  },



]

// ---- Main fetch: Aggressive Waterfall strategy & Deduplication ----
export async function fetchProducts() {
  if (cachedProducts) return cachedProducts

  const apis = [
    { name: 'DummyJSON', fn: fetchFromDummyJSON },
    { name: 'FakeStore', fn: fetchFromFakeStore },
    { name: 'Platzi', fn: fetchFromPlatzi },
    { name: 'GitHub Fashion', fn: fetchFromGitHubFashion },
  ]

  for (const api of apis) {
    try {
      console.log(`[DRIP] Trying ${api.name}...`)
      let products = await api.fn()

      if (products?.length > 0) {
        // Strict De-duplication & Placeholder Filter
        const seenImages = new Set()
        const seenTitles = new Set()
        const brokenIndicators = ['placeholder', 'via.placeholder', 'picsum', '[]', 'undefined', 'null', 'i.imgur.com/fHyEEi.jpg']

        products = products.filter(product => {
          const imageUrl = product.images?.edges?.[0]?.node?.url
          const title = product.title?.toLowerCase().trim()
          if (!imageUrl) return false
          if (seenImages.has(imageUrl)) return false
          if (seenTitles.has(title)) return false
          const isBroken = brokenIndicators.some(i => imageUrl.includes(i))
          if (isBroken) return false
          seenImages.add(imageUrl)
          seenTitles.add(title)
          return true
        })

        if (products.length < 6) {
          throw new Error(`${api.name} returned too few unique products (${products.length})`)
        }

        // Ensure Premium Editorial Collections (Dresses, Tops, Bottoms, & Outerwear) are ALWAYS included and prioritized
        const premiumCollections = FALLBACK_PRODUCTS.filter(p => p.tags.includes('dresses') || p.tags.includes('tops') || p.tags.includes('bottoms') || p.tags.includes('outerwear'))
        const otherProducts = products.filter(p => !p.tags.includes('dresses') && !p.tags.includes('tops') && !p.tags.includes('bottoms') && !p.tags.includes('outerwear'))
        const merged = [...premiumCollections, ...otherProducts]

        console.log(`[DRIP] ✓ Using ${merged.length} products (including premium collections) from ${api.name}`)
        cachedProducts = merged
        return merged
      }
    } catch (err) {
      console.warn(`[DRIP] Skipping ${api.name}:`, err.message)
    }
  }

  console.log(`[DRIP] All APIs failed or returned poor results. Falling back to boutique collection.`)
  // Combine all fallback items and ensure they are unique
  const seenImages = new Set()
  const boutique = FALLBACK_PRODUCTS.filter(p => {
    const url = p.images.edges[0].node.url
    if (seenImages.has(url)) return false
    seenImages.add(url)
    return true
  })

  cachedProducts = boutique
  return boutique
}

export async function fetchProductByHandle(handle) {
  const products = await fetchProducts()
  return products.find(p => p.handle === handle) || null
}

export function clearProductCache() {
  cachedProducts = null
}

export async function createCheckout(items) {
  // Mock checkout 
  console.log("Mock Checkout using items:", items);
  return "https://github.com/google/guava";
}
