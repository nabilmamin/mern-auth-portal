// defining our authentication routes

const express = require('express');
const router = express.Router();
const { check } = require('express-validator'); // provides a set of predefined validation methods to validate user inputs
const {
    register,
    verifyEmail,
    login,
    forgotPassword,
    resetPassword,
    getMe,
    logout
} = require('..controllers/auth');
const { protect } = require('../middleware/auth');

// Register route
router.post(
    '/register',
    [
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Please enter a password with 8 or more characters').isLength({ min: 8 }),
        check('password', 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])[A-Za-z\d[^A-Za-z0-9]]{8,}$/),
        check('phone', 'Please include a valid phone number').matches(/^\d{10}$/),
        /*
        check('password', 'Password must contain at least one number').matches(/\d/),
        check('password', 'Password must contain at least one special character').matches(/[^A-Za-z0-9]/),
        check('password', 'Password must contain at least one uppercase letter').matches(/[A-Z]/),
        check('password', 'Password must contain at least one lowercase letter').matches(/[a-z]/)
        */
    ], 
    register
);

// Verify email route
// When the user clicks on the verification link in their email, 
// this route is triggered to verify the user's email using the provided token
router.get('/verifyemail/:token', verifyEmail);


// Login route
router.post(
    '/login',
    [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').exists()
    ],
    login
);

// Retrieve the currently logged in user
// This route is protected, meaning that only authenticated users can access it. This means the user must have logged in and received a JWT token.
// the client (web browser, app, or api) makes a GET request to the /me endpoint with the JWT token in the Authorization header or cookie.
// The protect middleware will check if the token is valid and if the user exists in the database.
// If the token is valid and the user exists, the getMe controller function will return the user's information.
router.get('/me', protect, getMe);


// Logout route
router.get('/logout', logout);


// Forgot password route
router.post(
    '/forgot-password',
    // validate the email input, if invalid return an error message to the user
    [check('email', 'Please include a valid email').isEmail()],
    // call the forgotPassword controller function to handle the logic for generating a reset password token and sending an email to the user, saving it to the user's record, and sending a password reset email to the user.
    forgotPassword
)

// Reset password route
router.put(
    '/reset-password/:token',
    [check('password', 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])[A-Za-z\d[^A-Za-z0-9]]{8,}$/)],
    resetPassword
);

module.exports = router;
