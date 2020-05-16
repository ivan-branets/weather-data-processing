import { Injectable } from '@nestjs/common';
import moment from 'moment';
import _ from 'lodash';
import { data } from './hourly.json';

@Injectable()
export class AppService {
  getHello(): any {
    const start = new Date().getTime();

    const groupedByDate: { [day: string]: any[] } =
      _.groupBy(data,
        item => moment(item.time).format('YYYY-MM-DD')
      );

    const dates = Object.keys(groupedByDate);
    const averageTemperaturesByDate: { date: string, averageTemperature: number }[] =
      dates.map(date => {
        const temperaturesByDate = groupedByDate[date].map(item => item.temperature);
        return {
          date,
          averageTemperature: _.sum(temperaturesByDate) / temperaturesByDate.length
        }
      })

    const result = {
      length: data.length,
      processingTime: new Date().getTime() - start,
      averageTemperaturesByDate,
    };
    return result;
  }
}
