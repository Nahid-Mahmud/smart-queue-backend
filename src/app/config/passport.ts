import bcryptjs from "bcryptjs";
// import bcryptjs from "bcryptjs";
/* eslint-disable @typescript-eslint/no-explicit-any */
import passport from "passport";

// import User from "../modules/user/user.model";
// import { IsActive, UserRole } from "../modules/user/user.interface";
import { Strategy as LocalStrategy } from "passport-local";
import User from "../modules/user/user.model";
import { IsActive } from "../modules/user/user.interface";

// email password authentication with passport

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email: string, password: string, done) => {
      try {
        // check for email and password has been provided
        if (!email || !password) {
          return done(null, false, { message: "Email and password are required" });
        }

        // check if user exists
        const user = await User.findOne({ email });

        if (!user) {
          return done(null, false, { message: "User not found" });
        }
        if (!user.isVerified) {
          return done(null, false, { message: "User is not verified" });
        }
        if (user.isActive === IsActive.BLOCKED || user.isActive === IsActive.INACTIVE) {
          return done(null, false, { message: `User is ${user.isActive}` });
        }
        if (user.isDeleted) {
          return done(null, false, { message: "User is deleted" });
        }

        // check if the users is google authenticated

        const isPasswordMatch = await bcryptjs.compare(password, user.password as string);

        if (!isPasswordMatch) {
          return done(null, false, { message: "Password is incorrect" });
        }

        return done(null, user);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
        done(error);
      }
    }
  )
);

// Configure Passport to use Google OAuth strategy

// Serialize and deserialize user instances to support persistent login sessions

passport.serializeUser((user: any, done: (err: any, id?: unknown) => void) => {
  done(null, user._id);
});

// Deserialize user instance from the session

passport.deserializeUser(async (id: string, done: any) => {
  try {
    const user = await User.findById(id).select("-password");
    done(null, user);
  } catch (error) {
    done(error);
  }
});
