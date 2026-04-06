import mongoose, { Schema, Document } from 'mongoose';

export interface ITemplate extends Document {
  familyCode: string;
  familyName: string;
  defaultMaterial: string;
  standardFeatures: any[];
}

const templateSchema = new Schema<ITemplate>(
  {
    familyCode: { type: String, required: true, unique: true },
    familyName: { type: String, required: true },
    defaultMaterial: { type: String, required: true },
    standardFeatures: [Schema.Types.Mixed],
  },
  { timestamps: true }
);

export default mongoose.models.Template || mongoose.model<ITemplate>('Template', templateSchema);
