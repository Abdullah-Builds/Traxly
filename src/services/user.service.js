import prisma from "../config/prisma.js";

export const findOrCreateGoogleUser = async (profile) => {
  const email = profile.emails?.[0]?.value;

  let user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: profile.displayName,
        avatar_url: profile.photos?.[0]?.value,
        provider: "google",
        provider_id: profile.id,
      },
    });
  }

  return user;
};