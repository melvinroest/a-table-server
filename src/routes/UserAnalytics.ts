import { Request, Response, Router } from 'express';
import { BAD_REQUEST, CREATED, OK } from 'http-status-codes';
import { ParamsDictionary } from 'express-serve-static-core';
import { getConnection } from "typeorm";
import { UserAnalytics } from "../entities/UserAnalytics";
import { paramMissingError } from '../utils/constants';
import logger from '../utils/Logger';
import Papa from 'papaparse';
import * as crypto from "crypto";
import { convertToNumber, timeFormatToSeconds } from "shared/utils/typeFunctions";
import { toSnakeCase } from 'shared/utils/stringTransform';

interface DbItem {
  source: string;
  users: number;
  new_users: number;
  sessions: number;
  bounce_rate: number;
  first_seen_on: Date;
  pages_session: number;
  avg_session_duration: number;
  conversion_rate: number;
  goal_value: number;
}

const GLOBAL_HEADER_NAMES = [
  "source",
  "users",
  "new_users",
  "sessions",
  "bounce_rate",
  "first_seen_on",
  "pages_session",
  "avg_session_duration",
  "conversion_rate",
  "goal_value",
]

// Init shared
const router = Router();

router.get('/useranalytics/all/hash', async (req: Request, res: Response) => {
  //TODO figure out a more performant way to check for data integrity
  // --> 2 thoughts: use a timestamp for last updated, or use a diffing mechanism
  const data = await getConnection()
    .getRepository(UserAnalytics)
    .createQueryBuilder("user_analytics")
    .select(["user_analytics.id"])
    .getMany()
    .catch(x => console.log(x));
  
  const dataString = JSON.stringify(data);
  const hash = crypto.createHash('md5').update(dataString).digest('hex');
  return res.status(OK).json({
    hash,
  });
});

router.get('/useranalytics/all', async (req: Request, res: Response) => {
  const data = await getConnection()
    .getRepository(UserAnalytics)
    .createQueryBuilder("user_analytics")
    .orderBy("user_analytics.id")
    .getMany()
    .catch(x => console.log(x));
  return res.status(OK).json({
    data: data
  });
});

router.post('/useranalytics/upload', async (req: Request, res: Response) => {
  const {
      base64Csv
  } = req.body;
  const data = Buffer.from(base64Csv, 'base64').toString('binary');
  const options: Papa.ParseConfig = {
      delimiter: ",",
      quoteChar: '"',
      header: true
    }
  const parsedCsv = Papa.parse(data, options);
  const userAnalytics = parsedCsv.data;

  if (!userAnalytics) {
      return res.status(BAD_REQUEST).json({
          error: paramMissingError,
      });
  }

  const dbValuesContainer = [];
  try {
    let headers = Object.keys(userAnalytics[0]).map((item: any) => {
      return toSnakeCase(item);
    });
    let checkAllHeadersPresent = (arr: Array<any>, target: Array<any>) => target.every((v: any) => {
      return arr.includes(v);
    });
    const allheadersPresent = checkAllHeadersPresent(headers, GLOBAL_HEADER_NAMES);
    if (!allheadersPresent) {
      console.log(new Error('not all headers present'), headers, GLOBAL_HEADER_NAMES);
      return res.status(BAD_REQUEST).send("Error: not all headers are present");
    }

    for (let i = 0; i < userAnalytics.length; i++) {
      const item = userAnalytics[i];
      let headers = Object.keys(item).map((element: any) => {
        const newKey = toSnakeCase(element);
        const oldKey = element;
        delete Object.assign(item, {[newKey]: item[oldKey] })[oldKey]; //renames the object keys to snake case, this allows for a bit of permissable uploads
    });
      let dbItem = {
        source: item['source'],
        users: convertToNumber(item['users']),
        new_users: convertToNumber(item['new_users']),
        sessions: convertToNumber(item['sessions']),
        bounce_rate: convertToNumber(item['bounce_rate']),
        first_seen_on: item['first_seen_on'],
        pages_session: convertToNumber(item['pages_session']),
        avg_session_duration: timeFormatToSeconds(item['avg_session_duration']),
        conversion_rate: convertToNumber(item['conversion_rate']),
        goal_value: convertToNumber(item['goal_value'])
      };
      dbValuesContainer.push(dbItem);
    }
  }
  catch (e) {
    console.log(e);
    return res.status(BAD_REQUEST).send(`Error: something went wrong with converting the data. Error message: ${e}`);
  }

  await getConnection()
    .createQueryBuilder()
    .insert()
    .into(UserAnalytics)
    .values(dbValuesContainer)
    .onConflict(`("source") DO NOTHING`)
    .execute()
    .catch(x => {
      console.log(x);
      return res.status(BAD_REQUEST).send("Error: something went wrong with retrieving data from the database");
    });
  return res.status(CREATED).end();
});

router.put('/useranalytics/update', async (req: Request, res: Response) => {
  const { data } = req.body;
  if (!data && !data.id) {
    return res.status(BAD_REQUEST).json({error: paramMissingError,});
  }

  const { id, value, key } = data;

  if (key === "goal_value") {
    await getConnection()
      .createQueryBuilder()
      .update(UserAnalytics)
      .set({
          goal_value: value,
      })
      .where("id = :id", { id: id })
      .execute()
      .catch(x => console.log(x));
    return res.status(OK).end();
  } else {
    res.status(BAD_REQUEST).end();
  }
});

router.delete('/useranalytics/delete/', async (req: Request, res: Response) => {
  //TODO implement JSON schema generation that you can use for typechecking
  const ids = req.body;
  await getConnection()
    .createQueryBuilder()
    .delete()
    .from(UserAnalytics)
    .where("user_analytics.id IN (:...ids)", { ids: ids })
    .execute()
    .catch(x => console.log(x));
  return res.status(OK).end();
});

export default router;
