import mongoose, { Document, Schema } from "mongoose";

export interface IStayBooking extends Document {
  userId: string;
  propertyId?: string;
  propertyName: string;
  propertyType: "hotel" | "resort" | "apartment" | "villa" | "hostel";
  location: string;
  travelerName: string;
  phone: string;
  email: string;
  notes?: string;
  checkInDate: Date;
  checkOutDate: Date;
  numberOfGuests: number;
  numberOfNights: number;
  roomType?: string;
  baseFare: number;
  taxes: number;
  serviceFee: number;
  discount: number;
  totalAmount: number;
  paymentMethod: string;
  cardLastFour?: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  bookingDate: Date;
  amenities?: string[];
  specialRequests?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StayBookingSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    propertyId: { type: String },
    propertyName: { type: String, required: true },
    propertyType: {
      type: String,
      enum: ["hotel", "resort", "apartment", "villa", "hostel"],
      required: true,
    },
    location: { type: String, required: true },
    travelerName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    notes: { type: String },
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    numberOfGuests: { type: Number, required: true },
    numberOfNights: { type: Number, required: true },
    roomType: { type: String },
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
    amenities: [{ type: String }],
    specialRequests: { type: String },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IStayBooking>("StayBooking", StayBookingSchema);
