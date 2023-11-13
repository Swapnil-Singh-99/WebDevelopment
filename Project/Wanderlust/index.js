// Importing required modules
const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const path = require("path");
const ejsMate = require("ejs-mate");
const session = require('express-session')
var flash = require('connect-flash');

// importing router
const listings = require('./routes/listing.js');
const reviews = require('./routes/review.js')

// exporting expressError class
const expressError = require("./utils/expressError");

// Initializing express app
const app = express();

// creating a express session
app.use(session({
  secret: 'tejfwemoiwefodxixdiuqwjwioxjnwqcklmwqewioxqwnoexiqwmxenok',  // a secret string used to sign the session ID cookie
  resave: false,  // don't save session if unmodified
  saveUninitialized: false,  // don't create session until something stored
  cookie: { httpOnly: true, maxAge: Date.now() + 7 * 24 * 60 * 60 * 1000, expires: 7 * 24 * 60 * 60 * 1000 }
}))

// using flash
app.use(flash());

// setting ejs view engine
app.set("view engine", "ejs");
// setting up ejs mate
app.engine("ejs", ejsMate);
// setting views and public paths
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// reading post requests data using urlencoding
app.use(express.urlencoded({ extended: true }));
// setting method override variable to be able to override post request to put, patch, delete and others
app.use(methodOverride("_method"));

app.use((req, res, next) => {
  res.locals.success = req.flash("success")
  res.locals.error = req.flash("error")
  next();
})

// Setting up routes
app.use("/listings", listings)
app.use("/listings/:id/reviews", reviews)

// Connecting MongoDB
main()
  .then((res) => {
    console.log("Connection established (Mongoose connection)");
  })
  .catch((err) => console.log(err));
async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

// GET: Root path request
app.get("/", (req, res) => {
  res.send("Hey the server is working well!");
});

// app.get('/test-session', (req, res) => {
//   if (req.session.views) {
//     req.session.views++;
//     res.send(`You visited this page ${req.session.views} times`);
//   } else {
//     req.session.views = 1;
//     res.send('Welcome to this page for the first time!');
//   }
// });

// Creating an 404 page if none of the above conditions are met
app.all("*", (req, res, next) => {
  next(new expressError(404, "Page not found"));
});

// Creating a error handler
app.use((err, req, res, next) => {
  let { status = 500, message = "Something went wrong" } = err;
  // res.status(status).send(message);
  res.status(status).render("error", { message });
});

// Listening on port 8080
const port = 8080;
app.listen(port, () => {
  console.log("Server listening on port " + port);
});
