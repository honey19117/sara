import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { db, run, all, get, exec } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const seedDatabase = async () => {
  console.log('--- Seeding AURA Luxe Database ---');

  // 1. Initialize schema
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  await exec(schemaSql);
  console.log('✓ Database Schema applied successfully.');

  // Check if already seeded
  const existingProducts = await get('SELECT COUNT(*) as count FROM products');
  if (existingProducts && existingProducts.count > 0) {
    console.log(`Database already has ${existingProducts.count} products. Skipping seeding.`);
    return;
  }

  // 2. Seed Users (Admin & Customer)
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('admin123', salt);
  const customerPassword = await bcrypt.hash('customer123', salt);

  const adminResult = await run(
    `INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)`,
    ['AURA Executive Admin', 'admin@auraluxe.com', adminPassword, 'admin', '+91 98765 43210']
  );

  const customerResult = await run(
    `INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)`,
    ['Rohit Sharma', 'customer@auraluxe.com', customerPassword, 'customer', '+91 91234 56789']
  );

  // Seed default address for demo customer
  await run(
    `INSERT INTO addresses (user_id, full_name, phone, address_line1, address_line2, city, state, pincode, is_default)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
    [customerResult.lastID, 'Rohit Sharma', '+91 91234 56789', 'Penthouse 402, Signature Towers', 'Golf Course Road, DLF Phase 5', 'Gurugram', 'Haryana', '122002']
  );

  console.log('✓ Users & default address seeded.');

  // 3. Seed Categories
  const categories = [
    {
      name: 'Audio & Acoustics',
      slug: 'audio-acoustics',
      description: 'Audiophile-grade wireless sound systems, planar magnetic headphones, and precision monitors.',
      image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      is_featured: 1
    },
    {
      name: 'Precision Timepieces',
      slug: 'precision-timepieces',
      description: 'Handcrafted Swiss automatic movements, sapphire crystal glass, and minimal luxury chronographs.',
      image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      is_featured: 1
    },
    {
      name: 'Designer Apparel',
      slug: 'designer-apparel',
      description: 'Tailored merino wool overcoats, heavyweight Japanese cotton tees, and bespoke modern silhouettes.',
      image_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
      is_featured: 1
    },
    {
      name: 'Leather Goods & Bags',
      slug: 'leather-goods',
      description: 'Full-grain Italian Tuscan leather briefcases, travel duffels, and minimalist card sleeves.',
      image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
      is_featured: 1
    },
    {
      name: 'Haute Parfumerie',
      slug: 'haute-parfumerie',
      description: 'Artisanal niche fragrances crafted with Madagascar vanilla, French lavender, and rare Cambodian oud.',
      image_url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',
      is_featured: 1
    },
    {
      name: 'Modern Eyewear',
      slug: 'modern-eyewear',
      description: 'Japanese titanium frames with polarized UV400 antireflective gradient optics.',
      image_url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
      is_featured: 1
    }
  ];

  const categoryMap = {};
  for (const cat of categories) {
    const res = await run(
      `INSERT INTO categories (name, slug, description, image_url, is_featured) VALUES (?, ?, ?, ?, ?)`,
      [cat.name, cat.slug, cat.description, cat.image_url, cat.is_featured]
    );
    categoryMap[cat.slug] = res.lastID;
  }
  console.log('✓ Categories seeded.');

  // 4. Seed Products with Variants & Gallery
  const products = [
    // --- Audio ---
    {
      category_id: categoryMap['audio-acoustics'],
      name: 'AURA Sphere Master Wireless Headphones',
      slug: 'aura-sphere-master-headphones',
      price: 24999,
      compare_price: 29999,
      discount_percent: 17,
      sku: 'AUR-AUD-001',
      stock: 35,
      is_featured: 1,
      is_trending: 1,
      is_new_arrival: 1,
      rating: 4.9,
      reviews_count: 48,
      short_description: 'Custom 45mm beryllium drivers with lossless Bluetooth 5.4, active noise cancellation and 40-hour endurance.',
      description: `Engineered for pure acoustic transparency, the AURA Sphere Master wireless headphones feature bespoke 45mm custom-tuned beryllium dynamic drivers. Encased in bead-blasted anodized aluminum with lambskin leather ear cushions, they deliver unmatched depth, pristine highs, and visceral low-end response.
Features:
- Adaptive Hybrid Noise Cancellation with Transparency mode
- Lossless LDAC, aptX HD and AAC codec support
- 40 hours continuous playback with fast USB-C charge (10 mins = 6 hours)
- Quad microphone array with AI ambient beamforming for crystal clear voice`,
      images: [
        { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80', is_primary: 1 },
        { url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1000&q=80', is_primary: 0 },
        { url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1000&q=80', is_primary: 0 }
      ],
      variants: [
        { name: 'Matte Obsidian Black', color: 'Obsidian', color_code: '#18181B', size: 'Standard', sku: 'AUR-AUD-001-BLK', price: 24999, stock: 20 },
        { name: 'Champagne Silver', color: 'Silver', color_code: '#E2E8F0', size: 'Standard', sku: 'AUR-AUD-001-SLV', price: 24999, stock: 15 }
      ]
    },
    {
      category_id: categoryMap['audio-acoustics'],
      name: 'Vessel Acoustic Hi-Fi Home Speaker',
      slug: 'vessel-acoustic-hi-fi-speaker',
      price: 34999,
      compare_price: 39999,
      discount_percent: 13,
      sku: 'AUR-AUD-002',
      stock: 18,
      is_featured: 1,
      is_trending: 0,
      is_new_arrival: 1,
      rating: 4.8,
      reviews_count: 29,
      short_description: 'Room-filling 120W acoustic sculpture with Danish wool grille, walnut veneer body, and Apple AirPlay 2.',
      description: `A harmonious synthesis of modernist interior sculpture and studio-grade sound. Hand-finished American Walnut housing paired with Kvadrat wool fabric creates an organic warmth that anchors any living space while delivering 360-degree holographic sound staging.`,
      images: [
        { url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1000&q=80', is_primary: 1 },
        { url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=1000&q=80', is_primary: 0 }
      ],
      variants: [
        { name: 'American Walnut', color: 'Walnut', color_code: '#5C4033', size: '120W', sku: 'AUR-AUD-002-WAL', price: 34999, stock: 10 },
        { name: 'Nordic Ash', color: 'Ash Grey', color_code: '#A0AEC0', size: '120W', sku: 'AUR-AUD-002-ASH', price: 34999, stock: 8 }
      ]
    },

    // --- Watches ---
    {
      category_id: categoryMap['precision-timepieces'],
      name: 'Chronograph Minimalist Monolith Watch',
      slug: 'chronograph-minimalist-monolith-watch',
      price: 18999,
      compare_price: 22999,
      discount_percent: 17,
      sku: 'AUR-WTC-001',
      stock: 25,
      is_featured: 1,
      is_trending: 1,
      is_new_arrival: 0,
      rating: 4.9,
      reviews_count: 64,
      short_description: '316L Surgical grade stainless steel, Swiss Ronda movement, domed sapphire glass with anti-reflective coating.',
      description: `Crafted for discerning collectors, the Monolith Chronograph combines architectural discipline with Swiss quartz precision. Features a brushed 40mm steel case, sunburst anthracite dial, sub-second chronograph dials, and quick-release Milanese mesh strap. Water resistant to 5 ATM.`,
      images: [
        { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80', is_primary: 1 },
        { url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=80', is_primary: 0 },
        { url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=80', is_primary: 0 }
      ],
      variants: [
        { name: 'Anthracite / Steel Mesh', color: 'Steel', color_code: '#CBD5E1', size: '40mm', sku: 'AUR-WTC-001-STL', price: 18999, stock: 15 },
        { name: 'Rose Gold / Italian Calfskin', color: 'Rose Gold', color_code: '#B76E79', size: '40mm', sku: 'AUR-WTC-001-RSG', price: 19999, stock: 10 }
      ]
    },
    {
      category_id: categoryMap['precision-timepieces'],
      name: 'AURA Horizon Automatic Diver 200M',
      slug: 'aura-horizon-automatic-diver-watch',
      price: 29999,
      compare_price: 34999,
      discount_percent: 14,
      sku: 'AUR-WTC-002',
      stock: 14,
      is_featured: 1,
      is_trending: 1,
      is_new_arrival: 1,
      rating: 5.0,
      reviews_count: 31,
      short_description: 'Japanese Miyota 9015 Automatic caliber, ceramic unidirectional bezel, and Super-LumiNova BGW9 indices.',
      description: `The Horizon Diver is built to withstand extreme maritime pressure while maintaining effortless evening elegance. With a 42-hour power reserve, 200-meter water resistance, and high-contrast luminous markers, it is a masterclass in modern horology.`,
      images: [
        { url: 'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?auto=format&fit=crop&w=1000&q=80', is_primary: 1 },
        { url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1000&q=80', is_primary: 0 }
      ],
      variants: [
        { name: 'Deep Sea Cerulean', color: 'Cerulean Blue', color_code: '#1E3A8A', size: '41mm', sku: 'AUR-WTC-002-BLU', price: 29999, stock: 8 },
        { name: 'Midnight Shadow Ceramic', color: 'Ceramic Black', color_code: '#000000', size: '41mm', sku: 'AUR-WTC-002-BLK', price: 31999, stock: 6 }
      ]
    },

    // --- Apparel ---
    {
      category_id: categoryMap['designer-apparel'],
      name: 'Tailored Cashmere-Merino Overcoat',
      slug: 'tailored-cashmere-merino-overcoat',
      price: 15499,
      compare_price: 18999,
      discount_percent: 18,
      sku: 'AUR-APP-001',
      stock: 40,
      is_featured: 1,
      is_trending: 1,
      is_new_arrival: 0,
      rating: 4.8,
      reviews_count: 52,
      short_description: '90% Extra-fine Merino Wool, 10% Mongolian Cashmere, hand-stitched notch lapels, horn buttons.',
      description: `Woven from a rich blend of ethically sourced Merino and Cashmere yarns, this structured overcoat offers exceptional insulating warmth without bulk. Features cupro lining, interior chest passport pocket, and a clean single-breasted front.`,
      images: [
        { url: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=1000&q=80', is_primary: 1 },
        { url: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=80', is_primary: 0 }
      ],
      variants: [
        { name: 'Camel Tan / M', color: 'Camel', color_code: '#C19A6B', size: 'M', sku: 'AUR-APP-001-CAM-M', price: 15499, stock: 10 },
        { name: 'Camel Tan / L', color: 'Camel', color_code: '#C19A6B', size: 'L', sku: 'AUR-APP-001-CAM-L', price: 15499, stock: 10 },
        { name: 'Charcoal Grey / M', color: 'Charcoal', color_code: '#374151', size: 'M', sku: 'AUR-APP-001-CHR-M', price: 15499, stock: 10 },
        { name: 'Charcoal Grey / L', color: 'Charcoal', color_code: '#374151', size: 'L', sku: 'AUR-APP-001-CHR-L', price: 15499, stock: 10 }
      ]
    },
    {
      category_id: categoryMap['designer-apparel'],
      name: 'Heavyweight Supima Relaxed Hoodie',
      slug: 'heavyweight-supima-relaxed-hoodie',
      price: 4999,
      compare_price: 5999,
      discount_percent: 17,
      sku: 'AUR-APP-002',
      stock: 60,
      is_featured: 0,
      is_trending: 1,
      is_new_arrival: 1,
      rating: 4.9,
      reviews_count: 88,
      short_description: '450 GSM French Terry organic Supima cotton, seamless kangaroo pocket, pre-shrunk luxury drape.',
      description: `Crafted from 100% long-staple Supima combed cotton with a substantial 450 GSM weight. Features flatlock stitching, rib-knit gussets, and custom zinc-alloy aglets.`,
      images: [
        { url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80', is_primary: 1 },
        { url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1000&q=80', is_primary: 0 }
      ],
      variants: [
        { name: 'Stone Grey / S', color: 'Stone', color_code: '#E5E7EB', size: 'S', sku: 'AUR-APP-002-STN-S', price: 4999, stock: 15 },
        { name: 'Stone Grey / M', color: 'Stone', color_code: '#E5E7EB', size: 'M', sku: 'AUR-APP-002-STN-M', price: 4999, stock: 20 },
        { name: 'Onyx Black / M', color: 'Onyx', color_code: '#111827', size: 'M', sku: 'AUR-APP-002-ONX-M', price: 4999, stock: 15 },
        { name: 'Onyx Black / L', color: 'Onyx', color_code: '#111827', size: 'L', sku: 'AUR-APP-002-ONX-L', price: 4999, stock: 10 }
      ]
    },

    // --- Leather Goods ---
    {
      category_id: categoryMap['leather-goods'],
      name: 'Executive Tuscan Full-Grain Briefcase',
      slug: 'executive-tuscan-leather-briefcase',
      price: 16999,
      compare_price: 20999,
      discount_percent: 19,
      sku: 'AUR-LTH-001',
      stock: 22,
      is_featured: 1,
      is_trending: 1,
      is_new_arrival: 0,
      rating: 4.9,
      reviews_count: 42,
      short_description: 'Vegetable-tanned Florentine leather, padded 16" MacBook compartment, solid brass hardware with YKK Excella zippers.',
      description: `Handmade in Florence using time-honored vegetable tanning methods, this briefcase develops a rich patina over decades of use. Designed with dedicated organizational sleeves for tech accessories, pens, documents, and an adjustable shoulder strap.`,
      images: [
        { url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80', is_primary: 1 },
        { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80', is_primary: 0 }
      ],
      variants: [
        { name: 'Cognac Brown', color: 'Cognac', color_code: '#9A3412', size: '16 Inch', sku: 'AUR-LTH-001-CGN', price: 16999, stock: 12 },
        { name: 'Espresso Dark Brown', color: 'Espresso', color_code: '#3E2723', size: '16 Inch', sku: 'AUR-LTH-001-ESP', price: 16999, stock: 10 }
      ]
    },
    {
      category_id: categoryMap['leather-goods'],
      name: 'Voyager Weekend Duffel Bag',
      slug: 'voyager-weekend-leather-duffel',
      price: 19499,
      compare_price: 23999,
      discount_percent: 19,
      sku: 'AUR-LTH-002',
      stock: 16,
      is_featured: 1,
      is_trending: 0,
      is_new_arrival: 1,
      rating: 4.9,
      reviews_count: 36,
      short_description: '45L airline carry-on compliant, separate ventilated shoe compartment, reinforced base studs.',
      description: `The quintessential companion for 72-hour escapes. Features an expansive main compartment lined with waterproof herringbone twill, dedicated shoe pocket, and luggage trolley strap for seamless airport navigation.`,
      images: [
        { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80', is_primary: 1 },
        { url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80', is_primary: 0 }
      ],
      variants: [
        { name: 'Midnight Matte Black', color: 'Black', color_code: '#1F2937', size: '45L', sku: 'AUR-LTH-002-BLK', price: 19499, stock: 9 },
        { name: 'Vintage Saddle Tan', color: 'Saddle Tan', color_code: '#B45309', size: '45L', sku: 'AUR-LTH-002-TAN', price: 19499, stock: 7 }
      ]
    },

    // --- Fragrance ---
    {
      category_id: categoryMap['haute-parfumerie'],
      name: 'AURA Nuit Royale Extrait de Parfum (100ml)',
      slug: 'aura-nuit-royale-extrait-parfum',
      price: 11999,
      compare_price: 14499,
      discount_percent: 17,
      sku: 'AUR-FRG-001',
      stock: 45,
      is_featured: 1,
      is_trending: 1,
      is_new_arrival: 1,
      rating: 5.0,
      reviews_count: 73,
      short_description: '35% Oil concentration. Top notes of Bergamot & Cardamom; Heart of Bourbon Vanilla & Smoky Leather; Base of Aged Agarwood (Oud).',
      description: `An opulent, intoxicating scent formulated in Grasse, France. Nuit Royale opens with sparkling Calabrian bergamot and spicy green cardamom, melting into rich Madagascar vanilla absolute, smoky birch tar, and century-old wild Cambodian oud. 14+ hours sillage.`,
      images: [
        { url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1000&q=80', is_primary: 1 },
        { url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=80', is_primary: 0 }
      ],
      variants: [
        { name: '100ml Heavyweight Glass Flacon', color: 'Amber Flacon', color_code: '#D97706', size: '100ml', sku: 'AUR-FRG-001-100', price: 11999, stock: 30 },
        { name: '50ml Travel Flacon', color: 'Amber Flacon', color_code: '#D97706', size: '50ml', sku: 'AUR-FRG-001-50', price: 6999, stock: 15 }
      ]
    },
    {
      category_id: categoryMap['haute-parfumerie'],
      name: 'Solaris Vetiver Eau de Parfum (100ml)',
      slug: 'solaris-vetiver-eau-de-parfum',
      price: 8999,
      compare_price: 10499,
      discount_percent: 14,
      sku: 'AUR-FRG-002',
      stock: 30,
      is_featured: 0,
      is_trending: 1,
      is_new_arrival: 0,
      rating: 4.8,
      reviews_count: 39,
      short_description: 'Crisp Sicilian Grapefruit, Haitian Vetiver, Pink Peppercorn, and Cashmeran Cedar.',
      description: `A vibrant, sun-drenched olfactory voyage evoking Mediterranean coastal cliffs. Bright citrus zest harmonizes with earthy Haitian roots and soft white musk for effortless all-day sophistication.`,
      images: [
        { url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=80', is_primary: 1 },
        { url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1000&q=80', is_primary: 0 }
      ],
      variants: [
        { name: '100ml Flacon', color: 'Clear Glass', color_code: '#E0F2FE', size: '100ml', sku: 'AUR-FRG-002-100', price: 8999, stock: 30 }
      ]
    },

    // --- Eyewear ---
    {
      category_id: categoryMap['modern-eyewear'],
      name: 'Aerospace Titanium Polarized Sunglasses',
      slug: 'aerospace-titanium-sunglasses',
      price: 9999,
      compare_price: 12499,
      discount_percent: 20,
      sku: 'AUR-EYE-001',
      stock: 28,
      is_featured: 1,
      is_trending: 1,
      is_new_arrival: 1,
      rating: 4.9,
      reviews_count: 45,
      short_description: 'Ultra-lightweight Japanese Beta-Titanium (16g), Zeiss category-3 polarized lenses, silicone nose pads.',
      description: `Engineered from aerospace-grade beta-titanium, these sunglasses weigh just 16 grams for weightless comfort. Fitted with world-class Carl Zeiss polarized optics providing 100% UVA/UVB protection and zero chromatic aberration.`,
      images: [
        { url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1000&q=80', is_primary: 1 },
        { url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=1000&q=80', is_primary: 0 }
      ],
      variants: [
        { name: 'Gunmetal Frame / Polarized Green', color: 'Gunmetal', color_code: '#475569', size: '52-19-145', sku: 'AUR-EYE-001-GNM', price: 9999, stock: 15 },
        { name: 'Champagne Gold / Amber Gradient', color: 'Gold', color_code: '#EAB308', size: '52-19-145', sku: 'AUR-EYE-001-GLD', price: 9999, stock: 13 }
      ]
    },
    {
      category_id: categoryMap['modern-eyewear'],
      name: 'Architectural Acetate Optical Frames',
      slug: 'architectural-acetate-optical-frames',
      price: 7499,
      compare_price: 8999,
      discount_percent: 16,
      sku: 'AUR-EYE-002',
      stock: 35,
      is_featured: 0,
      is_trending: 0,
      is_new_arrival: 0,
      rating: 4.7,
      reviews_count: 24,
      short_description: 'Custom Mazzucchelli 1849 Italian cellulose acetate, 7-barrel hinges, custom wire core engraving.',
      description: `Sculpted from 8mm cured Italian bio-acetate, featuring hand-beveled rims and custom wire temples. Includes blue-light filtering demo lenses, hard travel case, and microfiber polishing cloth.`,
      images: [
        { url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=1000&q=80', is_primary: 1 },
        { url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1000&q=80', is_primary: 0 }
      ],
      variants: [
        { name: 'Tortoiseshell Havana', color: 'Tortoise', color_code: '#78350F', size: '49-21-145', sku: 'AUR-EYE-002-TRT', price: 7499, stock: 18 },
        { name: 'Crystal Smoked Grey', color: 'Crystal Grey', color_code: '#94A3B8', size: '49-21-145', sku: 'AUR-EYE-002-SMK', price: 7499, stock: 17 }
      ]
    },
    {
      category_id: categoryMap['audio-acoustics'],
      name: 'AURA True Wireless Active Earbuds Pro',
      slug: 'aura-true-wireless-earbuds-pro',
      price: 14999,
      compare_price: 17999,
      discount_percent: 16,
      sku: 'AUR-AUD-003',
      stock: 45,
      is_featured: 1,
      is_trending: 1,
      is_new_arrival: 1,
      rating: 4.8,
      reviews_count: 57,
      short_description: 'Custom ceramic drivers, -42dB Active Hybrid Noise Cancellation, wireless Qi charging anodized case.',
      description: `Precision-machined acoustic chambers deliver studio reference audio with deep punchy sub-bass and spatial audio head tracking. IPX5 water resistance with 32 hours total battery life.`,
      images: [
        { url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1000&q=80', is_primary: 1 },
        { url: 'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fit=crop&w=1000&q=80', is_primary: 0 }
      ],
      variants: [
        { name: 'Matte Jet Black', color: 'Jet Black', color_code: '#111827', size: 'Standard', sku: 'AUR-AUD-003-BLK', price: 14999, stock: 25 },
        { name: 'Frost Pearl White', color: 'Pearl White', color_code: '#F8FAFC', size: 'Standard', sku: 'AUR-AUD-003-WHT', price: 14999, stock: 20 }
      ]
    },
    {
      category_id: categoryMap['audio-acoustics'],
      name: 'Symphony Planar Desktop DAC & Tube Amp',
      slug: 'symphony-desktop-dac-tube-amplifier',
      price: 44999,
      compare_price: 49999,
      discount_percent: 10,
      sku: 'AUR-AUD-004',
      stock: 12,
      is_featured: 0,
      is_trending: 0,
      is_new_arrival: 1,
      rating: 5.0,
      reviews_count: 19,
      short_description: 'Dual ESS Sabre ES9038PRO DAC chips, matched Russian vacuum tubes, 32-bit/768kHz DSD512.',
      description: `Audiophile desktop amplification combining the warm lush harmonics of vacuum tube stages with pristine modern 32-bit ESS Sabre digital decoding. CNC milled from solid aircraft aluminum billet.`,
      images: [
        { url: 'https://images.unsplash.com/photo-1558089687-f282ffcbc126?auto=format&fit=crop&w=1000&q=80', is_primary: 1 }
      ],
      variants: [
        { name: 'Brushed Silver Aluminum', color: 'Silver', color_code: '#E2E8F0', size: 'Standard', sku: 'AUR-AUD-004-SLV', price: 44999, stock: 7 },
        { name: 'Stealth Matte Black', color: 'Black', color_code: '#18181B', size: 'Standard', sku: 'AUR-AUD-004-BLK', price: 44999, stock: 5 }
      ]
    },
    // --- Precision Timepieces (continued) ---
    {
      category_id: categoryMap['precision-timepieces'],
      name: 'Atelier Skeleton Tourbillon Automatic',
      slug: 'atelier-skeleton-tourbillon-automatic',
      price: 49999,
      compare_price: 59999,
      discount_percent: 16,
      sku: 'AUR-WTC-003',
      stock: 8,
      is_featured: 1,
      is_trending: 1,
      is_new_arrival: 1,
      rating: 5.0,
      reviews_count: 22,
      short_description: 'Exposed skeletonized escapement, 28,800 vph high-beat caliber, double anti-reflective sapphire front and exhibition back.',
      description: `A breathtaking open-worked timepiece highlighting every gear, balance wheel, and hand-beveled bridge. 50-hour power reserve, micro-rotor in 22K gold plating, and Louisiana alligator-embossed leather strap.`,
      images: [
        { url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=80', is_primary: 1 },
        { url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=80', is_primary: 0 }
      ],
      variants: [
        { name: 'Obsidian Steel / Sapphire Dial', color: 'Steel/Black', color_code: '#18181B', size: '42mm', sku: 'AUR-WTC-003-OBS', price: 49999, stock: 5 },
        { name: '18K Rose Gold Edition', color: 'Rose Gold', color_code: '#B76E79', size: '42mm', sku: 'AUR-WTC-003-GLD', price: 54999, stock: 3 }
      ]
    },
    {
      category_id: categoryMap['precision-timepieces'],
      name: 'Heritage Moonphase Perpetual Dress Watch',
      slug: 'heritage-moonphase-dress-watch',
      price: 27999,
      compare_price: 32999,
      discount_percent: 15,
      sku: 'AUR-WTC-004',
      stock: 18,
      is_featured: 0,
      is_trending: 1,
      is_new_arrival: 0,
      rating: 4.9,
      reviews_count: 38,
      short_description: 'True astronomical moonphase complication, enamel dial, blued Breguet hands, ultra-slim 8.2mm profile.',
      description: `Timeless haute horlogerie aesthetics designed for formal evening wear. The astronomical moonphase aperture tracks the lunar cycle with mathematical precision across 29.5 days.`,
      images: [
        { url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1000&q=80', is_primary: 1 }
      ],
      variants: [
        { name: 'Ivory Dial / Brown Leather', color: 'Ivory/Brown', color_code: '#78350F', size: '39mm', sku: 'AUR-WTC-004-BRN', price: 27999, stock: 10 },
        { name: 'Midnight Blue / Navy Leather', color: 'Blue/Navy', color_code: '#1E3A8A', size: '39mm', sku: 'AUR-WTC-004-NVY', price: 27999, stock: 8 }
      ]
    },
    // --- Designer Apparel (continued) ---
    {
      category_id: categoryMap['designer-apparel'],
      name: 'Silk-Cashmere Jacquard Wrap Scarf',
      slug: 'silk-cashmere-jacquard-scarf',
      price: 6499,
      compare_price: 7999,
      discount_percent: 18,
      sku: 'AUR-APP-003',
      stock: 50,
      is_featured: 0,
      is_trending: 1,
      is_new_arrival: 1,
      rating: 4.9,
      reviews_count: 41,
      short_description: '70% Mulberry Silk, 30% Mongolian Cashmere, subtle monogram jacquard weave, eyelash fringe edges.',
      description: `Feather-light yet luxuriously warm, this oversized 200x70cm scarf drapes effortlessly over tailored suits or casual evening knitwear.`,
      images: [
        { url: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=1000&q=80', is_primary: 1 }
      ],
      variants: [
        { name: 'Champagne Taupe', color: 'Taupe', color_code: '#D2B48C', size: '200x70cm', sku: 'AUR-APP-003-TAU', price: 6499, stock: 25 },
        { name: 'Onyx Noir', color: 'Black', color_code: '#111827', size: '200x70cm', sku: 'AUR-APP-003-BLK', price: 6499, stock: 25 }
      ]
    },
    {
      category_id: categoryMap['designer-apparel'],
      name: 'Selvedge Japanese Denim Structured Jacket',
      slug: 'selvedge-japanese-denim-jacket',
      price: 11499,
      compare_price: 13999,
      discount_percent: 17,
      sku: 'AUR-APP-004',
      stock: 32,
      is_featured: 1,
      is_trending: 0,
      is_new_arrival: 1,
      rating: 4.8,
      reviews_count: 27,
      short_description: '14.5oz Kurabo Mills shuttle-loom selvedge denim, custom hammered copper rivets, felled seam construction.',
      description: `Woven on vintage Toyoda shuttle looms in Okayama, Japan. Rich indigo rope-dyed yarn that fades with a unique high-contrast individual patina over years of wear.`,
      images: [
        { url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=1000&q=80', is_primary: 1 }
      ],
      variants: [
        { name: 'Raw Deep Indigo / M', color: 'Indigo', color_code: '#1E293B', size: 'M', sku: 'AUR-APP-004-IND-M', price: 11499, stock: 12 },
        { name: 'Raw Deep Indigo / L', color: 'Indigo', color_code: '#1E293B', size: 'L', sku: 'AUR-APP-004-IND-L', price: 11499, stock: 12 },
        { name: 'Raw Deep Indigo / XL', color: 'Indigo', color_code: '#1E293B', size: 'XL', sku: 'AUR-APP-004-IND-XL', price: 11499, stock: 8 }
      ]
    },
    // --- Leather Goods (continued) ---
    {
      category_id: categoryMap['leather-goods'],
      name: 'Minimalist Bifold Leather Wallet & Cardholder',
      slug: 'minimalist-bifold-leather-wallet',
      price: 3999,
      compare_price: 4999,
      discount_percent: 20,
      sku: 'AUR-LTH-003',
      stock: 75,
      is_featured: 0,
      is_trending: 1,
      is_new_arrival: 0,
      rating: 4.9,
      reviews_count: 94,
      short_description: 'Ultra-slim 7mm profile, RFID blocking shielding, 8 dedicated card slots, full-grain French calf leather.',
      description: `Designed for seamless pocket comfort without bulk. Edge-painted by hand and reinforced with German Serafil bonded nylon thread.`,
      images: [
        { url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1000&q=80', is_primary: 1 }
      ],
      variants: [
        { name: 'Espresso Brown', color: 'Espresso', color_code: '#3E2723', size: 'Slim', sku: 'AUR-LTH-003-ESP', price: 3999, stock: 40 },
        { name: 'Obsidian Black', color: 'Black', color_code: '#111827', size: 'Slim', sku: 'AUR-LTH-003-BLK', price: 3999, stock: 35 }
      ]
    },
    {
      category_id: categoryMap['leather-goods'],
      name: 'Artisan Goodyear-Welted Chelsea Boots',
      slug: 'artisan-goodyear-welted-chelsea-boots',
      price: 14999,
      compare_price: 18499,
      discount_percent: 18,
      sku: 'AUR-LTH-004',
      stock: 28,
      is_featured: 1,
      is_trending: 1,
      is_new_arrival: 1,
      rating: 4.9,
      reviews_count: 38,
      short_description: 'Goodyear welted construction, Italian suede upper, cork bed midsole, Dainite studded rubber sole.',
      description: `Built on timeless British lasts with genuine Goodyear welt stitching for lifelong resoleability. Hand-burnished suede with ergonomic elastic side gussets for effortless slip-on luxury.`,
      images: [
        { url: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=1000&q=80', is_primary: 1 }
      ],
      variants: [
        { name: 'Snuff Suede / UK 8', color: 'Snuff Brown', color_code: '#8D5B4C', size: 'UK 8', sku: 'AUR-LTH-004-SNF-8', price: 14999, stock: 8 },
        { name: 'Snuff Suede / UK 9', color: 'Snuff Brown', color_code: '#8D5B4C', size: 'UK 9', sku: 'AUR-LTH-004-SNF-9', price: 14999, stock: 10 },
        { name: 'Midnight Suede / UK 9', color: 'Black', color_code: '#18181B', size: 'UK 9', sku: 'AUR-LTH-004-BLK-9', price: 14999, stock: 10 }
      ]
    },
    // --- Fragrance (continued) ---
    {
      category_id: categoryMap['haute-parfumerie'],
      name: 'Kyoto Santal & White Tea Artisanal Extrait',
      slug: 'kyoto-santal-white-tea-extrait',
      price: 10499,
      compare_price: 12999,
      discount_percent: 19,
      sku: 'AUR-FRG-003',
      stock: 35,
      is_featured: 1,
      is_trending: 1,
      is_new_arrival: 1,
      rating: 5.0,
      reviews_count: 48,
      short_description: 'Australian Sandalwood, Silver Needle White Tea, Iris Concrete, and Blonde Cedar.',
      description: `A tranquil meditative fragrance evoking Kyoto temple courtyards in spring morning fog. Creamy sandalwood anchors luminous delicate white tea leaves and powdery iris root.`,
      images: [
        { url: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1000&q=80', is_primary: 1 }
      ],
      variants: [
        { name: '100ml Heavyweight Flacon', color: 'Amber Flacon', color_code: '#D97706', size: '100ml', sku: 'AUR-FRG-003-100', price: 10499, stock: 35 }
      ]
    },
    {
      category_id: categoryMap['haute-parfumerie'],
      name: 'Velvet Amber Luxury Botanical Scented Candle (400g)',
      slug: 'velvet-amber-botanical-candle',
      price: 3499,
      compare_price: 4299,
      discount_percent: 18,
      sku: 'AUR-FRG-004',
      stock: 60,
      is_featured: 0,
      is_trending: 1,
      is_new_arrival: 0,
      rating: 4.9,
      reviews_count: 62,
      short_description: '100% Organic coconut-soy wax, crackling Egyptian wooden wick, 80-hour clean burn time.',
      description: `Hand-poured in a matte ceramic vessel with notes of smoky amber resin, spiced patchouli, and Tonka bean. Infuses large spaces with lingering ambient warmth.`,
      images: [
        { url: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1000&q=80', is_primary: 1 }
      ],
      variants: [
        { name: '400g Matte Ceramic Vessel', color: 'Matte Charcoal', color_code: '#374151', size: '400g', sku: 'AUR-FRG-004-400', price: 3499, stock: 60 }
      ]
    },
    // --- Eyewear (continued) ---
    {
      category_id: categoryMap['modern-eyewear'],
      name: 'Geometric Hex Titanium Aviator Sunglasses',
      slug: 'geometric-hex-titanium-aviator-sunglasses',
      price: 11999,
      compare_price: 14999,
      discount_percent: 20,
      sku: 'AUR-EYE-003',
      stock: 26,
      is_featured: 1,
      is_trending: 1,
      is_new_arrival: 1,
      rating: 4.9,
      reviews_count: 33,
      short_description: 'Architectural hexagonal aviator silhouette, laser-engraved temples, sapphire-coated polarized green lenses.',
      description: `A bold reimagining of the classic pilot frame with sculpted geometric angles, titanium flex hinges, and crystal-clear high-definition polarized lenses.`,
      images: [
        { url: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=1000&q=80', is_primary: 1 }
      ],
      variants: [
        { name: 'Brushed Platinum / Green Polarized', color: 'Platinum', color_code: '#E2E8F0', size: '54-18-145', sku: 'AUR-EYE-003-PLT', price: 11999, stock: 14 },
        { name: 'Obsidian Black / Smoke Gradient', color: 'Obsidian', color_code: '#18181B', size: '54-18-145', sku: 'AUR-EYE-003-BLK', price: 11999, stock: 12 }
      ]
    }
  ];

  for (const prod of products) {
    const pResult = await run(
      `INSERT INTO products (
        category_id, name, slug, description, short_description, price, compare_price,
        discount_percent, sku, stock, is_featured, is_trending, is_new_arrival, rating, reviews_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        prod.category_id, prod.name, prod.slug, prod.description, prod.short_description,
        prod.price, prod.compare_price, prod.discount_percent, prod.sku, prod.stock,
        prod.is_featured, prod.is_trending, prod.is_new_arrival, prod.rating, prod.reviews_count
      ]
    );
    const productId = pResult.lastID;

    // Images
    for (let i = 0; i < prod.images.length; i++) {
      const img = prod.images[i];
      await run(
        `INSERT INTO product_images (product_id, image_url, is_primary, display_order) VALUES (?, ?, ?, ?)`,
        [productId, img.url, img.is_primary, i]
      );
    }

    // Variants
    for (const v of prod.variants) {
      await run(
        `INSERT INTO product_variants (product_id, name, size, color, color_code, sku, price, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [productId, v.name, v.size, v.color, v.color_code, v.sku, v.price, v.stock]
      );
    }

    // Seed sample reviews
    await run(
      `INSERT INTO reviews (product_id, user_id, user_name, rating, title, comment, is_approved)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [productId, customerResult.lastID, 'Rohit S.', 5, 'Exceptional craftsmanship & luxury feel', `The attention to detail on the ${prod.name} is outstanding. Delivered within 48 hours in immaculate luxury packaging. Highly recommend!`]
    );

    await run(
      `INSERT INTO reviews (product_id, user_id, user_name, rating, title, comment, is_approved)
       VALUES (?, NULL, 'Aarav Singhania', 5, 'Worth every rupee', 'Top tier quality that rivals international luxury houses. Customer support was also very responsive.', 1)`,
      [productId]
    );
  }
  console.log(`✓ Seeded ${products.length} comprehensive products with variants & reviews.`);

  // 5. Seed Discount Coupons
  const coupons = [
    { code: 'WELCOME10', description: '10% off on your first luxury order', discount_type: 'percentage', discount_value: 10, min_order_amount: 1999, max_discount: 2000 },
    { code: 'LUXE20', description: '20% exclusive festive discount for purchases above ₹10,000', discount_type: 'percentage', discount_value: 20, min_order_amount: 9999, max_discount: 5000 },
    { code: 'FLAT1500', description: 'Flat ₹1,500 off on premium audio & timepieces', discount_type: 'fixed', discount_value: 1500, min_order_amount: 15000, max_discount: 1500 },
    { code: 'AURAFIRST', description: 'Flat ₹500 discount for new club members', discount_type: 'fixed', discount_value: 500, min_order_amount: 2500, max_discount: 500 }
  ];

  for (const c of coupons) {
    await run(
      `INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, max_discount, is_active)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [c.code, c.description, c.discount_type, c.discount_value, c.min_order_amount, c.max_discount]
    );
  }
  console.log('✓ Seeded promo coupons.');

  // 6. Seed Shipping Rules
  await run(
    `INSERT INTO shipping_rules (name, pincode_prefix, standard_rate, express_rate, free_shipping_threshold, min_delivery_days, max_delivery_days)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['All India Express Shipping', '*', 99, 199, 2499, 2, 4]
  );
  console.log('✓ Seeded shipping rules.');

  // 7. Seed Default Settings
  const defaultSettings = [
    { key: 'store_name', value: 'AURA Luxe' },
    { key: 'support_email', value: 'concierge@auraluxe.com' },
    { key: 'support_phone', value: '+91 1800 2872 5893' },
    { key: 'free_shipping_threshold', value: '2499' },
    { key: 'standard_shipping_charge', value: '99' },
    { key: 'express_shipping_charge', value: '199' },
    { key: 'tax_rate_percentage', value: '18' },
    { key: 'razorpay_mode', value: 'TEST' }
  ];

  for (const s of defaultSettings) {
    await run(
      `INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`,
      [s.key, s.value]
    );
  }
  console.log('✓ Store settings initialized.');

  // 8. Seed Sample Order History for Demo
  const orderNumber = 'AURA-2026-89412';
  const orderAddress = {
    fullName: 'Rohit Sharma',
    phone: '+91 91234 56789',
    addressLine1: 'Penthouse 402, Signature Towers',
    addressLine2: 'Golf Course Road, DLF Phase 5',
    city: 'Gurugram',
    state: 'Haryana',
    pincode: '122002'
  };

  const sampleOrder = await run(
    `INSERT INTO orders (
      order_number, user_id, status, payment_status, subtotal, discount_amount,
      coupon_code, shipping_charge, tax_amount, total_amount, shipping_address_json,
      tracking_number, carrier_name, estimated_delivery
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      orderNumber,
      customerResult.lastID,
      'SHIPPED',
      'PAID',
      24999,
      2499,
      'WELCOME10',
      0,
      4050,
      26550,
      JSON.stringify(orderAddress),
      'AWB-BLUEDART-99238411',
      'Blue Dart Express Luxury Courier',
      new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
    ]
  );

  await run(
    `INSERT INTO order_items (order_id, product_id, variant_id, product_name, variant_name, price, quantity, image_url)
     VALUES (?, ?, NULL, ?, ?, ?, ?, ?)`,
    [
      sampleOrder.lastID,
      1,
      'AURA Sphere Master Wireless Headphones',
      'Matte Obsidian Black',
      24999,
      1,
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80'
    ]
  );

  await run(
    `INSERT INTO payments (order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, currency, status, payment_method)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      sampleOrder.lastID,
      'order_demo_202689412',
      'pay_demo_992147321',
      'demo_signature_hash_verified',
      26550,
      'INR',
      'CAPTURED',
      'Razorpay UPI'
    ]
  );

  console.log('✓ Sample order history created.');
  console.log('--- Seeding Completed Successfully! ---');
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedDatabase().then(() => {
    process.exit(0);
  }).catch((err) => {
    console.error('Seeding error:', err);
    process.exit(1);
  });
}
