import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import mongoose from 'mongoose';
import User from '../models/User';

require('dotenv').config(); // Load environment variable
const clientID = process.env.GITHUB_CLIENT_ID;
if (!clientID) {
  throw new Error("Missing GITHUB_CLIENT_ID");
}
const clientSecret = process.env.GITHUB_CLIENT_SECRET;
if (!clientSecret) {
  throw new Error("Missing GITHUB_CLIENT_SECRET");
}

export const configurePassport = ()=> {
passport.use(new GitHubStrategy({
  clientID,
  clientSecret,
  callbackURL: "/auth/github/callback"
}, async (accessToken: any, refreshToken: any, profile: any, done: any) => {
  try {//console.log('Access Token:', accessToken)
    const user = await User.findOne({ githubId: profile.id });
    if (user) {
      return done(null, user);
    } else {
      const newUser = new User({
        githubId: profile.id,
        username: profile.username,
      });
      await newUser.save();
      return done(null, newUser);
    }
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user: any, done) => {//console.log("serializing...")
  done(null, user._id);
});

passport.deserializeUser(async (_id, done) => {//console.log("deserializing...")
  const user = await User.findById(_id);
  done(null, user);
});

}