const express = require("express");
const router = express.Router();
// exporting wrapAsync function
const wrapAsync = require("../utils/wrapAsync");
// JOI Validation
const { listingSchema } = require("../schema");
// exporting expressError class
const expressError = require("../utils/expressError");

// inporting models
const listing = require("../models/listing");

// isLoggedIn middleware
const { isLoggedIn } = require('../middleware')

// validateListing function
const validateListing = (req, res, next) => {
    const { title, description, image, price, location, country } = req.body;
    let result = listingSchema.validate({
        title,
        description,
        image,
        price,
        location,
        country,
    });
    if (result.error) {
        throw new expressError(400, result.error);
    } else {
        next();
    }
};

// GET: listings route
router.get(
    "/",
    wrapAsync(async (req, res) => {
        let allListingData = await listing.find();
        console.log("Listing data fetched successfully");
        console.log("isLoggedIn: " + req.isAuthenticated());
        // console.log(allListingData);
        res.render("./listings/index", { allListings: allListingData });
    })
);

// GET: listings new add route
router.get("/new", isLoggedIn, (req, res) => {
    res.render("./listings/new");
});

// GET: listings edit specific route
router.get(
    "/:id/edit", isLoggedIn,
    wrapAsync(async (req, res) => {
        let listingData = await listing.findById(req.params.id);
        if (!listingData) {
            req.flash("error", "The listing you requested does not exit!")
            res.redirect("/listings")
        }
        console.log("Listing data by id fetched successfully");
        // console.log(listingData);
        res.render("./listings/edit", { listingData: listingData });
    })
);

// GET: listings get specific route
router.get(
    "/:id", isLoggedIn,
    wrapAsync(async (req, res) => {
        let listingData = await listing.findById(req.params.id).populate("reviews");
        console.log("Listing data by id fetched successfully");
        if (!listingData) {
            req.flash("error", "The listing you requested does not exit!")
            res.redirect("/listings")
        }
        res.render("./listings/show", { listingData: listingData });
    })
);

// POST: Add new listings route
router.post(
    "/", isLoggedIn,
    validateListing,
    wrapAsync(async (req, res, next) => {
        const { title, description, image, price, location, country } = req.body;
        const newListing = new listing({
            title,
            description,
            image,
            price,
            location,
            country,
        });
        await newListing.save();
        console.log("New listing data saved successfully");
        req.flash("success", "New Listing added")
        res.redirect("/listings");
    })
);

// PUT: edit specific listings
router.put(
    "/:id", isLoggedIn,
    validateListing,
    wrapAsync(async (req, res) => {
        let { title, description, image, price, location, country } = req.body;
        await listing.findByIdAndUpdate(req.params.id, {
            title,
            description,
            image,
            price,
            location,
            country,
        });
        console.log("Listing data updated successfully");
        req.flash("success", "Listing updated")
        res.redirect("/listings");
    })
);

// DELETE: delete specific listings
router.delete(
    "/:id", isLoggedIn,
    wrapAsync(async (req, res) => {
        const { id } = req.params;
        let listingData = await listing.findById(id);
        listingData.reviews.forEach(async (review_id) => {
            await review.findByIdAndDelete(review_id);
        })
        await listing.findByIdAndDelete(id);
        console.log("Listing data deleted successfully");
        req.flash("success", "Listing deleted")
        res.redirect("/listings");
    })
);

// Exporting router for index.js main file
module.exports = router;