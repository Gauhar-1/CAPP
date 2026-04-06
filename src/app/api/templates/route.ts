import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Template from '@/models/Template';

export async function GET() {
  try {
    await connectDB();
    
    const templates = await Template.find({}).sort({ familyName: 1 });
    
    return NextResponse.json({ success: true, templates }, { status: 200 });
  } catch (error: any) {
    console.error('Template Fetch Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
