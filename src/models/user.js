import mongoose, { mongo } from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    resetCode: {
      type: String,
      default: null,
    },
    resetCodeExpires: {
      type: Date,
      default: null,
    },

    firstTime: {
      type: Boolean,
      default: true,
    },
    diet: {
      type: Object,
      default: null,
    
    },
    workoutPlan: {
      type: Object,
      default: null,
    },
    hasPaid: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

userSchema.methods.comparePassword = async function (userPassword) {
  return await bcrypt.compare(userPassword, this.password);
};

userSchema.methods.compareCode = async function (userCode) {
  if (
    userCode == this.resetCode &&
    new Date(Date.now()) < this.resetCodeExpires
  ) {
    return true;
  }
  return false;
};

const User = mongoose.model("User", userSchema);

export default User;
