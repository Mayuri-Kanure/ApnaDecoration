const mongoose = require('mongoose');

const fileManagerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['folder', 'file'],
    required: true
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FileManager',
    default: null
  },
  path: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    default: 0
  },
  mimeType: String,
  files: {
    type: Number,
    default: 0
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  public: {
    type: Boolean,
    default: false
  },
  tags: [String],
  description: String
}, {
  timestamps: true
});

module.exports = mongoose.model('FileManager', fileManagerSchema);
