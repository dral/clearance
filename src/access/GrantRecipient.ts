import mongoose, { Types, Schema, Model } from 'mongoose';

export interface GrantRecipient {
  _id: Types.ObjectId;
}

interface GrantRecipientModel
  // eslint-disable-next-line @typescript-eslint/ban-types
  extends Model<GrantRecipient, {}, GrantRecipientMethods> {
  getUserAccountRecipient(
    organisation: Types.ObjectId,
    userAccount: Types.ObjectId
  ): Promise<UserAccountRecipient>;
  getServiceAccountRecipient(
    serviceAccount: Types.ObjectId
  ): Promise<ServiceAccountRecipient>;
}

export interface GrantRecipientMethods {
  accessList(asOf: Date): Promise<string[]>;
}

const schema = new mongoose.Schema<GrantRecipient, GrantRecipientModel>(
  {},
  { timestamps: true, discriminatorKey: 'kind' }
);

schema.static(
  'getUserAccountRecipient',
  async function (organisation: Types.ObjectId, userAccount: Types.ObjectId) {
    let existing = await UserAccountRecipientModel.findOne({
      organisation,
      userAccount,
    });
    if (existing) {
      return Promise.resolve(existing);
    }
    return new UserAccountRecipientModel({ organisation, userAccount }).save();
  }
);

schema.static(
  'getServiceAccountRecipient',
  async function (serviceAccount: Types.ObjectId) {
    let existing = await ServiceAccountRecipientModel.findOne({
      serviceAccount,
    });
    if (existing) {
      return Promise.resolve(existing);
    }
    return new ServiceAccountRecipientModel({ serviceAccount }).save();
  }
);

export const GrantRecipientModel = mongoose.model<
  GrantRecipient,
  GrantRecipientModel
>('GrantRecipient', schema);

// UserAccount recipient

export interface UserAccountRecipient extends GrantRecipient {
  organisation: Types.ObjectId;
  userAccount: Types.ObjectId;
}

const UserGrantRecipientSchema = new mongoose.Schema<UserAccountRecipient>({
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

export const UserAccountRecipientModel = GrantRecipientModel.discriminator<
  UserAccountRecipient,
  // eslint-disable-next-line @typescript-eslint/ban-types
  Model<UserAccountRecipient, {}, GrantRecipientMethods>
>('UserGrantRecipient', UserGrantRecipientSchema);

// ServiceAccount recipient

export interface ServiceAccountRecipient extends GrantRecipient {
  serviceAccount: Types.ObjectId;
}

const ServiceGrantRecipientSchema =
  new mongoose.Schema<ServiceAccountRecipient>({
    serviceAccount: {
      type: Schema.Types.ObjectId,
      ref: 'ServiceAccount',
      required: true,
      index: true,
    },
  });

export const ServiceAccountRecipientModel = GrantRecipientModel.discriminator<
  ServiceAccountRecipient,
  // eslint-disable-next-line @typescript-eslint/ban-types
  Model<ServiceAccountRecipient, {}, GrantRecipientMethods>
>('ServiceGrantRecipient', ServiceGrantRecipientSchema);
