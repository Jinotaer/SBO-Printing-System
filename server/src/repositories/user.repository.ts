import mongoose from "mongoose";
import { User, type UserDoc } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";

function ensureDbConnected(): void {
  if (mongoose.connection.readyState !== 1) {
    throw new ApiError(503, "Database unavailable — please try again shortly");
  }
}

export interface UserRepository {
  findByEmail(email: string): Promise<UserDoc | null>;
  findByEmailWithPassword(email: string): Promise<UserDoc | null>;
  findById(id: string): Promise<UserDoc | null>;
  create(data: {
    name: string;
    studentId: string;
    email: string;
    passwordHash: string;
    department?: string;
    role?: string;
    avatar?: string;
    provider?: "google" | "password";
  }): Promise<UserDoc>;
  setResetPasswordToken(email: string, token: string, expires: Date): Promise<UserDoc | null>;
  findByResetToken(token: string): Promise<UserDoc | null>;
  resetPassword(id: string, newPasswordHash: string): Promise<UserDoc | null>;
}

export class MongooseUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<UserDoc | null> {
    ensureDbConnected();
    return User.findOne({ email: email.toLowerCase() }).exec();
  }

  async findByEmailWithPassword(email: string): Promise<UserDoc | null> {
    ensureDbConnected();
    return User.findOne({ email: email.toLowerCase() }).select("+passwordHash").exec();
  }

  async findById(id: string): Promise<UserDoc | null> {
    ensureDbConnected();
    return User.findById(id).exec();
  }

  async setResetPasswordToken(email: string, token: string, expires: Date): Promise<UserDoc | null> {
    ensureDbConnected();
    return User.findOneAndUpdate(
      { email: email.toLowerCase() },
      {
        resetPasswordToken: token,
        resetPasswordExpires: expires,
      },
      { new: true }
    ).exec();
  }

  async findByResetToken(token: string): Promise<UserDoc | null> {
    ensureDbConnected();
    return User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    })
      .select("+resetPasswordToken +resetPasswordExpires")
      .exec();
  }

  async resetPassword(id: string, newPasswordHash: string): Promise<UserDoc | null> {
    ensureDbConnected();
    return User.findByIdAndUpdate(
      id,
      {
        passwordHash: newPasswordHash,
        $unset: { resetPasswordToken: 1, resetPasswordExpires: 1 },
      },
      { new: true }
    ).exec();
  }

  async create(data: {
    name: string;
    studentId: string;
    email: string;
    passwordHash: string;
    department?: string;
    role?: string;
    avatar?: string;
    provider?: "google" | "password";
  }): Promise<UserDoc> {
    ensureDbConnected();
    const avatar =
      data.avatar ?? `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(data.email)}`;
    return (User.create as unknown as (doc: unknown) => Promise<UserDoc>)({
      name: data.name,
      studentId: data.studentId,
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash,
      department: data.department ?? "College of Technologies (COT)",
      role: data.role ?? "SBO Printing Assistant",
      avatar,
      provider: data.provider ?? "password",
    });
  }
}
