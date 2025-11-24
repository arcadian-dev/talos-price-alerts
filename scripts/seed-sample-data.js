const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongodb');

// Sample data for testing Phase 3 features
const sampleProducts = [
  {
    _id: new ObjectId(),
    name: 'BPC-157',
    slug: 'bpc-157',
    category: 'Peptides',
    description: 'Body Protection Compound 157 is a pentadecapeptide composed of 15 amino acids. It is a partial sequence of body protection compound (BPC) that is discovered in and isolated from human gastric juice.',
    unit: 'mg',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: 'TB-500',
    slug: 'tb-500',
    category: 'Peptides',
    description: 'Thymosin Beta-4 is a naturally occurring peptide present in almost all human and animal cells. It plays a vital role in building new blood vessels, new small muscle tissue fibers, new cell migration and new blood cell reproduction.',
    unit: 'mg',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: 'NAD+',
    slug: 'nad-plus',
    category: 'Longevity',
    description: 'Nicotinamide adenine dinucleotide (NAD+) is a coenzyme central to metabolism. It is involved in redox reactions, carrying electrons from one reaction to another.',
    unit: 'mg',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: 'Resveratrol',
    slug: 'resveratrol',
    category: 'Longevity',
    description: 'Resveratrol is a stilbenoid, a type of natural phenol, and a phytoalexin produced by several plants in response to injury or when the plant is under attack by pathogens.',
    unit: 'mg',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const sampleVendorProducts = [
  {
    _id: new ObjectId(),
    productId: sampleProducts[0]._id, // BPC-157
    vendorName: 'PeptideSciences',
    url: 'https://www.peptidesciences.com/bpc-157-5mg',
    scrapingSelector: '.price',
    isActive: true,
    lastSuccessfulScrapeAt: new Date(),
    scrapeFailureCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    productId: sampleProducts[0]._id, // BPC-157
    vendorName: 'Research Peptides',
    url: 'https://www.researchpeptides.com/bpc-157',
    scrapingSelector: '.product-price',
    isActive: true,
    lastSuccessfulScrapeAt: new Date(),
    scrapeFailureCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    productId: sampleProducts[1]._id, // TB-500
    vendorName: 'PeptideSciences',
    url: 'https://www.peptidesciences.com/tb-500-5mg',
    scrapingSelector: '.price',
    isActive: true,
    lastSuccessfulScrapeAt: new Date(),
    scrapeFailureCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const samplePriceData = [
  // BPC-157 - PeptideSciences - 30 days of data
  ...Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const basePrice = 45.99;
    const variation = (Math.random() - 0.5) * 10; // ±$5 variation
    const price = Math.max(35, basePrice + variation);
    
    return {
      _id: new ObjectId(),
      vendorProductId: sampleVendorProducts[0]._id,
      price: parseFloat(price.toFixed(2)),
      amount: 5,
      unit: 'mg',
      pricePerUnit: parseFloat((price / 5).toFixed(4)),
      confidence: 0.95,
      isAvailable: true,
      scrapedAt: date,
      sourceUrl: sampleVendorProducts[0].url,
      createdAt: date,
    };
  }),
  
  // BPC-157 - Research Peptides - 30 days of data
  ...Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const basePrice = 52.99;
    const variation = (Math.random() - 0.5) * 12; // ±$6 variation
    const price = Math.max(40, basePrice + variation);
    
    return {
      _id: new ObjectId(),
      vendorProductId: sampleVendorProducts[1]._id,
      price: parseFloat(price.toFixed(2)),
      amount: 5,
      unit: 'mg',
      pricePerUnit: parseFloat((price / 5).toFixed(4)),
      confidence: 0.92,
      isAvailable: true,
      scrapedAt: date,
      sourceUrl: sampleVendorProducts[1].url,
      createdAt: date,
    };
  }),
  
  // TB-500 - PeptideSciences - 30 days of data
  ...Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const basePrice = 89.99;
    const variation = (Math.random() - 0.5) * 20; // ±$10 variation
    const price = Math.max(70, basePrice + variation);
    
    return {
      _id: new ObjectId(),
      vendorProductId: sampleVendorProducts[2]._id,
      price: parseFloat(price.toFixed(2)),
      amount: 5,
      unit: 'mg',
      pricePerUnit: parseFloat((price / 5).toFixed(4)),
      confidence: 0.88,
      isAvailable: true,
      scrapedAt: date,
      sourceUrl: sampleVendorProducts[2].url,
      createdAt: date,
    };
  }),
];

async function seedDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/talos_price_alerts';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();

    // Clear existing data
    console.log('Clearing existing data...');
    await db.collection('products').deleteMany({});
    await db.collection('vendorproducts').deleteMany({});
    await db.collection('pricedatas').deleteMany({});

    // Insert sample data
    console.log('Inserting sample products...');
    await db.collection('products').insertMany(sampleProducts);

    console.log('Inserting sample vendor products...');
    await db.collection('vendorproducts').insertMany(sampleVendorProducts);

    console.log('Inserting sample price data...');
    await db.collection('pricedatas').insertMany(samplePriceData);

    console.log('Sample data seeded successfully!');
    console.log(`- ${sampleProducts.length} products`);
    console.log(`- ${sampleVendorProducts.length} vendor products`);
    console.log(`- ${samplePriceData.length} price data points`);

    console.log('\nYou can now test:');
    console.log('- /products - Browse the product catalog');
    console.log('- /products/bpc-157 - View BPC-157 details with charts');
    console.log('- /products/tb-500 - View TB-500 details with charts');
    console.log('- /products/nad-plus - View NAD+ details (no price data)');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase().catch(console.error);
}

module.exports = { seedDatabase };
