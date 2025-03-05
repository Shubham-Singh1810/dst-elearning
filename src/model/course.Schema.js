const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");
const { type } = require("os");

const courseSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
    default: true,
  },
  image: {
    type: String,
    required: true,
  },
  type: {
    type: String,
  },
  price: {
    type: String,
  },
  discountedPrice: {
    type: String,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
});

courseSchema.plugin(timestamps);
module.exports = mongoose.model("Course", courseSchema);
