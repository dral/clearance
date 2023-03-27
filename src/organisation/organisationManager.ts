// create a new user, either with an existing organisation
// or with a new default organisation
// register a service for an organisation
// remove a service

// add an owner to an organisation
// remove an owner of the organisation (avoid no owner)
// remove an user from the organisation

import { Types } from 'mongoose';
import { UserAccountModel } from './UserAccount';
import { OrganisationModel } from './Organisation';
import { ServiceAccountModel } from './ServiceAccount';

// User management

export const addUserAccountToOrganisation = async (
  userAccount: Types.ObjectId,
  organisation: Types.ObjectId
) => {
  let foundUserAccount = await UserAccountModel.findById(userAccount);
  let foundOrganisation = await OrganisationModel.findById(organisation);

  if (!foundUserAccount || !foundOrganisation) {
    throw new Error(
      `Expecting user and organisation to exist. user:${userAccount} organisation:${organisation}`
    );
  }

  const updatedUser = await foundUserAccount.addToOrganisation(organisation);
  const updatedOrganisation = await foundOrganisation.addUser(userAccount);

  return {
    user: updatedUser,
    organisation: updatedOrganisation,
  };
};

export const createUserAccountWithOrganisation = async () => {
  let user = await new UserAccountModel().save();
  let organisation = await new OrganisationModel({ name: 'default' }).save();

  return addUserAccountToOrganisation(user._id, organisation._id);
};

export const createUserAccountInExistingOrganisation = async (
  organisation: Types.ObjectId
) => {
  let user = await new UserAccountModel().save();

  return addUserAccountToOrganisation(user._id, organisation);
};

export const leaveOrganisation = async (
  userAccount: Types.ObjectId,
  organisation: Types.ObjectId
) => {
  let foundUserAccount = await UserAccountModel.findById(userAccount);
  let foundOrganisation = await OrganisationModel.findById(organisation);

  if (!foundUserAccount || !foundOrganisation) {
    throw new Error(
      `Expecting user and organisation to exist. user:${foundUserAccount} organisation:${foundOrganisation}`
    );
  }

  const updatedUser = await foundUserAccount.leaveOrganisation(organisation);
  const updatedOrganisation = await foundOrganisation.removeUser(userAccount);

  return {
    user: updatedUser,
    organisation: updatedOrganisation,
  };
};

// Service management

export const addServiceAccountToOrganisation = async (
  name: string,
  organisation: Types.ObjectId
) => {
  let foundOrganisation = await OrganisationModel.findById(organisation);

  if (!foundOrganisation) {
    throw new Error(
      `Expecting organisation to exist. organisation:${organisation}`
    );
  }

  const serviceAccount = await new ServiceAccountModel({
    name,
    organisation,
  }).save();

  const updatedOrganisation = await foundOrganisation.addService(
    serviceAccount._id
  );

  return {
    service: serviceAccount,
    organisation: updatedOrganisation,
  };
};

export const deactivateServiceAccount = async (
  serviceAccount: Types.ObjectId
) => {
  let foundServiceAccount = await ServiceAccountModel.findById(serviceAccount);

  if (!foundServiceAccount) {
    throw new Error(
      `Expecting service account to exist. service account:${serviceAccount}`
    );
  }
  return foundServiceAccount.deactivate();
};

export const activateServiceAccount = async (
  serviceAccount: Types.ObjectId
) => {
  let foundServiceAccount = await ServiceAccountModel.findById(serviceAccount);

  if (!foundServiceAccount) {
    throw new Error(
      `Expecting service account to exist. service account:${serviceAccount}`
    );
  }
  return foundServiceAccount.activate();
};

export const deleteServiceAccount = async (serviceAccount: Types.ObjectId) => {
  let foundServiceAccount = await ServiceAccountModel.findById(serviceAccount);

  if (!foundServiceAccount) {
    throw new Error(
      `Expecting service account to exist. service account:${serviceAccount}`
    );
  }

  let foundOrganisation = await OrganisationModel.findById(
    foundServiceAccount.organisation
  );
  if (!foundOrganisation) {
    throw new Error(
      `Unexpected missing organisation for service. service:${serviceAccount} organisation:${foundServiceAccount.organisation}`
    );
  }

  const updatedOrganisation = await foundOrganisation.deleteService(
    serviceAccount
  );
  const updatedService = await foundServiceAccount.delete();

  return {
    service: updatedService,
    organisation: updatedOrganisation,
  };
};
