import { Injectable } from '@nestjs/common';
import moment from 'moment';
import _ from 'lodash';
import { data } from './hourly.json';
import { Result } from './result';

@Injectable()
export class AppService {
  v1(): any {
    const start = new Date();

    const source = data.map(item => ({
      ...item,
      date: moment(item.time).format('YYYY-MM-DD')
    }));

    const groupedByDate: { date: string, array: any[] }[] = [];

    while (source.length > 0) {
      const item = source[0];
      const match = groupedByDate.find(itemToFind => itemToFind.date === item.date);

      if (match) {
        match.array.push(item);
      } else {
        groupedByDate.push({
          date: item.date,
          array: [item]
        })
      }

      source.splice(0, 1);
    }

    const meanTemperaturesByDate: { date: string, meanTemperature: number }[] =
      groupedByDate.map(item => {
        return {
          date: item.date,
          meanTemperature: _.sumBy(item.array, item => item.temperature) / item.array.length
        }
      })

    return new Result(data.length, meanTemperaturesByDate, start);
  }

  v2(): any {
    const start = new Date();

    const source = data.map(item => ({
      ...item,
      date: item.time.substring(0, 10)
    }));

    const groupedByDate: { date: string, array: any[] }[] = [];

    while (source.length > 0) {
      const item = source[0];
      const match = groupedByDate.find(itemToFind => itemToFind.date === item.date);

      if (match) {
        match.array.push(item);
      } else {
        groupedByDate.push({
          date: item.date,
          array: [item]
        })
      }

      source.splice(0, 1);
    }

    const meanTemperaturesByDate: { date: string, meanTemperature: number }[] =
      groupedByDate.map(item => {
        return {
          date: item.date,
          meanTemperature: _.sumBy(item.array, item => item.temperature) / item.array.length
        }
      })

    return new Result(data.length, meanTemperaturesByDate, start);
  }

  v3(): any {
    const start = new Date();

    const source = data.map(item => ({
      ...item,
      date: item.time.substring(0, 10)
    }));

    const groupedByDate: { [day: string]: any[] } = {};

    while (source.length > 0) {
      const item = source[0];
      const match = groupedByDate[item.date];

      if (match) {
        match.push(item);
      } else {
        groupedByDate[item.date] = [item];
      }

      source.splice(0, 1);
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

  v4(): any {
    const start = new Date();

    const source = data.map(item => ({
      ...item,
      date: item.time.substring(0, 10)
    }));

    const groupedByDate: { [day: string]: any[] } = {};

    source.forEach(item => {
      const match = groupedByDate[item.date];

      if (match) {
        match.push(item);
      } else {
        groupedByDate[item.date] = [item];
      }
    });

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

  v5(): any {
    const start = new Date();

    const groupedByDate: { [day: string]: any[] } = {};

    data.forEach(item => {
      const date = item.time.substring(0, 10);

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

  v6(): any {
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
