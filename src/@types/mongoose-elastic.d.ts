// src/@types/mongoose-elastic.d.ts
declare module 'mongoose-elastic' {
  import { Schema } from 'mongoose';

  export type PluginFunction = (schema: Schema<any>, options?: any) => void;

  export default function mongooseElastic(schema: Schema<any>, options?: any): void;
}
