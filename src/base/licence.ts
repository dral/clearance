import checker, { ModuleInfo } from 'license-checker';
import logger from 'src/logger';
import express from 'express';
import project from 'src/../package.json';

const { name, version } = project;

let defaultOptions: checker.InitOpts = {
  start: '.',
  production: true,
  excludePrivatePackages: true,
  relativeLicensePath: true,
  customFormat: {
    name: true,
    version: true,
    description: true,
    licenses: true,
    copyright: '',
    licenseFile: false,
    licenseText: false,
    licenseModified: 'no',
    path: false,
  },
};

class licenseInfo {
  report: checker.ModuleInfos = {};
  licenceCountPerType: Record<string, object[]> = {};
  self: ModuleInfo = {};
  options: checker.InitOpts;
  initialized: boolean;

  constructor(options = defaultOptions) {
    this.options = options;
    this.initialized = false;
  }

  init() {
    return new Promise((accept, reject) => {
      checker.init(this.options, (err, packages) => {
        if (err) {
          logger.error('Unable to compile licence report');
          reject(err);
        }
        this.report = packages;
        this.licenceCountPerType = licenceCount(this.report);
        this.self = this.report[`${name}@${version}`];
        this.initialized = true;
        accept(this);
      });
    });
  }

  async getSelf() {
    if (this.initialized) {
      return Promise.resolve(this.self);
    }
    await this.init();
    return this.self;
  }

  async getReport() {
    if (this.initialized) {
      return Promise.resolve(this.report);
    }
    await this.init();
    return this.report;
  }

  async getSummary() {
    if (this.initialized) {
      return Promise.resolve(this.licenceCountPerType);
    }
    await this.init();
    return this.licenceCountPerType;
  }
}

export const infos = new licenseInfo();

/**
 * @openapi
 * /license:
 *   get:
 *     description: Get the license of this project
 *     responses:
 *       200:
 *         description: This project's licence
 */
export const selfLicense = async (
  _: express.Request,
  res: express.Response
) => {
  const self = await infos.getSelf();
  return res.json(self);
};

/**
 * @openapi
 * /licenses:
 *   get:
 *     description: Get the complete list of licenses used
 *     responses:
 *       200:
 *         description: Returns the production packages licence report
 */
export const licenses = async (_: express.Request, res: express.Response) => {
  const report = await infos.getReport();
  return res.json(report);
};

/**
 * @openapi
 * /licenses/summary:
 *   get:
 *     description: Get a summary of dependencies per license type
 *     responses:
 *       200:
 *         description: Returns the production packages licence summary
 */
export const summary = async (_: express.Request, res: express.Response) => {
  const summary = await infos.getSummary();
  return res.json(summary);
};

const router = express.Router();

router.get('/license', selfLicense);
router.get('/licenses', licenses);
router.get('/licenses/summary', summary);

export default router;

export const licenceCount = (
  report: checker.ModuleInfos
): Record<string, object[]> => {
  let counter: Record<string, object[]> = { unknown: [] };

  Object.values(report).forEach((moduleInfo) => {
    const { licenses, name, version, description } = moduleInfo;
    const info = { name, version, description };
    if (!licenses) {
      counter.unknown.push(info);
    } else if (typeof licenses === 'string') {
      counter[licenses] = counter[licenses] || [];
      counter[licenses].push(info);
    } else {
      licenses.forEach((license) => {
        counter[license] = counter[license] || [];
        counter[license].push(info);
      });
    }
  });
  return counter;
};
