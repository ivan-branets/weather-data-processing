import _ from 'lodash';
import { hrtimeConverter } from '../common';

export class Result {
  readonly count: number;
  readonly meanTemperaturesByDate: any;
  readonly memoryUsed: string;
  readonly processingTime: string;
  readonly pid: number;

  constructor(
    length: number,
    meanTemperaturesByDate: any,
    start: [number, number]
  ) {
    this.count = length;
    this.memoryUsed = `${_.round(process.memoryUsage().heapUsed / 1024 / 1024, 2)}Mb`;
    this.processingTime = `${_.round(hrtimeConverter(process.hrtime(start)).milliseconds, 2)} ms`;
    this.pid = process.pid;
    this.meanTemperaturesByDate = meanTemperaturesByDate;
  }
}
