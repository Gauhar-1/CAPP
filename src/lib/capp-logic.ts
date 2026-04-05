export type FeatureType = 'Face Mill' | 'Peripheral Mill' | 'Central Bore' | 'Step Pocket' | 'Threaded Hole' | 'Counterbore' | 'Keyway Slot' | 'Chamfer' | 'Oil Groove' | 'Reamed Hole';

export interface PartFeature {
  id: string;
  type: FeatureType;
  name: string;
  parameters: Record<string, number>;
}

export interface Operation {
  opNo: number;
  type: string;
  tooling: string;
  spindleSpeed: number;
  feedRate: number;
  featureId: string;
}

export function generateRouteSheet(features: PartFeature[], material: string): Operation[] {
  let operations: Operation[] = [];
  let opCount = 10;
  
  let speedMod = 1.0;
  if (material === 'Mild Steel 1018') speedMod = 0.6;
  if (material === 'Titanium Grade 5') speedMod = 0.4;
  if (material === 'Brass') speedMod = 1.2;
  
  const addOp = (type: string, tooling: string, rpm: number, feed: number, featureId: string) => {
    operations.push({ opNo: opCount, type, tooling, spindleSpeed: Math.round(rpm * speedMod), feedRate: Math.round(feed * speedMod), featureId });
    opCount += 10;
  };

  for (const feature of features) {
    const { id, type, parameters } = feature;
    switch (type) {
      case 'Face Mill':
        addOp('Rough Face Milling', 'Face Mill 50mm', 1200, 300, id);
        addOp('Finish Face Milling', 'Face Mill 50mm', 1800, 200, id);
        break;
      case 'Peripheral Mill':
        addOp('Rough Profiling', 'End Mill 12mm', 2000, 400, id);
        addOp('Finish Profiling', 'End Mill 10mm', 2500, 250, id);
        break;
      case 'Central Bore':
        addOp('Center Drill', 'Center Drill #4', 1500, 100, id);
        addOp('Drill Bore', `Twist Drill ${(parameters.diameter || 20) * 0.9}mm`, 1200, 120, id);
        addOp('Bore Finish', `Boring Bar`, 800, 50, id);
        break;
      case 'Step Pocket':
        addOp('Rough Pocket', 'End Mill 12mm', 2200, 400, id);
        addOp('Rest Machining', 'End Mill 6mm', 3000, 300, id);
        addOp('Finish Pocket', 'End Mill 6mm', 3500, 250, id);
        break;
      case 'Threaded Hole':
        addOp('Center Drill', 'Center Drill #3', 2000, 120, id);
        addOp('Tap Drill', `Twist Drill ${parameters.diameter ? parameters.diameter * 0.85 : 6.8}mm`, 1500, 150, id);
        addOp('Rigid Tapping', `Machine Tap M${parameters.diameter || 8}`, 400, (parameters.diameter || 8) * 1.25, id);
        break;
      case 'Counterbore':
        addOp('Center Drill', 'Center Drill #3', 2000, 120, id);
        addOp('Pilot Drill', `Twist Drill ${parameters.pilotDia || 5}mm`, 1800, 150, id);
        addOp('Counterbore', `Counterbore Tool ${parameters.cbDia || 10}mm`, 800, 80, id);
        break;
      case 'Keyway Slot':
        addOp('Slot Milling', `Slot Drill ${parameters.width || 6}mm`, 2500, 200, id);
        break;
      case 'Chamfer':
        addOp('Chamfering', 'Chamfer Mill 90deg', 3000, 350, id);
        break;
      case 'Oil Groove':
        addOp('Grooving', 'Ball Nose Mill 3mm', 4000, 400, id);
        break;
      case 'Reamed Hole':
        addOp('Center Drill', 'Center Drill #3', 2000, 120, id);
        addOp('Drill', `Twist Drill ${parameters.diameter ? parameters.diameter - 0.2 : 7.8}mm`, 1500, 150, id);
        addOp('Ream', `Reamer ${parameters.diameter || 8}mm`, 600, 80, id);
        break;
    }
  }

  return operations;
}
