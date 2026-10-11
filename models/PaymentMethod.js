import mongoose from 'mongoose';

const PaymentMethodSchema = new mongoose.Schema({
  methodName: { type: String, required: true, unique: true }, // মেথডের নাম
  isActive: { type: Boolean, default: true }                   // অন বা অফ স্ট্যাটাস
}, { timestamps: true });

export default mongoose.models.PaymentMethod || mongoose.model('PaymentMethod', PaymentMethodSchema);