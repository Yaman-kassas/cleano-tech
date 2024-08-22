import type { NextApiRequest, NextApiResponse } from 'next';
import autocomplete from './autocomplete';

import geocode from './geocode';
import { httpCode } from '@/data';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { type } = req.query;
  if (req.method === 'GET') {
    if (type === 'autocomplete') {
      return autocomplete(req, res);
    }
    if (type === 'geocode') {
      return geocode(req, res);
    }
    return res.status(httpCode.BAD_REQUEST).send({ message: 'invalid type ' });
  }

  return res.status(httpCode.BAD_REQUEST).send({ message: 'Error occurred' });
};
