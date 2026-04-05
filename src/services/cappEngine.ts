import Material from '../models/Material';

export async function generatePlan(
  materialName: string,
  dimensions: any,
  features: any[],
  includeLifecycle: boolean = false
) {
  let Vc = 100; // default m/min
  try {
    const mat = await Material.findOne({ name: materialName });
    if (mat) {
      Vc = mat.baseCuttingSpeed;
    } else if (materialName.includes('Steel')) {
      Vc = 60;
    } else if (materialName.includes('Aluminum')) {
      Vc = 150;
    } else if (materialName.includes('Brass')) {
      Vc = 120;
    } else if (materialName.includes('Titanium')) {
      Vc = 40;
    }
  } catch (e) {
    console.error('Material lookup failed', e);
  }

  let allOperations: any[] = [];
  let featureCounter = 0;

  for (const feature of features) {
    featureCounter++;
    const { type, parameters = {} } = feature;

    const addOp = (
      opType: string,
      tooling: string,
      toolDia: number,
      specificFeedRate: number | null = null,
      specificSpindleSpeed: number | null = null
    ) => {
      const N =
        specificSpindleSpeed !== null
          ? specificSpindleSpeed
          : Math.round((1000 * Vc) / (Math.PI * toolDia));
      
      let F = specificFeedRate;

      if (F === null) {
        let ipt = 0.05; // feed per tooth
        let flutes = 4;
        if (tooling.includes('Drill') || tooling.includes('Center')) {
          flutes = 2;
          ipt = 0.08;
        }
        if (tooling.includes('Reamer')) {
          flutes = 6;
          ipt = 0.04;
        }
        F = Math.round(N * ipt * flutes);
      }

      allOperations.push({
        featureRefId: feature.id || `f${featureCounter}`,
        type: opType,
        tooling,
        spindleSpeed: N,
        feedRate: F,
      });
    };

    switch (type) {
      case 'Face Mill':
        addOp('Rough Face Milling', 'Face Mill 50mm', 50);
        addOp('Finish Face Milling', 'Face Mill 50mm', 50);
        break;
      case 'Peripheral Mill':
        addOp('Rough Profiling', 'End Mill 12mm', 12);
        addOp('Finish Profiling', 'End Mill 10mm', 10);
        break;
      case 'Blind Hole':
        addOp('Center Drill', 'Center Drill #3', 3);
        addOp('Drill Bore', `Twist Drill ${parameters.diameter || 10}mm`, parameters.diameter || 10);
        break;
      case 'Through Hole':
        addOp('Center Drill', 'Center Drill #3', 3);
        addOp('Drill Through', `Twist Drill ${parameters.diameter || 10}mm`, parameters.diameter || 10);
        break;
      case 'Threaded Hole':
        addOp('Center Drill', 'Center Drill #3', 3);
        const threadSizeStr = parameters.threadSize ? String(parameters.threadSize) : 'M8';
        const dia = parseInt(threadSizeStr.replace('M', '')) || 8;
        addOp('Tap Drill', `Twist Drill ${dia * 0.85}mm`, dia * 0.85);

        const pitch = parameters.pitch || 1.0;
        const base_N = Math.round((1000 * Vc) / (Math.PI * dia));
        const N_tap = Math.round(base_N * 0.5); // Tapping runs slower (50% Vc)
        const F_tap = Math.round(N_tap * pitch); // Rigid Tapping Override Rule
        
        // Pass both the specific Feed and specific Speed
        addOp('Rigid Tapping', `Machine Tap ${threadSizeStr}`, dia, F_tap, N_tap);
        break;
      case 'Reamed Hole':
        addOp('Center Drill', 'Center Drill #4', 4);
        const reamerDia = parameters.targetDiameter || parameters.diameter || 10;
        addOp('Pilot Drill', `Twist Drill ${(reamerDia - 0.2).toFixed(1)}mm`, reamerDia - 0.2);
        addOp('Reamer Finish', `Reamer ${parameters.toleranceGrade || 'H7'} ${reamerDia}mm`, reamerDia);
        break;
      case 'Step / Counterbore':
        addOp('Center Drill', 'Center Drill #3', 3);
        addOp('Pilot Drill', `Twist Drill ${parameters.minorDiameter || 5}mm`, parameters.minorDiameter || 5);
        addOp('Counterbore', `Counterbore Tool ${parameters.majorDiameter || 10}mm`, parameters.majorDiameter || 10);
        break;
      case 'Keyway / Slot':
        addOp('Slot Roughing', `End Mill ${parameters.slotWidth || 6}mm`, parameters.slotWidth || 6);
        addOp('Slot Finishing', `End Mill ${parameters.slotWidth || 6}mm`, parameters.slotWidth || 6);
        break;
      case 'Internal Groove':
        addOp('Grooving', `Groove Tool ${(parameters.grooveWidth || 3).toFixed(1)}mm`, 10);
        break;
      case 'Chamfer':
        addOp('Chamfering', `Chamfer Mill ${parameters.angle || 45}deg`, 10);
        break;
      default:
        addOp(`Machining ${type}`, `Standard Tooling ${type}`, 10);
        break;
    }
  }

  let optimizedOperations: any[] = [];
  let toolGroups = new Map();

  for (const op of allOperations) {
    if (!toolGroups.has(op.tooling)) {
      toolGroups.set(op.tooling, []);
    }
    toolGroups.get(op.tooling).push(op);
  }

  for (const [tool, ops] of toolGroups.entries()) {
    optimizedOperations.push(...ops);
  }

  let currentOpNo = includeLifecycle ? 20 : 10;

  for (const op of optimizedOperations) {
    op.opNo = currentOpNo;
    currentOpNo += 10;
  }

  if (includeLifecycle) {
    optimizedOperations.unshift({
      featureRefId: 'LIFECYCLE',
      opNo: 10,
      type: 'Raw Material Prep',
      tooling: 'Band Saw',
      spindleSpeed: 0,
      feedRate: 0,
    });

    optimizedOperations.push({
      featureRefId: 'LIFECYCLE',
      opNo: currentOpNo,
      type: 'Deburr & Clean',
      tooling: 'Manual',
      spindleSpeed: 0,
      feedRate: 0,
    });

    currentOpNo += 10;

    optimizedOperations.push({
      featureRefId: 'LIFECYCLE',
      opNo: currentOpNo,
      type: 'Final Inspection',
      tooling: 'CMM',
      spindleSpeed: 0,
      feedRate: 0,
    });
  }

  let mappedFeatures = features.map((f, i) => {
    const id = f.id || `f${i + 1}`;
    const ops = optimizedOperations.filter((op) => op.featureRefId === id);
    return { ...f, operations: ops };
  });

  if (includeLifecycle) {
    mappedFeatures.push({
      id: 'LIFECYCLE',
      type: 'Lifecycle',
      name: 'Lifecycle Operations',
      operations: optimizedOperations.filter((op) => op.featureRefId === 'LIFECYCLE'),
    });
  }

  return mappedFeatures;
}
