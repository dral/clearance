import initdb from 'src/db';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Application } from './Application';

describe('db connection', () => {
  let dbServer: MongoMemoryServer;
  let connection: mongoose.Connection;

  beforeAll(async () => {
    dbServer = await MongoMemoryServer.create();
    connection = await initdb(dbServer.getUri());
  });

  afterAll(() => {
    connection.close();
    dbServer.stop();
  });

  it('should insert a doc into collection', async () => {
    const mockUser = { name: 'John' };
    const user = new Application(mockUser);
    const { _id } = await user.save();

    const insertedUser = await Application.findOne({ _id });
    expect(insertedUser).toMatchObject(mockUser);
  });
});
