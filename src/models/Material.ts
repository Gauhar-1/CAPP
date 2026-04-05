import mongoose, { Schema, Document } from 'mongoose';

export interface IMaterial extends Document {
  name: string;
  baseCuttingSpeed: number;
  machinability: number;
}

const materialSchema = new Schema<IMaterial>({
  name: { type: String, required: true, unique: true },
  baseCuttingSpeed: { type: Number, required: true },
  machinability: { type: Number, required: true },
});

// To prevent rewriting models during Hot Module Replacement
export default mongoose.models.Material || mongoose.model<IMaterial>('Material', materialSchema);
