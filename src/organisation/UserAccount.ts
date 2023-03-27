import mongoose, { Types, Schema, Model } from 'mongoose';

export interface UserAccount {
  _id: Types.ObjectId;
  organisations: Types.ObjectId[];
  status: 'active' | 'deleted';
}

export interface UserAccountMethods {
  isInOrganisation(organisation: Types.ObjectId): boolean;
  addToOrganisation(
    organisation: Types.ObjectId
  ): Promise<UserAccount & UserAccountMethods>;
  leaveOrganisation(
    organisation: Types.ObjectId
  ): Promise<UserAccount & UserAccountMethods>;
}

const schema = new mongoose.Schema<UserAccount>(
  {
    organisations: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Organisation',
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

schema.methods.isInOrganisation = function (
  organisation: Types.ObjectId
): boolean {
  return this.organisations.includes(organisation);
};

schema.methods.addToOrganisation = function (organisation: Types.ObjectId) {
  if (this.isInOrganisation(organisation)) {
    return Promise.resolve(this);
  }
  this.organisations.push(organisation);
  return this.save();
};

schema.methods.leaveOrganisation = function (organisation: Types.ObjectId) {
  if (!this.isInOrganisation(organisation)) {
    return Promise.resolve(this);
  }
  this.organisations.remove(organisation);
  return this.save();
};

export const UserAccountModel = mongoose.model<
  UserAccount,
  // eslint-disable-next-line @typescript-eslint/ban-types
  Model<UserAccount, {}, UserAccountMethods>
>('UserAccount', schema);
