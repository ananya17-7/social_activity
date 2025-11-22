const mongoose = require('mongoose');
const { ACTIVITY_TYPES } = require('../config/constants');

const activitySchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(ACTIVITY_TYPES),
      required: true,
    },
    target: {
      type: mongoose.Schema.Types.ObjectId,
      ref: function () {
        // Dynamic reference based on activity type
        if (
          this.type === ACTIVITY_TYPES.POST_CREATED ||
          this.type === ACTIVITY_TYPES.POST_DELETED ||
          this.type === ACTIVITY_TYPES.POST_LIKED ||
          this.type === ACTIVITY_TYPES.POST_UNLIKED
        ) {
          return 'Post';
        }
        return 'User';
      },
    },
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    description: String,
    metadata: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
activitySchema.index({ actor: 1, createdAt: -1 });
activitySchema.index({ createdAt: -1 });
activitySchema.index({ type: 1 });

module.exports = mongoose.model('Activity', activitySchema);
