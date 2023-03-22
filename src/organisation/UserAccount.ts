import mongoose, { Types, Schema, Model } from 'mongoose';

export interface UserAccount {
  _id: Types.ObjectId;
  organisations: Types.ObjectId[];
  status: 'active' | 'deleted';
}

export interface UserAccountMethods {
  isInOrganisation(organisationId: Types.ObjectId): boolean;
  addToOrganisation(
    organisationId: Types.ObjectId
  ): Promise<UserAccount & UserAccountMethods>;
  leaveOrganisation(
    organisationId: Types.ObjectId
  ): Promise<UserAccount & UserAccountMethods>;
}

const schema = new mongoose.Schema<UserAccount>({
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
  },
});

schema.methods.isInOrganisation = function (
  organisationId: Types.ObjectId
): boolean {
  return this.organisations.includes(organisationId);
};

schema.methods.addToOrganisation = function (organisationId: Types.ObjectId) {
  if (this.isInOrganisation(organisationId)) {
    return Promise.resolve(this);
  }
  this.organisations.push(organisationId);
  return this.save();
};

schema.methods.leaveOrganisation = function (organisationId: Types.ObjectId) {
  if (!this.isInOrganisation(organisationId)) {
    return Promise.resolve(this);
  }
  this.organisations.remove(organisationId);
  return this.save();
};

export const UserAccountModel = mongoose.model<
  UserAccount,
  // eslint-disable-next-line @typescript-eslint/ban-types
  Model<UserAccount, {}, UserAccountMethods>
>('UserAccount', schema);
