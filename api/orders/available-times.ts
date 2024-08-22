import type { NextApiRequest, NextApiResponse } from 'next';
import { apiEndpoints, httpCode } from '../../../data';
import { BackAPI } from '../../../lib';
import { getTimesResponseTransformer } from '@/store/time';
import { ConvertApiError } from '@/utils/ConvertApiError';
import { getCookies } from 'cookies-next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { query: params } = req;
  const cookies = getCookies({ req });
  const selectedLanguage = cookies.NEXT_LOCALE;
  const date = params.date ? { date: params.date } : null;
  try {
    const { data } = await BackAPI.get(apiEndpoints.availableTimes(), {
      headers: {
        locale: selectedLanguage ?? 'de',
      },
      params: {
        ...date,
      },
    });

    const transformedData = getTimesResponseTransformer.parse({
      ...(data as Object),
    });

    return res.status(httpCode.SUCCESS).send(transformedData);
  } catch (e) {
    const error = ConvertApiError({ error: e });
    return res.status(error.status).json(error);
  }
};
