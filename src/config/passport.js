import passport from "passport";

import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import prisma from "./prisma.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,

      clientSecret: process.env.GOOGLE_CLIENT_SECRET,

      callbackURL:
        "http://localhost:3000/auth/google/callback",
    },

    async (
      accessToken,
      refreshToken,
      profile,
      done
    ) => {
      try {
        let user = await prisma.user.findUnique({
          where: {
            email: profile.emails[0].value,
          },
        });

        /* ---------------------------------- */
        /* CREATE USER IF NOT EXISTS */
        /* ---------------------------------- */

        if (!user) {
          user = await prisma.user.create({
            data: {
              email: profile.emails[0].value,

              name: profile.displayName,

              avatar_url: profile.photos[0].value,

              provider: "google",

              provider_id: profile.id,
            },
          });

          /* ---------------------------------- */
          /* CREATE DEFAULT WORKSPACE */
          /* ---------------------------------- */

          await prisma.workspace.create({
            data: {
              user_id: user.id,

              name: `${user.name}'s Workspace`,
            },
          });
        }

        return done(null, user.id);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

/* ---------------------------------- */
/* SERIALIZE */
/* ---------------------------------- */

passport.serializeUser((userId, done) => {
  done(null, userId);
});

/* ---------------------------------- */
/* DESERIALIZE */
/* ---------------------------------- */

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },

      include: {
        workspaces: true,
      },
    });

    if (!user) {
      return done(null, false);
    }

    done(null, {
      ...user,
      workspace_id: user.workspaces[0]?.id,
    });
  } catch (error) {
    done(error, null);
  }
});