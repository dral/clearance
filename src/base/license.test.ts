import api, { infos, licenceCount } from './licence';
import project from 'src/../package.json';
import { setupServer } from 'src/server';
import request from 'supertest';

describe('licence report', () => {
  it('should initialize licences only once', async () => {
    let report = await infos.getReport();
    let report2 = await infos.getReport();
    expect(report).toBe(report2);
  });

  it('should get self package licence', async () => {
    let { name, version, license } = project;

    let self = await infos.getSelf();
    expect(self.name).toMatch(name);
    expect(self.version).toMatch(version);
    expect(self.licenses).toMatch(license);
  });

  it('should sumarize licences per type', async () => {
    let report = await infos.getReport();
    let summary = licenceCount(report);
    let { name, version, license, description } = project;

    expect(summary).toHaveProperty(license);
    expect(summary[license]).toContainEqual({
      name,
      version,
      description,
    });
  });

  it('should get the compiled summary from the info object', async () => {
    let report = await infos.getReport();
    let computedSummary = licenceCount(report);
    let summary = await infos.getSummary();

    expect(summary).toEqual(computedSummary);
  });

  it('should not have any unknown licences', async () => {
    let summary = await infos.getSummary();

    expect(summary).toHaveProperty('unknown');
    expect(summary.unknown).toHaveLength(0);
  });
});

describe('licence api', () => {
  const server = setupServer(api);

  it('should get report', async () => {
    let report = await infos.getReport();
    return request(server)
      .get('/licenses')
      .expect(200)
      .expect('Content-Type', /json/)
      .then((res) => {
        expect(res.body).toMatchObject(report);
      });
  });

  it('should get self licence', async () => {
    let self = await infos.getSelf();
    return request(server)
      .get('/license')
      .expect(200)
      .expect('Content-Type', /json/)
      .then((res) => {
        expect(res.body).toMatchObject(self);
      });
  });

  it('should get licences summary', async () => {
    let summary = await infos.getSummary();
    return request(server)
      .get('/licenses/summary')
      .expect(200)
      .expect('Content-Type', /json/)
      .then((res) => {
        expect(res.body).toMatchObject(summary);
      });
  });
});
