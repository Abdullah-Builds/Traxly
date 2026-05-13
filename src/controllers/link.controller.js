import prisma from "../config/prisma.js";
import crypto from "crypto";

/* ------------------------------------------------ */
/* HELPER: GENERATE UNIQUE SLUG */
/* ------------------------------------------------ */

async function generateUniqueSlug(length = 6) {
  let slug;
  let exists = true;

  while (exists) {
    slug = crypto.randomBytes(length).toString("base64url");

    const existing = await prisma.shortUrl.findUnique({
      where: { slug },
    });

    if (!existing) {
      exists = false;
    }
  }

  return slug;
}

/* ------------------------------------------------ */
/* POST /api/shorten */
/* CREATE SHORT URL */
/* ------------------------------------------------ */

export const createShortUrl = async (req, res) => {
  try {
    const user = req.user;

    const { original_url, slug, expires_at } = req.body;

    if (!original_url) {
      return res.status(400).json({
        message: "Original URL is required",
      });
    }

    /* ---------------- FIND USER WORKSPACE ---------------- */

    const workspace = await prisma.workspace.findFirst({
      where: {
        user_id: user.id,
      },
    });

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    /* ---------------- HANDLE CUSTOM SLUG ---------------- */

    let finalSlug = slug;

    if (slug) {
      const existingSlug = await prisma.shortUrl.findUnique({
        where: {
          slug,
        },
      });

      if (existingSlug) {
        return res.status(400).json({
          message: "Slug already exists",
        });
      }
    } else {
      finalSlug = await generateUniqueSlug();
    }

    /* ---------------- CREATE SHORT URL ---------------- */

    const shortUrl = await prisma.shortUrl.create({
      data: {
        workspace_id: workspace.id,

        slug: finalSlug,

        original_url,

        expires_at: expires_at
          ? new Date(expires_at)
          : null,
      },
    });

    return res.status(201).json({
      message: "Short URL created",
      data: shortUrl,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

/* ------------------------------------------------ */
/* GET /api/links */
/* LIST ALL LINKS */
/* ------------------------------------------------ */

export const getAllLinks = async (req, res) => {
  try {
    const user = req.user;

    const workspace = await prisma.workspace.findFirst({
      where: {
        user_id: user.id,
      },
    });

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const links = await prisma.shortUrl.findMany({
      where: {
        workspace_id: workspace.id,
      },

      orderBy: {
        created_at: "desc",
      },
    });

    return res.status(200).json({
      message: "Links fetched successfully",
      data: links,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

/* ------------------------------------------------ */
/* PATCH /api/links/:id */
/* UPDATE LINK */
/* ------------------------------------------------ */

export const updateLink = async (req, res) => {
  try {
    const user = req.user;

    const { id } = req.params;

    const {
      original_url,
      is_active,
      expires_at,
    } = req.body;

    /* ---------------- FIND WORKSPACE ---------------- */

    const workspace = await prisma.workspace.findFirst({
      where: {
        user_id: user.id,
      },
    });

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    /* ---------------- FIND LINK ---------------- */

    const existingLink = await prisma.shortUrl.findFirst({
      where: {
        id,
        workspace_id: workspace.id,
      },
    });

    if (!existingLink) {
      return res.status(404).json({
        message: "Link not found",
      });
    }

    /* ---------------- UPDATE ---------------- */

    const updatedLink = await prisma.shortUrl.update({
      where: {
        id,
      },

      data: {
        original_url:
          original_url ?? existingLink.original_url,

        is_active:
          is_active ?? existingLink.is_active,

        expires_at:
          expires_at !== undefined
            ? new Date(expires_at)
            : existingLink.expires_at,
      },
    });

    return res.status(200).json({
      message: "Link updated successfully",
      data: updatedLink,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

/* ------------------------------------------------ */
/* DELETE /api/links/:id */
/* DELETE LINK */
/* ------------------------------------------------ */

export const deleteLink = async (req, res) => {
  try {
    const user = req.user;

    const { id } = req.params;

    /* ---------------- FIND WORKSPACE ---------------- */

    const workspace = await prisma.workspace.findFirst({
      where: {
        user_id: user.id,
      },
    });

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    /* ---------------- FIND LINK ---------------- */

    const existingLink = await prisma.shortUrl.findFirst({
      where: {
        id,
        workspace_id: workspace.id,
      },
    });

    if (!existingLink) {
      return res.status(404).json({
        message: "Link not found",
      });
    }

    /* ---------------- DELETE ---------------- */

    await prisma.shortUrl.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({
      message: "Link deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};