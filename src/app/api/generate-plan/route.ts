import { NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/db';
import Part from '@/models/Part';
import { generatePlan } from '@/services/cappEngine';

const generatePlanSchema = z.object({
  partName: z.string().optional(),
  material: z.string(),
  dimensions: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number(),
  }),
  includeLifecycle: z.boolean().optional().default(false),
  features: z.array(z.any()), // Can be typed further with feature union, but dynamically accepted here for processing
});

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();
    
    // Type-safe validation using Zod
    const result = generatePlanSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid payload format', errors: result.error.format() },
        { status: 400 }
      );
    }

    const { partName, material, dimensions, includeLifecycle, features } = result.data;

    // Timeout to simulate complex processing calculation (optional as in original)
    await new Promise((r) => setTimeout(r, 1500));

    // Wait for engine execution
    const resultFeatures = await generatePlan(material, dimensions, features, includeLifecycle);

    // Save strictly mapped schema matching the database layout
    const part = new Part({
      name: partName || 'Untitled Part',
      dimensionX: dimensions.x,
      dimensionY: dimensions.y,
      dimensionZ: dimensions.z,
      material,
      features: resultFeatures,
    });
    
    await part.save();

    return NextResponse.json({ success: true, part }, { status: 200 });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
