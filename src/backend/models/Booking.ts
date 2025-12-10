import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  userId: string;
  experienceId: mongoose.Types.ObjectId;
  numberOfParticipants: number;
  totalPrice: number;
  currency: string;
  paymentMethod: 'card' | 'wallet' | 'cash';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  bookingStatus: 'confirmed' | 'cancelled' | 'completed';
  specialRequests: string;
  bookerName: string;
  bookerEmail: string;
  bookerPhone: string;
  startDate: Date;
  endDate: Date;
  paymentDetails: {
    transactionId?: string;
    provider?: string;
    lastFourDigits?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    experienceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Experience',
      required: true,
    },
    numberOfParticipants: {
      type: Number,
      required: true,
      min: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'BDT',
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'wallet', 'cash'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    bookingStatus: {
      type: String,
      enum: ['confirmed', 'cancelled', 'completed'],
      default: 'confirmed',
    },
    specialRequests: {
      type: String,
      default: '',
    },
    bookerName: {
      type: String,
      required: true,
    },
    bookerEmail: {
      type: String,
      required: true,
      lowercase: true,
    },
    bookerPhone: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    paymentDetails: {
      transactionId: String,
      provider: String,
      lastFourDigits: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IBooking>('Booking', BookingSchema);
