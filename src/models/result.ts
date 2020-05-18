import _ from 'lodash';

export class Result {
  readonly count: number;
  readonly meanTemperaturesByDate: any;
  readonly memoryUsed: string;
  readonly processingTime: string;
  readonly pid: number;

  constructor(
    length: number,
    meanTemperaturesByDate: any,
    start: Date
  ) {
    this.count = length;
    this.memoryUsed = `${_.round(process.memoryUsage().heapUsed / 1024 / 1024, 2)}Mb`;
    this.processingTime = `${new Date().getTime() - start.getTime()}ms`;
    this.pid = process.pid;
    this.meanTemperaturesByDate = meanTemperaturesByDate;
  }
}
