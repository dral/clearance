import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import initdb from 'src/db';
import {
  GrantRecipientModel,
  ServiceGrantRecipient,
  ServiceGrantRecipientModel,
  UserGrantRecipient,
  UserGrantRecipientModel,
} from './GrantRecipient';
import { UserAccount } from 'src/organisation/UserAccount';
import { Organisation } from 'src/organisation/Organisation';
import { ServiceAccount } from 'src/organisation/ServiceAccount';
import {
  addServiceToOrganisation,
  createUserWithOrganisation,
} from 'src/organisation/service';
import {
  AccessModel,
  AccessProfile,
  AccessProfileModel,
  SpecificAccess,
  SpecificAccessModel,
} from './Access';
import { GrantModel } from './Grant';

describe('db connection', () => {
  let dbServer: MongoMemoryServer;
  let connection: mongoose.Connection;

  let defaultUser: UserAccount;
  let defaultOrganisation: Organisation;
  let defaultServiceAccount: ServiceAccount;

  let userRecipient: UserGrantRecipient;
  let serviceRecipient: ServiceGrantRecipient;

  let access1: SpecificAccess;
  let access2: SpecificAccess;
  let access3: SpecificAccess;
  let accessProfile: AccessProfile;

  beforeAll(async () => {
    dbServer = await MongoMemoryServer.create();
    connection = await initdb(); // use persistent test db
    // connection = await initdb(dbServer.getUri());

    let { user, organisation } = await createUserWithOrganisation();
    defaultUser = user;
    defaultOrganisation = organisation;
    let { service } = await addServiceToOrganisation(
      'some service',
      organisation._id
    );
    defaultServiceAccount = service;

    access1 = await new SpecificAccessModel({ code: 'access1' }).save();
    access2 = await new SpecificAccessModel({ code: 'access2' }).save();
    access3 = await new SpecificAccessModel({ code: 'access3' }).save();

    accessProfile = await new AccessProfileModel({
      specificAccesses: [access2._id, access3._id],
    }).save();

    userRecipient = await new UserGrantRecipientModel({
      organisation: defaultOrganisation._id,
      userAccount: defaultUser._id,
    }).save();

    serviceRecipient = await new ServiceGrantRecipientModel({
      serviceAccount: defaultServiceAccount._id,
    }).save();
  });

  afterAll(async () => {
    await AccessModel.deleteMany({});
    await GrantRecipientModel.deleteMany({});
    connection.close();
    dbServer.stop();
  });

  afterEach(async () => {
    // Clean after each test
    await GrantModel.deleteMany({});
  });

  it('should create a grant for an user', async () => {
    const userGrant = await new GrantModel({
      recipient: userRecipient._id,
      access: access1._id,
    });

    expect(userGrant.access).toBe(access1._id);
    expect(userGrant.recipient).toBe(userRecipient._id);
  });

  it('should find all grants for an user', async () => {
    const userGrant1 = await new GrantModel({
      recipient: userRecipient._id,
      access: access1._id,
      type: 'permanent',
    }).save();
    const userGrant2 = await new GrantModel({
      recipient: userRecipient._id,
      access: accessProfile._id,
      type: 'permanent',
    }).save();

    // another grant
    await new GrantModel({
      recipient: serviceRecipient._id, // not the same recipient
      access: access1._id,
      type: 'permanent',
    }).save();

    let userGrants = await GrantModel.findGrantsForRecipient(userRecipient._id);

    expect(userGrants.length).toBe(2);

    expect(userGrants.map((grant) => grant._id)).toMatchObject([
      userGrant1._id,
      userGrant2._id,
    ]);
  });

  it('should find all accesses for an user', async () => {
    const userGrant1 = await new GrantModel({
      recipient: userRecipient._id,
      access: access1._id,
      type: 'permanent',
    }).save();
    const userGrant2 = await new GrantModel({
      recipient: userRecipient._id,
      access: accessProfile._id,
      type: 'permanent',
    }).save();

    // another grant
    await new GrantModel({
      recipient: serviceRecipient._id, // not the same recipient
      access: access1._id,
      type: 'permanent',
    }).save();

    let userAccess = await GrantModel.findAccessForRecipient(userRecipient._id);
    expect(userAccess).toMatchObject(['access1', 'access2', 'access3']);
  });
});
