import { Client } from '@elastic/elasticsearch'
import mongoose from 'mongoose';
import mongooseElastic from '@selego/mongoose-elastic';

const client = new Client({ node: "http://localhost:9200" });

const UserSchema = new mongoose.Schema({
  githubId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
}, { timestamps: true });

UserSchema.plugin(mongooseElastic, { esClient: client, index: 'users' });

const User = mongoose.model('User', UserSchema);
export default User;
