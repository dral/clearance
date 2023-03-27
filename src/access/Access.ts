import mongoose, { Types, Schema, Model } from 'mongoose';

export interface Access {
  _id: Types.ObjectId;
  description: string;
  status: 'active' | 'inactive' | 'deprecated';
}

export interface AccessMethods {
  accessList(): Promise<string[]>;
}

interface AccessModel
  // eslint-disable-next-line @typescript-eslint/ban-types
  extends Model<Access, {}, AccessMethods> {
  getAccessByCode(code: string): Promise<SpecificAccess>;
}

const schema = new mongoose.Schema<Access>(
  {
    description: {
      type: 'string',
      default: '',
    },
    status: {
      type: 'string',
      enum: ['active', 'inactive', 'deprecated'],
      default: 'active',
      required: true,
    },
  },
  { timestamps: true, discriminatorKey: 'kind' }
);

schema.static('getAccessByCode', async function (code: string) {
  let existing = await SpecificAccessModel.findOne({ code });
  if (existing) {
    return Promise.resolve(existing);
  }
  return new SpecificAccessModel({ code }).save();
});

export const AccessModel = mongoose.model<Access, AccessModel>(
  'Access',
  schema
);

export interface SpecificAccess extends Access {
  code: string;
}

const specificAccessesSchema = new mongoose.Schema<SpecificAccess>({
  code: {
    type: 'string',
    unique: true,
    required: true,
    index: true,
  },
});

specificAccessesSchema.methods.accessList = function () {
  if (this.status === 'inactive') {
    return Promise.resolve([]);
  }
  return Promise.resolve([this.code]);
};

export const SpecificAccessModel = AccessModel.discriminator<
  SpecificAccess,
  // eslint-disable-next-line @typescript-eslint/ban-types
  Model<SpecificAccess, {}, AccessMethods>
>('SpecificAccess', specificAccessesSchema);

export interface AccessProfile extends Access {
  specificAccesses: Types.ObjectId[];
}

const accessProfileSchema = new mongoose.Schema<AccessProfile>({
  specificAccesses: [
    {
      type: Schema.Types.ObjectId,
      ref: 'SpecificAccess',
    },
  ],
});

accessProfileSchema.methods.accessList = async function () {
  if (this.status === 'inactive') {
    return Promise.resolve([]);
  }

  let specificAccesses = await SpecificAccessModel.find({
    _id: { $in: this.specificAccesses },
  });

  const fullAccessList = await Promise.all(
    specificAccesses.map((access) => {
      return access.accessList();
    })
  );

  return fullAccessList.flat().sort();
};

export const AccessProfileModel = AccessModel.discriminator<
  AccessProfile,
  // eslint-disable-next-line @typescript-eslint/ban-types
  Model<AccessProfile, {}, AccessMethods>
>('AccessProfile', accessProfileSchema);
