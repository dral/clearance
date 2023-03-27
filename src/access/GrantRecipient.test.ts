import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import initdb from 'src/db';
import {
  GrantRecipientModel,
  ServiceAccountRecipientModel,
  UserAccountRecipientModel,
} from './GrantRecipient';
import { UserAccount } from 'src/organisation/UserAccount';
import { Organisation } from 'src/organisation/Organisation';
import { ServiceAccount } from 'src/organisation/ServiceAccount';
import {
  addServiceAccountToOrganisation,
  createUserAccountWithOrganisation,
} from 'src/organisation/organisationManager';

describe('db connection', () => {
  let dbServer: MongoMemoryServer;
  let connection: mongoose.Connection;

  let defaultUserAccount: UserAccount;
  let defaultOrganisation: Organisation;
  let defaultServiceAccount: ServiceAccount;

  beforeAll(async () => {
    dbServer = await MongoMemoryServer.create();
    // connection = await initdb(); // use persistent test db
    connection = await initdb(dbServer.getUri());

    let { user, organisation } = await createUserAccountWithOrganisation();
    defaultUserAccount = user;
    defaultOrganisation = organisation;
    let { service } = await addServiceAccountToOrganisation(
      'some service',
      organisation._id
    );
    defaultServiceAccount = service;
  });

  afterAll(async () => {
    await connection.close();
    await dbServer.stop();
  });

  afterEach(async () => {
    // Clean after each test
    await GrantRecipientModel.deleteMany({});
  });

  it('should create a Grant recipient from an user in a given organisation', async () => {
    const userRecipient = await new UserAccountRecipientModel({
      organisation: defaultOrganisation._id,
      userAccount: defaultUserAccount._id,
    }).save();
    expect(userRecipient.userAccount).toBe(defaultUserAccount._id);
  });

  it('should fail creating a Grant recipient from an user without an organisation', async () => {
    await expect(() => {
      return new UserAccountRecipientModel({
        // organisation: defaultOrganisation._id,
        userAccount: defaultUserAccount._id,
      }).save();
    }).rejects.toThrow();
  });

  it('should fail creating a Grant recipient from an user without an user', async () => {
    await expect(() => {
      return new UserAccountRecipientModel({
        organisation: defaultOrganisation._id,
        // userAccount: defaultUser._id,
      }).save();
    }).rejects.toThrow();
  });

  it('should create a Grant recipient from an serviceAccount in a given organisation', async () => {
    const serviceAccountRecipient = await new ServiceAccountRecipientModel({
      serviceAccount: defaultServiceAccount._id,
    }).save();
    expect(serviceAccountRecipient.serviceAccount).toBe(
      defaultServiceAccount._id
    );
  });

  it('should fail creating a Grant recipient from a service account without an service account', async () => {
    await expect(() => {
      return new ServiceAccountRecipientModel({
        // serviceAccount: defaultServiceAccount._id,
      }).save();
    }).rejects.toThrow();
  });

  it('should get a userAccount recipient from its id and organisation', async () => {
    const userRecipient = await new UserAccountRecipientModel({
      organisation: defaultOrganisation._id,
      userAccount: defaultUserAccount._id,
    }).save();

    const foundRecipient = await GrantRecipientModel.getUserAccountRecipient(
      defaultOrganisation._id,
      defaultUserAccount._id
    );
    expect(foundRecipient._id).toEqual(userRecipient._id);
  });

  it('should create a new userAccount recipient if none exist', async () => {
    const foundRecipient = await GrantRecipientModel.getUserAccountRecipient(
      defaultOrganisation._id,
      defaultUserAccount._id
    );
    expect(foundRecipient._id).not.toBeNull();
  });

  it('should not create a new userAccount recipient twice', async () => {
    const firstRecipient = await GrantRecipientModel.getUserAccountRecipient(
      defaultOrganisation._id,
      defaultUserAccount._id
    );
    const secondRecipient = await GrantRecipientModel.getUserAccountRecipient(
      defaultOrganisation._id,
      defaultUserAccount._id
    );
    expect(firstRecipient._id).toEqual(secondRecipient._id);
  });

  it('should get a serviceAccount recipient from its id', async () => {
    const serviceAccountRecipient = await new ServiceAccountRecipientModel({
      serviceAccount: defaultServiceAccount._id,
    }).save();

    const foundRecipient = await GrantRecipientModel.getServiceAccountRecipient(
      defaultServiceAccount._id
    );

    expect(foundRecipient._id).toEqual(serviceAccountRecipient._id);
  });

  it('should create a new serviceAccount recipient if none exist', async () => {
    const foundRecipient = await GrantRecipientModel.getServiceAccountRecipient(
      defaultServiceAccount._id
    );
    expect(foundRecipient._id).not.toBeNull();
  });

  it('should not create a new serviceAccount recipient twice', async () => {
    const firstRecipient = await GrantRecipientModel.getServiceAccountRecipient(
      defaultServiceAccount._id
    );
    const secondRecipient =
      await GrantRecipientModel.getServiceAccountRecipient(
        defaultServiceAccount._id
      );
    expect(firstRecipient._id).toEqual(secondRecipient._id);
  });
});
