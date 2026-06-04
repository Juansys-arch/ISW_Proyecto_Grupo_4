"use strict";
import passport from "passport";
import User from "../entity/user.entity.js";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import { ACCESS_TOKEN_SECRET } from "../config/configEnv.js";
import { AppDataSource } from "../config/configDb.js";

function cookieJwtExtractor(req) {
  if (!req || !req.cookies) return null;

  return req.cookies.jwt || req.cookies["jwt-auth"] || null;
}

const options = {
  jwtFromRequest: ExtractJwt.fromExtractors([
    cookieJwtExtractor,
    ExtractJwt.fromAuthHeaderAsBearerToken(),
  ]),
  secretOrKey: ACCESS_TOKEN_SECRET,
};

passport.use(
  new JwtStrategy(options, async (jwt_payload, done) => {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: {
          email: jwt_payload.email,
        },
      });

      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (error) {
      return done(error, false);
    }
  }),
);

export function passportJwtSetup() {
  passport.initialize();
}
