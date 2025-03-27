const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: function() {
            // Password is required only for local authentication
            return !this.googleId;
        }
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car'
    }],
    searchHistory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Add method to find or create user (for OAuth)
UserSchema.statics.findOrCreate = async function(profile) {
    const User = this;
    let user = await User.findOne({ 
        $or: [
            { googleId: profile.googleId },
            { email: profile.email }
        ]
    });

    if (!user) {
        user = new User({
            fullName: profile.name,
            email: profile.email,
            googleId: profile.googleId
        });
        await user.save();
    }

    return user;
};

const User = mongoose.model('User', UserSchema);

module.exports = User;