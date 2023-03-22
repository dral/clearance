import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  name: 'string',
});

export const Application = mongoose.model('Application', schema);
