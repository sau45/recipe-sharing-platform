const {mongoose}= require('mongoose');


const userSchema = new mongoose.Schema({
  name: { type: String, require: true },
  email: { type: String, require: true, unique: true, lowercase: true },
  isChef: { type: Boolean, default: false },
  password: { type: String, require: true },
  profileUrl: { type: String },
  createdAt: { type: Date, default: Date.now() },
});

const User = mongoose.model("User",userSchema);
module.exports = User;