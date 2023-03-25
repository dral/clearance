import mongoose, { Types, Schema, Model } from 'mongoose';

// TODO remove organisation
// TODO add a getRecipient that finds or createsa a new recipient
export interface GrantRecipient {
  _id: Types.ObjectId;
}

export interface GrantRecipientMethods {
  accessList(asOf: Date): Promise<string[]>;
}
const schema = new mongoose.Schema<GrantRecipient>(
  {},
  { timestamps: true, discriminatorKey: 'kind' }
);

export const GrantRecipientModel = mongoose.model<
  GrantRecipient,
  // eslint-disable-next-line @typescript-eslint/ban-types
  Model<GrantRecipient, {}, GrantRecipientMethods>
>('GrantRecipient', schema);

export interface UserGrantRecipient extends GrantRecipient {
  organisation: Types.ObjectId;
  userAccount: Types.ObjectId;
}

const UserGrantRecipientSchema = new mongoose.Schema<UserGrantRecipient>({
  organisation: {
    type: Schema.Types.ObjectId,
    ref: 'Organisation',
    required: true,
  },
  userAccount: {
    type: Schema.Types.ObjectId,
    ref: 'UserAccount',
    required: true,
  },
});

UserGrantRecipientSchema.index(
  { organisation: 1, userAccount: 1 },
  { unique: true }
);

export const UserGrantRecipientModel = GrantRecipientModel.discriminator<
  UserGrantRecipient,
  // eslint-disable-next-line @typescript-eslint/ban-types
  Model<UserGrantRecipient, {}, GrantRecipientMethods>
>('UserGrantRecipient', UserGrantRecipientSchema);

export interface ServiceGrantRecipient extends GrantRecipient {
  serviceAccount: Types.ObjectId;
}

const ServiceGrantRecipientSchema = new mongoose.Schema<ServiceGrantRecipient>({
  serviceAccount: {
    type: Schema.Types.ObjectId,
    ref: 'ServiceAccount',
    required: true,
    index: true,
  },
});

export const ServiceGrantRecipientModel = GrantRecipientModel.discriminator<
  ServiceGrantRecipient,
  // eslint-disable-next-line @typescript-eslint/ban-types
  Model<ServiceGrantRecipient, {}, GrantRecipientMethods>
>('ServiceGrantRecipient', ServiceGrantRecipientSchema);
