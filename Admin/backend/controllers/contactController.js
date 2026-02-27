const Contact = require('../models/Contact');
const { sendContactReply } = require('../utils/emailService');

const contactController = {
  // Submit contact form
  submitContact: async (req, res) => {
    try {
      const { name, email, phone, subject, message } = req.body;

      const contact = new Contact({
        name,
        email,
        phone,
        subject,
        message
      });

      await contact.save();

      res.status(201).json({
        success: true,
        message: 'Contact form submitted successfully',
        data: contact
      });
    } catch (error) {
      console.error('Submit contact error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit contact form',
        error: error.message
      });
    }
  },

  // Get all contacts (Admin only)
  getAllContacts: async (req, res) => {
    try {
      const { status, page = 1, limit = 20 } = req.query;
      
      const query = status ? { status } : {};
      
      const contacts = await Contact.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const count = await Contact.countDocuments(query);

      res.json({
        success: true,
        data: contacts,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count
      });
    } catch (error) {
      console.error('Get contacts error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch contacts',
        error: error.message
      });
    }
  },

  // Update contact status
  updateContactStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, reply } = req.body;

      const contact = await Contact.findById(id);
      
      if (!contact) {
        return res.status(404).json({
          success: false,
          message: 'Contact not found'
        });
      }

      const updateData = { status };
      
      if (reply) {
        updateData.reply = reply;
        updateData.repliedAt = new Date();
        updateData.repliedBy = req.user.userId;
        
        // Send email to user
        const emailResult = await sendContactReply(
          contact.email,
          contact.name,
          contact.subject,
          contact.message,
          reply
        );
        
        if (!emailResult.success) {
          console.error('Failed to send email:', emailResult.error);
        }
      }

      const updatedContact = await Contact.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );

      res.json({
        success: true,
        message: 'Contact updated successfully',
        data: updatedContact
      });
    } catch (error) {
      console.error('Update contact error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update contact',
        error: error.message
      });
    }
  },

  // Delete contact
  deleteContact: async (req, res) => {
    try {
      const { id } = req.params;

      const contact = await Contact.findByIdAndDelete(id);

      if (!contact) {
        return res.status(404).json({
          success: false,
          message: 'Contact not found'
        });
      }

      res.json({
        success: true,
        message: 'Contact deleted successfully'
      });
    } catch (error) {
      console.error('Delete contact error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete contact',
        error: error.message
      });
    }
  }
};

module.exports = contactController;
