// File: lib/actions/user.actions.ts

"use server";

import { revalidatePath } from "next/cache";
import { clerkClient } from "@clerk/nextjs/server";
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
    // Log the full error object
    console.error(JSON.stringify(error, null, 2));
    handleError(error);
  }
}

// READ
export async function getUserById(userId: string) {
  try {
    await connectToDatabase();
    console.log("Database connected for reading user.");

    let user = await User.findOne({ clerkId: userId });

    if (!user) {
      console.log("User not found for ID:", userId);
      
      // Attempt to fetch user data from Clerk
      const clerkUser = await clerkClient.users.getUser(userId);
      
      if (clerkUser) {
        // Create user in your database
        const newUser = {
          clerkId: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          username: clerkUser.username || `user_${userId}`,
          firstName: clerkUser.firstName || '',
          lastName: clerkUser.lastName || '',
          photo: clerkUser.imageUrl || '',
        };
        
        user = await createUser(newUser);
        console.log("User created as fallback:", user);
      }
    }

    if (!user) {
      console.log("User still not found after fallback creation attempt");
      return null;
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
      return null;
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

    const deletedUser = await User.findOneAndDelete({ clerkId });

    if (!deletedUser) {
      console.log("User not found for deletion with Clerk ID:", clerkId);
      return null;
    }

    console.log("User deleted:", deletedUser);
    revalidatePath("/");

    return JSON.parse(JSON.stringify(deletedUser));
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
      return null;
    }

    console.log("User credits updated:", updatedUserCredits);
    return JSON.parse(JSON.stringify(updatedUserCredits));
  } catch (error) {
    console.error("Error updating user credits:", error);
    handleError(error);
  }
}