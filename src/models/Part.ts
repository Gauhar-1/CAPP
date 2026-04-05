import mongoose, { Schema, Document } from 'mongoose';

export interface IOperation {
  opNo: number;
  type: string;
  tooling: string;
  spindleSpeed: number;
  feedRate: number;
}

export interface IFeature {
  type: string;
  name: string;
  parameters: any;
  operations: IOperation[];
}

export interface IPart extends Document {
  name: string;
  dimensionX: number;
  dimensionY: number;
  dimensionZ: number;
  material: string;
  features: IFeature[];
}

const operationSchema = new Schema<IOperation>({
  opNo: Number,
  type: String,
  tooling: String,
  spindleSpeed: Number,
  feedRate: Number,
});

const featureSchema = new Schema<IFeature>({
  type: String,
  name: String,
  parameters: Schema.Types.Mixed,
  operations: [operationSchema],
});

const partSchema = new Schema<IPart>(
  {
    name: { type: String, default: 'Untitled Part' },
    dimensionX: Number,
    dimensionY: Number,
    dimensionZ: Number,
    material: { type: String },
    features: [featureSchema],
  },
  { timestamps: true }
);

export default mongoose.models.Part || mongoose.model<IPart>('Part', partSchema);
