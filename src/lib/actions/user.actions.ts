"use server";

import { revalidatePath } from "next/cache";
import User from "../database/models/user.model";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";

// CREATE
export async function createUser(user: CreateUserParams) {
  try {
    await connectToDatabase();
    console.log("Database connected for creating user.");

    const newUser = await User.create(user);
    console.log("New user created:", newUser);

    return JSON.parse(JSON.stringify(newUser));
  } catch (error) {
    console.error("Error creating user:", error);
    handleError(error);
  }
}

// READ
export async function getUserById(userId: string) {
  try {
    await connectToDatabase();
    console.log("Database connected for reading user.");

    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      console.log("User not found for ID:", userId);
      throw new Error("User not found");
    }

    console.log("User found:", user);
    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    console.error("Error reading user:", error);
    handleError(error);
  }
}

// UPDATE
export async function updateUser(clerkId: string, user: UpdateUserParams) {
  try {
    await connectToDatabase();
    console.log("Database connected for updating user.");

    const updatedUser = await User.findOneAndUpdate({ clerkId }, user, { new: true });

    if (!updatedUser) {
      console.log("User update failed for Clerk ID:", clerkId);
      throw new Error("User update failed");
    }

    console.log("User updated:", updatedUser);
    return JSON.parse(JSON.stringify(updatedUser));
  } catch (error) {
    console.error("Error updating user:", error);
    handleError(error);
  }
}

// DELETE
export async function deleteUser(clerkId: string) {
  try {
    await connectToDatabase();
    console.log("Database connected for deleting user.");

    const userToDelete = await User.findOne({ clerkId });
    if (!userToDelete) {
      console.log("User not found for deletion with Clerk ID:", clerkId);
      throw new Error("User not found");
    }

    const deletedUser = await User.findByIdAndDelete(userToDelete._id);
    console.log("User deleted:", deletedUser);
    revalidatePath("/");

    return deletedUser ? JSON.parse(JSON.stringify(deletedUser)) : null;
  } catch (error) {
    console.error("Error deleting user:", error);
    handleError(error);
  }
}

// UPDATE CREDITS
export async function updateCredits(userId: string, creditFee: number) {
  try {
    await connectToDatabase();
    console.log("Database connected for updating credits.");

    const updatedUserCredits = await User.findOneAndUpdate(
      { _id: userId },
      { $inc: { creditBalance: creditFee }},
      { new: true }
    );

    if (!updatedUserCredits) {
      console.log("Credits update failed for User ID:", userId);
      throw new Error("User credits update failed");
    }

    console.log("User credits updated:", updatedUserCredits);
    return JSON.parse(JSON.stringify(updatedUserCredits));
  } catch (error) {
    console.error("Error updating user credits:", error);
    handleError(error);
  }
}
