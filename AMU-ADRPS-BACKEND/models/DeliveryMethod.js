const mongoose = require("mongoose");

const deliveryMethodSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required for delivery information.'],
    index: true,
    unique: true,
  },
  deliveryMethod: {
    type: String,
    required: [true, 'Delivery method selection is required.'],
    enum: {
      values: ["post", "appointment"],
      message: 'Delivery method must be either "post" or "appointment".'
    }
  },
  address: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    postalCode: { type: String, trim: true },
    country: { type: String, trim: true },
  },
  confirmationInfo: {
    name: { type: String, required: [true, 'Confirmation name is required.'], trim: true },
    telNo: { type: String, required: [true, 'Confirmation telephone number is required.'], trim: true },
    date: { type: Date, required: [true, 'Confirmation date is required.'] },
  },
}, { timestamps: true });

// Correct validation for nested address
deliveryMethodSchema.pre('validate', function(next) {
  if (this.deliveryMethod === 'post') {
    if (!this.address || !this.address.street || !this.address.city || !this.address.country) {
      this.invalidate('address', 'Full address (Street, City, Country) is required when delivery method is "post".');
    }
  }
  next();
});

const DeliveryMethod = mongoose.model("DeliveryMethod", deliveryMethodSchema);

module.exports = DeliveryMethod;