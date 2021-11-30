const express = require("express");
const router = express.Router();
const { getBootcamps, getBootcamp, createBootcamp, updateBootcamp, deleteBootcamp, getBootcampsInRadius, bootcampPhotoUpload } = require("../controllers/bootcamps");

const Bootcamp = require("../models/Bootcamp");
const advancedResults = require("../middleware/advancedResults");

// include other resource routers
const courseRouter = require("./courses");

// re-route/pass into other resource routers
router.use("/:bootcampId/courses", courseRouter);

router.route("/radius/:zipcode/:distance").get(getBootcampsInRadius);
router.route("/").get(advancedResults(Bootcamp, "courses"), getBootcamps).post(createBootcamp);
router.route("/:id").get(getBootcamp).put(updateBootcamp).delete(deleteBootcamp);
router.route("/:id/photo").put(bootcampPhotoUpload);

// router.get("/", (req, res) => {});
// router.get("/:id", (req, res) => {});
// router.post("/", (req, res) => {});
// router.put("/:id", (req, res) => {});
// router.delete("/:id", (req, res) => {});

module.exports = router;
