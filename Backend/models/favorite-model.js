import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  carId: { type: String, required: true },
  imageUrl: { type: String },
  description: { type: String }
}, { timestamps: true });

const Favorite = mongoose.model('Favorite', favoriteSchema);
export default Favorite;
