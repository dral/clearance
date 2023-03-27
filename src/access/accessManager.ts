// Register new access code
// List available access
// Deprecate an access
// Update access code
// Update access description
// Create an access profile
// Add/remove

import { Types } from 'mongoose';
import {
  AccessMethods,
  AccessModel,
  AccessProfile,
  AccessProfileModel,
  SpecificAccess,
} from './Access';
import { Grant, GrantModel } from './Grant';
import { GrantRecipientModel } from './GrantRecipient';

export const ensureAccessCodesExist = (
  ...codes: string[]
): Promise<SpecificAccess[]> => {
  return Promise.all(codes.map((code) => AccessModel.getAccessByCode(code)));
};

export const grantPermanentAccessToUserAccount = async (
  organisation: Types.ObjectId,
  userAccount: Types.ObjectId,
  access: Types.ObjectId
): Promise<Grant> => {
  let recipient = await GrantRecipientModel.getUserAccountRecipient(
    organisation,
    userAccount
  );
  return new GrantModel({
    type: 'permanent',
    recipient: recipient._id,
    access: access,
  }).save();
};

export const grantTemporarytAccessToUserAccount = async (
  expiresAt: Date,
  organisation: Types.ObjectId,
  userAccount: Types.ObjectId,
  access: Types.ObjectId
): Promise<Grant> => {
  let recipient = await GrantRecipientModel.getUserAccountRecipient(
    organisation,
    userAccount
  );
  return new GrantModel({
    type: 'temporary',
    expiresAt,
    recipient: recipient._id,
    access: access,
  }).save();
};

export const grantPermanentAccessToServiceAccount = async (
  serviceAccount: Types.ObjectId,
  access: Types.ObjectId
): Promise<Grant> => {
  let recipient = await GrantRecipientModel.getServiceAccountRecipient(
    serviceAccount
  );
  return new GrantModel({
    type: 'permanent',
    recipient: recipient._id,
    access,
  }).save();
};

export const grantTemporarytAccessToServiceAccount = async (
  expiresAt: Date,
  serviceAccount: Types.ObjectId,
  access: Types.ObjectId
): Promise<Grant> => {
  let recipient = await GrantRecipientModel.getServiceAccountRecipient(
    serviceAccount
  );
  return new GrantModel({
    type: 'temporary',
    expiresAt,
    recipient: recipient._id,
    access,
  }).save();
};

export const createAccessProfileFromCodes = async (
  description: string,
  ...codes: string[]
): Promise<AccessProfile & AccessMethods> => {
  const specificAccesses = await ensureAccessCodesExist(...codes);
  return new AccessProfileModel({
    description,
    specificAccesses: specificAccesses.map((access) => access._id),
  }).save();
};

export const grantHistory = async (recipient: Types.ObjectId) => {
  return GrantModel.find({ recipient }).populate('access');
};
