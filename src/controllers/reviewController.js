const {
  findReviewByUserAndStation,
  createReview,
  getReviewsByStation,
} = require("../models/reviewModel");

// =======================
// Add Review
// =======================
const addReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { station_id, rating, review } = req.body;

    // Check if already reviewed
    const existingReview = await findReviewByUserAndStation(
      userId,
      station_id
    );

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this station.",
      });
    }

    // Create review
    const newReview = await createReview(
      userId,
      station_id,
      rating,
      review
    );

    return res.status(201).json({
      success: true,
      message: "Review added successfully.",
      review: newReview,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =======================
// Get Reviews By Station
// =======================
const getStationReviews = async (req, res) => {
  try {
    const { stationId } = req.params;

    const reviews = await getReviewsByStation(stationId);

    const totalReviews = reviews.length;

    let averageRating = 0;

    if (totalReviews > 0) {
      const totalRating = reviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );

      averageRating = (totalRating / totalReviews).toFixed(1);
    }

    return res.status(200).json({
      success: true,
      average_rating: Number(averageRating),
      total_reviews: totalReviews,
      reviews,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  addReview,
  getStationReviews,
};