const usersSchema = {
  name: String,
  email: String,
  password: String,
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date, default: Date.now },
};

module.exports = usersSchema;
