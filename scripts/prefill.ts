import mysql from 'mysql';
import Redis from 'ioredis';
import zlib from 'zlib';
import _ from 'lodash';
import { data } from '../src/hourly.json';

Promise.resolve()
  .then(() => prefillMySql())
  .then(() => prefillRedis())
  .catch(error => console.error(error))
  .finally(() => console.log('Finished'));

function prefillMySql() {
  var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'example',
    multipleStatements: true
  });

  const connect = new Promise((resolve, reject) => {
    connection.connect(error => {
      if (error) {
        reject(error);
      } else {
        console.log('Connected to MySql');
        resolve();
      }
    })
  });

  const createDb = new Promise((resolve, reject) => {
    connection.query(`
          DROP DATABASE IF EXISTS weather;
          CREATE DATABASE weather;
        `, error => {
      if (error) {
        reject(error);
      } else {
        console.log('weather Db is created');
        resolve();
      }
    });
  });

  const createTable = new Promise((resolve, reject) => {
    connection.query(`
          USE weather;

          CREATE TABLE hourly_statistics (
            city_id VARCHAR(50) NOT NULL,
            time DATETIME NOT NULL,
            temperature FLOAT NOT NULL
          );

          CREATE INDEX city_index ON hourly_statistics(city_id);

          CREATE TABLE hourly_statistics_no_index (
            city_id VARCHAR(50) NOT NULL,
            time DATETIME NOT NULL,
            temperature FLOAT NOT NULL
          );
        `, error => {
      if (error) {
        reject(error);
      } else {
        console.log('hourly_statistics and hourly_statistics_no_index Tables are created');
        resolve();
      }
    });
  });

  const insert = (values: string) =>
    new Promise((resolve, reject) => {
      connection.query(`
          USE weather;
          INSERT INTO hourly_statistics (city_id, time, temperature)
            VALUES ${values};

          INSERT INTO hourly_statistics_no_index (city_id, time, temperature)
            VALUES ${values};
        `, error => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });

  const fill = new Promise(async (resolve, reject) => {

    try {
      for (let i = 0; i < 1000; i++) {
        const values = data.map(({ time, temperature }) => `('city-${i}', '${time}', ${temperature + _.random(-5, 5)})`)
          .join(', ');

        await insert(values);

        if ((i + 1) % 50 === 0) {
          console.log(`${(i + 1) * data.length} items added`);
        }
      }

      resolve();

    } catch (error) {
      reject(error);
    }
  });

  return connect
    .then(() => createDb)
    .then(() => createTable)
    .then(() => fill)
    .finally(() => connection.end(error => {
      if (error) {
        console.error(error);
      }
    }));
}

function prefillRedis() {
  const client = new Redis();
  console.log('Connected to Redis');

  client.on('error', (error: Error) => {
    console.error(error);
  });

  const gzip = (value: string) => new Promise<Buffer>((resolve, reject) => {
    zlib.gzip(value, (error, buffer) => {
      if (error) {
        reject(error);
      } else {
        resolve(buffer);
      }
    });
  });

  const set = (key: string, buffer: Buffer) => new Promise((resolve, reject) => {
    client.set(key, buffer, (error: Error, reply: any) => {
      if (error) {
        reject(error);
      } else {
        resolve(reply)
      }
    });
  });

  return new Promise(async (resolve, reject) => {
    try {
      for (let i = 0; i < 1000; i++) {
        const value = await gzip(
          JSON.stringify(
            data.map(({ time, temperature }) => ({ time, temperature: temperature + _.random(-5, 5) }))
          )
        );

        await set(`city-${i}`, value);

        if ((i + 1) % 50 === 0) {
          console.log(`${(i + 1) * data.length} items added`);
        }
      }

      resolve();

    } catch (error) {
      reject(error);
    }
  })
    .then(() => client.quit());
}