import type { NextApiRequest, NextApiResponse } from 'next';
import { API_KEY, apiEndpoints, httpCode } from '../../../data';
import { GoogleAPI } from '@/lib';

import { geocodeTransformer } from '@/store/google/responses-transformers';
import { ConvertApiError } from '@/utils/ConvertApiError';
import { getCookies } from 'cookies-next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { address } = req.query;
  const cookies = getCookies({ req });
  const selectedLanguage = cookies.NEXT_LOCALE;
  if (req.method === 'GET') {
    try {
      const { data } = await GoogleAPI.get(apiEndpoints.geocode, {
        params: {
          key: API_KEY,
          address,
        },

        headers: {
          locale: selectedLanguage,
        },
      });

      const transformedData = geocodeTransformer.parse({
        ...(data as Object),
      });

      return res.status(httpCode.SUCCESS).send(transformedData);
    } catch (e) {
      const error = ConvertApiError({ error: e });
      return res.status(error.status).json(e);
    }
  }
  return res.status(httpCode.BAD_REQUEST).send({ message: 'Error occurred' });
};
