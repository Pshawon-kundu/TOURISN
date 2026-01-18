import { createHash } from "crypto";
import { Request, Response } from "express";
import { supabase } from "../config/supabase";

interface NIDVerificationRequest {
  userId: string;
  nidNumber: string;
  dateOfBirth: string;
  nidImageBase64?: string;
}

/**
 * Enhanced NID verification with strict security measures
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

    // CRITICAL SECURITY: Require image for verification
    if (!nidImageBase64) {
      return res.status(400).json({
        success: false,
        message: "NID image is required for verification",
      });
    }

    // Check for obviously fake NID patterns FIRST
    const fakePatterns = [
      /^1234567890$/,
      /^123456789010$/, // The exact fake NID being used
      /^1111111111$/,
      /^0000000000$/,
      /^9999999999$/,
      /^123456789012[37]$/,
      /^1234567890123$/,
      /^(123456|654321)/, // Any NID starting with sequential patterns
    ];

    for (const pattern of fakePatterns) {
      if (pattern.test(nidNumber)) {
        console.log(
          `🚨 SECURITY ALERT: Fake NID attempt: ${nidNumber} from user: ${userId}`
        );

        // Delete any existing fake verification records
        await supabase
          .from("nid_verifications")
          .delete()
          .eq("nid_number", nidNumber);

        return res.status(400).json({
          success: false,
          message:
            "⚠️ Invalid NID detected. Please enter your actual NID number from your official card.",
        });
      }
    }

    // Check if NID is already verified by another user
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

    // Process the image (simplified for now)
    let imageUrl: string | null = null;
    let verificationScore = 20; // Start with base score

    try {
      imageUrl = await uploadNIDImage(userId, nidImageBase64);
      verificationScore += 15; // Add points for successful image upload
    } catch (error) {
      console.error("Image upload error:", error);
      return res.status(400).json({
        success: false,
        message: "Failed to process NID image",
      });
    }

    // Basic validation scoring
    verificationScore += validateNIDFormat(nidNumber);
    verificationScore += validateAge(dateOfBirth);

    // ENHANCED SECURITY: Force manual review for all submissions
    // This ensures human verification until real OCR is implemented
    const status = "pending_review";
    const statusReason = "Manual verification required for enhanced security";

    console.log(
      `🔒 NID verification for user ${userId}: ${verificationScore} points, requiring manual review`
    );

    // Create verification record
    const { data: verification, error: verificationError } = await supabase
      .from("nid_verifications")
      .upsert({
        user_id: userId,
        nid_number: nidNumber,
        date_of_birth: dateOfBirth,
        nid_image_url: imageUrl,
        status: status,
        verification_score: verificationScore,
        verified_at: null, // Will be set when admin approves
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (verificationError) {
      console.error("Database error:", verificationError);
      return res.status(500).json({
        success: false,
        message: "Failed to save verification data",
      });
    }

    // Log the attempt for security monitoring
    await logVerificationAttempt(userId, nidNumber, status, verificationScore);

    return res.status(200).json({
      success: true,
      message:
        "🔍 NID verification submitted for manual review due to enhanced security measures. Our team will verify your documents within 24-48 hours.",
      data: {
        verificationId: verification.id,
        status: verification.status,
        message: statusReason,
        nextSteps:
          "For security, all NID verifications require manual review. You'll receive a notification once complete.",
      },
    });
  } catch (error: any) {
    console.error("NID verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during verification",
    });
  }
};

/**
 * Get NID verification status for a user
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

    if (error) {
      return res.status(404).json({
        success: false,
        message: "No verification record found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        status: verification.status,
        verificationScore: verification.verification_score,
        submittedAt: verification.created_at,
        verifiedAt: verification.verified_at,
      },
    });
  } catch (error: any) {
    console.error("Error fetching verification status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch verification status",
    });
  }
};

/**
 * Upload NID image to Supabase storage
 */
async function uploadNIDImage(
  userId: string,
  nidImageBase64: string
): Promise<string> {
  try {
    const base64Data = nidImageBase64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    const fileName = `${userId}_${Date.now()}.jpg`;
    const filePath = `nid-images/${fileName}`;

    const { error } = await supabase.storage
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
    throw new Error("Failed to upload NID image");
  }
}

/**
 * Validate NID format and assign score
 */
function validateNIDFormat(nidNumber: string): number {
  if (/^(\d{10}|\d{13}|\d{17})$/.test(nidNumber)) {
    // Check for Bangladesh-specific patterns
    if (nidNumber.length === 13 || nidNumber.length === 17) {
      const birthYear = parseInt(nidNumber.substring(0, 4));
      const currentYear = new Date().getFullYear();
      if (birthYear >= 1900 && birthYear <= currentYear) {
        return 20; // Higher score for proper format
      }
    }
    return 15; // Basic format validation
  }
  return 0;
}

/**
 * Validate age and date of birth
 */
function validateAge(dateOfBirth: string): number {
  try {
    const dob = new Date(dateOfBirth);
    const currentDate = new Date();
    let age = currentDate.getFullYear() - dob.getFullYear();

    const monthDiff = currentDate.getMonth() - dob.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && currentDate.getDate() < dob.getDate())
    ) {
      age--;
    }

    if (age >= 18 && age <= 120) {
      return age >= 18 && age <= 80 ? 15 : 10;
    }
    return 0;
  } catch {
    return 0;
  }
}

/**
 * Log verification attempt for security monitoring
 */
async function logVerificationAttempt(
  userId: string,
  nidNumber: string,
  status: string,
  score: number
): Promise<void> {
  try {
    await supabase.from("verification_logs").insert({
      user_id: userId,
      nid_number_hash: createHash("sha256").update(nidNumber).digest("hex"),
      verification_status: status,
      score: score,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error logging verification attempt:", error);
  }
}
