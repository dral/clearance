import mongoose, { Types, Schema, Model } from 'mongoose';

export interface Organisation {
  _id: Types.ObjectId;
  name: string;
  users: Types.ObjectId[];
  services: Types.ObjectId[];
  status: 'active' | 'deleted';
}

export interface OrganisationMethods {
  hasUser(userId: Types.ObjectId): boolean;
  addUser(userId: Types.ObjectId): Promise<Organisation & OrganisationMethods>;
  removeUser(
    userId: Types.ObjectId
  ): Promise<Organisation & OrganisationMethods>;
  hasService(serviceId: Types.ObjectId): boolean;
  addService(
    serviceId: Types.ObjectId
  ): Promise<Organisation & OrganisationMethods>;
  deleteService(
    serviceId: Types.ObjectId
  ): Promise<Organisation & OrganisationMethods>;
}

const schema = new mongoose.Schema<Organisation>(
  {
    name: 'string',
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: 'UserAccount',
      },
    ],
    services: [
      {
        type: Schema.Types.ObjectId,
        ref: 'ServiceAccount',
      },
    ],
    status: {
      type: 'string',
      enum: ['active', 'deleted'],
      default: 'active',
    },
  },
  { timestamps: true }
);

schema.methods.hasUser = function (userId: Types.ObjectId) {
  return this.users.includes(userId);
};

schema.methods.addUser = function (userId: Types.ObjectId) {
  if (this.hasUser(userId)) {
    return Promise.resolve(this);
  }
  this.users.push(userId);
  return this.save();
};

schema.methods.removeUser = function (userId: Types.ObjectId) {
  if (!this.hasUser(userId)) {
    return Promise.resolve(this);
  }
  this.users.remove(userId);

  if (this.users.length === 0) {
    this.status = 'deleted';
  }

  return this.save();
};

schema.methods.hasService = function (serviceId: Types.ObjectId) {
  return this.services.includes(serviceId);
};

schema.methods.addService = function (serviceId: Types.ObjectId) {
  if (this.hasService(serviceId)) {
    return Promise.resolve(this);
  }
  this.services.push(serviceId);
  return this.save();
};

schema.methods.deleteService = function (serviceId: Types.ObjectId) {
  if (!this.hasService(serviceId)) {
    return Promise.resolve(this);
  }

  this.services.remove(serviceId);
  return this.save();
};

export const OrganisationModel = mongoose.model<
  Organisation,
  // eslint-disable-next-line @typescript-eslint/ban-types
  Model<Organisation, {}, OrganisationMethods>
>('Organisation', schema);
