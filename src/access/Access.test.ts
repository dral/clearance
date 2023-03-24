import { AccessModel, AccessProfileModel, SpecificAccessModel } from './Access';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import initdb from '../db';

describe('db connection', () => {
  let dbServer: MongoMemoryServer;
  let connection: mongoose.Connection;

  beforeAll(async () => {
    dbServer = await MongoMemoryServer.create();
    connection = await initdb(); // use persistent test db
    // connection = await initdb(dbServer.getUri());
  });

  afterAll(() => {
    connection.close();
    dbServer.stop();
  });

  afterEach(async () => {
    // Clean after each test
    await AccessModel.deleteMany({});
  });

  it('should create a specific access', async () => {
    const accessCode = 'toto';
    let specificAccess = await new SpecificAccessModel({
      code: accessCode,
    }).save();
    expect(await specificAccess.accessList()).toMatchObject([accessCode]);
  });

  it('should not consider if inactive', async () => {
    const accessCode = 'toto';
    let specificAccess = await new SpecificAccessModel({
      code: accessCode,
      status: 'inactive',
    }).save();
    expect(await specificAccess.accessList()).toMatchObject([]);
  });

  it('should fail creating a specific access with an existing code', async () => {
    const accessCode = 'toto';
    await new SpecificAccessModel({
      code: accessCode,
    }).save();

    await expect(() => {
      return new SpecificAccessModel({
        code: accessCode,
      }).save();
    }).rejects.toThrow();
  });

  it('should create an access profile', async () => {
    const accessCode1 = 'toto';
    let specificAccess1 = await new SpecificAccessModel({
      code: accessCode1,
    }).save();

    const accessCode2 = 'titi';
    let specificAccess2 = await new SpecificAccessModel({
      code: accessCode2,
    }).save();

    let accessProfile = await new AccessProfileModel({
      specificAccesses: [specificAccess1._id, specificAccess2._id],
    });

    expect((await accessProfile.accessList()).sort()).toMatchObject(
      [accessCode1, accessCode2].sort()
    );
  });

  it('should get the correct access list for an access profile if called generically', async () => {
    const accessCode1 = 'toto';
    let specificAccess1 = await new SpecificAccessModel({
      code: accessCode1,
    }).save();

    const accessCode2 = 'titi';
    let specificAccess2 = await new SpecificAccessModel({
      code: accessCode2,
    }).save();

    let accessProfile = await new AccessProfileModel({
      specificAccesses: [specificAccess1._id, specificAccess2._id],
    }).save();

    let genericAccess = await AccessModel.findById(accessProfile._id);

    if (genericAccess === null) {
      return expect(true).toBe(false);
    }

    expect((await genericAccess.accessList()).sort()).toMatchObject(
      [accessCode1, accessCode2].sort()
    );
  });

  it('should not include inactive codes', async () => {
    const accessCode1 = 'toto';
    let specificAccess1 = await new SpecificAccessModel({
      code: accessCode1,
    }).save();

    const accessCode2 = 'titi';
    let specificAccess2 = await new SpecificAccessModel({
      code: accessCode2,
      status: 'inactive',
    }).save();

    let accessProfile = await new AccessProfileModel({
      specificAccesses: [specificAccess1._id, specificAccess2._id],
    }).save();

    let genericAccess = await AccessModel.findById(accessProfile._id);

    if (genericAccess === null) {
      return expect(true).toBe(false);
    }

    expect((await genericAccess.accessList()).sort()).toMatchObject(
      [accessCode1].sort()
    );
  });

  it('should reflect specific codes changes on profile access', async () => {
    const accessCode1 = 'toto';
    let specificAccess1 = await new SpecificAccessModel({
      code: accessCode1,
    }).save();

    const accessCode2 = 'titi';
    let specificAccess2 = await new SpecificAccessModel({
      code: accessCode2,
    }).save();

    let accessProfile = await new AccessProfileModel({
      specificAccesses: [specificAccess1._id, specificAccess2._id],
    }).save();

    // update code for specificAcces2
    const updatedCode2 = 'tutu';
    specificAccess2.code = updatedCode2;
    await specificAccess2.save();

    expect((await accessProfile.accessList()).sort()).toMatchObject(
      [accessCode1, updatedCode2].sort()
    );
  });
});
