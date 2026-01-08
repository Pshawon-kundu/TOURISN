import { Request, Response } from "express";
import { supabase } from "../config/supabase";

interface NIDVerificationRequest {
  userId: string;
  nidNumber: string;
  dateOfBirth: string;
  nidImageBase64?: string;
}

/**
 * Verify Bangladesh NID using OCR and pattern matching
 * For production, integrate with Bangladesh Election Commission API or third-party NID verification service
 */
export const verifyNID = async (req: Request, res: Response) => {
  try {
    const {
      userId,
      nidNumber,
      dateOfBirth,
      nidImageBase64,
    }: NIDVerificationRequest = req.body;

    // Validate required fields
    if (!userId || !nidNumber || !dateOfBirth) {
      return res.status(400).json({
        success: false,
        message: "User ID, NID number, and date of birth are required",
      });
    }

    // Validate NID format (Bangladesh NID: 10, 13, or 17 digits)
    const nidPattern = /^(\d{10}|\d{13}|\d{17})$/;
    if (!nidPattern.test(nidNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid NID format. Must be 10, 13, or 17 digits",
      });
    }

    // Validate date of birth format (YYYY-MM-DD)
    const dobPattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!dobPattern.test(dateOfBirth)) {
      return res.status(400).json({
        success: false,
        message: "Invalid date of birth format. Use YYYY-MM-DD",
      });
    }

    let ocrResult: any = null;
    let imageUrl: string | null = null;

    // If image is provided, perform OCR verification
    if (nidImageBase64) {
      try {
        // For demo purposes, simulate OCR extraction
        // In production, use services like:
        // - Google Cloud Vision API
        // - AWS Textract
        // - Azure Computer Vision
        // - Tesseract.js for client-side

        ocrResult = await performOCR(nidImageBase64, nidNumber);

        // Upload image to Supabase Storage
        imageUrl = await uploadNIDImage(userId, nidImageBase64);
      } catch (ocrError) {
        console.error("OCR processing error:", ocrError);
        // Continue with verification even if OCR fails
      }
    }

    // Check if NID is already verified
    const { data: existingVerification } = await supabase
      .from("nid_verifications")
      .select("*")
      .eq("nid_number", nidNumber)
      .eq("status", "verified")
      .single();

    if (existingVerification) {
      return res.status(400).json({
        success: false,
        message: "This NID number is already verified by another user",
      });
    }

    // Calculate verification score based on available data
    const verificationScore = calculateVerificationScore(
      nidNumber,
      dateOfBirth,
      ocrResult
    );

    // Determine verification status
    const status = verificationScore >= 70 ? "verified" : "pending_review";

    // Create or update verification record
    const { data: verification, error: verificationError } = await supabase
      .from("nid_verifications")
      .upsert({
        user_id: userId,
        nid_number: nidNumber,
        date_of_birth: dateOfBirth,
        nid_image_url: imageUrl,
        status: status,
        verification_score: verificationScore,
        ocr_data: ocrResult,
        verified_at: status === "verified" ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (verificationError) {
      throw verificationError;
    }

    // Update user verification status
    if (status === "verified") {
      await supabase
        .from("users")
        .update({
          nid_verified: true,
          verified_at: new Date().toISOString(),
        })
        .eq("id", userId);
    }

    return res.status(200).json({
      success: true,
      message:
        status === "verified"
          ? "NID verified successfully"
          : "NID submitted for manual review",
      data: {
        verificationId: verification.id,
        status: verification.status,
        score: verificationScore,
        requiresManualReview: status === "pending_review",
      },
    });
  } catch (error: any) {
    console.error("NID verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify NID",
      error: error.message,
    });
  }
};

/**
 * Get NID verification status
 */
export const getNIDVerificationStatus = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const { data: verification, error } = await supabase
      .from("nid_verifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = not found
      throw error;
    }

    return res.status(200).json({
      success: true,
      data: verification || null,
    });
  } catch (error: any) {
    console.error("Get verification status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get verification status",
      error: error.message,
    });
  }
};

/**
 * Simulate OCR extraction from NID image
 * In production, replace with actual OCR API
 */
async function performOCR(
  imageBase64: string,
  expectedNID: string
): Promise<any> {
  // For demo purposes, simulate OCR response
  // In production, integrate with:
  // - Google Cloud Vision API: https://cloud.google.com/vision/docs/ocr
  // - AWS Textract: https://aws.amazon.com/textract/
  // - Azure Computer Vision: https://azure.microsoft.com/en-us/services/cognitive-services/computer-vision/

  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Mock OCR result
  return {
    extractedNID: expectedNID,
    confidence: 0.95,
    textBlocks: [{ text: expectedNID, confidence: 0.95 }],
    isNIDDetected: true,
  };
}

/**
 * Upload NID image to Supabase Storage
 */
async function uploadNIDImage(
  userId: string,
  imageBase64: string
): Promise<string> {
  try {
    // Remove data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    const fileName = `${userId}_${Date.now()}.jpg`;
    const filePath = `nid-images/${fileName}`;

    const { data, error } = await supabase.storage
      .from("verifications")
      .upload(filePath, buffer, {
        contentType: "image/jpeg",
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("verifications")
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error("Image upload error:", error);
    throw error;
  }
}

/**
 * Calculate verification score based on available data
 */
function calculateVerificationScore(
  nidNumber: string,
  dateOfBirth: string,
  ocrResult: any
): number {
  let score = 0;

  // Base score for valid NID format
  if (/^(\d{10}|\d{13}|\d{17})$/.test(nidNumber)) {
    score += 30;
  }

  // Score for date of birth
  if (dateOfBirth) {
    const dob = new Date(dateOfBirth);
    const age = new Date().getFullYear() - dob.getFullYear();
    if (age >= 18 && age <= 100) {
      score += 20;
    }
  }

  // Score for OCR matching
  if (ocrResult) {
    if (ocrResult.isNIDDetected) {
      score += 20;
    }
    if (ocrResult.extractedNID === nidNumber) {
      score += 20;
    }
    if (ocrResult.confidence >= 0.9) {
      score += 10;
    }
  }

  return Math.min(score, 100);
}

/**
 * Admin: Manually approve/reject NID verification
 */
export const updateVerificationStatus = async (req: Request, res: Response) => {
  try {
    const { verificationId } = req.params;
    const { status, notes } = req.body;

    if (!["verified", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'verified' or 'rejected'",
      });
    }

    const { data: verification, error } = await supabase
      .from("nid_verifications")
      .update({
        status,
        admin_notes: notes,
        verified_at: status === "verified" ? new Date().toISOString() : null,
      })
      .eq("id", verificationId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Update user verification status
    if (status === "verified") {
      await supabase
        .from("users")
        .update({
          nid_verified: true,
          verified_at: new Date().toISOString(),
        })
        .eq("id", verification.user_id);
    }

    return res.status(200).json({
      success: true,
      message: `Verification ${status}`,
      data: verification,
    });
  } catch (error: any) {
    console.error("Update verification status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update verification status",
      error: error.message,
    });
  }
};
