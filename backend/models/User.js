const mongoose = require("mongoose");

// Define User schema matching fields used by controllers
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

// Static methods expected by authController.js
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email }).exec();
};

userSchema.statics.findById = function (id) {
  return this.findOne({ _id: id }).exec();
};

userSchema.statics.findWithPasswordByEmail = function (email) {
  // Returns full document (including password_hash)
  return this.findOne({ email }).exec();
};

userSchema.statics.createUser = async function ({ name, email, passwordHash }) {
  const user = new this({ name, email, password_hash: passwordHash });
  await user.save();
  return user;
};

// Helper to shape data for the front‑end
function toPublic(doc) {
  if (!doc) return null;
  const obj = doc.toObject();
  return {
    id: obj._id.toString(),
    name: obj.name,
    email: obj.email,
    createdAt: obj.created_at ? new Date(obj.created_at).toISOString() : undefined,
  };
}

// Register model once
if (!mongoose.models.User) {
  mongoose.model("User", userSchema);
}

const User = mongoose.model("User");

module.exports = {
  findByEmail: (email) => User.findByEmail(email),
  findById: (id) => User.findById(id),
  findWithPasswordByEmail: (email) => User.findWithPasswordByEmail(email),
  createUser: (data) => User.createUser(data),
  toPublic,
};
