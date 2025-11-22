import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OwnerDocument = HydratedDocument<Owner>;

@Schema()
export class Owner {
  @Prop({ required: true })
  nombre: string;

  @Prop({ 
    type: { 
      telefono: { type: String, required: true }, 
      email: { type: String, required: false } 
    }, 
    _id: false 
  })
  contacto: { telefono: string; email?: string };
}

export const OwnerSchema = SchemaFactory.createForClass(Owner);