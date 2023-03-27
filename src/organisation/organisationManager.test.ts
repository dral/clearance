import initdb from 'src/db';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import {
  activateServiceAccount,
  addServiceAccountToOrganisation,
  addUserAccountToOrganisation,
  createUserAccountInExistingOrganisation,
  createUserAccountWithOrganisation,
  deactivateServiceAccount,
  deleteServiceAccount,
  leaveOrganisation,
} from './organisationManager';

describe('Manage organisation and users', () => {
  let dbServer: MongoMemoryServer;
  let connection: mongoose.Connection;

  beforeAll(async () => {
    dbServer = await MongoMemoryServer.create();
    // connection = await initdb(); // use persistent test db
    connection = await initdb(dbServer.getUri());
  });

  afterAll(async () => {
    await connection.close();
    await dbServer.stop();
  });

  it('should create a new userwith a new default organisation', async () => {
    const { user, organisation } = await createUserAccountWithOrganisation();
    expect(user).not.toBeNull();
    expect(user).toHaveProperty('organisations');
    expect(user?.organisations.length).toBe(1);

    expect(organisation).not.toBeNull();
    expect(organisation.status).toBe('active');
    expect(organisation.users.length).toBe(1);

    expect(user.isInOrganisation(organisation._id)).toBe(true);
    expect(organisation.hasUser(user._id)).toBe(true);
  });

  it('should create a new user on an existing organisation', async () => {
    const { user: initialUser, organisation } =
      await createUserAccountWithOrganisation();
    const { user: newUser, organisation: updatedOrganisation } =
      await createUserAccountInExistingOrganisation(organisation._id);

    expect(organisation._id).toEqual(updatedOrganisation._id);
    expect(initialUser._id).not.toEqual(newUser._id);
    expect(updatedOrganisation.hasUser(initialUser._id)).toBe(true);
    expect(updatedOrganisation.hasUser(newUser._id)).toBe(true);

    // check it didn't create other organisations
    expect(newUser.organisations.length).toBe(1);
  });

  it('should avoid adding a user twice to an organisation', async () => {
    const { user: initialUser, organisation } =
      await createUserAccountWithOrganisation();
    const { user: updatedUser, organisation: updatedOrganisation } =
      await addUserAccountToOrganisation(initialUser._id, organisation._id);

    expect(organisation._id).toEqual(updatedOrganisation._id);
    expect(updatedOrganisation.hasUser(updatedUser._id)).toBe(true);

    expect(updatedOrganisation.users.length).toBe(1);
    expect(updatedUser.organisations.length).toBe(1);
  });

  it('should remove an user from organisation', async () => {
    const { user, organisation } = await createUserAccountWithOrganisation();

    expect(user.isInOrganisation(organisation._id)).toBe(true);
    expect(organisation.hasUser(user._id)).toBe(true);

    const { user: updatedUser, organisation: updatedOrganisation } =
      await leaveOrganisation(user._id, organisation._id);

    expect(updatedUser.isInOrganisation(updatedOrganisation._id)).toBe(false);
    expect(updatedOrganisation.hasUser(updatedUser._id)).toBe(false);
  });

  it('should delete empty organisations', async () => {
    const { user, organisation } = await createUserAccountWithOrganisation();
    const { organisation: updatedOrganisation } = await leaveOrganisation(
      user._id,
      organisation._id
    );

    expect(updatedOrganisation.status).toBe('deleted');
  });

  it('should not remove user if not in organisation', async () => {
    const { user, organisation } = await createUserAccountWithOrganisation();
    const { user: user2, organisation: organisation2 } =
      await createUserAccountWithOrganisation();
    const { organisation: updatedOrganisation } = await leaveOrganisation(
      user._id,
      organisation2._id
    );

    expect(user.isInOrganisation(organisation._id)).toBe(true);
    expect(user2.isInOrganisation(organisation2._id)).toBe(true);
    expect(organisation.status).toBe('active');
    expect(updatedOrganisation.status).toBe('active');
  });

  it('should fail leaveOrganisation on wrong user or organisation ids', async () => {
    const { user, organisation } = await createUserAccountWithOrganisation();

    await expect(
      leaveOrganisation(
        organisation._id, // not an user id
        organisation._id
      )
    ).rejects.toThrow();

    await expect(
      leaveOrganisation(
        user._id,
        user._id // not an organisation id
      )
    ).rejects.toThrow();
  });

  it('should fail addUserToOrganisation on wrong user or organisation ids', async () => {
    const { user, organisation } = await createUserAccountWithOrganisation();

    await expect(
      addUserAccountToOrganisation(
        organisation._id, // not an user id
        organisation._id
      )
    ).rejects.toThrow();

    await expect(
      addUserAccountToOrganisation(
        user._id,
        user._id // not an organisation id
      )
    ).rejects.toThrow();
  });

  it('should fail createUserInExistingOrganisation on wrong organisation id', async () => {
    const { user } = await createUserAccountWithOrganisation();

    await expect(
      createUserAccountInExistingOrganisation(
        user._id // not an organisation id
      )
    ).rejects.toThrow();
  });
});

