import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface UserDoc extends Document {
  name: string;
  studentId: string;
  email: string;
  passwordHash: string;
  role: string;
  department: string;
  avatar?: string;
  provider: "google" | "password";
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDoc>(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    studentId: { type: String, required: true, trim: true, maxlength: 20, index: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^[a-zA-Z0-9._%+-]+@student\.buksu\.edu\.ph$/i, "Invalid BukSU email"],
    },
    passwordHash: { type: String, required: false, select: false, default: "" },
    role: { type: String, default: "SBO Printing Assistant", trim: true },
    department: { type: String, default: "College of Technologies (COT)", trim: true },
    avatar: { type: String },
    provider: { type: String, enum: ["google", "password"], default: "password" },
    resetPasswordToken: { type: String, select: false, index: true },
    resetPasswordExpires: { type: Date, select: false },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform(_doc, ret: Record<string, unknown>) {
        ret["id"] = ret["_id"];
        delete ret["_id"];
        delete ret["passwordHash"];
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform(_doc, ret: Record<string, unknown>) {
        ret["id"] = ret["_id"];
        delete ret["_id"];
        delete ret["passwordHash"];
        return ret;
      },
    },
  }
);

// Email already has unique+index above; no extra index needed (lowercase storage ensures case-insensitivity)

export const User: Model<UserDoc> =
  mongoose.models["User"] ?? mongoose.model<UserDoc>("User", userSchema);
