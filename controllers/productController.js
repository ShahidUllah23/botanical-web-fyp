const Product = require("../models/productModel");
const ApiFeatures = require("../utils/apiFeatures");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("../middleware/catchAsyncErrorr");
const { response } = require("express");
const cloudinary = require("cloudinary");

//Create Prodect ---admin
exports.createProduct = async (req, res, next) => {
  try {
    // Set the user field to the user's id
    let images = [];

    if (typeof req.body.images === "string") {
      images.push(req.body.images);
    } else {
      images = req.body.images;
    }

    const imagesLinks = [];

    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.v2.uploader.upload(images[i], {
        folder: "products",
      });

      imagesLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }

    req.body.images = imagesLinks;
    req.body.user = req.user.id;

    const product = await Product.create(req.body);
    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    // Handle any potential error that might occur during product creation
    next(new ErrorHandler(`Error creating product: ${error.message}`, 400));
  }
};

//get all products
exports.getAllproducts = async (req, res, next) => {
  const resultPerPage = 8;
  // next(new ErrorHandler("this Bigra Nawab Jan Boj kar Error", 500));
  try {
    const productsCount = await Product.countDocuments();
    const apiFeature = new ApiFeatures(Product.find(), req.query)
      .search()
      .filter()
      .pagination(resultPerPage);
    const products = await apiFeature.query;
    res.status(200).json({
      success: true,
      products,
      productsCount,
      resultPerPage,
    });
  } catch (error) {
    next(new ErrorHandler(`Resource Not Found. Invalid: ${error}`, 400));
  }
};
//get single product details
exports.getProductDetails = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }
    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(new ErrorHandler(`Resource Not Found. Invalid: ${error}`, 400));
  }
};

//update products admin
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    // Images Start Here
    let images = [];

    if (typeof req.body.images === "string") {
      images.push(req.body.images);
    } else {
      images = req.body.images;
    }

    if (images !== undefined) {
      // Deleting Images From Cloudinary
      for (let i = 0; i < product.images.length; i++) {
        await cloudinary.v2.uploader.destroy(product.images[i].public_id);
      }

      const imagesLinks = [];

      for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.v2.uploader.upload(images[i], {
          folder: "products",
        });

        imagesLinks.push({
          public_id: result.public_id,
          url: result.secure_url,
        });
      }

      req.body.images = imagesLinks;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }
    );

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    next(new ErrorHandler(`Resource Not Found. Invalid: ${error}`, 400));
  }
};

//Delete Product
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }
    await Product.deleteOne({ _id: req.params.id });

    //Deleting images from cloudinary
    for (let i = 0; i < product.images.length; i++) {
      await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }

    res.status(200).json({
      success: true,
      message: "Product Deleted successfully",
    });
  } catch (error) {
    next(new ErrorHandler(`Resource Not Found. Invalid: ${error}`, 400));
  }
};

//create new review or update the review
exports.createProductReview = catchAsyncError(async (req, res, next) => {
  const { rating, Comment, productId } = req.body;

  // Validate that the rating and productId are provided
  if (!rating || !productId) {
    return res.status(400).json({
      success: false,
      message: "Rating and productId are required.",
    });
  }

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    Comment,
  };

  const product = await Product.findById(productId);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found.",
    });
  }

  const isReviewed = product.reviews.some(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (isReviewed) {
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString()) {
        rev.rating = rating;
        rev.Comment = Comment;
      }
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  let totalRating = 0;
  product.reviews.forEach((rev) => {
    totalRating += rev.rating;
  });

  product.ratings = totalRating / product.reviews.length;

  await product.save();

  res.status(200).json({
    success: true,
    message: "Review created/updated successfully.",
  });
});

//Get All Reviews of a Product
exports.getProductReview = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.id);

  if (!product) {
    return next(new ErrorHandler(` Product not found `, 404));
  }

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

//delete product review
exports.deleteReview = catchAsyncError(async (req, res, next) => {
  const productId = req.query.productId;
  const reviewId = req.query.id;
  if (!productId || !reviewId) {
    return res.status(400).json({
      success: false,
      message: "Both productId and id are required.",
    });
  }

  const product = await Product.findById(productId);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  const existingReviewIndex = product.reviews.findIndex(
    (rev) => rev._id.toString() === reviewId.toString()
  );

  if (existingReviewIndex === -1) {
    return res.status(404).json({
      success: false,
      message: "Review not found for the given product.",
    });
  }

  // Get the rating of the review to be deleted
  const deletedRating = product.reviews[existingReviewIndex].rating;

  // Remove the review from the product's reviews array
  product.reviews.splice(existingReviewIndex, 1);

  // Calculate the updated totalRating and numOfReviews
  const totalRating = product.reviews.reduce((sum, rev) => sum + rev.rating, 0);
  const numOfReviews = product.reviews.length;

  // Calculate the updated average rating (ratings) for the product
  const ratings = numOfReviews ? totalRating / numOfReviews : 0;

  // Update the product's average rating and save
  product.ratings = ratings;
  
  await product.save();

  res.status(200).json({
    success: true,
    message: "Review and rating deleted successfully.",
  });
});


//get all products (Admin)
exports.getAdminproducts = async (req, res, next) => {
  try {
    const products = await Product.find();
    const productsCount = products.length;
    const resultPerPage = 10; // Set the appropriate value based on your pagination logic

    res.status(200).json({
      success: true,
      products,
      productsCount,
      resultPerPage,
    });
  } catch (error) {
    // Log the error for debugging purposes
    console.error(error);

    // Send a more informative error message in the response
    next(
      new ErrorHandler(`Failed to retrieve products: ${error.message}`, 400)
    );
  }
};
