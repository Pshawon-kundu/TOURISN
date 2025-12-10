import mongoose, { Schema, Document } from 'mongoose';

export interface IGuide extends Document {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profileImage: string;
  bio: string;
  specialties: string[];
  languages: string[];
  yearsOfExperience: number;
  certifications: string[];
  rating: number;
  totalReviews: number;
  isVerified: boolean;
  experiencesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const GuideSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
    },
    profileImage: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
    },
    specialties: [
      {
        type: String,
      },
    ],
    languages: [
      {
        type: String,
      },
    ],
    yearsOfExperience: {
      type: Number,
      default: 0,
    },
    certifications: [
      {
        type: String,
      },
    ],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    experiencesCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IGuide>('Guide', GuideSchema);
