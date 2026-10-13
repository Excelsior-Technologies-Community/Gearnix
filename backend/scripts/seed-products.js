/**
 * seed-products.js — top up the catalogue so each category has ~4 products
 * (for a full-looking New Arrivals / Top Rated section). Idempotent: skips any
 * product whose SKU already exists. Run: node scripts/seed-products.js
 */
require('dotenv').config()
const mysql = require('mysql2/promise')

const slugify = (s) => String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

// catgory keyword → the DB category to attach to
const PRODUCTS = [
  // Gaming Keyboards
  { name: 'Pulsar Phantom', cat: 'keyboard', price: 8999, discount: null, stock: 30, sku: 'KB-003', img: '/assets/cat-keyboards.jpg', sd: 'Compact TKL mechanical keyboard' },
  { name: 'Nebula Ranger', cat: 'keyboard', price: 7499, discount: null, stock: 25, sku: 'KB-004', img: '/assets/prod-kb-2.jpg', sd: 'Full-size RGB mechanical keyboard' },
  // Gaming Mouse
  { name: 'Eclipse RGB Pro Mouse', cat: 'mouse', price: 5499, discount: null, stock: 40, sku: 'MS-002', img: '/assets/cat-mouse.jpg', sd: 'High-precision RGB gaming mouse' },
  { name: 'Nebula Quantum Mouse', cat: 'mouse', price: 6299, discount: null, stock: 35, sku: 'MS-003', img: '/assets/prod-mouse-2.jpg', sd: 'Ergonomic wireless gaming mouse' },
  { name: 'Zephyr Wireless Mouse', cat: 'mouse', price: 7999, discount: 6999, stock: 20, sku: 'MS-004', img: '/assets/prod-mouse-3.jpg', sd: 'Ultra-light wireless gaming mouse' },
  // Gaming Headsets
  { name: 'Phantom Elite Headset Pro', cat: 'head', price: 6499, discount: null, stock: 28, sku: 'HS-002', img: '/assets/cat-headphones.jpg', sd: '7.1 surround gaming headset' },
  { name: 'Aurora Glide Headset', cat: 'head', price: 5999, discount: null, stock: 32, sku: 'HS-003', img: '/assets/deal-headphones.png', sd: 'Wireless over-ear headset' },
  { name: 'Vortex Surround Headset', cat: 'head', price: 5499, discount: null, stock: 26, sku: 'HS-004', img: '/assets/prod-head-2.jpg', sd: 'Immersive RGB gaming headset' },
  // Gaming Controllers
  { name: 'Eclipse Vortex Controller', cat: 'controller', price: 4999, discount: null, stock: 22, sku: 'CTRL-002', img: '/assets/cat-controllers.jpg', sd: 'Wireless precision controller' },
  { name: 'Galaxy Striker Controller', cat: 'controller', price: 5499, discount: null, stock: 18, sku: 'CTRL-003', img: '/assets/prod-ctrl-2.jpg', sd: 'Pro-grade gaming controller' },
  { name: 'Aurora Sentinel Controller', cat: 'controller', price: 4499, discount: null, stock: 24, sku: 'CTRL-004', img: '/assets/prod-ctrl-3.jpg', sd: 'Low-latency wireless controller' },
]

const matchCat = (cats, keyword) =>
  cats.find((c) => {
    const n = c.name.toLowerCase()
    if (keyword === 'mouse') return n.includes('mouse') || n.includes('mice')
    if (keyword === 'head') return n.includes('head')
    if (keyword === 'keyboard') return n.includes('keyboard')
    if (keyword === 'controller') return n.includes('controller')
    return false
  })

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST, port: Number(process.env.DB_PORT),
    user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
  })

  const [catRows] = await conn.query('CALL sp_GetCategories(0)')
  const cats = catRows[0]
  const [prodRows] = await conn.query('CALL sp_GetProducts(0, NULL, NULL)')
  const existingSkus = new Set(prodRows[0].map((p) => p.sku))

  let added = 0
  for (const p of PRODUCTS) {
    if (existingSkus.has(p.sku)) { console.log(`• skip ${p.sku} (exists)`); continue }
    const category = matchCat(cats, p.cat)
    if (!category) { console.log(`! no category for ${p.name}`); continue }

    const [res] = await conn.query('CALL sp_AddProduct(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
      p.name, slugify(p.name), p.sd, p.sd + '. Built for competitive gamers.',
      p.price, p.discount, p.stock, p.sku, category.id, 'active',
    ])
    const id = res[0][0].id
    await conn.query('CALL sp_AddProductImage(?, ?, ?, ?)', [id, p.img, 1, 0])
    console.log(`✓ added ${p.name} (${category.name})`)
    added++
  }

  const [after] = await conn.query('CALL sp_GetCategories(0)')
  console.log('\nProducts per category:')
  after[0].forEach((c) => console.log(`  ${c.name}: ${c.product_count}`))
  console.log(`\n${added} products added.`)
  await conn.end()
}

main().catch((e) => { console.error('❌', e.message); process.exit(1) })
