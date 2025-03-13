const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    let token;

    // Check if token exists in cookies or headers
    // check if token exists in cookies
    if (req.cookies.token) {
        token = req.cookies.token;
    } 
    // check if token exists in headers
    else if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) 
    // Set token from Bearer token in header
    {
        token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route'
        });
    }

    try {
        // Verify token
        // JWT_SECRET is the secret key used to sign the JWT, and is used to decode the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // token.id is the users id
        // Find user with id from token
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return res.status(401).json({
                msg: 'No user found with this id'
            });
        }

        // If authenticated, the middleware allows the request to proceed to the next middleware or route handler (controller)
        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route'
        });
    }
};