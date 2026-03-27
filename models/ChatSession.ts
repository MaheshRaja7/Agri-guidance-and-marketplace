import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IChatMessage {
  role: "user" | "model";
  content: string;
  imageUrl?: string;
  timestamp: Date;
}

export interface IChatSession extends Document {
  sessionId: string;
  userId?: string;
  title: string;
  messages: IChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>({
  role: { type: String, enum: ["user", "model"], required: true },
  content: { type: String, required: true },
  imageUrl: { type: String },
  timestamp: { type: Date, default: Date.now },
});

const ChatSessionSchema = new Schema<IChatSession>(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, index: true },
    title: { type: String, default: "New Chat" },
    messages: [ChatMessageSchema],
  },
  { timestamps: true }
);

const ChatSession: Model<IChatSession> =
  mongoose.models.ChatSession ||
  mongoose.model<IChatSession>("ChatSession", ChatSessionSchema);

export default ChatSession;
