const PolicyContent = require('../models/PolicyContent');

// GET policy content by page type
exports.getPolicyContent = async (req, res) => {
  try {
    const { pageType } = req.params;
    
    const content = await PolicyContent.getByPageType(pageType);
    
    if (!content) {
      return res.json({ 
        pageType, 
        content: '', 
        title: getDefaultTitle(pageType)
      });
    }
    
    res.json(content);
  } catch (error) {
    console.error('Error fetching policy content:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST/UPDATE policy content
exports.updatePolicyContent = async (req, res) => {
  try {
    const { pageType } = req.params;
    const { content, title } = req.body;
    
    if (!content && content !== '') {
      return res.status(400).json({ message: 'Content is required' });
    }
    
    const updatedContent = await PolicyContent.createOrUpdate(
      pageType, 
      content, 
      title || getDefaultTitle(pageType),
      req.user?.id
    );
    
    res.json({
      message: 'Content saved successfully',
      content: updatedContent
    });
  } catch (error) {
    console.error('Error saving policy content:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Page type already exists' });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET all policy content
exports.getAllPolicyContent = async (req, res) => {
  try {
    const allContent = await PolicyContent.find().sort({ pageType: 1 });
    res.json(allContent);
  } catch (error) {
    console.error('Error fetching all policy content:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST/UPDATE refund policy status
exports.updateRefundPolicyStatus = async (req, res) => {
  try {
    const { active } = req.body;
    
    let refundPolicy = await PolicyContent.findOne({ pageType: 'refund' });
    
    if (refundPolicy) {
      refundPolicy.active = active;
      refundPolicy.lastUpdated = new Date();
      if (req.user?.id) {
        refundPolicy.updatedBy = req.user.id;
      }
      await refundPolicy.save();
    } else {
      refundPolicy = await PolicyContent.create({
        pageType: 'refund',
        title: 'Refund Policy',
        content: '',
        active: active,
        updatedBy: req.user?.id
      });
    }
    
    res.json({
      message: `Refund policy ${active ? 'enabled' : 'disabled'} successfully`,
      active: active
    });
  } catch (error) {
    console.error('Error updating refund policy status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST/UPDATE return policy status
exports.updateReturnPolicyStatus = async (req, res) => {
  try {
    const { active } = req.body;
    
    let returnPolicy = await PolicyContent.findOne({ pageType: 'return' });
    
    if (returnPolicy) {
      returnPolicy.active = active;
      returnPolicy.lastUpdated = new Date();
      if (req.user?.id) {
        returnPolicy.updatedBy = req.user.id;
      }
      await returnPolicy.save();
    } else {
      returnPolicy = await PolicyContent.create({
        pageType: 'return',
        title: 'Return Policy',
        content: '',
        active: active,
        updatedBy: req.user?.id
      });
    }
    
    res.json({
      message: `Return policy ${active ? 'enabled' : 'disabled'} successfully`,
      active: active
    });
  } catch (error) {
    console.error('Error updating return policy status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST/UPDATE cancellation policy status
exports.updateCancellationPolicyStatus = async (req, res) => {
  try {
    const { active } = req.body;
    
    let cancellationPolicy = await PolicyContent.findOne({ pageType: 'cancellation' });
    
    if (cancellationPolicy) {
      cancellationPolicy.active = active;
      cancellationPolicy.lastUpdated = new Date();
      if (req.user?.id) {
        cancellationPolicy.updatedBy = req.user.id;
      }
      await cancellationPolicy.save();
    } else {
      cancellationPolicy = await PolicyContent.create({
        pageType: 'cancellation',
        title: 'Cancellation Policy',
        content: '',
        active: active,
        updatedBy: req.user?.id
      });
    }
    
    res.json({
      message: `Cancellation policy ${active ? 'enabled' : 'disabled'} successfully`,
      active: active
    });
  } catch (error) {
    console.error('Error updating cancellation policy status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST/UPDATE shipping policy status
exports.updateShippingPolicyStatus = async (req, res) => {
  try {
    const { active } = req.body;
    
    let shippingPolicy = await PolicyContent.findOne({ pageType: 'shipping' });
    
    if (shippingPolicy) {
      shippingPolicy.active = active;
      shippingPolicy.lastUpdated = new Date();
      if (req.user?.id) {
        shippingPolicy.updatedBy = req.user.id;
      }
      await shippingPolicy.save();
    } else {
      shippingPolicy = await PolicyContent.create({
        pageType: 'shipping',
        title: 'Shipping Policy',
        content: '',
        active: active,
        updatedBy: req.user?.id
      });
    }
    
    res.json({
      message: `Shipping policy ${active ? 'enabled' : 'disabled'} successfully`,
      active: active
    });
  } catch (error) {
    console.error('Error updating shipping policy status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper function to get default title based on page type
function getDefaultTitle(pageType) {
  const titles = {
    terms: 'Terms & Conditions',
    privacy: 'Privacy Policy',
    refund: 'Refund Policy',
    return: 'Return Policy',
    cancellation: 'Cancellation Policy',
    shipping: 'Shipping Policy',
    about: 'About Us',
    faq: 'FAQ',
    reliability: 'Company Reliability'
  };
  
  return titles[pageType] || 'Policy Page';
}
