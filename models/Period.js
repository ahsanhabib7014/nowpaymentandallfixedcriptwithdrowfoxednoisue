import mongoose from 'mongoose';

const PeriodSchema = new mongoose.Schema({
  periodNumber: { type: Number, required: true, unique: true },
  status: { type: String, enum: ['active', 'closed'], default: 'active' },
  winningNumber: { type: Number, default: null },
  winningChoice: { type: String, default: null }, 
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date, required: true }
}, { timestamps: true });

export default mongoose.models.Period || mongoose.model('Period', PeriodSchema);