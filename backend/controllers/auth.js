const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRATION
    });
};

// @desc Register user
// @route POST /api/auth/register
// @access Public

// exports.register is an Express route handler. 
// it will be used to register a user.
exports.register = async (req, res, next) => {
    try {
        // Check for validation errors in the request. If there are any, return a 400 error. 
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Extract name, email, password from the request body
        const { name, email, password } = req.body;

        // Check if user already exists in the database with the provided email
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'Email already exists' });
        }

        // Create a new user instance with the provided data from the request body
        user = new User({
            name,
            email,
            password
        });

        // Generate verification token (defined in User model)
        const verificationToken = user.getVerificationToken();

        // Save user to DB
        await user.save();

        // Create verification URL
        // verification server side url
        // const verificationURL = `${req.protocol}://${req.get('host')}/api/auth/verify/${verificationToken}`;

        // verification client side url
        // /verify-email will be a react webpage that will send a request to the backend to verify the token
        // const verificationURL = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
        const verificationURL = `${req.protocol}://${req.get('host')}/verify-email/${verificationToken}`;
        
        // Email content
        const message = `
        <h1>Email Verification</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationURL}" clicktracking="off">Verification Link</a>
        `;

        try {
            await sendEmail({
                to: user.email,
                subject: 'Email Verification',
                text: message
            });

            res.status(201).json({
                success: true,
                message: 'User registered. Verification email sent.'
            });
        } catch (error) {
            user.verificationToken = undefined;
            user.verificationTokenExpiry = undefined;
            await user.save();

            return res.status(500).json({ message: 'Email could not be sent' });
        }       
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

// @desc Verify email
// @route GET /api/auth/verify/:token
// @access Public
// When the user clicks on the verification link sent to their email, this function is called to verify the token.
exports.verifyEmail = async (req, res, next) => {
    try {
        // Hash token received from the request. Token is passed as a URL parameter and is hashed to match the format stored in the DB
        const verificationToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        // Find user by verification token
        const user = await User.findOne({
            verificationToken,
            verificationTokenExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Activate account
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiry = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Email verified successfully. You can now log in.'
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

// @desc Login user
// @route POST /api/auth/login
// @access Public

exports.login = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Extract email and password from the request body
        const { email, password } = req.body;

        // Query DB to find user by email
        // .select('+password') is used to include the password in the query result since we exclude this field by default in the User model
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid email' });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Check if email is verified
        if (!user.isVerified) {
            return res.status(401).json({ message: 'Please verify your email to log in' });
        }

        // Generate JWT token
        const token = generateToken(user._id);

        // Set cookie with token
        const cookieOptions = {
            expires: new Date(
                Date.now() + process.env.JWT_COOKIE_EXPIRATION * 24 * 60 * 60 * 1000
            ),
            httpOnly: true,
            // When secure is true, the cookie will only be set on a secure connection, i.e., https.
            // When secure is false, the cookie will be set on http and https connections.
            secure: process.env.NODE_ENV === 'production'
        };

        // Token contains encoded information about the user, like user.id
        // cookieOptions defines the props of the cookie that will be set  in the users browser
        // res.cookie sets the cookie in the user browser. 
        res.cookie('token', token, cookieOptions);

        // Return user, exclude password
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            isVerified: user.isVerified
        };

        res.status(200).json({
            success: true,
            token,
            user: userResponse
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

// @desc Get current user
// @route GET /api/auth/me
// @access Private
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            user: {
                _id: user.id,
                name: user.name,
                email: user.email,
                isVerified: user.isVerified,
            }
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};

// @desc Logout user / clear cookie
// @route GET /api/auth/logout
// @access Private
exports.logout = (req, res, next) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        message: 'User logged out'
    });
};

// @desc Forgot password
// @route POST /api/auth/forgotpassword
// @access Public
exports.forgotPassword = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get reset token
        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        // Create reset URL
        const resetURL = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

        // Email content
        const message = `
        <h1>Password Reset Request</h1>
        <p>Please click the link below to reset your password:</p>
        <a href="${resetURL}" clicktracking="off">Reset Password</a>
        <p>If you did not request a password reset, please ignore this email.</p>
        `;

        try {
            await sendEmail({
                to: user.email,
                subject: 'Password Reset',
                text: message
            });

            res.status(200).json({
                success: true,
                message: 'Password reset email sent'
            });
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpiry = undefined;
            /* in mongoose, save is used to save a document to the db. by default, mongoose validates docs before saving.
            however, there are cases where you want to skip validation when updating specific fields that dont require validating.
            here, we're updating resetPasswordtoken and expiry. */
            await user.save({ validateBeforeSave: false });

            return res.status(500).json({ message: 'Email could not be sent' });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

exports.resetPasssword = async (req, res, next) => {
    try {
        // Get hashed token
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        // Find user by reset token
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ msg: 'Invalid or expired token' });
        }

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiry = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password reset successful. You can now log in with your new password.'
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
}

