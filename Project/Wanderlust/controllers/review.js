// importing models
const review = require("../models/review");
const listing = require("../models/listing");

module.exports.addReview = async (req, res, next) => {
  const { rating, comment } = req.body;
  const newReview = new review({
    rating,
    comment,
  });
  newReview.author = req.user._id;
  const listing_ = await listing.findById(req.params.id);
  listing_.reviews.push(newReview);
  await newReview.save();
  await listing_.save();
  console.log("New review saved successfully");
  req.flash("success", "New Review created");
  res.redirect("/listings/" + req.params.id);
};

module.exports.deleteReview = async (req, res) => {
  let { id, review_id } = req.params;
  await review.findByIdAndDelete(review_id);
  let listingData = await listing.findById(id);
  listingData.reviews = listingData.reviews.filter(
    (review) => review != review_id
  );
  await listingData.save();
  req.flash("success", "Review deleted");
  res.redirect(`/listings/${id}`);
};
