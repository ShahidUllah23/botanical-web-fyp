const Blog = require("../models/blogModel");
const cloudinary = require("cloudinary");
const catchAsyncErrorr = require("../middleware/catchAsyncErrorr");


// Create a new blog
exports.createBlog = catchAsyncErrorr( async (req, res) => {
  try {
    const { title, author, content } = req.body;

    // Upload the image to Cloudinary
    const myCloud = await cloudinary.uploader.upload(req.body.image, {
      folder: 'blog_images',
      width: 150,
      crop: 'scale',
    });

    const blog = await Blog.create({
      title,
      author,
      content,
      image: {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      },
    });

    res.status(201).json({
      success: true,
      blog,
    });
  } catch (err) {
    console.error('Error creating blog:', err);

    if (err.message.includes('Cloudinary')) {
      console.error('Error uploading image to Cloudinary:', err);
      res.status(500).json({ error: 'Error uploading image to Cloudinary.' });
    } else if (err.message.includes('MongoDB')) {
      console.error('Error saving blog data to the database:', err);
      res.status(500).json({ error: 'Error saving blog data to the database.' });
    } else {
      console.error('An unknown error occurred:', err);
      res.status(500).json({ error: 'An unknown error occurred.' });
    }
  }
});

// Retrieve all blog posts
exports.getAllBlogs = catchAsyncErrorr(async (req, res) => {
  try {
    const blogPosts = await Blog.find();
    res.json(blogPosts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Retrieve a specific blog post by ID
exports.getBlogById = async (req, res) => {
  try {
    const blogPost = await Blog.findById(req.params.id);
    if (!blogPost) {
      return res.status(404).json({ error: "Blog post not found" });
    }
    res.json(blogPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a blog post by ID
exports.updateBlog = async (req, res) => {
  try {
    const { title, author, content, image } = req.body;
    const updatedBlogPost = await Blog.findByIdAndUpdate(
      req.params.id,
      { title, author, content, image },
      { new: true }
    );
    if (!updatedBlogPost) {
      return res.status(404).json({ error: "Blog post not found" });
    }
    res.json(updatedBlogPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a blog post by ID
exports.deleteBlog = async (req, res) => {
  try {
    const deletedBlogPost = await Blog.findByIdAndRemove(req.params.id);
    if (!deletedBlogPost) {
      return res.status(404).json({ error: "Blog post not found" });
    }
    res.json({ message: "Blog post deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


