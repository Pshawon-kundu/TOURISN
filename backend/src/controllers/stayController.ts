import { Request, Response } from "express";
import { firebaseDB } from "../config/firebase";
import StayBooking from "../models/StayBooking";

// Create a new stay booking
export const createStayBooking = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const bookingData = req.body;

    // Validate required fields
    if (
      !bookingData.propertyName ||
      !bookingData.propertyType ||
      !bookingData.location ||
      !bookingData.travelerName ||
      !bookingData.phone ||
      !bookingData.email ||
      !bookingData.checkInDate ||
      !bookingData.checkOutDate ||
      !bookingData.totalAmount
    ) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    // Save to MongoDB
    const mongoBooking = new StayBooking(bookingData);
    await mongoBooking.save();

    // Save to Firebase Firestore
    const firebaseBookingRef = await firebaseDB.collection("stayBookings").add({
      ...bookingData,
      mongoId: mongoBooking._id.toString(),
      bookingDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    console.log(
      `✓ Stay booking created - MongoDB: ${mongoBooking._id}, Firebase: ${firebaseBookingRef.id}`
    );

    res.status(201).json({
      success: true,
      message: "Stay booking created successfully",
      data: {
        mongoId: mongoBooking._id,
        firebaseId: firebaseBookingRef.id,
        booking: mongoBooking,
      },
    });
  } catch (error) {
    console.error("Error creating stay booking:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create stay booking",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get all stay bookings
export const getAllStayBookings = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    // Get from MongoDB
    const mongoBookings = await StayBooking.find().sort({ createdAt: -1 });

    // Get from Firebase
    const firebaseSnapshot = await firebaseDB
      .collection("stayBookings")
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
    console.error("Error fetching stay bookings:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch stay bookings",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get booking by ID
export const getStayBookingById = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;

    // Try to get from MongoDB
    const mongoBooking = await StayBooking.findById(id);

    // Try to get from Firebase
    let firebaseBooking = null;
    try {
      const firebaseDoc = await firebaseDB
        .collection("stayBookings")
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
    console.error("Error fetching stay booking:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch stay booking",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Update booking status
export const updateStayBookingStatus = async (
  req: Request,
  res: Response
): Promise<any> => {
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
    const mongoBooking = await StayBooking.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    );

    // Update Firebase (search by mongoId)
    const firebaseQuery = await firebaseDB
      .collection("stayBookings")
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
    console.error("Error updating stay booking:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update booking status",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get user bookings
export const getUserStayBookings = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { userId } = req.params;

    const mongoBookings = await StayBooking.find({ userId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      data: mongoBookings,
    });
  } catch (error) {
    console.error("Error fetching user stay bookings:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user bookings",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
