import { Injectable } from '@nestjs/common';
import moment from 'moment';
import _ from 'lodash';
import axios from 'axios';
import mysql from 'mysql';
import redis from 'redis';
import zlib from 'zlib';
import { data } from './hourly.json';
import { IWeatherItem, Result } from './models';

@Injectable()
export class AppService {

  // 1. create a new collection, which contains items only with date and temperature
  // 2. group items by date in a list
  // 3. count mean temperature for items with the same date
  v1(): Result {
    // record start time to know how much time we've spent for data processing    
    const start = new Date();

    // we have a time field '2019-01-01 00:10:00'.
    // to make a grouping by date why need to cut '00:10:00' part, so leave only date.
    // let's create a new collection, which contains temperature and date
    const source = data.map(item => ({
      temperature: item.temperature,
      date: moment(item.time).format('YYYY-MM-DD')
    }));

    // in this collection we store items with the same date
    const groupedByDate: { date: string, array: IWeatherItem[] }[] = [];

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
      temperature: item.temperature,
      // was: date: moment(item.time).format('YYYY-MM-DD')
      // replace moment, since it decrease performance significantly
      date: item.time.substring(0, 10)
    }));

    const groupedByDate: { date: string, array: IWeatherItem[] }[] = [];

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

  // the same as v2, but hashmap instead of list
  v3(): Result {
    const start = new Date();

    const source = data.map(item => ({
      temperature: item.temperature,
      date: item.time.substring(0, 10)
    }));

    // was: const groupedByDate: { date: string, array: IWeatherItem[] }[] = [];
    // hashmap instead of list
    const groupedByDate: { [date: string]: IWeatherItem[] } = {};

    while (source.length > 0) {
      const item = source[0];

      // was:
      // const match = groupedByDate.find(itemToFind => itemToFind.date === item.date);
      // search O(1) instead of O(n)
      const match = groupedByDate[item.date];

      if (match) {
        match.push(item);
      } else {
        // was:
        // groupedByDate.push({
        //  date: item.date,
        //  array: [item]
        // })
        groupedByDate[item.date] = [item];
      }

      source.splice(0, 1);
    }

    // get all dates
    const dates = Object.keys(groupedByDate);
    const meanTemperaturesByDate: { date: string, meanTemperature: number }[] =
      // for every date get mean temperature
      dates.map(date => {
        const temperaturesInOneDay = groupedByDate[date];
        return {
          date,
          meanTemperature:
            _.sumBy(temperaturesInOneDay, item => item.temperature) / temperaturesInOneDay.length
        }
      })

    return new Result(data.length, meanTemperaturesByDate, start);
  }

  // the same as v3, but no element removing in source list
  v4(): Result {
    const start = new Date();

    const source = data.map(item => ({
      temperature: item.temperature,
      date: item.time.substring(0, 10)
    }));

    const groupedByDate: { [date: string]: IWeatherItem[] } = {};

    // was: while (source.length > 0) {
    source.forEach(item => {
      const match = groupedByDate[item.date];

      if (match) {
        match.push(item);
      } else {
        groupedByDate[item.date] = [item];
      }

      // was: source.splice(0, 1);
      // remove element from the list is an expensive operation
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

  // in v4 we didn't mutate source collection
  // it is redundant now
  // let get items from original data collection
  v5(): Result {
    const start = new Date();

    // was:
    // const source = data.map(item => ({
    //  temperature: item.temperature,
    //  date: item.time.substring(0, 10)
    // }));

    const groupedByDate: { [date: string]: IWeatherItem[] } = {};

    // was: source.forEach(item => {
    data.forEach(item => {
      const date = item.time.substring(0, 10);

      // was:
      // const match = groupedByDate[item.date];

      // if (match) {
      //  match.push(item);
      // } else {
      //   groupedByDate[item.date] = [item];
      // }

      // less code
      // if groupedByDate[date] is not undefined, set self, otherwise set an empty array
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

  // the same as v5, but grouping and mean is done by lodash library
  v6(): Result {
    const start = new Date();

    // was:
    // const groupedByDate: { [date: string]: IWeatherItem[] } = {};

    // data.forEach(item => {
    //   const date = item.time.substring(0, 10);

    //   groupedByDate[date] = groupedByDate[date] || []; 
    //   groupedByDate[date].push(item);
    // })

    const groupedByDate: { [day: string]: IWeatherItem[] } =
      _.groupBy(data, item => item.time.substring(0, 10));

    const dates = Object.keys(groupedByDate);

    const meanTemperaturesByDate: { date: string, meanTemperature: number }[] =
      dates.map(date => {
        const temperaturesInOneDay = groupedByDate[date];
        return {
          date,
          // was:
          // _.sumBy(temperaturesInOneDay, item => item.temperature) / temperaturesInOneDay.length
          meanTemperature: _.meanBy(temperaturesInOneDay, item => item.temperature)
        }
      })

    return new Result(data.length, meanTemperaturesByDate, start);
  }

  async v7(): Promise<Result> {
    const start = new Date();
    const response = await axios.get('https://weather-dou.azureedge.net/weather/hourly.json', {
      headers: {
        'Accept-Encoding': 'gzip'
      }
    });

    // mimic slow connection (800ms)
    const responseTime = new Date().getTime() - start.getTime();
    await this.timeout(responseTime < 800 ? 800 - responseTime : 0);

    const groupedByDate: { [day: string]: IWeatherItem[] } =
      _.groupBy(response.data.data, item => item.time.substring(0, 10));

    const dates = Object.keys(groupedByDate);

    const meanTemperaturesByDate: { date: string, meanTemperature: number }[] =
      dates.map(date => {
        const temperaturesInOneDay = groupedByDate[date];
        return {
          date,
          meanTemperature: _.meanBy(temperaturesInOneDay, item => item.temperature)
        }
      })

    return new Result(response.data.data.length, meanTemperaturesByDate, start);
  }

  private readonly pool = mysql.createPool({
    connectionLimit: 1000,
    host: process.env.DB_HOST,
    user: 'root',
    password: 'example',
    multipleStatements: true,
    database: 'weather'
  });

  async v8(): Promise<Result> {
    const start = new Date();

    const query = new Promise((resolve, reject) => {
      this.pool.query(`
            SELECT time, temperature FROM hourly_statistics
              WHERE city='city-0';
          `, (error, result) => {
        error ? reject(error) : resolve(result);
      });
    });

    const sqlResult: any = await query;

    const groupedByDate: { [day: string]: IWeatherItem[] } =
      _.groupBy(sqlResult, ({ time }) => `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()}`);

    const dates = Object.keys(groupedByDate);

    const meanTemperaturesByDate: { date: string, meanTemperature: number }[] =
      dates.map(date => {
        const temperaturesInOneDay = groupedByDate[date];
        return {
          date,
          meanTemperature: _.meanBy(temperaturesInOneDay, item => item.temperature)
        }
      })

    return new Result(sqlResult.length, meanTemperaturesByDate, start);
  }

  async v9(): Promise<Result> {
    const start = new Date();

    const query = new Promise((resolve, reject) => {
      this.pool.query(`
            SELECT date, AVG(temperature) AS meanTemperature FROM
                (SELECT DATE_FORMAT(time,'%Y-%m-%d') AS date, temperature
                FROM hourly_statistics
                WHERE city='city-0') as t
              GROUP BY date
          `, (error, result) => {
        error ? reject(error) : resolve(result);
      });
    });

    const sqlResult = await query;
    return new Result(data.length, sqlResult, start);
  }

  private readonly client = redis.createClient({
    host: process.env.REDIS_HOST,
    return_buffers: true
  });

  async v10(): Promise<Result> {
    const start = new Date();

    const get = (key: string) => new Promise<string>((resolve, reject) => {
      this.client.get(key, (error: Error, reply: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(reply.toString());
        }
      });
    });

    const gunzip = (compressedString: string) => new Promise<string>((resolve, reject) => {
      const buffer = Buffer.from(compressedString, 'base64');

      zlib.gunzip(buffer, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.toString('ascii'));
        }
      });
    });

    const compressedString = await get('city-0');

    console.log('--------------');
    console.log(new Date().getTime() - start.getTime());

    const value = await gunzip(compressedString);
    console.log(new Date().getTime() - start.getTime());

    const arr = JSON.parse(value);
    console.log(new Date().getTime() - start.getTime());

    const groupedByDate: { [day: string]: IWeatherItem[] } =
      _.groupBy(arr, item => item.time.substring(0, 10));

    const dates = Object.keys(groupedByDate);

    const meanTemperaturesByDate: { date: string, meanTemperature: number }[] =
      dates.map(date => {
        const temperaturesInOneDay = groupedByDate[date];
        return {
          date,
          meanTemperature: _.meanBy(temperaturesInOneDay, item => item.temperature)
        }
      })

    return new Result(arr.length, meanTemperaturesByDate, start);
  }

  private timeout(milliseconds: number) {
    return new Promise(resolve => {
      setTimeout(resolve, milliseconds);
    });
  }
}
