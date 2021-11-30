const path = require("path");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const geocoder = require("../utils/geocoder");
const Bootcamp = require("../models/Bootcamp");

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public (no need auth)
exports.getBootcamps = asyncHandler(async (req, res, next) => {
	res.status(200).json(res.advancedResults);
});

// @desc    Get single bootcamps
// @route   GET /api/v1/bootcamps/:id
// @access  Public (no need auth)
exports.getBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findById(req.params.id);

	if (!bootcamp) {
		return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
	}
	res.status(200).json({ success: true, data: bootcamp });
});

// @desc    Create new bootcamps
// @route   POST /api/v1/bootcamps
// @access  Private (need auth)
exports.createBootcamp = asyncHandler(async (req, res, next) => {
	// Add user to req.body
	req.body.user = req.user.id;

	// Check for publisher bootcamp
	const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

	// If the user is not an admin, they can only add one bootcamp
	if (publishedBootcamp && req.user.role != "admin") return next(new ErrorResponse(`The user with ID ${req.user.id} already published a bootcamp`, 400));

	const bootcamp = await Bootcamp.create(req.body);
	res.status(201).json({ success: true, data: bootcamp });
});

// @desc    Update bootcamps
// @route   PUT /api/v1/bootcamps/:id
// @access  Private (need auth)
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
	let bootcamp = await Bootcamp.findById(req.params.id);

	// Make sure bootcamp is exists and logged in user is bootcamp owner
	if (!bootcamp) return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
	if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this bootcamp`, 401));

	bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

	res.status(200).json({ success: true, data: bootcamp });
});

// @desc    Delete bootcamps
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private (need auth)
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
	let bootcamp = await Bootcamp.findById(req.params.id);

	// Make sure bootcamp is exists and logged in user is bootcamp owner
	if (!bootcamp) return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
	if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this bootcamp`, 401));

	bootcamp.remove();

	res.status(200).json({ success: true, data: {} });
});

// @desc    Get bootcamps within a radius
// @route   GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access  Private (need auth)
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
	const { zipcode, distance } = req.params;

	// get lat and lang from geocoder
	const loc = await geocoder.geocode(zipcode);
	const lat = loc[0].latitude;
	const lng = loc[0].longitude;

	// Calc radius using radians
	// Divided distance by radius of Earth
	// Earth radius = 3,963 miles / 6,378 km
	const radius = distance / 6378;
	const bootcamps = await Bootcamp.find({
		location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
	});

	res.status(200).json({ success: true, count: bootcamps.length, data: bootcamps });
});

// @desc    Upload photo for bootcamp
// @route   PUT /api/v1/bootcamps/:id/photo
// @access  Private (need auth)
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findById(req.params.id);

	// Make sure bootcamp is exists and logged in user is bootcamp owner
	if (!bootcamp) return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
	if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this bootcamp`, 401));
	if (!req.files) return next(new ErrorResponse(`Please upload a file`, 400));

	const file = req.files.file;

	// Make sure the image is a photo
	if (!file.mimetype.startsWith("image")) return next(new ErrorResponse(`Please upload an image only dude`, 400));
	if (file.size > process.env.MAX_FILE_UPLOAD) return next(new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`, 400));

	// Create custom file name
	file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

	// Upload
	file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
		if (err) {
			console.error(err);
			return next(new ErrorResponse(`Problem with file upload`, 500));
		}

		await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });
	});

	res.status(200).json({ success: true, data: file.name });
});
