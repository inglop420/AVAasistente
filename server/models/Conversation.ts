import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export interface IConversation extends Document {
  userId: string;
  tenantId: string;
  title: string;
  messages: IMessage[];
}

const MessageSchema = new Schema<IMessage>({
  id: { type: String, required: true },
  text: { type: String, required: true },
  isUser: { type: Boolean, required: true },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const ConversationSchema = new Schema<IConversation>({
  userId: { type: String, required: true, index: true },
  tenantId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  messages: { type: [MessageSchema], default: [] }
}, {
  timestamps: true
});

export default mongoose.model<IConversation>('Conversation', ConversationSchema);
