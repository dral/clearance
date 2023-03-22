// create a new user, either with an existing organisation
// or with a new default organisation
// grant access to an user
// register a service for an organisation
// grant access to a service
// remove a service
// add an owner to an organisation
// remove an owner of the organisation (avoid no owner)
// remove an user from the organisation

import { Types } from 'mongoose';
import { UserAccountModel } from './UserAccount';
import { OrganisationModel } from './Organisation';
import { ServiceAccountModel } from './ServiceAccount';

// User management

export const addUserToOrganisation = async (
  userId: Types.ObjectId,
  organisationId: Types.ObjectId
) => {
  let user = await UserAccountModel.findById(userId);
  let organisation = await OrganisationModel.findById(organisationId);

  if (!user || !organisation) {
    throw new Error(
      `Expecting user and organisation to exist. user:${userId} organisation:${organisationId}`
    );
  }

  const updatedUser = await user.addToOrganisation(organisationId);
  const updatedOrganisation = await organisation.addUser(userId);

  return {
    user: updatedUser,
    organisation: updatedOrganisation,
  };
};

export const createUserWithOrganisation = async () => {
  let user = await new UserAccountModel().save();
  let organisation = await new OrganisationModel({ name: 'default' }).save();

  return addUserToOrganisation(user._id, organisation._id);
};

export const createUserInExistingOrganisation = async (
  organisationId: Types.ObjectId
) => {
  let user = await new UserAccountModel().save();

  return addUserToOrganisation(user._id, organisationId);
};

export const leaveOrganisation = async (
  userId: Types.ObjectId,
  organisationId: Types.ObjectId
) => {
  let user = await UserAccountModel.findById(userId);
  let organisation = await OrganisationModel.findById(organisationId);

  if (!user || !organisation) {
    throw new Error(
      `Expecting user and organisation to exist. user:${user} organisation:${organisation}`
    );
  }

  const updatedUser = await user.leaveOrganisation(organisationId);
  const updatedOrganisation = await organisation.removeUser(userId);

  return {
    user: updatedUser,
    organisation: updatedOrganisation,
  };
};

// Service management

export const addServiceToOrganisation = async (
  name: string,
  organisationId: Types.ObjectId
) => {
  let organisation = await OrganisationModel.findById(organisationId);

  if (!organisation) {
    throw new Error(
      `Expecting organisation to exist. organisation:${organisationId}`
    );
  }

  const service = await new ServiceAccountModel({
    name,
    organisation: organisationId,
  }).save();

  const updatedOrganisation = await organisation.addService(service._id);

  return {
    service,
    organisation: updatedOrganisation,
  };
};

export const deactivateService = async (serviceId: Types.ObjectId) => {
  let service = await ServiceAccountModel.findById(serviceId);

  if (!service) {
    throw new Error(
      `Expecting service account to exist. service account:${serviceId}`
    );
  }
  return service.deactivate();
};

export const activateService = async (serviceId: Types.ObjectId) => {
  let service = await ServiceAccountModel.findById(serviceId);

  if (!service) {
    throw new Error(
      `Expecting service account to exist. service account:${serviceId}`
    );
  }
  return service.activate();
};

export const deleteService = async (serviceId: Types.ObjectId) => {
  let service = await ServiceAccountModel.findById(serviceId);

  if (!service) {
    throw new Error(
      `Expecting service account to exist. service account:${serviceId}`
    );
  }

  let organisation = await OrganisationModel.findById(service.organisation);
  if (!organisation) {
    throw new Error(
      `Unexpected missing organisation for service. service:${serviceId} organisation:${service.organisation}`
    );
  }

  const updatedOrganisation = await organisation.deleteService(serviceId);
  const updatedService = await service.delete();

  return {
    service: updatedService,
    organisation: updatedOrganisation,
  };
};
