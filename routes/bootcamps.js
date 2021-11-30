const express = require("express");
const router = express.Router();
const { getBootcamps, getBootcamp, createBootcamp, updateBootcamp, deleteBootcamp, getBootcampsInRadius, bootcampPhotoUpload } = require("../controllers/bootcamps");

const Bootcamp = require("../models/Bootcamp");
const advancedResults = require("../middleware/advancedResults");

const { protect } = require("../middleware/auth");

// include other resource routers
const courseRouter = require("./courses");

// re-route/pass into other resource routers
router.use("/:bootcampId/courses", courseRouter);

router.route("/radius/:zipcode/:distance").get(getBootcampsInRadius);
router.route("/").get(advancedResults(Bootcamp, "courses"), getBootcamps).post(protect, createBootcamp);
router.route("/:id").get(getBootcamp).put(protect, updateBootcamp).delete(protect, deleteBootcamp);
router.route("/:id/photo").put(protect, bootcampPhotoUpload);

// router.get("/", (req, res) => {});
// router.get("/:id", (req, res) => {});
// router.post("/", (req, res) => {});
// router.put("/:id", (req, res) => {});
// router.delete("/:id", (req, res) => {});

module.exports = router;
