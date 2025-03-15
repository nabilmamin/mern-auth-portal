const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Define schema methods and middleware for the User model that can be executed elsewhere.

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true // removes whitespace from both ends of the string
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        match: [
            /^\S+@\S+\.\S+$/,
            'Please provide a valid email'
        ],
        lowercase: true
    },
    phone: {
        type: String,
        required: [true, 'Please provide a phone number'],
        unique: true,
        match: [
            /^\d{10}$/,
            'Please provide a valid phone number'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false // prevents password from being returned in queries
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: String,
    verificationTokenExpiry: Date,
    resetPasswordToken: String,
    resetPasswordTokenExpiry: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving to database
// The pre('save') middleware function is called whenever a User document is saved to the database
// When you update an existing user and call save(), this will run. If the password has been modified, it will be hashed. 
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next(); // skip if password is not modified to prevent re-hashing an already hashed password
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// normalize phone number before saving to database
UserSchema.pre('save', function(next) {
    if (this.modified('phone')) {
        // Remove non-digit characters from phone number
        this.phone = this.phone.replace(/\D/g, '');

        if (this.phone.length === 11 && this.phone.startsWith('1')) {
            this.phone = this.phone.slice(1); // remove leading 1 if its a country code
        }

        if (this.phone.length !== 10) {
            return next(new Error('Phone number must be exactly 10 digits long'))
        }
    }
    next ()
});

// Compare entered password with hashed password in database
// this will be called when we execute matchPassword function in another file. 
UserSchema.methods.matchPassword = async function(enteredPassword) {
    // bcrypt will hash the entered password with the same salt that was used to hash the stored password, then compare.
    return await bcrypt.compare(enteredPassword, this.password);
}

// Generate and hash resetpassword token
// This will be used when a user wants to reset their password
UserSchema.methods.getResetPasswordToken = function() {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set token expiry
    this.resetPasswordExpiry = Date.now() + 10 /*minutes*/ * 60 * 1000; 

    return resetToken // this will be sent to the user as their reset code;
}

// generate email verification token
UserSchema.methods.getVerificationToken = function() {
    // Generate token
    const verificationToken = crypto.randomBytes(20).toString('hex');

    // Note that 'this' refers to the User object. so User.verificationToken will be set to the hashed verificationToken
    this.verificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

    // Note that 'this' refers to the User object. so User.verificationTokenExpiry will be set to the current time plus 24 hours
    this.verificationTokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 Hours

    return verificationToken;
};

module.exports = mongoose.model('User', UserSchema);
