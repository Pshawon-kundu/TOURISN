import axios from "axios";
import { Request, Response } from "express";
import Tesseract from "tesseract.js";
import { v4 as uuidv4 } from "uuid";

import { supabase } from "../config/supabase";

/**
 * Extract NID number from image using OCR
 */
export const extractNIDFromImage = async (req: Request, res: Response) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res
        .status(400)
        .json({ success: false, message: "Image URL is required" });
    }

    console.log("📷 Extracting NID from image:", imageUrl);

    const imageResponse = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });
    const imageBuffer = Buffer.from(imageResponse.data);

    const {
      data: { text },
    } = await Tesseract.recognize(imageBuffer, "eng", {
      logger: (m) => console.log(m),
    });

    console.log("📝 Extracted text:", text);

    const nidPattern = /\b(\d{10}|\d{13}|\d{17})\b/g;
    const matches = text.match(nidPattern);

    if (!matches || matches.length === 0) {
      return res.status(200).json({
        success: false,
        message: "No NID number found in image",
        extractedText: text,
      });
    }

    const fakePatterns = [
      /^1234567890$/,
      /^123456789010$/,
      /^1111111111$/,
      /^0000000000$/,
      /^9999999999$/,
      /^123456789012[37]$/,
      /^1234567890123$/,
    ];

    const validNIDs = matches.filter(
      (nid) => !fakePatterns.some((pattern) => pattern.test(nid)),
    );

    if (validNIDs.length === 0) {
      return res.status(200).json({
        success: false,
        message: "Only fake NID patterns detected",
        extractedText: text,
      });
    }

    const nidNumber = validNIDs[0];
    console.log("✅ NID extracted successfully:", nidNumber);

    return res.status(200).json({
      success: true,
      nidNumber,
      confidence: "medium",
      extractedText: text,
      message: "NID extracted successfully",
    });
  } catch (error: any) {
    console.error("❌ NID extraction error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to extract NID from image",
      error: error.message,
    });
  }
};

/**
 * Verify if entered NID matches extracted NID
 */
export const verifyNIDMatch = async (req: Request, res: Response) => {
  try {
    const { enteredNID, imageUrl } = req.body;

    if (!enteredNID || !imageUrl) {
      return res.status(400).json({
        success: false,
        message: "Both NID number and image URL are required",
      });
    }

    const imageResponse = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });
    const imageBuffer = Buffer.from(imageResponse.data);

    const {
      data: { text },
    } = await Tesseract.recognize(imageBuffer, "eng");

    const nidPattern = /\b(\d{10}|\d{13}|\d{17})\b/g;
    const matches = text.match(nidPattern);

    if (!matches || matches.length === 0) {
      return res.status(200).json({
        success: false,
        match: false,
        message: "No NID number found in image",
      });
    }

    const match = matches.includes(enteredNID.trim());

    return res.status(200).json({
      success: true,
      match,
      extractedNIDs: matches,
      message: match
        ? "NID number matches the image"
        : "NID number does not match the image",
    });
  } catch (error: any) {
    console.error("❌ NID verify match error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify NID match",
      error: error.message,
    });
  }
};

/**
 * Upload NID image to Supabase Storage using service role (bypasses RLS)
 */
export const uploadNIDImage = async (req: Request, res: Response) => {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res
        .status(400)
        .json({ success: false, message: "imageBase64 is required" });
    }

    const base64Data = imageBase64.includes(",")
      ? imageBase64.split(",")[1]
      : imageBase64;
    const buffer = Buffer.from(base64Data, "base64");
    const fileName = `${uuidv4()}.jpg`;
    const filePath = `nid-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("nid-documents")
      .upload(filePath, buffer, { contentType: "image/jpeg", upsert: false });

    if (uploadError) {
      console.error("❌ Supabase upload error:", uploadError);
      return res.status(400).json({
        success: false,
        message: uploadError.message || "Upload failed",
      });
    }

    const { data: urlData } = supabase.storage
      .from("nid-documents")
      .getPublicUrl(filePath);

    return res
      .status(200)
      .json({ success: true, publicUrl: urlData.publicUrl, path: filePath });
  } catch (error: any) {
    console.error("❌ NID upload error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload NID image",
      error: error.message,
    });
  }
};
const fileName = `${uuidv4()}.jpg`;
