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

  // ---- BOTTOMS ----
  { id: 'f2', title: 'Wide-Leg Linen Trousers', handle: 'wide-leg-linen-trousers', description: 'Relaxed wide-leg trousers in breathable Irish linen.', brand: 'DRIP', tags: ['bottoms', 'bestseller'], priceRange: { minVariantPrice: { amount: '120.00', currencyCode: 'USD' } }, compareAtPrice: null, rating: '4.6', stock: 24, images: { edges: [{ node: { url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80', altText: 'Linen Trousers' } }] }, variants: { edges: ['XS', 'S', 'M', 'L'].map(s => ({ node: { id: `f2-${s}`, title: `${s} / Ecru`, price: { amount: '120.00', currencyCode: 'USD' } } })) }, source: 'fallback' },

  // ---- TOPS ----
  { id: 'f3', title: 'Relaxed Cream Blouse', handle: 'relaxed-cream-blouse', description: 'A flowy blouse in soft cotton voile.', brand: 'DRIP', tags: ['tops', 'new'], priceRange: { minVariantPrice: { amount: '75.00', currencyCode: 'USD' } }, compareAtPrice: null, rating: '4.5', stock: 18, images: { edges: [{ node: { url: 'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=600&q=80', altText: 'Cream Blouse' } }] }, variants: { edges: ['XS', 'S', 'M'].map(s => ({ node: { id: `f3-${s}`, title: `${s} / Ivory`, price: { amount: '75.00', currencyCode: 'USD' } } })) }, source: 'fallback' },
  { id: 'f4', title: 'Fitted Ribbed Tank', handle: 'fitted-ribbed-tank', description: 'The perfect fitted tank in fine ribbed cotton.', brand: 'DRIP', tags: ['tops', 'bestseller'], priceRange: { minVariantPrice: { amount: '55.00', currencyCode: 'USD' } }, compareAtPrice: null, rating: '4.4', stock: 40, images: { edges: [{ node: { url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=80', altText: 'Ribbed Tank' } }] }, variants: { edges: ['XS', 'S', 'M', 'L'].map(s => ({ node: { id: `f4-${s}`, title: `${s} / Sand`, price: { amount: '55.00', currencyCode: 'USD' } } })) }, source: 'fallback' },

  // ---- JACKETS ----
  { id: 'f5', title: 'Oversized Linen Blazer', handle: 'oversized-linen-blazer', description: 'An oversized linen blazer with a lived-in feel.', brand: 'DRIP', tags: ['outerwear', 'new'], priceRange: { minVariantPrice: { amount: '195.00', currencyCode: 'USD' } }, compareAtPrice: null, rating: '4.7', stock: 15, images: { edges: [{ node: { url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80', altText: 'Linen Blazer' } }] }, variants: { edges: ['S', 'M', 'L'].map(s => ({ node: { id: `f5-${s}`, title: `${s} / Stone`, price: { amount: '195.00', currencyCode: 'USD' } } })) }, source: 'fallback' },

  // ---- DRESSES ----
  { id: 'f6', title: 'Satin Slip Midi Dress', handle: 'satin-slip-midi-dress', description: 'Fluid satin slip dress. Day to night without trying.', brand: 'DRIP', tags: ['dresses', 'bestseller'], priceRange: { minVariantPrice: { amount: '160.00', currencyCode: 'USD' } }, compareAtPrice: '200.00', rating: '4.9', stock: 3, images: { edges: [{ node: { url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80', altText: 'Slip Dress' } }] }, variants: { edges: ['XS', 'S', 'M'].map(s => ({ node: { id: `f6-${s}`, title: `${s} / Champagne`, price: { amount: '160.00', currencyCode: 'USD' } } })) }, source: 'fallback' },

  // ---- BOTTOMS ----
  { id: 'f7', title: 'Tailored Straight Trousers', handle: 'tailored-straight-trousers', description: 'Clean straight-cut trousers with a high waist.', brand: 'DRIP', tags: ['bottoms', 'new'], priceRange: { minVariantPrice: { amount: '135.00', currencyCode: 'USD' } }, compareAtPrice: null, rating: '4.6', stock: 20, images: { edges: [{ node: { url: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&q=80', altText: 'Straight Trousers' } }] }, variants: { edges: ['XS', 'S', 'M', 'L'].map(s => ({ node: { id: `f7-${s}`, title: `${s} / Oat`, price: { amount: '135.00', currencyCode: 'USD' } } })) }, source: 'fallback' },

  // ---- TOPS ----
  { id: 'f8', title: 'Cashmere Knit Sweater', handle: 'cashmere-knit-sweater', description: 'Soft generous cashmere in a relaxed fit.', brand: 'DRIP', tags: ['tops', 'bestseller'], priceRange: { minVariantPrice: { amount: '210.00', currencyCode: 'USD' } }, compareAtPrice: '280.00', rating: '4.9', stock: 7, images: { edges: [{ node: { url: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&q=80', altText: 'Cashmere Sweater' } }] }, variants: { edges: ['S', 'M', 'L'].map(s => ({ node: { id: `f8-${s}`, title: `${s} / Oatmeal`, price: { amount: '210.00', currencyCode: 'USD' } } })) }, source: 'fallback' },

  // ---- DRESSES ----
  { id: 'f9', title: 'Floral Wrap Dress', handle: 'floral-wrap-dress', description: 'A flattering wrap silhouette in a delicate floral print.', brand: 'DRIP', tags: ['dresses', 'new'], priceRange: { minVariantPrice: { amount: '145.00', currencyCode: 'USD' } }, compareAtPrice: '180.00', rating: '4.7', stock: 14, images: { edges: [{ node: { url: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=600&q=80', altText: 'Floral Wrap Dress' } }] }, variants: { edges: ['XS', 'S', 'M', 'L'].map(s => ({ node: { id: `f9-${s}`, title: `${s} / Floral`, price: { amount: '145.00', currencyCode: 'USD' } } })) }, source: 'fallback' },
  { id: 'f10', title: 'Linen Shirt Dress', handle: 'linen-shirt-dress', description: 'An effortless oversized shirt dress in breathable linen.', brand: 'DRIP', tags: ['dresses', 'bestseller'], priceRange: { minVariantPrice: { amount: '130.00', currencyCode: 'USD' } }, compareAtPrice: null, rating: '4.5', stock: 22, images: { edges: [{ node: { url: 'https://images.unsplash.com/photo-1623609163859-ca93c959b98a?w=600&q=80', altText: 'Linen Shirt Dress' } }] }, variants: { edges: ['XS', 'S', 'M', 'L'].map(s => ({ node: { id: `f10-${s}`, title: `${s} / Sand`, price: { amount: '130.00', currencyCode: 'USD' } } })) }, source: 'fallback' },
  { id: 'f11', title: 'Knit Midi Dress', handle: 'knit-midi-dress', description: 'A body-skimming knit midi dress with ribbed texture.', brand: 'DRIP', tags: ['dresses', 'new'], priceRange: { minVariantPrice: { amount: '175.00', currencyCode: 'USD' } }, compareAtPrice: '210.00', rating: '4.8', stock: 9, images: { edges: [{ node: { url: 'https://images.unsplash.com/photo-1590114538379-a84ff6ca87a0?w=600&q=80', altText: 'Knit Midi Dress' } }] }, variants: { edges: ['XS', 'S', 'M', 'L'].map(s => ({ node: { id: `f11-${s}`, title: `${s} / Camel`, price: { amount: '175.00', currencyCode: 'USD' } } })) }, source: 'fallback' },
  { id: 'f12', title: 'Pleated Chiffon Dress', handle: 'pleated-chiffon-dress', description: 'Floaty pleated chiffon dress with a v-neckline.', brand: 'DRIP', tags: ['dresses', 'bestseller'], priceRange: { minVariantPrice: { amount: '165.00', currencyCode: 'USD' } }, compareAtPrice: null, rating: '4.9', stock: 6, images: { edges: [{ node: { url: 'https://images.unsplash.com/photo-1519657337289-077653f724ed?w=600&q=80', altText: 'Pleated Chiffon Dress' } }] }, variants: { edges: ['XS', 'S', 'M', 'L'].map(s => ({ node: { id: `f12-${s}`, title: `${s} / Blush`, price: { amount: '165.00', currencyCode: 'USD' } } })) }, source: 'fallback' },

  // ---- TOPS ----
  { id: 'f13', title: 'Cropped Linen Shirt', handle: 'cropped-linen-shirt', description: 'A breezy cropped shirt in stonewashed linen.', brand: 'DRIP', tags: ['tops', 'new'], priceRange: { minVariantPrice: { amount: '68.00', currencyCode: 'USD' } }, compareAtPrice: null, rating: '4.5', stock: 30, images: { edges: [{ node: { url: 'https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?w=600&q=80', altText: 'Cropped Linen Shirt' } }] }, variants: { edges: ['XS', 'S', 'M', 'L'].map(s => ({ node: { id: `f13-${s}`, title: `${s} / White`, price: { amount: '68.00', currencyCode: 'USD' } } })) }, source: 'fallback' },
  { id: 'f14', title: 'Silk Camisole Top', handle: 'silk-camisole-top', description: 'A luxurious silk camisole with adjustable straps.', brand: 'DRIP', tags: ['tops', 'bestseller'], priceRange: { minVariantPrice: { amount: '89.00', currencyCode: 'USD' } }, compareAtPrice: '110.00', rating: '4.7', stock: 16, images: { edges: [{ node: { url: 'https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=600&q=80', altText: 'Silk Camisole Top' } }] }, variants: { edges: ['XS', 'S', 'M', 'L'].map(s => ({ node: { id: `f14-${s}`, title: `${s} / Ivory`, price: { amount: '89.00', currencyCode: 'USD' } } })) }, source: 'fallback' },
  { id: 'f15', title: 'Oversized Polo Shirt', handle: 'oversized-polo-shirt', description: 'A relaxed oversized polo in pique cotton.', brand: 'DRIP', tags: ['tops', 'new'], priceRange: { minVariantPrice: { amount: '72.00', currencyCode: 'USD' } }, compareAtPrice: null, rating: '4.4', stock: 28, images: { edges: [{ node: { url: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600&q=80', altText: 'Oversized Polo Shirt' } }] }, variants: { edges: ['XS', 'S', 'M', 'L', 'XL'].map(s => ({ node: { id: `f15-${s}`, title: `${s} / Ecru`, price: { amount: '72.00', currencyCode: 'USD' } } })) }, source: 'fallback' },
  { id: 'f16', title: 'Sheer Organza Blouse', handle: 'sheer-organza-blouse', description: 'A billowy sheer organza blouse.', brand: 'DRIP', tags: ['tops', 'bestseller'], priceRange: { minVariantPrice: { amount: '95.00', currencyCode: 'USD' } }, compareAtPrice: null, rating: '4.6', stock: 12, images: { edges: [{ node: { url: 'https://images.unsplash.com/photo-1530073391204-7b5f2214bbb6?w=600&q=80', altText: 'Sheer Organza Blouse' } }] }, variants: { edges: ['XS', 'S', 'M', 'L'].map(s => ({ node: { id: `f16-${s}`, title: `${s} / Nude`, price: { amount: '95.00', currencyCode: 'USD' } } })) }, source: 'fallback' },
  // 10 MORE OUTERWEAR
  { id: 'f34', title: 'Cropped Trench', handle: 'cropped-trench', description: 'A modern cropped version of the classic cotton trench coat.', brand: 'DRIP', tags: ['outerwear', 'new'], priceRange: { minVariantPrice: { amount: '165.00', currencyCode: 'USD' } }, compareAtPrice: '210.00', rating: '4.8', stock: 8, images: { edges: [{ node: { url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80', altText: 'Cropped Trench' } }] }, variants: { edges: ['S', 'M', 'L'].map(s => ({ node: { id: `f34-${s}`, title: `${s} / Sand`, price: { amount: '165.00', currencyCode: 'USD' } } })) }, source: 'fallback' },
  { id: 'f35', title: 'Puffer Vest', handle: 'puffer-vest', description: 'A cozy, lightweight puffer vest in a matte water-resistant finish.', brand: 'DRIP', tags: ['outerwear', 'bestseller'], priceRange: { minVariantPrice: { amount: '125.00', currencyCode: 'USD' } }, compareAtPrice: null, rating: '4.7', stock: 25, images: { edges: [{ node: { url: 'https://images.unsplash.com/photo-1604176354204-926873ff3da9?w=600&q=80', altText: 'Puffer Vest' } }] }, variants: { edges: ['S', 'M', 'L', 'XL'].map(s => ({ node: { id: `f35-${s}`, title: `${s} / Moss`, price: { amount: '125.00', currencyCode: 'USD' } } })) }, source: 'fallback' },
  { id: 'f36', title: 'Faux Fur Jacket', handle: 'faux-fur-jacket', description: 'Ultra-soft plush faux fur jacket for ultimate winter warmth.', brand: 'DRIP', tags: ['outerwear', 'new'], priceRange: { minVariantPrice: { amount: '225.00', currencyCode: 'USD' } }, compareAtPrice: '300.00', rating: '4.9', stock: 4, images: { edges: [{ node: { url: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&q=80', altText: 'Faux Fur' } }] }, variants: { edges: ['S', 'M'].map(s => ({ node: { id: `f36-${s}`, title: `${s} / Cream`, price: { amount: '225.00', currencyCode: 'USD' } } })) }, source: 'fallback' },
  { id: 'f37', title: 'Quilted Liner', handle: 'quilted-liner', description: 'A versatile quilted jacket that works as a stand-alone or a mid-layer.', brand: 'DRIP', tags: ['outerwear', 'new'], priceRange: { minVariantPrice: { amount: '110.00', currencyCode: 'USD' } }, compareAtPrice: null, rating: '4.6', stock: 18, images: { edges: [{ node: { url: 'https://images.unsplash.com/photo-1531938158074-8ba607bef122?w=600&q=80', altText: 'Quilted Liner' } }] }, variants: { edges: ['XS', 'S', 'M', 'L'].map(s => ({ node: { id: `f37-${s}`, title: `${s} / Olive`, price: { amount: '110.00', currencyCode: 'USD' } } })) }, source: 'fallback' },
  { id: 'f38', title: 'Double Breasted Blazer', handle: 'double-breasted-blazer', description: 'An elegant structured blazer with gold-tone hardware.', brand: 'DRIP', tags: ['outerwear', 'new'], priceRange: { minVariantPrice: { amount: '195.00', currencyCode: 'USD' } }, compareAtPrice: '260.00', rating: '4.8', stock: 12, images: { edges: [{ node: { url: 'https://images.unsplash.com/photo-1548121674-9dc513728365?w=600&q=80', altText: 'Blazer' } }] }, variants: { edges: ['S', 'M', 'L'].map(s => ({ node: { id: `f38-${s}`, title: `${s} / Black`, price: { amount: '195.00', currencyCode: 'USD' } } })) }, source: 'fallback' },
  { id: 'f39', title: 'Denim Trucker', handle: 'denim-trucker', description: 'A timeless oversized denim jacket in a heavy vintage wash.', brand: 'DRIP', tags: ['outerwear', 'bestseller'], priceRange: { minVariantPrice: { amount: '135.00', currencyCode: 'USD' } }, compareAtPrice: null, rating: '4.7', stock: 20, images: { edges: [{ node: { url: 'https://images.unsplash.com/photo-1544441892-794166f42a22?w=600&q=80', altText: 'Denim Jacket' } }] }, variants: { edges: ['S', 'M', 'L', 'XL'].map(s => ({ node: { id: `f39-${s}`, title: `${s} / Light Wash`, price: { amount: '135.00', currencyCode: 'USD' } } })) }, source: 'fallback' },
  { id: 'f40', title: 'Varsity Bomber', handle: 'varsity-bomber', description: 'A modern varsity jacket with wool-blend body and contrast details.', brand: 'DRIP', tags: ['outerwear', 'new'], priceRange: { minVariantPrice: { amount: '185.00', currencyCode: 'USD' } }, compareAtPrice: '240.00', rating: '4.8', stock: 6, images: { edges: [{ node: { url: 'https://images.unsplash.com/photo-1559551409-dadc959f76b8?w=600&q=80', altText: 'Varsity Jacket' } }] }, variants: { edges: ['S', 'M', 'L'].map(s => ({ node: { id: `f40-${s}`, title: `${s} / Forest`, price: { amount: '185.00', currencyCode: 'USD' } } })) }, source: 'fallback' },
  { id: 'f41', title: 'Longline Cardigan', handle: 'longline-cardigan', description: 'An extra-long soft knit cardigan for cozy layering.', brand: 'DRIP', tags: ['outerwear', 'new'], priceRange: { minVariantPrice: { amount: '115.00', currencyCode: 'USD' } }, compareAtPrice: null, rating: '4.5', stock: 22, images: { edges: [{ node: { url: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&q=80', altText: 'Long Cardigan' } }] }, variants: { edges: ['XS', 'S', 'M', 'L'].map(s => ({ node: { id: `f41-${s}`, title: `${s} / Oatmeal`, price: { amount: '115.00', currencyCode: 'USD' } } })) }, source: 'fallback' },
  { id: 'f42', title: 'Rain Mac', handle: 'rain-mac', description: 'A sleek, lightweight water-repellent mac coat.', brand: 'DRIP', tags: ['outerwear', 'new'], priceRange: { minVariantPrice: { amount: '155.00', currencyCode: 'USD' } }, compareAtPrice: '195.00', rating: '4.6', stock: 10, images: { edges: [{ node: { url: 'https://images.unsplash.com/photo-1516575334481-f8528e9466b4?w=600&q=80', altText: 'Rain Mac' } }] }, variants: { edges: ['S', 'M', 'L'].map(s => ({ node: { id: `f42-${s}`, title: `${s} / Stone`, price: { amount: '155.00', currencyCode: 'USD' } } })) }, source: 'fallback' },
  { id: 'f43', title: 'Shearling Trim Coat', handle: 'shearling-trim-coat', description: 'A warm wool-blend coat finished with soft faux shearling trims.', brand: 'DRIP', tags: ['outerwear', 'new'], priceRange: { minVariantPrice: { amount: '245.00', currencyCode: 'USD' } }, compareAtPrice: '320.00', rating: '4.9', stock: 5, images: { edges: [{ node: { url: 'https://images.unsplash.com/photo-1542060770-de5c1236173a?w=600&q=80', altText: 'Shearling Coat' } }] }, variants: { edges: ['S', 'M', 'L'].map(s => ({ node: { id: `f43-${s}`, title: `${s} / Chocolate`, price: { amount: '245.00', currencyCode: 'USD' } } })) }, source: 'fallback' },
  // ---- 4 More Dresses ----
  { id: 'f9', title: 'Floral Wrap Dress', handle: 'floral-wrap-dress', description: 'A flattering wrap silhouette in a delicate floral print. Adjustable tie waist, perfect for any occasion.', brand: 'DRIP', tags: ['dresses', 'new'], priceRange: { minVariantPrice: { amount: '145.00', currencyCode: 'USD' } }, compareAtPrice: '180.00', rating: '4.7', stock: 14, images: { edges: [{ node: { url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80', altText: 'Floral Wrap Dress' } }] }, variants: { edges: ['XS', 'S', 'M', 'L'].map(s => ({ node: { id: `f9-${s}`, title: `${s} / Floral`, price: { amount: '145.00', currencyCode: 'USD' } } })) }, source: 'fallback' },
  { id: 'f10', title: 'Linen Shirt Dress', handle: 'linen-shirt-dress', description: 'An effortless oversized shirt dress in breathable linen. Belted or loose — it works both ways.', brand: 'DRIP', tags: ['dresses', 'bestseller'], priceRange: { minVariantPrice: { amount: '130.00', currencyCode: 'USD' } }, compareAtPrice: null, rating: '4.5', stock: 22, images: { edges: [{ node: { url: 'https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?w=600&q=80', altText: 'Linen Shirt Dress' } }] }, variants: { edges: ['XS', 'S', 'M', 'L'].map(s => ({ node: { id: `f10-${s}`, title: `${s} / Sand`, price: { amount: '130.00', currencyCode: 'USD' } } })) }, source: 'fallback' },
  { id: 'f11', title: 'Knit Midi Dress', handle: 'knit-midi-dress', description: 'A body-skimming knit midi dress with ribbed texture. Understated and elegant for any season.', brand: 'DRIP', tags: ['dresses', 'new'], priceRange: { minVariantPrice: { amount: '175.00', currencyCode: 'USD' } }, compareAtPrice: '210.00', rating: '4.8', stock: 9, images: { edges: [{ node: { url: 'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=600&q=80', altText: 'Knit Midi Dress' } }] }, variants: { edges: ['XS', 'S', 'M', 'L'].map(s => ({ node: { id: `f11-${s}`, title: `${s} / Camel`, price: { amount: '175.00', currencyCode: 'USD' } } })) }, source: 'fallback' },
  { id: 'f12', title: 'Pleated Chiffon Dress', handle: 'pleated-chiffon-dress', description: 'Floaty pleated chiffon dress with a v-neckline and subtle shimmer. Made for golden hour.', brand: 'DRIP', tags: ['dresses', 'bestseller'], priceRange: { minVariantPrice: { amount: '165.00', currencyCode: 'USD' } }, compareAtPrice: null, rating: '4.9', stock: 6, images: { edges: [{ node: { url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&q=80', altText: 'Pleated Chiffon Dress' } }] }, variants: { edges: ['XS', 'S', 'M', 'L'].map(s => ({ node: { id: `f12-${s}`, title: `${s} / Blush`, price: { amount: '165.00', currencyCode: 'USD' } } })) }, source: 'fallback' },

  // ---- 4 More Tops ----
  { id: 'f13', title: 'Cropped Linen Shirt', handle: 'cropped-linen-shirt', description: 'A breezy cropped shirt in stonewashed linen. Effortlessly cool with high-waisted anything.', brand: 'DRIP', tags: ['tops', 'new'], priceRange: { minVariantPrice: { amount: '68.00', currencyCode: 'USD' } }, compareAtPrice: null, rating: '4.5', stock: 30, images: { edges: [{ node: { url: 'https://images.unsplash.com/photo-1554412933-514a83d2f3c8?w=600&q=80', altText: 'Cropped Linen Shirt' } }] }, variants: { edges: ['XS', 'S', 'M', 'L'].map(s => ({ node: { id: `f13-${s}`, title: `${s} / White`, price: { amount: '68.00', currencyCode: 'USD' } } })) }, source: 'fallback' },
  { id: 'f14', title: 'Silk Camisole Top', handle: 'silk-camisole-top', description: 'A luxurious silk camisole with adjustable straps and a delicate lace trim. Layer it or wear it alone.', brand: 'DRIP', tags: ['tops', 'bestseller'], priceRange: { minVariantPrice: { amount: '89.00', currencyCode: 'USD' } }, compareAtPrice: '110.00', rating: '4.7', stock: 16, images: { edges: [{ node: { url: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600&q=80', altText: 'Silk Camisole Top' } }] }, variants: { edges: ['XS', 'S', 'M', 'L'].map(s => ({ node: { id: `f14-${s}`, title: `${s} / Ivory`, price: { amount: '89.00', currencyCode: 'USD' } } })) }, source: 'fallback' },
  { id: 'f15', title: 'Oversized Polo Shirt', handle: 'oversized-polo-shirt', description: 'A relaxed oversized polo in pique cotton. Tuck it in for clean girl vibes or leave it out for casual cool.', brand: 'DRIP', tags: ['tops', 'new'], priceRange: { minVariantPrice: { amount: '72.00', currencyCode: 'USD' } }, compareAtPrice: null, rating: '4.4', stock: 28, images: { edges: [{ node: { url: 'https://images.unsplash.com/photo-1598033129183-c4f50c7176510?w=600&q=80', altText: 'Oversized Polo Shirt' } }] }, variants: { edges: ['XS', 'S', 'M', 'L', 'XL'].map(s => ({ node: { id: `f15-${s}`, title: `${s} / Ecru`, price: { amount: '72.00', currencyCode: 'USD' } } })) }, source: 'fallback' },
  { id: 'f16', title: 'Sheer Organza Blouse', handle: 'sheer-organza-blouse', description: 'A billowy sheer organza blouse with button-down front. Wear over a slip or a bralette for a fashion-forward look.', brand: 'DRIP', tags: ['tops', 'bestseller'], priceRange: { minVariantPrice: { amount: '95.00', currencyCode: 'USD' } }, compareAtPrice: null, rating: '4.6', stock: 12, images: { edges: [{ node: { url: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=600&q=80', altText: 'Sheer Organza Blouse' } }] }, variants: { edges: ['XS', 'S', 'M', 'L'].map(s => ({ node: { id: `f16-${s}`, title: `${s} / Nude`, price: { amount: '95.00', currencyCode: 'USD' } } })) }, source: 'fallback' },

  // ---- 5 Jackets ----
  // ---- JACKETS ----
  { id: 'f17', title: 'Classic Denim Jacket', handle: 'classic-denim-jacket', description: 'A timeless denim jacket in mid-wash blue.', brand: 'DRIP', tags: ['outerwear', 'bestseller'], priceRange: { minVariantPrice: { amount: '115.00', currencyCode: 'USD' } }, compareAtPrice: null, rating: '4.7', stock: 25, images: { edges: [{ node: { url: 'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=600&q=80', altText: 'Classic Denim Jacket' } }] }, variants: { edges: ['XS', 'S', 'M', 'L', 'XL'].map(s => ({ node: { id: `f17-${s}`, title: `${s} / Mid Wash`, price: { amount: '115.00', currencyCode: 'USD' } } })) }, source: 'fallback' },
  { id: 'f18', title: 'Cropped Leather Jacket', handle: 'cropped-leather-jacket', description: 'A sleek cropped leather jacket with silver hardware.', brand: 'DRIP', tags: ['outerwear', 'new'], priceRange: { minVariantPrice: { amount: '280.00', currencyCode: 'USD' } }, compareAtPrice: '350.00', rating: '4.9', stock: 7, images: { edges: [{ node: { url: 'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=600&q=80', altText: 'Cropped Leather Jacket' } }] }, variants: { edges: ['XS', 'S', 'M', 'L'].map(s => ({ node: { id: `f18-${s}`, title: `${s} / Black`, price: { amount: '280.00', currencyCode: 'USD' } } })) }, source: 'fallback' },
  { id: 'f19', title: 'Teddy Shearling Coat', handle: 'teddy-shearling-coat', description: 'An incredibly cozy teddy shearling coat.', brand: 'DRIP', tags: ['outerwear', 'bestseller'], priceRange: { minVariantPrice: { amount: '245.00', currencyCode: 'USD' } }, compareAtPrice: null, rating: '4.8', stock: 11, images: { edges: [{ node: { url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80', altText: 'Teddy Shearling Coat' } }] }, variants: { edges: ['XS', 'S', 'M', 'L'].map(s => ({ node: { id: `f19-${s}`, title: `${s} / Cream`, price: { amount: '245.00', currencyCode: 'USD' } } })) }, source: 'fallback' },
  { id: 'f20', title: 'Trench Coat', handle: 'trench-coat', description: 'The forever classic trench coat.', brand: 'DRIP', tags: ['outerwear', 'new'], priceRange: { minVariantPrice: { amount: '310.00', currencyCode: 'USD' } }, compareAtPrice: '380.00', rating: '4.9', stock: 5, images: { edges: [{ node: { url: 'https://images.unsplash.com/photo-1463100099107-aa0980c362e6?w=600&q=80', altText: 'Trench Coat' } }] }, variants: { edges: ['XS', 'S', 'M', 'L', 'XL'].map(s => ({ node: { id: `f20-${s}`, title: `${s} / Camel`, price: { amount: '310.00', currencyCode: 'USD' } } })) }, source: 'fallback' },
  { id: 'f21', title: 'Quilted Puffer Vest', handle: 'quilted-puffer-vest', description: 'A sleeveless quilted puffer vest in a luxe matte finish.', brand: 'DRIP', tags: ['outerwear', 'bestseller'], priceRange: { minVariantPrice: { amount: '135.00', currencyCode: 'USD' } }, compareAtPrice: null, rating: '4.6', stock: 19, images: { edges: [{ node: { url: 'https://images.unsplash.com/photo-1456291253866-c5d7e3a77edd?w=600&q=80', altText: 'Quilted Puffer Vest' } }] }, variants: { edges: ['XS', 'S', 'M', 'L'].map(s => ({ node: { id: `f21-${s}`, title: `${s} / Taupe`, price: { amount: '135.00', currencyCode: 'USD' } } })) }, source: 'fallback' },

  // ---- 5 Jeans ----
  // ---- BOTTOMS ----
  { id: 'f22', title: 'High Waist Straight Jeans', handle: 'high-waist-straight-jeans', description: 'The perfect high-waist straight leg jean.', brand: 'DRIP', tags: ['bottoms', 'bestseller'], priceRange: { minVariantPrice: { amount: '98.00', currencyCode: 'USD' } }, compareAtPrice: null, rating: '4.8', stock: 32, images: { edges: [{ node: { url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80', altText: 'High Waist Straight Jeans' } }] }, variants: { edges: ['24', '26', '28', '30', '32'].map(s => ({ node: { id: `f22-${s}`, title: `W${s} / Indigo`, price: { amount: '98.00', currencyCode: 'USD' } } })) }, source: 'fallback' },
  { id: 'f23', title: 'Wide Leg Jeans', handle: 'wide-leg-jeans', description: 'Ultra wide leg jeans in a vintage light wash.', brand: 'DRIP', tags: ['bottoms', 'new'], priceRange: { minVariantPrice: { amount: '110.00', currencyCode: 'USD' } }, compareAtPrice: '135.00', rating: '4.7', stock: 18, images: { edges: [{ node: { url: 'https://images.unsplash.com/photo-1475178626620-a4d074967452?w=600&q=80', altText: 'Wide Leg Jeans' } }] }, variants: { edges: ['24', '26', '28', '30', '32'].map(s => ({ node: { id: `f23-${s}`, title: `W${s} / Light Wash`, price: { amount: '110.00', currencyCode: 'USD' } } })) }, source: 'fallback' },
  { id: 'f24', title: 'Barrel Leg Jeans', handle: 'barrel-leg-jeans', description: 'The trending barrel leg silhouette in a medium vintage wash.', brand: 'DRIP', tags: ['bottoms', 'new'], priceRange: { minVariantPrice: { amount: '125.00', currencyCode: 'USD' } }, compareAtPrice: null, rating: '4.6', stock: 14, images: { edges: [{ node: { url: 'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600&q=80', altText: 'Barrel Leg Jeans' } }] }, variants: { edges: ['24', '26', '28', '30', '32'].map(s => ({ node: { id: `f24-${s}`, title: `W${s} / Vintage`, price: { amount: '125.00', currencyCode: 'USD' } } })) }, source: 'fallback' },
  { id: 'f25', title: 'Slim Fit Black Jeans', handle: 'slim-fit-black-jeans', description: 'A sleek slim fit jean in jet black.', brand: 'DRIP', tags: ['bottoms', 'bestseller'], priceRange: { minVariantPrice: { amount: '92.00', currencyCode: 'USD' } }, compareAtPrice: null, rating: '4.5', stock: 27, images: { edges: [{ node: { url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80', altText: 'Slim Fit Black Jeans' } }] }, variants: { edges: ['24', '26', '28', '30', '32'].map(s => ({ node: { id: `f25-${s}`, title: `W${s} / Black`, price: { amount: '92.00', currencyCode: 'USD' } } })) }, source: 'fallback' },
  { id: 'f26', title: 'Distressed Mom Jeans', handle: 'distressed-mom-jeans', description: 'Classic 90s mom jeans with authentic distressing.', brand: 'DRIP', tags: ['bottoms', 'new'], priceRange: { minVariantPrice: { amount: '105.00', currencyCode: 'USD' } }, compareAtPrice: '130.00', rating: '4.6', stock: 20, images: { edges: [{ node: { url: 'https://images.unsplash.com/photo-1555689502-c4b22d76c56f?w=600&q=80', altText: 'Distressed Mom Jeans' } }] }, variants: { edges: ['24', '26', '28', '30', '32'].map(s => ({ node: { id: `f26-${s}`, title: `W${s} / Light Blue`, price: { amount: '105.00', currencyCode: 'USD' } } })) }, source: 'fallback' },
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

        console.log(`[DRIP] ✓ Using ${products.length} products from ${api.name}`)
        cachedProducts = products
        return products
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
