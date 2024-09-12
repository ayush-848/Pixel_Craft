/* eslint-disable camelcase */
import { clerkClient } from "@clerk/nextjs/server";
import { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";

import { createUser, deleteUser, updateUser } from "@/lib/actions/user.actions";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("WEBHOOK_SECRET not set in environment variables.");
  }

  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.log("Svix headers missing.");
    return new Response("Error: Missing Svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  console.log("Received webhook payload:", payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;

    console.log("Webhook verified. Event type:", evt.type);
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new Response("Webhook verification failed", { status: 400 });
  }

  const eventType = evt.type;
  const { id } = evt.data;

  if (!id) {
    console.log("ID missing in event data:", evt.data);
    return new Response("Error: Missing user ID", { status: 400 });
  }

  // CREATE
  if (eventType === "user.created") {
    const { email_addresses, image_url, first_name, last_name, username } = evt.data;
    console.log("Creating user with data:", evt.data);

    const user = {
      clerkId: id,
      email: email_addresses?.[0]?.email_address || "",
      username: username || "",
      firstName: first_name || "",
      lastName: last_name || "",
      photo: image_url || "",
    };

    const newUser = await createUser(user);

    if (newUser) {
      await clerkClient.users.updateUserMetadata(id, {
        publicMetadata: {
          userId: newUser._id,
        },
      });
    }

    return NextResponse.json({ message: "User created", user: newUser });
  }

  // UPDATE
  if (eventType === "user.updated") {
    const { image_url, first_name, last_name, username } = evt.data;
    console.log("Updating user with ID:", id);

    const user = {
      firstName: first_name || "",
      lastName: last_name || "",
      username: username || "",
      photo: image_url || "",
    };

    const updatedUser = await updateUser(id, user);

    return NextResponse.json({ message: "User updated", user: updatedUser });
  }

  // DELETE
  if (eventType === "user.deleted") {
    console.log("Deleting user with ID:", id);

    const deletedUser = await deleteUser(id);

    return NextResponse.json({ message: "User deleted", user: deletedUser });
  }

  console.log(`Unhandled event type: ${eventType} for user ${id}`);
  return new Response("", { status: 200 });
}
