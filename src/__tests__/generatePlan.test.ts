import { generatePlan } from '../services/cappEngine';
import { NextResponse } from 'next/server';

// Note: Testing API routes natively in Next.js 13+ App Router in Jest requires a bit of mocking.
// We are primarily testing the `generatePlan` service layer here since the controller is mostly Zod wrapping now.

jest.mock('../lib/db', () => jest.fn());

jest.mock('../models/Material', () => ({
    findOne: jest.fn().mockResolvedValue({ name: 'Aluminum 6061', baseCuttingSpeed: 100 })
}));

describe('CAPP Engine & Data Sync Tests', () => {

    test('1. Rigid Tapping Math for Threaded Hole (M8x1.25)', async () => {
        const features = [{
            type: 'Threaded Hole',
            parameters: { threadSize: 'M8', pitch: 1.25 }
        }];
        const result = await generatePlan('Aluminum 6061', {x: 100, y: 100, z: 50}, features);
        const ops = result[0].operations;
        const tapOp = ops.find((op: any) => op.type === 'Rigid Tapping');
        
        expect(tapOp).toBeDefined();
        expect(tapOp.feedRate).toBe(Math.round(tapOp.spindleSpeed * 1.25));
    });

    test('2. Reamer Pilot Logic for 8mm diameter', async () => {
        const features = [{
            type: 'Reamed Hole',
            parameters: { targetDiameter: 8 }
        }];
        const result = await generatePlan('Aluminum 6061', {x: 100, y: 100, z: 50}, features);
        const ops = result[0].operations;
        const pilotOp = ops.find((op: any) => op.type === 'Pilot Drill');
        
        expect(pilotOp).toBeDefined();
        expect(pilotOp.tooling).toContain("7.8mm");
    });

    test('3. Lifecycle Injection', async () => {
        const features = [{
            type: 'Blind Hole',
            parameters: { diameter: 10 }
        }];
        const result = await generatePlan('Aluminum 6061', {x: 100, y: 100, z: 50}, features, true);
        
        const allOps = result.flatMap((f: any) => f.operations);
        allOps.sort((a, b) => a.opNo - b.opNo);

        expect(allOps[0].type).toBe('Raw Material Prep');
        expect(allOps[allOps.length - 1].type).toBe('Final Inspection');
    });
});
