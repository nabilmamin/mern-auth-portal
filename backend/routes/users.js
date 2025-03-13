const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private


// The route is a PUT request to /profile, and is protected, meaning that only authenticated users can access it. This means the user must have logged in and received a JWT token.
// The protect middleware will check if the token is valid and if the user exists in the database. If so, it will allow the request to proceed to the next middleware or route handler (controller).
// The controller function will update the user's profile information, such as their name, email, and password.
router.put('/profile', protect, async (req, res) => {
    try {
        // req.user contains information about the authenticated user.
        // req.body contains the updated user information.
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update the user.name if a new name is provided in the request body
        // if (req.body.name) checks if the name field is present in the request body, and if so, then true
        if (req.body.name) user.name = req.body.name;

        // If email is changed, require re-verification
        if (req.body.email && req.body.email !== user.email) {
            user.email = req.body.email;
            user.isVerified = false;

            // Generate verification token
            const verificationToken = user.getVerificationToken();

            // Save user with new email and verification token
            await user.save();

            // Create verification URL
            /* const verificationURL = `${req.protocol}://${req.get('host')}/api/auth/verifyemail/${verificationToken}`;*/
            const verificationURL = `${req.protocol}://${req.get('host')}/verify-email/${verificationToken}`;
            // const verificationURL = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

            // Email content
            const message = `
                <h1>Email Verification</h1>
                <p>Please click the following link to verify your email address:</p>
                <a href=${verificationURL} clicktracking=off>Verification Link</a>
                `;

            // Send email
            const sendEmail = require('../utils/sendEmail');
            await sendEmail({
                to: user.email,
                subject: 'Email Verification',
                text: message
            });

            return res.status(200).json({
                success: true,
                message: 'Profile updated. Please check your email to verify your new email address.'
            });
        }

        // updates the user for any other changes that may have been made (outside of the email and verificationtoken and verificationtokenexpiry)
        // it does this by being outside the IF statement.
        await user.save();

        // immediate response. after sending the verification email, the user will be updated. isverified will be false.
        res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                isVerified: user.isVerified
            },
            msg: 'Profile updated'
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});


// @desc    Update user password
// @route   PUT /api/users/password
// @access  Private
// The route is a PUT request to /password, and is protected, meaning that only authenticated users can access it. 
// Update Password allows authenticated users to change their password when they are logged in.
// Forgot password allows unauthenticated users to request a password reset email.
router.put('/password', protect, async (req, res) => {
    try {
        // find authenticated user by id and include their password in the query result
        const user = await User.findById(req.user.id).select('+password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if the user provided the current password and the new password
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide current password and new password'
            });
        }

        // Check if the user entered the correct current password
        // matchPassword is defined in the User model. It hashes the currentPassword and compares it to the stored hashed password from the DB.
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // update the password
        user.password = newPassword;

        // save
        await user.save();
        res.status(200).json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private

router.get('/profile', protect, async (req, res) => {
    try {
        // req.user contains information about the authenticated user.
        const user = await User.findById(req.user.id)

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        res.status(200).json({
            success: true,
            data: user
            // data contains the user profile information
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
})

module.exports = router;