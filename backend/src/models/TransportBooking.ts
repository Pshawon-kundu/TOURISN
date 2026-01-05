import mongoose, { Document, Schema } from "mongoose";

export interface ITransportBooking extends Document {
  userId: string;
  transportType: "car" | "bus" | "bike" | "boat";
  from: string;
  to: string;
  travelerName: string;
  phone: string;
  email: string;
  notes?: string;
  baseFare: number;
  taxes: number;
  serviceFee: number;
  discount: number;
  totalAmount: number;
  paymentMethod: string;
  cardLastFour?: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  bookingDate: Date;
  travelDate?: Date;
  duration?: string;
  provider?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransportBookingSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    transportType: {
      type: String,
      enum: ["car", "bus", "bike", "boat"],
      required: true,
    },
    from: { type: String, required: true },
    to: { type: String, required: true },
    travelerName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    notes: { type: String },
    baseFare: { type: Number, required: true },
    taxes: { type: Number, required: true },
    serviceFee: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    cardLastFour: { type: String },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "confirmed",
    },
    bookingDate: { type: Date, default: Date.now },
    travelDate: { type: Date },
    duration: { type: String },
    provider: { type: String },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ITransportBooking>(
  "TransportBooking",
  TransportBookingSchema
);
