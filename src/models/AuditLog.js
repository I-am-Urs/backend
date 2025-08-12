import mongoose from 'mongoose';

const auditSchema = new mongoose.Schema({
  credentialId: { type: mongoose.Schema.Types.ObjectId, ref: 'Credential', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, enum: ['reveal'], required: true },
  at: { type: Date, default: Date.now },
  ip: { type: String }
});

const AuditLog = mongoose.model('AuditLog', auditSchema);
export default AuditLog;

