const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true
      },
      role: {
        type: DataTypes.ENUM('user', 'admin', 'vendor'),
        defaultValue: 'user'
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'suspended', 'deleted'),
        defaultValue: 'active'
      },
      emailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      phoneVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      profilePicture: {
        type: DataTypes.STRING,
        allowNull: true
      },
      lastLoginAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    });

    await queryInterface.createTable('Vendors', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false
      },
      businessName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      businessAddress: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      businessCity: {
        type: DataTypes.STRING,
        allowNull: false
      },
      businessState: {
        type: DataTypes.STRING,
        allowNull: false
      },
      businessPincode: {
        type: DataTypes.STRING,
        allowNull: false
      },
      availabilityStatus: {
        type: DataTypes.ENUM('available', 'busy', 'offline', 'suspended'),
        defaultValue: 'available'
      },
      locationCoverage: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
      },
      categories: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
      },
      maxOrdersPerDay: {
        type: DataTypes.INTEGER,
        defaultValue: 5
      },
      currentOrders: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      rating: {
        type: DataTypes.DECIMAL(3, 2),
        defaultValue: 0.00
      },
      totalReviews: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      setupCharges: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 500.00
      },
      verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    });

    await queryInterface.createTable('Products', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      category: {
        type: DataTypes.ENUM('birthday', 'anniversary', 'proposal', 'wedding', 'baby-shower', 'corporate', 'festival', 'general'),
        allowNull: false
      },
      vendorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Vendors',
          key: 'id'
        }
      },
      stockQuantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      images: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
      },
      setupRequired: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      setupCharges: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
      },
      rating: {
        type: DataTypes.DECIMAL(3, 2),
        defaultValue: 0.00
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'out_of_stock', 'discontinued'),
        defaultValue: 'active'
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    });

    await queryInterface.createTable('Orders', {
      id: {
        type: DataTypes.STRING,
        primaryKey: true
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      shippingCharges: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
      },
      setupCharges: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
      },
      eventType: {
        type: DataTypes.ENUM('birthday', 'anniversary', 'proposal', 'wedding', 'baby-shower', 'corporate', 'festival', 'other'),
        allowNull: false
      },
      eventDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      eventTime: {
        type: DataTypes.TIME,
        allowNull: false
      },
      venueType: {
        type: DataTypes.ENUM('home', 'banquet', 'outdoor', 'office'),
        allowNull: false
      },
      venueAddress: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      guestCount: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      setupRequired: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      setupTimeSlot: {
        type: DataTypes.ENUM('6am-8am', '8am-10am', '10am-12pm', '2pm-4pm', '4pm-6pm', '6pm-8pm'),
        allowNull: true
      },
      specialInstructions: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      paymentMethod: {
        type: DataTypes.ENUM('card', 'cod', 'upi'),
        allowNull: false
      },
      paymentStatus: {
        type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
        defaultValue: 'pending'
      },
      orderStatus: {
        type: DataTypes.ENUM('pending', 'confirmed', 'processing', 'ready', 'setup', 'completed', 'cancelled'),
        defaultValue: 'pending'
      },
      shippingFirstName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      shippingLastName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      shippingEmail: {
        type: DataTypes.STRING,
        allowNull: false
      },
      shippingPhone: {
        type: DataTypes.STRING,
        allowNull: false
      },
      shippingAddress: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      shippingCity: {
        type: DataTypes.STRING,
        allowNull: false
      },
      shippingState: {
        type: DataTypes.STRING,
        allowNull: false
      },
      shippingPincode: {
        type: DataTypes.STRING,
        allowNull: false
      },
      shippingCountry: {
        type: DataTypes.STRING,
        defaultValue: 'India'
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    });

    await queryInterface.createTable('OrderItems', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      orderId: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: 'Orders',
          key: 'id'
        }
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Products',
          key: 'id'
        }
      },
      vendorId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Vendors',
          key: 'id'
        }
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      totalPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      itemStatus: {
        type: DataTypes.ENUM('pending', 'accepted', 'preparing', 'prepared', 'ready_for_setup', 'setup_scheduled', 'completed', 'cancelled'),
        defaultValue: 'pending'
      },
      setupAssigned: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    });

    await queryInterface.createTable('SupportTickets', {
      id: {
        type: DataTypes.STRING,
        primaryKey: true
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      orderId: {
        type: DataTypes.STRING,
        allowNull: true,
        references: {
          model: 'Orders',
          key: 'id'
        }
      },
      subject: {
        type: DataTypes.STRING,
        allowNull: false
      },
      category: {
        type: DataTypes.ENUM('order', 'billing', 'technical', 'general', 'cancellation', 'refund'),
        allowNull: false
      },
      priority: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
        defaultValue: 'medium'
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('open', 'in_progress', 'pending_user', 'resolved', 'closed'),
        defaultValue: 'open'
      },
      assignedTo: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      resolution: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      refundAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      refundProcessed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      lastReplyBy: {
        type: DataTypes.ENUM('user', 'admin'),
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    });

    await queryInterface.createTable('Addresses', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false
      },
      addressLine1: {
        type: DataTypes.STRING,
        allowNull: false
      },
      addressLine2: {
        type: DataTypes.STRING,
        allowNull: true
      },
      landmark: {
        type: DataTypes.STRING,
        allowNull: true
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false
      },
      state: {
        type: DataTypes.STRING,
        allowNull: false
      },
      pincode: {
        type: DataTypes.STRING,
        allowNull: false
      },
      country: {
        type: DataTypes.STRING,
        defaultValue: 'India'
      },
      addressType: {
        type: DataTypes.ENUM('home', 'work', 'other'),
        allowNull: false
      },
      isDefault: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Addresses');
    await queryInterface.dropTable('SupportTickets');
    await queryInterface.dropTable('OrderItems');
    await queryInterface.dropTable('Orders');
    await queryInterface.dropTable('Products');
    await queryInterface.dropTable('Vendors');
    await queryInterface.dropTable('Users');
  }
};
