import mongoose, { Types, Schema, Model } from 'mongoose';
import { AccessModel } from './Access';

export interface Grant {
  _id: Types.ObjectId;
  recipient: Types.ObjectId;
  access: Types.ObjectId;
  accessProfile: Types.ObjectId;
  type: 'permanent' | 'temporary';
  status: 'active' | 'revoked';
  expiresAt: Date;
}

interface GrantModel extends Model<Grant> {
  findGrantsForRecipient(
    recipient: Types.ObjectId,
    date?: Date
  ): Promise<Grant[]>;
  findAccessForRecipient(
    recipient: Types.ObjectId,
    date?: Date
  ): Promise<string[]>;
}

const schema = new Schema<Grant, GrantModel>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'GrantRecipient',
      required: true,
      index: true,
    },
    access: {
      type: Schema.Types.ObjectId,
      ref: 'Access',
    },
    type: {
      type: 'string',
      enum: ['permanent', 'temporary'],
      required: true,
    },
    status: {
      type: 'string',
      enum: ['active', 'revoked'],
      default: 'active',
      required: true,
    },
    expiresAt: {
      type: 'date',
    },
  },
  { timestamps: true }
);

schema.static(
  'findGrantsForRecipient',
  async function (recipient: Types.ObjectId, asOf: Date = new Date()) {
    return GrantModel.find({
      recipient,
      status: 'active',
      $or: [
        {
          $and: [{ type: 'temporary' }, { expiresAt: { $gt: asOf } }],
        },
        { type: 'permanent' },
      ],
    });
  }
);

schema.static(
  'findAccessForRecipient',
  async function (
    recipient: Types.ObjectId,
    asOf: Date = new Date()
  ): Promise<string[]> {
    const activeGrants = await GrantModel.findGrantsForRecipient(
      recipient,
      asOf
    );
    let accessIds = activeGrants.map((grant) => grant.access);
    let accesses = await AccessModel.find({ _id: { $in: accessIds } });
    const fullAccessList = await Promise.all(
      accesses.map((access) => {
        return access.accessList();
      })
    );

    return fullAccessList.flat().sort();
  }
);

export const GrantModel = mongoose.model<Grant, GrantModel>('Grant', schema);
