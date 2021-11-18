const ErrorResponse = require("../utils/errorResponse");
const Bootcamp = require("../models/Bootcamp");

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public (no need auth)
exports.getBootcamps = async (req, res, next) => {
	try {
		const bootcamps = await Bootcamp.find();
		res.status(200).json({ success: true, count: bootcamps.length, data: bootcamps });
	} catch (err) {
		res.status(400).json({ success: false, err: err });
	}
};

// @desc    Get single bootcamps
// @route   GET /api/v1/bootcamps/:id
// @access  Public (no need auth)
exports.getBootcamp = async (req, res, next) => {
	try {
		const bootcamp = await Bootcamp.findById(req.params.id);

		if (!bootcamp) {
			// return res.status(400).json({ success: false, err: `Bootcamp not exists` });
			return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
		}
		res.status(200).json({ success: true, data: bootcamp });
	} catch (err) {
		// res.status(400).json({ success: false, err: err });
		// next(err);

		// custom error response
		next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
	}
};

// @desc    Create new bootcamps
// @route   POST /api/v1/bootcamps
// @access  Private (need auth)
exports.createBootcamp = async (req, res, next) => {
	try {
		const bootcamp = await Bootcamp.create(req.body);
		res.status(201).json({ success: true, data: bootcamp });
	} catch (err) {
		res.status(400).json({ success: false, err: err });
	}
};

// @desc    Update bootcamps
// @route   PUT /api/v1/bootcamps/:id
// @access  Private (need auth)
exports.updateBootcamp = async (req, res, next) => {
	try {
		const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

		if (!bootcamp) {
			return res.status(400).json({ success: false, err: `Bootcamp not exists` });
		}

		res.status(200).json({ success: true, data: bootcamp });
	} catch (err) {
		res.status(400).json({ success: false, err: err });
	}
};

// @desc    Delete bootcamps
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private (need auth)
exports.deleteBootcamp = async (req, res, next) => {
	try {
		const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

		if (!bootcamp) {
			return res.status(400).json({ success: false, err: `Bootcamp not exists` });
		}

		res.status(200).json({ success: true, data: {} });
	} catch (err) {
		res.status(400).json({ success: false, err: err });
	}
};