// grant access to an user
// grant access to a service
// add an owner to an organisation
// remove an owner of the organisation (avoid no owner)

describe('Manage organisation service accounts', () => {
  let dbServer: MongoMemoryServer;
  let connection: mongoose.Connection;

  beforeAll(async () => {
    dbServer = await MongoMemoryServer.create();
    // connection = await initdb(); // use persistent test db
    connection = await initdb(dbServer.getUri());
  });

  afterAll(() => {
    connection.close();
    dbServer.stop();
  });

  it('sould register a service for an organisation', async () => {
    const { organisation } = await createUserAccountWithOrganisation();
    const serviceName = 'new service';
    const { service, organisation: updatedOrganisation } =
      await addServiceAccountToOrganisation(serviceName, organisation._id);
    expect(updatedOrganisation.services.includes(service._id)).toBe(true);
    expect(service.organisation).toEqual(updatedOrganisation._id);
    expect(service.status).toBe('active');
    expect(service.name).toBe(serviceName);
  });

  it('sould deactivate a service for an organisation', async () => {
    const { organisation } = await createUserAccountWithOrganisation();
    const serviceName = 'new service';
    const { service } = await addServiceAccountToOrganisation(
      serviceName,
      organisation._id
    );

    const updatedService = await deactivateServiceAccount(service._id);
    expect(updatedService.status).toBe('inactive');
  });

  it('sould be idempotent for service deactivation', async () => {
    const { organisation } = await createUserAccountWithOrganisation();
    const serviceName = 'new service';
    const { service } = await addServiceAccountToOrganisation(
      serviceName,
      organisation._id
    );

    const updatedService = await deactivateServiceAccount(service._id);
    const deactivatedService = await deactivateServiceAccount(
      updatedService._id
    );
    expect(deactivatedService.status).toBe('inactive');
  });

  it('sould activate a previously deactivated service for an organisation', async () => {
    const { organisation } = await createUserAccountWithOrganisation();
    const serviceName = 'new service';
    const { service } = await addServiceAccountToOrganisation(
      serviceName,
      organisation._id
    );

    const updatedService = await deactivateServiceAccount(service._id);
    const reactivatedService = await activateServiceAccount(updatedService._id);
    expect(reactivatedService.status).toBe('active');
  });

  it('sould be idempotent for service activation', async () => {
    const { organisation } = await createUserAccountWithOrganisation();
    const serviceName = 'new service';
    const { service } = await addServiceAccountToOrganisation(
      serviceName,
      organisation._id
    );

    const activatedService = await activateServiceAccount(service._id);
    expect(activatedService.status).toBe('active');
  });

  it('sould delete a service for an organisation', async () => {
    const { organisation } = await createUserAccountWithOrganisation();
    const serviceName = 'new service';
    const { service } = await addServiceAccountToOrganisation(
      serviceName,
      organisation._id
    );

    const { service: updatedService, organisation: updatedOrganisation } =
      await deleteServiceAccount(service._id);

    expect(updatedService.status).toBe('deleted');
    expect(updatedOrganisation.hasService(updatedService._id)).toBe(false);
  });

  it('sould be idempotent for service deletion', async () => {
    const { organisation } = await createUserAccountWithOrganisation();
    const serviceName = 'new service';
    const { service } = await addServiceAccountToOrganisation(
      serviceName,
      organisation._id
    );

    await deleteServiceAccount(service._id);
    const { service: updatedService, organisation: updatedOrganisation } =
      await deleteServiceAccount(service._id);
    expect(updatedService.status).toBe('deleted');
    expect(updatedOrganisation.hasService(service._id)).toBe(false);
  });

  it('should fail adding service on wrong organisation id', async () => {
    const { user } = await createUserAccountWithOrganisation();

    await expect(
      addServiceAccountToOrganisation(
        'impossible service',
        user._id // not an organisation
      )
    ).rejects.toThrow();
  });

  it('should fail deactivating a service on wrong service id', async () => {
    const { organisation } = await createUserAccountWithOrganisation();
    const serviceName = 'new service';
    await addServiceAccountToOrganisation(serviceName, organisation._id);

    await expect(deactivateServiceAccount(organisation._id)).rejects.toThrow();
  });

  it('should fail deactivating a service on wrong service id', async () => {
    const { organisation } = await createUserAccountWithOrganisation();
    const serviceName = 'new service';
    await addServiceAccountToOrganisation(serviceName, organisation._id);

    await expect(activateServiceAccount(organisation._id)).rejects.toThrow();
  });

  it('should fail deleting a service on wrong service id', async () => {
    const { organisation } = await createUserAccountWithOrganisation();
    const serviceName = 'new service';
    await addServiceAccountToOrganisation(serviceName, organisation._id);

    await expect(deleteServiceAccount(organisation._id)).rejects.toThrow();
  });
});
