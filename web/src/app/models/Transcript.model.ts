import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITranscript extends Document {
  userId: Types.ObjectId;
  title?: string;
  transcript: string;
  summary?: string;
  duration?: number;
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

const transcriptSchema = new Schema<ITranscript>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      trim: true,
    },

    transcript: {
      type: String,
      required: true,
    },

    summary: {
      type: String,
    },

    duration: {
      type: Number,
    },

    language: {
      type: String,
      default: "en",
    },
  },
  {
    timestamps: true,
  }
);

export const Transcript =
  mongoose.models.Transcript ||
  mongoose.model<ITranscript>("Transcript", transcriptSchema);