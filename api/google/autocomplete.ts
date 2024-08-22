import type { NextApiRequest, NextApiResponse } from 'next';
import { API_KEY, apiEndpoints, httpCode } from '../../../data';
import { GoogleAPI } from '@/lib';
import { ConvertApiError } from '@/utils/ConvertApiError';
import { autoCompleteTransformer } from '@/store/google';
import { getCookies } from 'cookies-next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { input } = req.query;
  const cookies = getCookies({ req });
  const selectedLanguage = cookies.NEXT_LOCALE;
  const countryFilter = 'country:DE';

  if (req.method === 'GET') {
    try {
      const { data } = await GoogleAPI.get(apiEndpoints.autocomplete, {
        params: {
          key: API_KEY,
          input,
          components: countryFilter,
        },
        headers: {
          locale: selectedLanguage,
        },
      });

      const transformedData = autoCompleteTransformer.parse({
        ...(data as Object),
      });
      return res.status(httpCode.SUCCESS).send(transformedData);
    } catch (e) {
      const error = ConvertApiError({ error: e });
      return res.status(error.status).json(error);
    }
  }
  return res.status(httpCode.BAD_REQUEST).send({ message: 'Error occurred' });
};
