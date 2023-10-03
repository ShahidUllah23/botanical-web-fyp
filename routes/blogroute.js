const express = require("express");
const router = express.Router();
const {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
} = require("../controllers/blogController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");


// Create a new blog post
router.route("/blogs/new").post(isAuthenticatedUser, createBlog);

// Retrieve all blog posts
router.get("/blogs", getAllBlogs);

// Retrieve a specific blog post by ID
router.get("/blog/:id", getBlogById);

// Update a blog post by ID
router.put("/blog/:id", updateBlog);

// Delete a blog post by ID
router.delete("/blog/:id", deleteBlog);

module.exports = router;
