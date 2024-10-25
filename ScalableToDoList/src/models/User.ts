import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  githubId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
}, { timestamps: true });

const UserModel = mongoose.model('User', UserSchema);

export interface User {
    _id: string;
    githubId: string;
    username: string;
}

export default UserModel;
