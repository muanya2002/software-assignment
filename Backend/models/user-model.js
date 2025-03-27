import { Schema, model } from 'mongoose';

const UserSchema = new Schema({
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
        type: Schema.Types.ObjectId,
        ref: 'Car'
    }],
    searchHistory: [{
        type: Schema.Types.ObjectId,
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

const User = model('User', UserSchema);

export default User;