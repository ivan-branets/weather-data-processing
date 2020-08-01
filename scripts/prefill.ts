import mysql from 'mysql';
import redis from 'redis';
import zlib from 'zlib';
import { data } from '../src/hourly.json';

prefillRedis()
//prefillMySql()
  //.then(() => prefillRedis())
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
            city VARCHAR(50) NOT NULL,
            time DATETIME NOT NULL,
            temperature FLOAT NOT NULL
          );

          CREATE INDEX city_index ON hourly_statistics(city);

          CREATE TABLE hourly_statistics_no_index (
            city VARCHAR(50) NOT NULL,
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
      // INSERT INTO hourly_statistics_no_index (city, time, temperature)
      // VALUES ${values};
      connection.query(`
          USE weather;
          INSERT INTO hourly_statistics (city, time, temperature)
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
        const values = data.map(({ time, temperature }) => `('city-${i}', '${time}', ${temperature})`)
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
  const client = redis.createClient();
  console.log('Connected to Redis');

  client.on('error', (error: Error) => {
    console.error(error);
  });

  const gzip = (value: string) => new Promise<string>((resolve, reject) => {
    zlib.gzip(value, (error, buffer) => {
      if (error) {
        reject(error);
      } else {
        resolve(buffer.toString('base64'));
      }
    });
  });

  const set = (key: string, value: string) => new Promise((resolve, reject) => {
    client.set(key, value, (error: Error, reply: any) => {
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
        const value = await gzip(JSON.stringify(data.map(({ time, temperature }) => ({ time, temperature }))));
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
    .then(() => client.end(true));
}