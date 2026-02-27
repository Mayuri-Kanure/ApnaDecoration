const { Vendor } = require('../models');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const vendors = [
      {
        name: 'Rajesh Decorations',
        email: 'rajesh@decorations.com',
        phone: '+91 98765 43212',
        businessName: 'Rajesh Event Decorations',
        businessAddress: '123 MG Road, Bangalore',
        businessCity: 'Bangalore',
        businessState: 'Karnataka',
        businessPincode: '560001',
        gstNumber: '29AAAPL1234C1ZV',
        panNumber: 'AAAPL1234C',
        availabilityStatus: 'available',
        locationCoverage: ['Bangalore', 'Mysore', 'Hubli'],
        categories: ['birthday', 'anniversary', 'wedding', 'baby-shower'],
        maxOrdersPerDay: 5,
        rating: 4.5,
        totalReviews: 25,
        setupCharges: 500.00,
        experience: 8,
        specialties: ['balloon-decoration', 'flower-arrangement', 'lighting'],
        commissionRate: 10.00,
        verified: true,
        active: true
      },
      {
        name: 'Priya Events',
        email: 'priya@events.com',
        phone: '+91 98765 43213',
        businessName: 'Priya Event Management',
        businessAddress: '456 Brigade Road, Bangalore',
        businessCity: 'Bangalore',
        businessState: 'Karnataka',
        businessPincode: '560025',
        gstNumber: '29AAAPM5678D2ZV',
        panNumber: 'AAAPM5678D',
        availabilityStatus: 'available',
        locationCoverage: ['Bangalore', 'Chennai', 'Hyderabad'],
        categories: ['corporate', 'wedding', 'festival', 'proposal'],
        maxOrdersPerDay: 3,
        rating: 4.8,
        totalReviews: 40,
        setupCharges: 750.00,
        experience: 12,
        specialties: ['stage-decoration', 'theme-decoration', 'corporate-events'],
        commissionRate: 12.00,
        verified: true,
        active: true
      },
      {
        name: 'Ankit Celebration',
        email: 'ankit@celebration.com',
        phone: '+91 98765 43214',
        businessName: 'Ankit Celebration Planners',
        businessAddress: '789 Commercial Street, Bangalore',
        businessCity: 'Bangalore',
        businessState: 'Karnataka',
        businessPincode: '560042',
        gstNumber: '29AAACK9012E3ZV',
        panNumber: 'AAACK9012E',
        availabilityStatus: 'available',
        locationCoverage: ['Bangalore', 'Mumbai', 'Pune'],
        categories: ['birthday', 'festival', 'corporate'],
        maxOrdersPerDay: 4,
        rating: 4.3,
        totalReviews: 18,
        setupCharges: 600.00,
        experience: 6,
        specialties: ['theme-parties', 'festival-decoration', 'corporate-setup'],
        commissionRate: 11.00,
        verified: true,
        active: true
      }
    ];

    const createdVendors = await Vendor.bulkCreate(vendors);

    console.log('✅ Vendors seeded successfully!');
    console.log(`Created ${createdVendors.length} vendors`);

    return createdVendors;
  },

  down: async (queryInterface, Sequelize) => {
    await Vendor.destroy({ where: {} });
  }
};
