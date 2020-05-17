import _ from 'lodash';

export class Result {
  readonly length: number;
  readonly meanTemperaturesByDate: any;
  readonly memoryUsed: string;
  readonly processingTime: string;

  constructor(
    length: number,
    meanTemperaturesByDate: any,
    start: Date
  ) {
    this.length = length;
    this.memoryUsed = `${_.round(process.memoryUsage().heapUsed / 1024 / 1024, 2)}Mb`;
    this.processingTime = `${new Date().getTime() - start.getTime()}ms`;
    this.meanTemperaturesByDate = meanTemperaturesByDate;
  }
}
