const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const sendEmail = require("../utils/sendEmail");
const User = require("../models/User");

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public (no need auth)
exports.register = asyncHandler(async (req, res, next) => {
	const { name, email, password, role } = req.body;

	// Create user
	const user = await User.create({
		name,
		email,
		password,
		role,
	});

	sendTokenResponse(user, 200, res);
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public (no need auth)
exports.login = asyncHandler(async (req, res, next) => {
	const { email, password } = req.body;

	// Validate email and password
	if (!email || !password) return next(new ErrorResponse(`Please provide an email and password`, 404));

	// Check for user
	const user = await User.findOne({ email }).select("+password");
	if (!user) return next(new ErrorResponse(`Invalid credentials`, 401));

	// Check for password matches
	const isMatch = await user.matchPassword(password);
	if (!isMatch) return next(new ErrorResponse(`Invalid credentials`, 401));

	sendTokenResponse(user, 200, res);
});

// @desc    Get current logged in user
// @route   POST /api/v1/auth/me
// @access  Private (need auth)
exports.getMe = asyncHandler(async (req, res, next) => {
	const user = await User.findById(req.user.id);
	res.status(200).json({ success: true, data: user });
});

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public (no need auth)
exports.forgotPassword = asyncHandler(async (req, res, next) => {
	const user = await User.findOne({ email: req.body.email });

	if (!user) return next(new ErrorResponse(`There is no user with that email`, 404));

	// Get reset token
	const resetToken = user.getResetPasswordToken();

	// Save the user with hashed token and expire token
	await user.save({ validateBeforeSave: false });

	// Create reset URL
	const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/resetpassword/${resetToken}`;
	const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

	try {
		await sendEmail({
			email: user.email,
			subject: `Password reset token`,
			message,
		});

		res.status(200).json({ success: true, data: `Email send` });
	} catch (err) {
		// if something goes wrong, reset the token and expire in user doc
		console.error(err);

		user.resetPasswordToken = undefined;
		user.resetPasswordExpire = undefined;

		await user.save({ validateBeforeSave: false });

		return next(new ErrorResponse(`Email could not be sent`, 500));
	}

	res.status(200).json({ success: true, data: user });
});

// Get token from model, create cookie, and send response
const sendTokenResponse = (user, statusCode, res) => {
	// Create token
	const token = user.getSignedJwtToken();

	const options = {
		expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
		httpOnly: true,
	};

	// secure option is for https only, so it run in production
	if (process.env.NODE_ENV === "production") options.secure = true;

	// sending a respon for client side
	res.status(statusCode).cookie("token", token, options).json({ success: true, token });
};
