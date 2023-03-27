import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import initdb from 'src/db';
import { UserAccount } from 'src/organisation/UserAccount';
import { Organisation } from 'src/organisation/Organisation';
import { ServiceAccount } from 'src/organisation/ServiceAccount';
import {
  addServiceAccountToOrganisation,
  createUserAccountWithOrganisation,
} from 'src/organisation/organisationManager';
import { AccessModel } from './Access';
import { GrantRecipientModel } from './GrantRecipient';
import { GrantModel } from './Grant';
import {
  createAccessProfileFromCodes,
  grantPermanentAccessToServiceAccount,
  grantPermanentAccessToUserAccount,
  grantTemporarytAccessToServiceAccount,
  grantTemporarytAccessToUserAccount,
} from './accessManager';

describe('db connection', () => {
  let dbServer: MongoMemoryServer;
  let connection: mongoose.Connection;

  let defaultUser: UserAccount;
  let defaultOrganisation: Organisation;
  let defaultServiceAccount: ServiceAccount;

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const afterTomorrow = new Date(tomorrow);
  afterTomorrow.setDate(afterTomorrow.getDate() + 1);

  beforeAll(async () => {
    dbServer = await MongoMemoryServer.create();
    // connection = await initdb(); // use persistent test db
    connection = await initdb(dbServer.getUri());

    let { user, organisation } = await createUserAccountWithOrganisation();
    defaultUser = user;
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
    await AccessModel.deleteMany({});
    await GrantRecipientModel.deleteMany({});
    await GrantModel.deleteMany({});
  });

  it('should create an access profile from a list of codes', async () => {
    const codes = [
      'someResource.list',
      'someResource.write',
      'someAction.execute',
    ];
    const profile = await createAccessProfileFromCodes(
      'resource owner',
      ...codes
    );

    const accessList = await profile.accessList();

    expect(accessList).toMatchObject(codes.sort());
  });

  it('should grant a permanent access profile', async () => {
    const codes = [
      'someResource.list',
      'someResource.write',
      'someAction.execute',
    ];
    const profile = await createAccessProfileFromCodes(
      'resource owner',
      ...codes
    );

    await grantPermanentAccessToUserAccount(
      defaultOrganisation._id,
      defaultUser._id,
      profile._id
    );

    const recipient = await GrantRecipientModel.getUserAccountRecipient(
      defaultOrganisation._id,
      defaultUser._id
    );

    let accessList = await GrantModel.findAccessForRecipient(recipient._id);

    expect(accessList).toMatchObject(codes.sort());
  });

  it('should grant a temporary access profile', async () => {
    const codes = [
      'someResource.list',
      'someResource.write',
      'someAction.execute',
    ];
    const profile = await createAccessProfileFromCodes(
      'resource owner',
      ...codes
    );

    await grantTemporarytAccessToUserAccount(
      tomorrow,
      defaultOrganisation._id,
      defaultUser._id,
      profile._id
    );

    const recipient = await GrantRecipientModel.getUserAccountRecipient(
      defaultOrganisation._id,
      defaultUser._id
    );

    let todayAccessList = await GrantModel.findAccessForRecipient(
      recipient._id,
      now
    );
    let tomorrowAccessList = await GrantModel.findAccessForRecipient(
      recipient._id,
      tomorrow
    );
    let afterTomorrowAccessList = await GrantModel.findAccessForRecipient(
      recipient._id,
      afterTomorrow
    );

    expect(todayAccessList).toMatchObject(codes.sort());
    expect(tomorrowAccessList).toMatchObject([]);
    expect(afterTomorrowAccessList).toMatchObject([]);
  });

  it('should grant a permanent access profile to service account', async () => {
    const codes = [
      'someResource.list',
      'someResource.write',
      'someAction.execute',
    ];
    const profile = await createAccessProfileFromCodes(
      'resource owner',
      ...codes
    );

    await grantPermanentAccessToServiceAccount(
      defaultServiceAccount._id,
      profile._id
    );

    const recipient = await GrantRecipientModel.getServiceAccountRecipient(
      defaultServiceAccount._id
    );

    let accessList = await GrantModel.findAccessForRecipient(recipient._id);

    expect(accessList).toMatchObject(codes.sort());
  });

  it('should grant a temporary access profile', async () => {
    const codes = [
      'someResource.list',
      'someResource.write',
      'someAction.execute',
    ];
    const profile = await createAccessProfileFromCodes(
      'resource owner',
      ...codes
    );

    await grantTemporarytAccessToServiceAccount(
      tomorrow,
      defaultServiceAccount._id,
      profile._id
    );

    const recipient = await GrantRecipientModel.getServiceAccountRecipient(
      defaultServiceAccount._id
    );

    let todayAccessList = await GrantModel.findAccessForRecipient(
      recipient._id,
      now
    );
    let tomorrowAccessList = await GrantModel.findAccessForRecipient(
      recipient._id,
      tomorrow
    );
    let afterTomorrowAccessList = await GrantModel.findAccessForRecipient(
      recipient._id,
      afterTomorrow
    );

    expect(todayAccessList).toMatchObject(codes.sort());
    expect(tomorrowAccessList).toMatchObject([]);
    expect(afterTomorrowAccessList).toMatchObject([]);
  });
});
