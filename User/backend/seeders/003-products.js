const { Product, Vendor } = require('../models');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get vendors to assign products
    const vendors = await Vendor.findAll();
    const vendor1 = vendors[0]; // Rajesh Decorations
    const vendor2 = vendors[1]; // Priya Events
    const vendor3 = vendors[2]; // Ankit Celebration

    const products = [
      // Birthday Products
      {
        name: 'Birthday Balloon Decoration Package',
        description: 'Complete birthday decoration with colorful balloons, banners, and themed decorations. Perfect for kids and adults birthday parties.',
        price: 1500.00,
        originalPrice: 1800.00,
        category: 'birthday',
        subcategory: 'balloon-decoration',
        occasion: ['birthday', 'kids-party'],
        vendorId: vendor1.id,
        stockQuantity: 50,
        minOrderQuantity: 1,
        maxOrderQuantity: 10,
        images: [
          'https://example.com/birthday1.jpg',
          'https://example.com/birthday2.jpg',
          'https://example.com/birthday3.jpg'
        ],
        thumbnail: 'https://example.com/birthday-thumb.jpg',
        specifications: {
          'balloons': '100+ latex balloons',
          'banner': 'Happy Birthday banner',
          'theme': 'Customizable themes available',
          'duration': '6-8 hours setup'
        },
        features: [
          'Professional balloon arrangement',
          'Theme-based decorations',
          'Photo booth setup',
          'LED lighting included'
        ],
        includes: [
          'Balloons',
          'Banners',
          'Decorative items',
          'Setup and removal'
        ],
        setupRequired: true,
        setupTime: 120,
        setupCharges: 500.00,
        deliveryTime: 4,
        deliveryCharges: 200,
        tags: ['birthday', 'balloons', 'party', 'kids', 'celebration'],
        rating: 4.2,
        reviewCount: 25,
        soldCount: 150,
        status: 'active',
        featured: true,
        trending: true,
        bestSeller: true,
        weight: 5.5,
        dimensions: {
          'length': 50,
          'width': 30,
          'height': 20
        },
        colors: ['red', 'blue', 'pink', 'yellow', 'purple'],
        materials: ['latex', 'foil', 'paper', 'plastic'],
        careInstructions: 'Keep away from direct sunlight and sharp objects',
        returnPolicy: 'Returns accepted within 7 days of delivery',
        cancellationPolicy: 'Free cancellation up to 48 hours before event'
      },
      {
        name: 'Kids Birthday Theme Package',
        description: 'Special themed birthday decoration for kids with cartoon characters and fun elements.',
        price: 2000.00,
        originalPrice: 2500.00,
        category: 'birthday',
        subcategory: 'themed-party',
        occasion: ['birthday', 'kids-party'],
        vendorId: vendor1.id,
        stockQuantity: 30,
        minOrderQuantity: 1,
        maxOrderQuantity: 5,
        images: [
          'https://example.com/kids-birthday1.jpg',
          'https://example.com/kids-birthday2.jpg'
        ],
        thumbnail: 'https://example.com/kids-birthday-thumb.jpg',
        specifications: {
          'themes': 'Cartoon, Superhero, Princess available',
          'characters': 'Life-size cutouts',
          'games': 'Fun games included',
          'duration': 'Full day setup'
        },
        features: [
          'Character-based themes',
          'Interactive games',
          'Party favors included',
          'Photography props'
        ],
        includes: [
          'Theme decorations',
          'Game materials',
          'Party favors',
          'Character cutouts'
        ],
        setupRequired: true,
        setupTime: 180,
        setupCharges: 600.00,
        deliveryTime: 6,
        deliveryCharges: 250,
        tags: ['kids', 'birthday', 'theme', 'cartoon', 'games'],
        rating: 4.6,
        reviewCount: 18,
        soldCount: 85,
        status: 'active',
        featured: true,
        newArrival: true,
        weight: 8.0,
        dimensions: {
          'length': 60,
          'width': 40,
          'height': 25
        },
        colors: ['multicolor'],
        materials: ['foam', 'cardboard', 'plastic', 'fabric'],
        returnPolicy: 'Returns accepted within 5 days of delivery',
        cancellationPolicy: 'Free cancellation up to 72 hours before event'
      },

      // Anniversary Products
      {
        name: 'Anniversary Rose Decoration',
        description: 'Romantic anniversary decoration with premium roses, candles, and intimate lighting setup.',
        price: 2500.00,
        originalPrice: 3000.00,
        category: 'anniversary',
        subcategory: 'romantic',
        occasion: ['anniversary', 'valentine', 'romantic'],
        vendorId: vendor1.id,
        stockQuantity: 25,
        minOrderQuantity: 1,
        maxOrderQuantity: 3,
        images: [
          'https://example.com/anniversary1.jpg',
          'https://example.com/anniversary2.jpg',
          'https://example.com/anniversary3.jpg'
        ],
        thumbnail: 'https://example.com/anniversary-thumb.jpg',
        specifications: {
          'roses': '50+ premium roses',
          'candles': 'Scented candles',
          'lighting': 'Warm LED lights',
          'duration': '4-6 hours setup'
        },
        features: [
          'Premium rose arrangement',
          'Scented candle setup',
          'Romantic lighting',
          'Music system included'
        ],
        includes: [
          'Fresh roses',
          'Candles',
          'LED lights',
          'Decorative elements'
        ],
        setupRequired: true,
        setupTime: 90,
        setupCharges: 600.00,
        deliveryTime: 3,
        deliveryCharges: 150,
        tags: ['anniversary', 'romantic', 'roses', 'candles', 'intimate'],
        rating: 4.7,
        reviewCount: 32,
        soldCount: 95,
        status: 'active',
        featured: true,
        bestSeller: true,
        weight: 4.0,
        dimensions: {
          'length': 40,
          'width': 30,
          'height': 20
        },
        colors: ['red', 'pink', 'white', 'cream'],
        materials: ['fresh-flowers', 'wax', 'led', 'fabric'],
        careInstructions: 'Handle roses with care, keep away from direct heat',
        returnPolicy: 'Returns accepted within 24 hours due to fresh flowers',
        cancellationPolicy: 'Free cancellation up to 24 hours before event'
      },

      // Wedding Products
      {
        name: 'Wedding Stage Decoration',
        description: 'Traditional wedding stage with premium flowers, elegant lighting, and cultural elements.',
        price: 15000.00,
        originalPrice: 18000.00,
        category: 'wedding',
        subcategory: 'stage-decoration',
        occasion: ['wedding', 'reception', 'marriage'],
        vendorId: vendor2.id,
        stockQuantity: 10,
        minOrderQuantity: 1,
        maxOrderQuantity: 2,
        images: [
          'https://example.com/wedding1.jpg',
          'https://example.com/wedding2.jpg',
          'https://example.com/wedding3.jpg'
        ],
        thumbnail: 'https://example.com/wedding-thumb.jpg',
        specifications: {
          'stage-size': '20x15 feet',
          'flowers': 'Premium fresh flowers',
          'lighting': 'Professional stage lighting',
          'duration': 'Full day setup'
        },
        features: [
          'Customizable stage design',
          'Premium flower arrangements',
          'Professional lighting',
          'Sound system included'
        ],
        includes: [
          'Stage structure',
          'Flower decorations',
          'Lighting setup',
          'Sound system',
          'Backdrop'
        ],
        setupRequired: true,
        setupTime: 480,
        setupCharges: 2000.00,
        deliveryTime: 24,
        deliveryCharges: 500,
        tags: ['wedding', 'stage', 'traditional', 'premium', 'flowers'],
        rating: 4.9,
        reviewCount: 45,
        soldCount: 28,
        status: 'active',
        featured: true,
        bestSeller: true,
        weight: 150.0,
        dimensions: {
          'length': 600,
          'width': 450,
          'height': 300
        },
        colors: ['red', 'gold', 'white', 'maroon'],
        materials: ['wood', 'flowers', 'fabric', 'metal', 'lights'],
        careInstructions: 'Professional handling required, keep flowers fresh',
        returnPolicy: 'Custom orders cannot be returned',
        cancellationPolicy: '50% refund if cancelled 7 days before event'
      },

      // Corporate Products
      {
        name: 'Corporate Event Setup',
        description: 'Professional corporate event decoration with branding, elegant setup, and business-appropriate decor.',
        price: 8000.00,
        originalPrice: 10000.00,
        category: 'corporate',
        subcategory: 'business-event',
        occasion: ['corporate', 'conference', 'seminar'],
        vendorId: vendor2.id,
        stockQuantity: 20,
        minOrderQuantity: 1,
        maxOrderQuantity: 5,
        images: [
          'https://example.com/corporate1.jpg',
          'https://example.com/corporate2.jpg'
        ],
        thumbnail: 'https://example.com/corporate-thumb.jpg',
        specifications: {
          'branding': 'Custom branding options',
          'seating': 'Professional seating arrangement',
          'lighting': 'Business-appropriate lighting',
          'duration': 'Full day setup'
        },
        features: [
          'Custom branding',
          'Professional setup',
          'Audio-visual support',
          'Elegant decorations'
        ],
        includes: [
          'Branding materials',
          'Seating arrangement',
          'Lighting setup',
          'Decorative elements',
          'AV equipment'
        ],
        setupRequired: true,
        setupTime: 240,
        setupCharges: 1500.00,
        deliveryTime: 8,
        deliveryCharges: 400,
        tags: ['corporate', 'business', 'professional', 'branding', 'conference'],
        rating: 4.6,
        reviewCount: 28,
        soldCount: 65,
        status: 'active',
        featured: true,
        weight: 80.0,
        dimensions: {
          'length': 200,
          'width': 150,
          'height': 100
        },
        colors: ['blue', 'black', 'white', 'silver'],
        materials: ['metal', 'fabric', 'wood', 'plastic', 'electronics'],
        returnPolicy: 'Returns accepted within 3 days of delivery',
        cancellationPolicy: '25% cancellation fee if cancelled within 48 hours'
      },

      // Baby Shower Products
      {
        name: 'Baby Shower Theme Package',
        description: 'Cute baby shower decoration with pastel colors, baby themes, and adorable decorations.',
        price: 2000.00,
        originalPrice: 2400.00,
        category: 'baby-shower',
        subcategory: 'baby-theme',
        occasion: ['baby-shower', 'gender-reveal', 'welcome-baby'],
        vendorId: vendor1.id,
        stockQuantity: 25,
        minOrderQuantity: 1,
        maxOrderQuantity: 4,
        images: [
          'https://example.com/baby1.jpg',
          'https://example.com/baby2.jpg'
        ],
        thumbnail: 'https://example.com/baby-thumb.jpg',
        specifications: {
          'theme': 'Pastel baby themes',
          'decorations': 'Baby-themed decorations',
          'colors': 'Soft pastel colors',
          'duration': '4-5 hours setup'
        },
        features: [
          'Baby-themed decorations',
          'Pastel color scheme',
          'Photo booth setup',
          'Game materials included'
        ],
        includes: [
          'Theme decorations',
          'Baby items',
          'Game materials',
          'Photo props',
          'Decorative elements'
        ],
        setupRequired: true,
        setupTime: 120,
        setupCharges: 400.00,
        deliveryTime: 4,
        deliveryCharges: 200,
        tags: ['baby-shower', 'pastel', 'cute', 'baby-theme', 'gender-reveal'],
        rating: 4.3,
        reviewCount: 22,
        soldCount: 78,
        status: 'active',
        featured: true,
        newArrival: true,
        weight: 6.0,
        dimensions: {
          'length': 50,
          'width': 35,
          'height': 25
        },
        colors: ['pink', 'blue', 'yellow', 'mint', 'lavender'],
        materials: ['paper', 'fabric', 'foam', 'plastic'],
        careInstructions: 'Keep away from moisture and direct sunlight',
        returnPolicy: 'Returns accepted within 5 days of delivery',
        cancellationPolicy: 'Free cancellation up to 48 hours before event'
      },

      // Festival Products
      {
        name: 'Festival Lighting Decoration',
        description: 'Colorful festival lighting and decorative items for all Indian festivals and celebrations.',
        price: 3000.00,
        originalPrice: 3500.00,
        category: 'festival',
        subcategory: 'lighting',
        occasion: ['diwali', 'eid', 'christmas', 'navratri', 'ganesh-chaturthi'],
        vendorId: vendor2.id,
        stockQuantity: 35,
        minOrderQuantity: 1,
        maxOrderQuantity: 8,
        images: [
          'https://example.com/festival1.jpg',
          'https://example.com/festival2.jpg',
          'https://example.com/festival3.jpg'
        ],
        thumbnail: 'https://example.com/festival-thumb.jpg',
        specifications: {
          'lights': 'LED string lights',
          'decorations': 'Festival-specific decorations',
          'power': 'Energy-efficient LEDs',
          'duration': 'Full festival season setup'
        },
        features: [
          'Energy-efficient lighting',
          'Festival-specific themes',
          'Weather-resistant',
          'Easy installation'
        ],
        includes: [
          'LED lights',
          'Decorative items',
          'Installation materials',
          'Power extensions',
          'Control systems'
        ],
        setupRequired: true,
        setupTime: 180,
        setupCharges: 800.00,
        deliveryTime: 6,
        deliveryCharges: 300,
        tags: ['festival', 'lighting', 'decoration', 'led', 'celebration'],
        rating: 4.4,
        reviewCount: 35,
        soldCount: 120,
        status: 'active',
        featured: true,
        trending: true,
        weight: 12.0,
        dimensions: {
          'length': 80,
          'width': 60,
          'height': 40
        },
        colors: ['multicolor', 'warm-white', 'cool-white'],
        materials: ['led', 'copper', 'plastic', 'fabric'],
        careInstructions: 'Handle with care, protect from rain',
        returnPolicy: 'Returns accepted within 7 days of delivery',
        cancellationPolicy: 'Free cancellation up to 72 hours before event'
      },

      // Proposal Products
      {
        name: 'Romantic Proposal Setup',
        description: 'Heart-touching romantic proposal decoration with flowers, candles, and surprise elements.',
        price: 3500.00,
        originalPrice: 4000.00,
        category: 'proposal',
        subcategory: 'romantic-proposal',
        occasion: ['proposal', 'engagement', 'romantic'],
        vendorId: vendor3.id,
        stockQuantity: 15,
        minOrderQuantity: 1,
        maxOrderQuantity: 2,
        images: [
          'https://example.com/proposal1.jpg',
          'https://example.com/proposal2.jpg'
        ],
        thumbnail: 'https://example.com/proposal-thumb.jpg',
        specifications: {
          'flowers': 'Premium roses and lilies',
          'candles': 'Romantic candle setup',
          'surprise': 'Hidden surprise elements',
          'duration': '3-4 hours setup'
        },
        features: [
          'Surprise elements',
          'Romantic ambiance',
          'Photo-perfect setup',
          'Music synchronization'
        ],
        includes: [
          'Fresh flowers',
          'Candles',
          'Decorative elements',
          'Surprise items',
          'Music system'
        ],
        setupRequired: true,
        setupTime: 150,
        setupCharges: 700.00,
        deliveryTime: 4,
        deliveryCharges: 250,
        tags: ['proposal', 'romantic', 'surprise', 'engagement', 'heart'],
        rating: 4.8,
        reviewCount: 18,
        soldCount: 42,
        status: 'active',
        featured: true,
        newArrival: true,
        weight: 8.5,
        dimensions: {
          'length': 60,
          'width': 45,
          'height': 30
        },
        colors: ['red', 'pink', 'white', 'cream'],
        materials: ['fresh-flowers', 'wax', 'fabric', 'electronics'],
        careInstructions: 'Handle flowers with care, keep candles away from flammable materials',
        returnPolicy: 'Returns accepted within 12 hours due to fresh flowers',
        cancellationPolicy: 'Free cancellation up to 24 hours before event'
      }
    ];

    const createdProducts = await Product.bulkCreate(products);

    console.log('✅ Products seeded successfully!');
    console.log(`Created ${createdProducts.length} products across all categories`);

    return createdProducts;
  },

  down: async (queryInterface, Sequelize) => {
    await Product.destroy({ where: {} });
  }
};
