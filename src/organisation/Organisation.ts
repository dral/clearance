import mongoose, { Types, Schema, Model } from 'mongoose';

export interface Organisation {
  _id: Types.ObjectId;
  name: string;
  users: Types.ObjectId[];
  services: Types.ObjectId[];
  status: 'active' | 'deleted';
}

export interface OrganisationMethods {
  hasUser(userAccount: Types.ObjectId): boolean;
  addUser(
    userAccount: Types.ObjectId
  ): Promise<Organisation & OrganisationMethods>;
  removeUser(
    userAccount: Types.ObjectId
  ): Promise<Organisation & OrganisationMethods>;
  hasService(serviceAccount: Types.ObjectId): boolean;
  addService(
    serviceAccount: Types.ObjectId
  ): Promise<Organisation & OrganisationMethods>;
  deleteService(
    serviceAccount: Types.ObjectId
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
      required: true,
    },
  },
  { timestamps: true }
);

schema.methods.hasUser = function (userAccount: Types.ObjectId) {
  return this.users.includes(userAccount);
};

schema.methods.addUser = function (userAccount: Types.ObjectId) {
  if (this.hasUser(userAccount)) {
    return Promise.resolve(this);
  }
  this.users.push(userAccount);
  return this.save();
};

schema.methods.removeUser = function (userAccount: Types.ObjectId) {
  if (!this.hasUser(userAccount)) {
    return Promise.resolve(this);
  }
  this.users.remove(userAccount);

  if (this.users.length === 0) {
    this.status = 'deleted';
  }

  return this.save();
};

schema.methods.hasService = function (serviceAccount: Types.ObjectId) {
  return this.services.includes(serviceAccount);
};

schema.methods.addService = function (serviceAccount: Types.ObjectId) {
  if (this.hasService(serviceAccount)) {
    return Promise.resolve(this);
  }
  this.services.push(serviceAccount);
  return this.save();
};

schema.methods.deleteService = function (serviceAccount: Types.ObjectId) {
  if (!this.hasService(serviceAccount)) {
    return Promise.resolve(this);
  }

  this.services.remove(serviceAccount);
  return this.save();
};

export const OrganisationModel = mongoose.model<
  Organisation,
  // eslint-disable-next-line @typescript-eslint/ban-types
  Model<Organisation, {}, OrganisationMethods>
>('Organisation', schema);
