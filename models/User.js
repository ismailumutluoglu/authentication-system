import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Kullanıcı adı zorunludur'],
      trim: true,
      minlength: [3, 'Kullanıcı adı en az 3 karakter olmalıdır'],
    },

    email: {
      type: String,
      required: [true, 'Email zorunludur'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Geçerli bir email giriniz',
      ],
    },

    password: {
      type: String,
      required: [true, 'Şifre zorunludur'],
      minlength: [6, 'Şifre en az 6 karakter olmalıdır'],
      select: false,
    },

    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true, // createdAt ve updatedAt otomatik eklenir
  }
);


// MIDDLEWARE: Kaydetmeden önce şifreyi hash'le
userSchema.pre('save', async function (next) {
  // Şifre değişmediyse tekrar hash'leme
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// METHOD: Şifre karşılaştırma
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;