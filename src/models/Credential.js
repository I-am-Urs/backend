import mongoose from 'mongoose';

const passwordSubSchema = new mongoose.Schema({
  iv: { type: String, required: true },
  content: { type: String, required: true }
}, { _id: false });

const credentialSchema = new mongoose.Schema({
  accountName: { type: String, required: true },
  accountUsername: { type: String, required: true },
  password: { type: passwordSubSchema, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

credentialSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const Credential = mongoose.model('Credential', credentialSchema);
export default Credential;

