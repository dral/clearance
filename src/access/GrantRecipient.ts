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
  ): Promise<UserGrantRecipient>;
  getServiceAccountRecipient(
    serviceAccount: Types.ObjectId
  ): Promise<ServiceGrantRecipient>;
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
    let existing = await UserGrantRecipientModel.findOne({
      organisation,
      userAccount,
    });
    if (existing) {
      return Promise.resolve(existing);
    }
    return new UserGrantRecipientModel({ organisation, userAccount }).save();
  }
);

schema.static(
  'getServiceAccountRecipient',
  async function (serviceAccount: Types.ObjectId) {
    let existing = await ServiceGrantRecipientModel.findOne({
      serviceAccount,
    });
    if (existing) {
      return Promise.resolve(existing);
    }
    return new ServiceGrantRecipientModel({ serviceAccount }).save();
  }
);

export const GrantRecipientModel = mongoose.model<
  GrantRecipient,
  GrantRecipientModel
>('GrantRecipient', schema);

// UserAccount recipient

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

// ServiceAccount recipient

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
