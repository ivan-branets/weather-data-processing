import { Injectable } from '@nestjs/common';
import moment from 'moment';
import _ from 'lodash';
import { data } from './hourly.json';
import { IWearerItem, Result } from './models';

@Injectable()
export class AppService {

  // 1. add date field to every item
  // 2. group items by date in a list
  // 3. count mean temperature for items with the same date
  v1(): Result {
    // record start time to know how much time we've spent for data processing    
    const start = new Date();

    // we have a time field '2019-01-01 00:10:00'.
    // to make a grouping by date why need to cut '00:10:00' part, so leave only date.
    // let's add a new field 'date' and write this value there
    const source = data.map(item => ({
      ...item,
      date: moment(item.time).format('YYYY-MM-DD')
    }));

    // in this collection we store items with the same date
    const groupedByDate: { date: string, array: IWearerItem[] }[] = [];

    // take the first element, process it, and remove from the collection
    // stop processing once collection is empty
    while (source.length > 0) {
      const item = source[0];

      // check if we already have found items with date of the current element
      const match = groupedByDate.find(itemToFind => itemToFind.date === item.date);

      // if found
      if (match) {
        // add the current element to the array, which has elements with the same date
        match.array.push(item);

        // otherwise (if no elements with the date we are looking for)
      } else {
        // add new grouping with the current date
        groupedByDate.push({
          date: item.date,
          array: [item]
        })
      }

      // remove the first element, so we can process the next one on the following step
      source.splice(0, 1);
    }

    // count mean temperature for items with the same date
    const meanTemperaturesByDate: { date: string, meanTemperature: number }[] =
      groupedByDate.map(item => {
        return {
          date: item.date,
          meanTemperature:
            _.sumBy(item.array, item => item.temperature) / item.array.length
        }
      })

    return new Result(data.length, meanTemperaturesByDate, start);
  }

  // the same as v1, but avoiding moment()
  v2(): Result {
    const start = new Date();

    const source = data.map(item => ({
      ...item,
      // date: moment(item.time).format('YYYY-MM-DD')
      // replace moment, since it decrease performance significantly
      date: item.time.substring(0, 10)
    }));

    const groupedByDate: { date: string, array: IWearerItem[] }[] = [];

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

  v3(): Result {
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

  v4(): Result {
    const start = new Date();

    const source = data.map(item => ({
      ...item,
      date: item.time.substring(0, 10)
    }));

    const groupedByDate: { [day: string]: IWearerItem[] } = {};

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

  v5(): Result {
    const start = new Date();

    const groupedByDate: { [day: string]: IWearerItem[] } = {};

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

  v6(): Result {
    const start = new Date();

    const groupedByDate: { [day: string]: IWearerItem[] } =
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
