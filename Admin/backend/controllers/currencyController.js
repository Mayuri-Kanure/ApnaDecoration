const AdminSettings = require('../models/AdminSettings');

// Get all currencies
exports.getCurrencies = async (req, res) => {
  try {
    // Default currencies for APNA DECORATION
    const defaultCurrencies = [
      {
        id: 1,
        name: 'US Dollar',
        code: 'USD',
        symbol: '$',
        exchangeRate: 1.00,
        status: true,
        isDefault: true
      },
      {
        id: 2,
        name: 'Euro',
        code: 'EUR',
        symbol: '€',
        exchangeRate: 0.85,
        status: false,
        isDefault: false
      },
      {
        id: 3,
        name: 'British Pound',
        code: 'GBP',
        symbol: '£',
        exchangeRate: 0.73,
        status: false,
        isDefault: false
      },
      {
        id: 4,
        name: 'Indian Rupee',
        code: 'INR',
        symbol: '₹',
        exchangeRate: 74.50,
        status: false,
        isDefault: false
      }
    ];

    // Try to get currencies from settings, otherwise use defaults
    const settings = await AdminSettings.getSettings();
    const currencies = settings.currencies || defaultCurrencies;

    res.json(currencies);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching currencies', error: error.message });
  }
};

// Add new currency
exports.addCurrency = async (req, res) => {
  try {
    const { name, code, symbol, exchangeRate } = req.body;

    // Validation
    if (!name || !code || !symbol || exchangeRate === undefined) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const settings = await AdminSettings.getSettings();
    
    // Initialize currencies array if not exists
    if (!settings.currencies) {
      settings.currencies = [];
    }

    // Check if currency code already exists
    const existingCurrency = settings.currencies.find(c => c.code === code);
    if (existingCurrency) {
      return res.status(400).json({ message: 'Currency code already exists' });
    }

    // Add new currency
    const newCurrency = {
      id: settings.currencies.length + 1,
      name,
      code,
      symbol,
      exchangeRate: parseFloat(exchangeRate),
      status: true,
      isDefault: false
    };

    settings.currencies.push(newCurrency);
    await settings.save();

    res.json({
      message: 'Currency added successfully',
      currency: newCurrency
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding currency', error: error.message });
  }
};

// Update currency
exports.updateCurrency = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, symbol, exchangeRate, status, isDefault } = req.body;

    const settings = await AdminSettings.getSettings();
    
    if (!settings.currencies) {
      return res.status(404).json({ message: 'No currencies found' });
    }

    const currencyIndex = settings.currencies.findIndex(c => c.id === parseInt(id));
    if (currencyIndex === -1) {
      return res.status(404).json({ message: 'Currency not found' });
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      settings.currencies.forEach(c => c.isDefault = false);
    }

    // Update currency
    settings.currencies[currencyIndex] = {
      ...settings.currencies[currencyIndex],
      name: name || settings.currencies[currencyIndex].name,
      code: code || settings.currencies[currencyIndex].code,
      symbol: symbol || settings.currencies[currencyIndex].symbol,
      exchangeRate: exchangeRate !== undefined ? parseFloat(exchangeRate) : settings.currencies[currencyIndex].exchangeRate,
      status: status !== undefined ? status : settings.currencies[currencyIndex].status,
      isDefault: isDefault !== undefined ? isDefault : settings.currencies[currencyIndex].isDefault
    };

    await settings.save();

    res.json({
      message: 'Currency updated successfully',
      currency: settings.currencies[currencyIndex]
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating currency', error: error.message });
  }
};

// Delete currency
exports.deleteCurrency = async (req, res) => {
  try {
    const { id } = req.params;

    const settings = await AdminSettings.getSettings();
    
    if (!settings.currencies) {
      return res.status(404).json({ message: 'No currencies found' });
    }

    const currencyIndex = settings.currencies.findIndex(c => c.id === parseInt(id));
    if (currencyIndex === -1) {
      return res.status(404).json({ message: 'Currency not found' });
    }

    // Don't allow deletion of default currency
    if (settings.currencies[currencyIndex].isDefault) {
      return res.status(400).json({ message: 'Cannot delete default currency' });
    }

    // Remove currency
    settings.currencies.splice(currencyIndex, 1);
    await settings.save();

    res.json({
      message: 'Currency deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting currency', error: error.message });
  }
};

// Set default currency
exports.setDefaultCurrency = async (req, res) => {
  try {
    const { id } = req.params;

    const settings = await AdminSettings.getSettings();
    
    if (!settings.currencies) {
      return res.status(404).json({ message: 'No currencies found' });
    }

    const currencyIndex = settings.currencies.findIndex(c => c.id === parseInt(id));
    if (currencyIndex === -1) {
      return res.status(404).json({ message: 'Currency not found' });
    }

    // Unset all defaults and set new default
    settings.currencies.forEach(c => c.isDefault = false);
    settings.currencies[currencyIndex].isDefault = true;

    await settings.save();

    res.json({
      message: 'Default currency updated successfully',
      currency: settings.currencies[currencyIndex]
    });
  } catch (error) {
    res.status(500).json({ message: 'Error setting default currency', error: error.message });
  }
};
