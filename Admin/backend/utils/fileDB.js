const fs = require('fs').promises;
const path = require('path');

class FileDB {
  constructor(dataDir = './data') {
    this.dataDir = dataDir;
    this.init();
  }

  async init() {
    try {
      await fs.access(this.dataDir);
    } catch {
      await fs.mkdir(this.dataDir, { recursive: true });
    }
  }

  async readFile(filename) {
    try {
      const filePath = path.join(this.dataDir, filename);
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  async writeFile(filename, data) {
    const filePath = path.join(this.dataDir, filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }

  // User methods
  async findUsers(query = {}) {
    const users = await this.readFile('users.json');
    return users.filter(user => {
      return Object.keys(query).every(key => user[key] === query[key]);
    });
  }

  async findUserById(id) {
    const users = await this.readFile('users.json');
    return users.find(user => user._id === id);
  }

  async createUser(userData) {
    const users = await this.readFile('users.json');
    const newUser = {
      _id: Date.now().toString(),
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    users.push(newUser);
    await this.writeFile('users.json', users);
    return newUser;
  }

  async updateUser(id, updateData) {
    const users = await this.readFile('users.json');
    const index = users.findIndex(user => user._id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...updateData, updatedAt: new Date() };
      await this.writeFile('users.json', users);
      return users[index];
    }
    return null;
  }

  // Customer methods
  async findCustomers(query = {}) {
    const customers = await this.readFile('customers.json');
    return customers.filter(customer => {
      return Object.keys(query).every(key => customer[key] === query[key]);
    });
  }

  async findCustomerById(id) {
    const customers = await this.readFile('customers.json');
    return customers.find(customer => customer._id === id);
  }

  async createCustomer(customerData) {
    const customers = await this.readFile('customers.json');
    const newCustomer = {
      _id: Date.now().toString(),
      ...customerData,
      totalOrders: 0,
      totalSpent: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    customers.push(newCustomer);
    await this.writeFile('customers.json', customers);
    return newCustomer;
  }

  async updateCustomer(id, updateData) {
    const customers = await this.readFile('customers.json');
    const index = customers.findIndex(customer => customer._id === id);
    if (index !== -1) {
      customers[index] = { ...customers[index], ...updateData, updatedAt: new Date() };
      await this.writeFile('customers.json', customers);
      return customers[index];
    }
    return null;
  }

  // Product methods
  async findProducts(query = {}) {
    const products = await this.readFile('products.json');
    return products.filter(product => {
      return Object.keys(query).every(key => product[key] === query[key]);
    });
  }

  async findProductById(id) {
    const products = await this.readFile('products.json');
    return products.find(product => product._id === id);
  }

  async createProduct(productData) {
    const products = await this.readFile('products.json');
    const newProduct = {
      _id: Date.now().toString(),
      ...productData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    products.push(newProduct);
    await this.writeFile('products.json', products);
    return newProduct;
  }

  async updateProduct(id, updateData) {
    const products = await this.readFile('products.json');
    const index = products.findIndex(product => product._id === id);
    if (index !== -1) {
      products[index] = { ...products[index], ...updateData, updatedAt: new Date() };
      await this.writeFile('products.json', products);
      return products[index];
    }
    return null;
  }

  // Order methods
  async findOrders(query = {}) {
    const orders = await this.readFile('orders.json');
    return orders.filter(order => {
      return Object.keys(query).every(key => order[key] === query[key]);
    });
  }

  async findOrderById(id) {
    const orders = await this.readFile('orders.json');
    return orders.find(order => order._id === id);
  }

  async createOrder(orderData) {
    const orders = await this.readFile('orders.json');
    const newOrder = {
      _id: Date.now().toString(),
      orderNumber: `ORD-${Date.now()}`,
      ...orderData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    orders.push(newOrder);
    await this.writeFile('orders.json', orders);
    return newOrder;
  }

  async updateOrder(id, updateData) {
    const orders = await this.readFile('orders.json');
    const index = orders.findIndex(order => order._id === id);
    if (index !== -1) {
      orders[index] = { ...orders[index], ...updateData, updatedAt: new Date() };
      await this.writeFile('orders.json', orders);
      return orders[index];
    }
    return null;
  }
}

module.exports = new FileDB();
