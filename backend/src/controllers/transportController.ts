import { Request, Response } from "express";
import { firebaseDB } from "../config/firebase";
import TransportBooking from "../models/TransportBooking";

// Create a new transport booking
export const createTransportBooking = async (req: Request, res: Response) => {
  try {
    const bookingData = req.body;

    // Validate required fields
    if (
      !bookingData.transportType ||
      !bookingData.from ||
      !bookingData.to ||
      !bookingData.travelerName ||
      !bookingData.phone ||
      !bookingData.email ||
      !bookingData.totalAmount
    ) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    // Save to MongoDB
    const mongoBooking = new TransportBooking(bookingData);
    await mongoBooking.save();

    // Save to Firebase Firestore
    const firebaseBookingRef = await firebaseDB
      .collection("transportBookings")
      .add({
        ...bookingData,
        mongoId: mongoBooking._id.toString(),
        bookingDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

    console.log(
      `✓ Transport booking created - MongoDB: ${mongoBooking._id}, Firebase: ${firebaseBookingRef.id}`
    );

    res.status(201).json({
      success: true,
      message: "Transport booking created successfully",
      data: {
        mongoId: mongoBooking._id,
        firebaseId: firebaseBookingRef.id,
        booking: mongoBooking,
      },
    });
  } catch (error) {
    console.error("Error creating transport booking:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create transport booking",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get all transport bookings
export const getAllTransportBookings = async (req: Request, res: Response) => {
  try {
    // Get from MongoDB
    const mongoBookings = await TransportBooking.find().sort({
      createdAt: -1,
    });

    // Get from Firebase
    const firebaseSnapshot = await firebaseDB
      .collection("transportBookings")
      .orderBy("createdAt", "desc")
      .get();

    const firebaseBookings = firebaseSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json({
      success: true,
      data: {
        mongodb: mongoBookings,
        firebase: firebaseBookings,
        totalMongo: mongoBookings.length,
        totalFirebase: firebaseBookings.length,
      },
    });
  } catch (error) {
    console.error("Error fetching transport bookings:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch transport bookings",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get booking by ID
export const getTransportBookingById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Try to get from MongoDB
    const mongoBooking = await TransportBooking.findById(id);

    // Try to get from Firebase
    let firebaseBooking = null;
    try {
      const firebaseDoc = await firebaseDB
        .collection("transportBookings")
        .doc(id)
        .get();
      if (firebaseDoc.exists) {
        firebaseBooking = { id: firebaseDoc.id, ...firebaseDoc.data() };
      }
    } catch (fbError) {
      console.log("Firebase fetch error:", fbError);
    }

    if (!mongoBooking && !firebaseBooking) {
      return res.status(404).json({
        success: false,
        error: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        mongodb: mongoBooking,
        firebase: firebaseBooking,
      },
    });
  } catch (error) {
    console.error("Error fetching transport booking:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch transport booking",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Update booking status
export const updateTransportBookingStatus = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "confirmed", "cancelled", "completed"].includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status",
      });
    }

    // Update MongoDB
    const mongoBooking = await TransportBooking.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    );

    // Update Firebase (search by mongoId)
    const firebaseQuery = await firebaseDB
      .collection("transportBookings")
      .where("mongoId", "==", id)
      .get();

    if (!firebaseQuery.empty) {
      const firebaseDoc = firebaseQuery.docs[0];
      await firebaseDoc.ref.update({
        status,
        updatedAt: new Date().toISOString(),
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      data: mongoBooking,
    });
  } catch (error) {
    console.error("Error updating transport booking:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update booking status",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get user bookings
export const getUserTransportBookings = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const mongoBookings = await TransportBooking.find({ userId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      data: mongoBookings,
    });
  } catch (error) {
    console.error("Error fetching user transport bookings:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user bookings",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
