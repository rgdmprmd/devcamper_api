const jwt = require("jsonwebtoken");
const asyncHandler = require("./async");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");

// Protect route
exports.protect = asyncHandler(async (req, res, next) => {
	let token;

	if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
		// Cari token di headers.authorization jika ada
		token = req.headers.authorization.split(" ")[1];
	}
	// else if (req.cookies.token) {
	// 	// Cari token di cookies.token jika ada
	// 	token = req.cookies.token;
	// }

	// Make sure token is exists
	if (!token) return next(new ErrorResponse(`Not authorize to access this route`, 401));

	try {
		// Verify token
		const decoded = jwt.verify(token, process.env.JWT_SECREET);
		console.log(decoded);

		req.user = await User.findById(decoded.id);
		next();
	} catch (err) {
		return next(new ErrorResponse(`Not authorize to access this route`, 401));
	}
});

// Grant access to spesific role
exports.authorize = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) return next(new ErrorResponse(`User role ${req.user.role} is not authorize to access this route`, 403));

		next();
	};
};
