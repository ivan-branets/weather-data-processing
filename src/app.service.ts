import { Injectable } from '@nestjs/common';
import moment from 'moment';
import _ from 'lodash';
import { data } from './hourly.json';
import { Result } from './result';

@Injectable()
export class AppService {
  v1(): any {
    const start = new Date();

    const groupedByDate: { [day: string]: any[] } = {};
    const list = data.map(item => ({
      ...item,
      date: moment(item.time).format('YYYY-MM-DD')
    }));

    while (list.length > 0) {
      const currDate = list[0].date;

      groupedByDate[currDate] = [list[0]];
      list.splice(0, 1);

      for (let i = 0; i < list.length; i++) {
        const otherDate =list[i].date;

        if (currDate === otherDate) {
          groupedByDate[currDate].push(list[i]);

          list.splice(i, 1);
          i--;
        }
      }
    }

    const dates = Object.keys(groupedByDate);
    const meanTemperaturesByDate: { date: string, meanTemperature: number }[] =
      dates.map(date => {
        const temperaturesInOneDay = groupedByDate[date];
        return {
          date,
          meanTemperature: _.sumBy(temperaturesInOneDay, item => item.temperature) / temperaturesInOneDay.length
        }
      })

    return new Result(data.length, meanTemperaturesByDate, start);
  }

  v2(): any {
    const start = new Date();

    const groupedByDate: { [day: string]: any[] } = {};
    const list = data.map(item => ({
      ...item,
      date: moment(item.time).format('YYYY-MM-DD')
    }));

    for (let i = 0; i < list.length; i++) {
      if (list[i] === null) {
        continue;
      }

      const currDate = list[i].date;

      groupedByDate[currDate] = [list[i]];

      for (let j = i + 1; j < list.length; j++) {
        if (list[j] === null) {
          continue;
        }

        const otherDate = list[j].date;

        if (currDate === otherDate) {
          groupedByDate[currDate].push(list[j]);

          list[j] = null;
        }
      }
    }

    const dates = Object.keys(groupedByDate);
    const meanTemperaturesByDate: { date: string, meanTemperature: number }[] =
      dates.map(date => {
        const temperaturesInOneDay = groupedByDate[date];
        return {
          date,
          meanTemperature: _.sumBy(temperaturesInOneDay, item => item.temperature) / temperaturesInOneDay.length
        }
      })

    return new Result(data.length, meanTemperaturesByDate, start);
  }

  v3(): any {
    const start = new Date();

    const groupedByDate: { [day: string]: any[] } = {};

    data.forEach(item => {
      const date = moment(item.time).format('YYYY-MM-DD');

      groupedByDate[date] = groupedByDate[date] || [];
      groupedByDate[date].push(item);
    })

    const dates = Object.keys(groupedByDate);
    const meanTemperaturesByDate: { date: string, meanTemperature: number }[] =
      dates.map(date => {
        const temperaturesInOneDay = groupedByDate[date];
        return {
          date,
          meanTemperature: _.sumBy(temperaturesInOneDay, item => item.temperature) / temperaturesInOneDay.length
        }
      })

    return new Result(data.length, meanTemperaturesByDate, start);
  }

  v4(): any {
    const start = new Date();

    const groupedByDate: { [day: string]: any[] } =
      _.groupBy(data, item => moment(item.time).format('YYYY-MM-DD'));

    const dates = Object.keys(groupedByDate);

    const meanTemperaturesByDate: { date: string, meanTemperature: number }[] =
      dates.map(date => {
        const temperaturesInOneDay = groupedByDate[date];
        return {
          date,
          meanTemperature: _.meanBy(temperaturesInOneDay, item => item.temperature)
        }
      })

    return new Result(data.length, meanTemperaturesByDate, start);
  }

  v5(): any {
    const start = new Date();

    const groupedByDate: { [day: string]: any[] } =
      _.groupBy(data, item => item.time.substring(0, 10));

    const dates = Object.keys(groupedByDate);

    const meanTemperaturesByDate: { date: string, meanTemperature: number }[] =
      dates.map(date => {
        const temperaturesInOneDay = groupedByDate[date];
        return {
          date,
          meanTemperature: _.sumBy(temperaturesInOneDay, item => item.temperature) / temperaturesInOneDay.length
        }
      })

    return new Result(data.length, meanTemperaturesByDate, start);
  }
}
