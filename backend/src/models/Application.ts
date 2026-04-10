import mongoose from 'mongoose';

const ApplicationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company: { type: String, required: true },
  role: { type: String, required: true },
  companyUrl: { type: String },
  companyDescription: { type: String },
  jdLink: { type: String },
  notes: { type: String },
  dateApplied: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['Applied', 'Phone Screen', 'Interview', 'Offer', 'Rejected'],
    default: 'Applied'
  },
  salaryRange: { type: String },
}, { timestamps: true });

export default mongoose.model('Application', ApplicationSchema);
