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
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return res.status(401).json({
                msg: 'No user found with this id'
            });
        }

        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route'
        });
    }
};