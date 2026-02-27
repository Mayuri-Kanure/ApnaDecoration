const FAQ = require('../models/FAQ');

// GET all FAQs with pagination and search
exports.getAllFAQs = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', sortBy = 'ranking', sortOrder = 'asc' } = req.query;
    
    // Build search query
    const searchQuery = search ? {
      $or: [
        { question: { $regex: search, $options: 'i' } },
        { answer: { $regex: search, $options: 'i' } }
      ]
    } : {};
    
    // Build sort query
    const sortQuery = {};
    sortQuery[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Get FAQs with pagination
    const faqs = await FAQ.find(searchQuery)
      .sort(sortQuery)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    // Get total count for pagination
    const total = await FAQ.countDocuments(searchQuery);
    
    res.json({
      faqs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET single FAQ by ID
exports.getFAQById = async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }
    
    res.json(faq);
  } catch (error) {
    console.error('Error fetching FAQ:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// CREATE new FAQ
exports.createFAQ = async (req, res) => {
  try {
    const { question, answer, ranking = 0, active = true } = req.body;
    
    if (!question || !answer) {
      return res.status(400).json({ message: 'Question and answer are required' });
    }
    
    const faq = new FAQ({
      question,
      answer,
      ranking,
      active,
      createdBy: req.user?.id,
      updatedBy: req.user?.id
    });
    
    await faq.save();
    
    res.status(201).json({
      message: 'FAQ created successfully',
      faq
    });
  } catch (error) {
    console.error('Error creating FAQ:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// UPDATE FAQ
exports.updateFAQ = async (req, res) => {
  try {
    const { question, answer, ranking, active } = req.body;
    
    const faq = await FAQ.findById(req.params.id);
    
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }
    
    // Update fields
    if (question !== undefined) faq.question = question;
    if (answer !== undefined) faq.answer = answer;
    if (ranking !== undefined) faq.ranking = ranking;
    if (active !== undefined) faq.active = active;
    
    faq.updatedBy = req.user?.id;
    faq.updatedAt = new Date();
    
    await faq.save();
    
    res.json({
      message: 'FAQ updated successfully',
      faq
    });
  } catch (error) {
    console.error('Error updating FAQ:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE FAQ
exports.deleteFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }
    
    await FAQ.findByIdAndDelete(req.params.id);
    
    res.json({
      message: 'FAQ deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// UPDATE FAQ status (active/inactive)
exports.updateFAQStatus = async (req, res) => {
  try {
    const { active } = req.body;
    
    const faq = await FAQ.findById(req.params.id);
    
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }
    
    faq.active = active;
    faq.updatedBy = req.user?.id;
    faq.updatedAt = new Date();
    
    await faq.save();
    
    res.json({
      message: `FAQ ${active ? 'activated' : 'deactivated'} successfully`,
      faq
    });
  } catch (error) {
    console.error('Error updating FAQ status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
