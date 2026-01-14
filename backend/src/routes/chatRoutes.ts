import { Router } from "express";
import {
  getChatMessages,
  getOrCreateChatRoom,
  getUserChatRooms,
  markMessagesAsRead,
  sendMessage,
} from "../controllers/chatController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// All chat routes require authentication
router.use(authenticateToken);

// Get or create a chat room
router.post("/room", getOrCreateChatRoom);

// Send a message
router.post("/message", sendMessage);

// Get messages for a chat room
router.get("/messages/:roomId", getChatMessages);

// Get all chat rooms for the user
router.get("/rooms", getUserChatRooms);

// Mark messages as read
router.post("/mark-read", markMessagesAsRead);

export default router;
