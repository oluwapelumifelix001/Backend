import mongoose from 'mongoose';
import bcrypt from 'bcrypt';


const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true
    },
    Password: {
        type: String,
        required: [true, "Password is required"]
    }
});

// Hash Password before saving
UserSchema.pre('save', async function (next) {
    if (!this.isModified('Password')) return next();
    this.Password = await bcrypt.hash(this.Password, 10);
    next();
});

// Method to compare Password during login
UserSchema.methods.comparePassword = async function (Password) {
    return await bcrypt.compare(Password, this.Password);
};

export default mongoose.model("User", UserSchema);
