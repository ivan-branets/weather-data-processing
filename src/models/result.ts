import _ from 'lodash';

const hrtimeConverter = hrtime => {
  const nanoseconds = (hrtime[0] * 1e9) + hrtime[1];
  const milliseconds = nanoseconds / 1e6;
  const seconds = nanoseconds / 1e9;

  return {
    seconds,
    milliseconds,
    nanoseconds
  };
};

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
    this.processingTime = `${hrtimeConverter(process.hrtime(start)).milliseconds} milliseconds`;
    this.pid = process.pid;
    this.meanTemperaturesByDate = meanTemperaturesByDate;
  }
}
