const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema(
  {
    message: {
      type: String,
    },

    sender: {
      type: Schema.Types.ObjectId,
      ref: "Userdetail",
    },

    receiver: {
      type: Schema.Types.ObjectId,
      ref: "Userdetail",
    },

    read: { type: Boolean, default: false },

    conversationId: {
      type: String,
    },
  },
  { timestamps: true }
);

const MessageDetail = mongoose.model("Messagedetail", messageSchema);

module.exports = MessageDetail;
