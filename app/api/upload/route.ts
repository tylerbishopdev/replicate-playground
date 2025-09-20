/**
 * API Route: /api/upload
 * Handles file uploads to Vercel Blob storage
 */

import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { nanoid } from 'nanoid';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` },
        { status: 400 }
      );
    }

    // Generate unique filename
    const extension = file.name.split('.').pop();
    const filename = `${nanoid()}.${extension}`;

    // Upload to Vercel Blob storage
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: false,
    });

    return NextResponse.json({
      url: blob.url,
      filename: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (error: any) {
    console.error('Error uploading file:', error);

    // Fallback to local storage if Vercel Blob is not configured
    if (error.message?.includes('BLOB_READ_WRITE_TOKEN')) {
      return NextResponse.json(
        {
          error: 'File upload not configured. Please set up Vercel Blob storage or use direct URLs.',
          hint: 'Set BLOB_READ_WRITE_TOKEN in your environment variables',
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

/**
 * Alternative upload handler for base64 encoded files
 */
export async function PUT(request: NextRequest) {
  try {
    const { data, filename, type } = await request.json();

    if (!data || !filename) {
      return NextResponse.json(
        { error: 'Missing data or filename' },
        { status: 400 }
      );
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(data.split(',')[1] || data, 'base64');

    // Validate file size
    if (buffer.length > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` },
        { status: 400 }
      );
    }

    // Generate unique filename
    const extension = filename.split('.').pop();
    const uniqueFilename = `${nanoid()}.${extension}`;

    // Upload to Vercel Blob storage
    const blob = await put(uniqueFilename, buffer, {
      access: 'public',
      contentType: type,
      addRandomSuffix: false,
    });

    return NextResponse.json({
      url: blob.url,
      filename,
      size: buffer.length,
      type,
    });
  } catch (error: any) {
    console.error('Error uploading base64 file:', error);

    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}