const express = require("express");
const router = express.Router();
const { getBootcamps, getBootcamp, createBootcamp, updateBootcamp, deleteBootcamp, getBootcampsInRadius } = require("../controllers/bootcamps");

router.route("/radius/:zipcode/:distance").get(getBootcampsInRadius);
router.route("/").get(getBootcamps).post(createBootcamp);
router.route("/:id").get(getBootcamp).put(updateBootcamp).delete(deleteBootcamp);

// router.get("/", (req, res) => {});
// router.get("/:id", (req, res) => {});
// router.post("/", (req, res) => {});
// router.put("/:id", (req, res) => {});
// router.delete("/:id", (req, res) => {});

module.exports = router;
