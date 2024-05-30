import Review from "../models/review.js";

export const getReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });
    res.status(200).json(review);
  } catch (error) {
    console.log("Error in getReview: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
