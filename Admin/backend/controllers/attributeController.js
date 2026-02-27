const fs = require('fs').promises;
const path = require('path');

// File path for attributes data
const ATTRIBUTES_FILE = path.join(__dirname, '../data/attributes.json');

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.dirname(ATTRIBUTES_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Read attributes from file
async function readAttributes() {
  try {
    await ensureDataDir();
    const data = await fs.readFile(ATTRIBUTES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return default attributes
    return [
      { 
        id: 1, 
        name: 'Color', 
        type: 'color', 
        values: ['Red', 'Blue', 'Green', 'Black', 'White'], 
        category: 'All Products',
        required: true,
        active: true,
        createdAt: '2024-01-01',
        description: 'Product color variations'
      },
      { 
        id: 2, 
        name: 'Size', 
        type: 'size', 
        values: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], 
        category: 'Clothing',
        required: true,
        active: true,
        createdAt: '2024-01-02',
        description: 'Product size options'
      },
      { 
        id: 3, 
        name: 'Material', 
        type: 'text', 
        values: ['Cotton', 'Polyester', 'Wool', 'Silk', 'Linen'], 
        category: 'Clothing',
        required: false,
        active: true,
        createdAt: '2024-01-03',
        description: 'Fabric material composition'
      },
      { 
        id: 4, 
        name: 'Weight', 
        type: 'number', 
        values: ['100g', '200g', '500g', '1kg', '2kg'], 
        category: 'Food',
        required: false,
        active: true,
        createdAt: '2024-01-04',
        description: 'Product weight measurements'
      }
    ];
  }
}

// Write attributes to file
async function writeAttributes(attributes) {
  await ensureDataDir();
  await fs.writeFile(ATTRIBUTES_FILE, JSON.stringify(attributes, null, 2));
}

// Generate unique ID
function generateId(attributes) {
  if (attributes.length === 0) return 1;
  return Math.max(...attributes.map(attr => attr.id)) + 1;
}

// GET all attributes
exports.getAttributes = async (req, res) => {
  try {
    const attributes = await readAttributes();
    res.json(attributes);
  } catch (error) {
    console.error('Error fetching attributes:', error);
    res.status(500).json({ error: 'Failed to fetch attributes' });
  }
};

// GET attribute by ID
exports.getAttributeById = async (req, res) => {
  try {
    const attributes = await readAttributes();
    const attribute = attributes.find(attr => attr.id === parseInt(req.params.id));
    
    if (!attribute) {
      return res.status(404).json({ error: 'Attribute not found' });
    }
    
    res.json(attribute);
  } catch (error) {
    console.error('Error fetching attribute:', error);
    res.status(500).json({ error: 'Failed to fetch attribute' });
  }
};

// POST create new attribute
exports.createAttribute = async (req, res) => {
  try {
    const attributes = await readAttributes();
    const newAttribute = {
      id: generateId(attributes),
      name: req.body.name,
      type: req.body.type,
      values: req.body.values || [],
      category: req.body.category || 'All Products',
      required: req.body.required || false,
      active: req.body.active !== undefined ? req.body.active : true,
      description: req.body.description || '',
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    attributes.push(newAttribute);
    await writeAttributes(attributes);
    
    res.status(201).json(newAttribute);
  } catch (error) {
    console.error('Error creating attribute:', error);
    res.status(500).json({ error: 'Failed to create attribute' });
  }
};

// PUT update attribute
exports.updateAttribute = async (req, res) => {
  try {
    const attributes = await readAttributes();
    const index = attributes.findIndex(attr => attr.id === parseInt(req.params.id));
    
    if (index === -1) {
      return res.status(404).json({ error: 'Attribute not found' });
    }
    
    const updatedAttribute = {
      ...attributes[index],
      name: req.body.name || attributes[index].name,
      type: req.body.type || attributes[index].type,
      values: req.body.values || attributes[index].values,
      category: req.body.category || attributes[index].category,
      required: req.body.required !== undefined ? req.body.required : attributes[index].required,
      active: req.body.active !== undefined ? req.body.active : attributes[index].active,
      description: req.body.description !== undefined ? req.body.description : attributes[index].description
    };
    
    attributes[index] = updatedAttribute;
    await writeAttributes(attributes);
    
    res.json(updatedAttribute);
  } catch (error) {
    console.error('Error updating attribute:', error);
    res.status(500).json({ error: 'Failed to update attribute' });
  }
};

// DELETE attribute
exports.deleteAttribute = async (req, res) => {
  try {
    const attributes = await readAttributes();
    const index = attributes.findIndex(attr => attr.id === parseInt(req.params.id));
    
    if (index === -1) {
      return res.status(404).json({ error: 'Attribute not found' });
    }
    
    const deletedAttribute = attributes.splice(index, 1)[0];
    await writeAttributes(attributes);
    
    res.json({ message: 'Attribute deleted successfully', attribute: deletedAttribute });
  } catch (error) {
    console.error('Error deleting attribute:', error);
    res.status(500).json({ error: 'Failed to delete attribute' });
  }
};

// GET attributes by category
exports.getAttributesByCategory = async (req, res) => {
  try {
    const attributes = await readAttributes();
    const category = req.params.category;
    const filteredAttributes = attributes.filter(attr => 
      attr.category === category || attr.category === 'All Products'
    );
    
    res.json(filteredAttributes);
  } catch (error) {
    console.error('Error fetching attributes by category:', error);
    res.status(500).json({ error: 'Failed to fetch attributes by category' });
  }
};

// GET active attributes only
exports.getActiveAttributes = async (req, res) => {
  try {
    const attributes = await readAttributes();
    const activeAttributes = attributes.filter(attr => attr.active);
    
    res.json(activeAttributes);
  } catch (error) {
    console.error('Error fetching active attributes:', error);
    res.status(500).json({ error: 'Failed to fetch active attributes' });
  }
};
