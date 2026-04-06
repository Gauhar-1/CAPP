import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Template from '@/models/Template';

const MASTER_TEMPLATES = [
  {
    familyCode: 'VALVE-BLK-001',
    familyName: 'Pneumatic Valve Block Family',
    defaultMaterial: 'Aluminum 6061',
    standardFeatures: [
      {
        id: 'f-valve-1',
        name: 'Top Face Prep',
        type: 'Face Mill',
        parameters: { depthOfCut: 2.0, surfaceFinish: '1.6' }
      },
      {
        id: 'f-valve-2',
        name: 'Main Air Channel',
        type: 'Through Hole',
        parameters: { diameter: 12.0 }
      },
      {
        id: 'f-valve-3',
        name: 'Port Thread 1',
        type: 'Threaded Hole',
        parameters: { threadSize: 'M8', pitch: 1.25, threadDepth: 18 }
      },
      {
        id: 'f-valve-4',
        name: 'Port Thread 2',
        type: 'Threaded Hole',
        parameters: { threadSize: 'M8', pitch: 1.25, threadDepth: 18 }
      }
    ]
  },
  {
    familyCode: 'MNT-PLT-4X4',
    familyName: 'Standard Aluminum Mounting Plate',
    defaultMaterial: 'Aluminum 7075',
    standardFeatures: [
      {
        id: 'f-mnt-1',
        name: 'Initial Facing',
        type: 'Face Mill',
        parameters: { depthOfCut: 1.5, surfaceFinish: '3.2' }
      },
      {
        id: 'f-mnt-2',
        name: 'Mounting Counterbore 1',
        type: 'Step / Counterbore',
        parameters: { majorDiameter: 15, stepDepth: 8, minorDiameter: 8 }
      },
      {
        id: 'f-mnt-3',
        name: 'Mounting Counterbore 2',
        type: 'Step / Counterbore',
        parameters: { majorDiameter: 15, stepDepth: 8, minorDiameter: 8 }
      },
      {
        id: 'f-mnt-4',
        name: 'Sensor Blind Hole',
        type: 'Blind Hole',
        parameters: { diameter: 6, depth: 15 }
      },
      {
        id: 'f-mnt-5',
        name: 'Edge Chamfering',
        type: 'Chamfer',
        parameters: { chamferSize: 1.5, angle: 45 }
      }
    ]
  },
  {
    familyCode: 'HOUS-PRIS-01',
    familyName: 'Basic Prismatic Housing',
    defaultMaterial: 'Mild Steel',
    standardFeatures: [
      {
        id: 'f-hous-1',
        name: 'Heavy Face Mill',
        type: 'Face Mill',
        parameters: { depthOfCut: 4.0, surfaceFinish: '6.3' }
      },
      {
        id: 'f-hous-2',
        name: 'Main Bearing Bore',
        type: 'Blind Hole',
        parameters: { diameter: 45, depth: 30 }
      },
      {
        id: 'f-hous-3',
        name: 'Dowel Pin Hole 1',
        type: 'Reamed Hole',
        parameters: { targetDiameter: 8, depth: 15, toleranceGrade: 'H7' }
      },
      {
        id: 'f-hous-4',
        name: 'Dowel Pin Hole 2',
        type: 'Reamed Hole',
        parameters: { targetDiameter: 8, depth: 15, toleranceGrade: 'H7' }
      }
    ]
  }
];

export async function POST() {
  try {
    await connectDB();
    
    // Clear existing templates to avoid duplicates during seeding
    await Template.deleteMany({});
    
    // Insert heavily realistic Mongoose Data
    const templates = await Template.insertMany(MASTER_TEMPLATES);
    
    return NextResponse.json({ success: true, message: 'Seeded templates', templates }, { status: 201 });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error seeding templates' },
      { status: 500 }
    );
  }
}
