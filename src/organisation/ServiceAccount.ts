import mongoose, { Types, Schema, Model } from 'mongoose';

export interface ServiceAccount {
  _id: Types.ObjectId;
  name: string;
  organisation: Types.ObjectId;
  status: 'active' | 'inactive' | 'deleted';
}

export interface ServiceAccountMethods {
  activate(): Promise<ServiceAccount & ServiceAccountMethods>;
  deactivate(): Promise<ServiceAccount & ServiceAccountMethods>;
  delete(): Promise<ServiceAccount & ServiceAccountMethods>;
}

const schema = new Schema<ServiceAccount>(
  {
    name: 'string',
    organisation: {
      type: Schema.Types.ObjectId,
      ref: 'Organisation',
      required: true,
    },
    status: {
      type: 'string',
      enum: ['active', 'inactive', 'deleted'],
      default: 'active',
      required: true,
    },
  },
  { timestamps: true }
);

schema.methods.activate = function () {
  if (this.status === 'active') {
    Promise.resolve(this);
  }
  this.status = 'active';
  return this.save();
};

schema.methods.deactivate = function () {
  if (this.status === 'inactive') {
    Promise.resolve(this);
  }
  this.status = 'inactive';
  return this.save();
};

schema.methods.delete = function () {
  if (this.status === 'deleted') {
    Promise.resolve(this);
  }
  this.status = 'deleted';
  return this.save();
};

export const ServiceAccountModel = mongoose.model<
  ServiceAccount,
  // eslint-disable-next-line @typescript-eslint/ban-types
  Model<ServiceAccount, {}, ServiceAccountMethods>
>('ServiceAccount', schema);
