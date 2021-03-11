import { Request, Response, Router } from 'express';
import { BAD_REQUEST, CREATED, OK } from 'http-status-codes';
import { ParamsDictionary } from 'express-serve-static-core';
import { getConnection } from "typeorm";
import { UserAnalytics } from "../entities/UserAnalytics";
import { paramMissingError } from '../utils/constants';
import logger from '../utils/Logger';
import Papa from 'papaparse';
import { convertToNumber } from "shared/utils/typeFunctions"

// Init shared
const router = Router();

router.get('/useranalytics/all', async (req: Request, res: Response) => {
  const data = await getConnection()
    .getRepository(UserAnalytics)
    .createQueryBuilder("user_analytics")
    .getMany();
  return res.status(OK).json({
    data,
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
  for (let i = 0; i < userAnalytics.length; i++) {
    const item = userAnalytics[i];
    let dbItem = {
      source: item['Source'],                                                     // string
      new_users: (item['New Users']),                              // number
      sessions: (item['Sessions']),                                // number
      first_seen_on: item['First seen on'],                                       // Date
      pages_session: (item['Pages / Session']),                    // number
      avg_session_duration: item['Avg. Session Duration'],                        // string
      conversation_rate: (item['Conversion Rate']),                // number
      goal_value: (item['Goal Value'])                             // number
    };
    dbValuesContainer.push(dbItem);
  }

  await getConnection()
    .createQueryBuilder()
    .insert()
    .into(UserAnalytics)
    .values(dbValuesContainer)
    .onConflict(`("source") DO NOTHING`)
    .execute()
    .catch(x => console.log(x));
  return res.status(CREATED).end();
});

router.put('/useranalytics/update', async (req: Request, res: Response) => {
    const { userAnalytics } = req.body;
    if (!userAnalytics && !userAnalytics.id) {
        return res.status(BAD_REQUEST).json({
            error: paramMissingError,
        });
    }
    await getConnection()
        .createQueryBuilder()
        .update(UserAnalytics)
        .set({ 
            goal_value: userAnalytics.goal_value,
        })
        .where("id = :id", { id: userAnalytics.id })
        .execute();
    return res.status(OK).end();
});

router.delete('/useranalytics/delete/', async (req: Request, res: Response) => {
    const { id } = req.params as ParamsDictionary;
    await getConnection()
        .createQueryBuilder()
        .delete()
        .from(UserAnalytics)
        .where("id = :id", { id: id })
        .execute();
    return res.status(OK).end();
});

export default router;
