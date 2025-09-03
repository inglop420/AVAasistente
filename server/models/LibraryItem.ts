import mongoose, { Document, Schema } from 'mongoose';

export interface ILibraryItem extends Document {
  title: string;
  category: string;
  content: string;
  tenantId: string;
  createdAt: Date;
}

const LibraryItemSchema = new Schema<ILibraryItem>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  tenantId: {
    type: String,
    required: true,
    index: true
  }
}, {
  timestamps: true
});

// Index for tenant isolation
//LibraryItemSchema.index({ tenantId: 1 });

export default mongoose.model<ILibraryItem>('LibraryItem', LibraryItemSchema);