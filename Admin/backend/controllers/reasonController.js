const Reason = require('../models/Reason');

// GET all reasons
exports.getReasons = async (req, res) => {
  try {
    const reasons = await Reason.find().sort({ priority: -1, createdAt: -1 });
    res.json(reasons);
  } catch (error) {
    console.error('Error fetching reasons:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET single reason
exports.getReason = async (req, res) => {
  try {
    const reason = await Reason.findById(req.params.id);
    if (!reason) {
      return res.status(404).json({ message: 'Reason not found' });
    }
    res.json(reason);
  } catch (error) {
    console.error('Error fetching reason:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// CREATE reason
exports.createReason = async (req, res) => {
  try {
    const { title, description, priority, status } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const reason = new Reason({
      title,
      description,
      priority: priority || 0,
      status: status !== undefined ? status : true,
      createdBy: req.user?.id
    });

    await reason.save();
    res.status(201).json({
      message: 'Reason created successfully',
      reason
    });
  } catch (error) {
    console.error('Error creating reason:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// UPDATE reason
exports.updateReason = async (req, res) => {
  try {
    const reason = await Reason.findById(req.params.id);
    if (!reason) {
      return res.status(404).json({ message: 'Reason not found' });
    }

    const { title, description, priority, status } = req.body;

    if (title) reason.title = title;
    if (description) reason.description = description;
    if (priority !== undefined) reason.priority = priority;
    if (status !== undefined) reason.status = status;
    
    reason.updatedBy = req.user?.id;
    await reason.save();

    res.json({
      message: 'Reason updated successfully',
      reason
    });
  } catch (error) {
    console.error('Error updating reason:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE reason
exports.deleteReason = async (req, res) => {
  try {
    const reason = await Reason.findById(req.params.id);
    if (!reason) {
      return res.status(404).json({ message: 'Reason not found' });
    }

    await reason.deleteOne();
    res.json({ message: 'Reason deleted successfully' });
  } catch (error) {
    console.error('Error deleting reason:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// TOGGLE reason status
exports.toggleReasonStatus = async (req, res) => {
  try {
    const reason = await Reason.findById(req.params.id);
    if (!reason) {
      return res.status(404).json({ message: 'Reason not found' });
    }

    reason.status = !reason.status;
    reason.updatedBy = req.user?.id;
    await reason.save();

    res.json({
      message: 'Reason status updated successfully',
      reason
    });
  } catch (error) {
    console.error('Error toggling reason status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
