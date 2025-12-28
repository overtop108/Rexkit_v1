import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request: NextRequest) {
  try {
    const { prompt, aspect_ratio = '16:9', num_outputs = 1 } = await request.json();
    
    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json(
        { error: 'Image generation not configured' },
        { status: 503 }
      );
    }

    const output = await replicate.run(
      'black-forest-labs/flux-schnell',
      {
        input: {
          prompt,
          num_outputs,
          aspect_ratio,
          output_format: 'webp',
          output_quality: 90,
        },
      }
    );

    // Debug: Log the raw output type and value
    console.log('Raw output type:', typeof output);
    console.log('Raw output:', JSON.stringify(output, null, 2));
    console.log('Is array:', Array.isArray(output));
    if (Array.isArray(output) && output[0]) {
      console.log('First item type:', typeof output[0]);
      console.log('First item:', output[0]);
      console.log('First item toString:', String(output[0]));
    }

    // Extract URLs from output
    let images: string[] = [];
    
    if (Array.isArray(output)) {
      for (const item of output) {
        if (typeof item === 'string') {
          images.push(item);
        } else if (item instanceof URL) {
          images.push(item.href);
        } else if (item && typeof item === 'object') {
          // Handle FileOutput or similar objects
          if ('url' in item && typeof item.url === 'function') {
            images.push(await item.url());
          } else if ('url' in item && typeof item.url === 'string') {
            images.push(item.url);
          } else if ('href' in item) {
            images.push(String(item.href));
          } else {
            // Last resort: convert to string
            const str = String(item);
            if (str.startsWith('http')) {
              images.push(str);
            }
          }
        }
      }
    } else if (typeof output === 'string') {
      images = [output];
    } else if (output instanceof URL) {
      images = [output.href];
    }

    console.log('Processed images:', images);

    if (images.length === 0) {
      return NextResponse.json(
        { error: 'No images generated', debug: { outputType: typeof output, output: String(output) } },
        { status: 500 }
      );
    }

    return NextResponse.json({ images, success: true });
  } catch (error: any) {
    const errorDetails = {
      message: error?.message || 'Unknown error',
      status: error?.status,
      name: error?.name,
    };
    return NextResponse.json(
      { error: 'Failed to generate images', debug: errorDetails },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}