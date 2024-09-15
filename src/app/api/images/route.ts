import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from '@/lib/database/mongoose';
import Image from '@/lib/database/models/image.model';
import User from '@/lib/database/models/user.model';

export async function GET(req: NextRequest) {
  console.log('API route called');
  const { userId: clerkId } = auth();
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = 9; // Adjust as needed

  console.log('Clerk ID:', clerkId, 'Page:', page);

  if (!clerkId) {
    console.log('Unauthorized: No Clerk ID');
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectToDatabase();
    console.log('Connected to database');

    // Find the user in MongoDB using the Clerk ID
    const user = await User.findOne({ clerkId });
    if (!user) {
      console.log('User not found in MongoDB');
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    console.log('Found user in MongoDB:', user._id);

    const skip = (page - 1) * pageSize;

    // Use the MongoDB user ID to find images
    const images = await Image.find({ author: user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    console.log(`Found ${images.length} images`);

    const totalImages = await Image.countDocuments({ author: user._id });
    const totalPages = Math.ceil(totalImages / pageSize);

    console.log('Total images:', totalImages, 'Total pages:', totalPages);

    return NextResponse.json({
      images,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json({ message: 'Error fetching images' }, { status: 500 });
  }
}