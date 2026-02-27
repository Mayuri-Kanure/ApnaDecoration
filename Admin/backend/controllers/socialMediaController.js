const SocialMedia = require('../models/SocialMedia');

// GET all social media links
exports.getAllSocialMedia = async (req, res) => {
  try {
    const socialMedia = await SocialMedia.find().sort({ order: 1, createdAt: 1 });
    res.json(socialMedia);
  } catch (error) {
    console.error('Error fetching social media:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET social media by ID
exports.getSocialMediaById = async (req, res) => {
  try {
    const socialMedia = await SocialMedia.findById(req.params.id);
    if (!socialMedia) {
      return res.status(404).json({ message: 'Social media not found' });
    }
    res.json(socialMedia);
  } catch (error) {
    console.error('Error fetching social media:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// CREATE new social media link
exports.createSocialMedia = async (req, res) => {
  try {
    const { platform, url } = req.body;

    // Check if platform already exists
    const existingSocialMedia = await SocialMedia.findOne({ platform });
    if (existingSocialMedia) {
      return res.status(400).json({ message: 'This social media platform already exists' });
    }

    // Get platform display name
    const platformNames = SocialMedia.getPlatformNames();
    const name = platformNames[platform] || platform;

    const socialMedia = new SocialMedia({
      platform,
      name,
      url,
      createdBy: req.user?.id
    });

    await socialMedia.save();
    res.status(201).json({
      message: 'Social media link created successfully',
      socialMedia
    });
  } catch (error) {
    console.error('Error creating social media:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// UPDATE social media link
exports.updateSocialMedia = async (req, res) => {
  try {
    const { platform, url } = req.body;
    const { id } = req.params;

    let socialMedia = await SocialMedia.findById(id);
    if (!socialMedia) {
      return res.status(404).json({ message: 'Social media not found' });
    }

    // Check if platform is being changed and if new platform already exists
    if (platform && platform !== socialMedia.platform) {
      const existingSocialMedia = await SocialMedia.findOne({ platform });
      if (existingSocialMedia) {
        return res.status(400).json({ message: 'This social media platform already exists' });
      }
      socialMedia.platform = platform;
      
      // Update name if platform changed
      const platformNames = SocialMedia.getPlatformNames();
      socialMedia.name = platformNames[platform] || platform;
    }

    if (url) socialMedia.url = url;
    
    socialMedia.updatedBy = req.user?.id;
    await socialMedia.save();

    res.json({
      message: 'Social media link updated successfully',
      socialMedia
    });
  } catch (error) {
    console.error('Error updating social media:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE social media link
exports.deleteSocialMedia = async (req, res) => {
  try {
    const socialMedia = await SocialMedia.findById(req.params.id);
    if (!socialMedia) {
      return res.status(404).json({ message: 'Social media not found' });
    }

    await SocialMedia.findByIdAndDelete(req.params.id);
    res.json({
      message: 'Social media link deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting social media:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// UPDATE social media status (active/inactive)
exports.updateSocialMediaStatus = async (req, res) => {
  try {
    const { active } = req.body;
    const { id } = req.params;

    const socialMedia = await SocialMedia.findById(id);
    if (!socialMedia) {
      return res.status(404).json({ message: 'Social media not found' });
    }

    socialMedia.active = active;
    socialMedia.updatedBy = req.user?.id;
    await socialMedia.save();

    res.json({
      message: 'Social media status updated successfully',
      socialMedia
    });
  } catch (error) {
    console.error('Error updating social media status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// UPDATE social media order
exports.updateSocialMediaOrder = async (req, res) => {
  try {
    const { orders } = req.body; // Array of { id, order }

    const updatePromises = orders.map(({ id, order }) =>
      SocialMedia.findByIdAndUpdate(id, { order }, { new: true })
    );

    await Promise.all(updatePromises);

    res.json({
      message: 'Social media order updated successfully'
    });
  } catch (error) {
    console.error('Error updating social media order:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
