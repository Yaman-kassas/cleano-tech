import type { NextApiRequest, NextApiResponse } from 'next';
import { apiEndpoints, httpCode } from '../../data';
import { BackAPI } from '../../lib';
import { getDaySResponseTransformer } from '../../store/day/responses-transformers';
import { ConvertApiError } from '@/utils/ConvertApiError';
import { getCookies } from 'cookies-next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { query: params } = req;
  const cookies = getCookies({ req });
  const selectedLanguage = cookies.NEXT_LOCALE;
  const populateDate = params['populate[dates]'] === 'true' ? { dates: { populate: '*' } } : {};

  try {
    const { data } = await BackAPI.get(apiEndpoints.days, {
      headers: {
        locale: selectedLanguage ?? 'de',
      },
      params: {
        populate: {
          ...populateDate,
        },
      },
    });
    const transformedData = getDaySResponseTransformer.parse({
      ...(data as Object),
    });

    return res.status(httpCode.SUCCESS).send(transformedData);
  } catch (e) {
    const error = ConvertApiError({ error: e });
    return res.status(error.status).json(error);
  }
};
