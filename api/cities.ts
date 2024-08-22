import type { NextApiRequest, NextApiResponse } from 'next';
import { apiEndpoints, httpCode } from '../../data';
import { BackAPI } from '../../lib';
import { getCitiesFieldsResponseTransformer } from '../../store/cities/responses-transformers';
import { ConvertApiError } from '@/utils/ConvertApiError';
import { getCookies } from 'cookies-next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const cookies = getCookies({ req });
  const selectedLanguage = cookies.NEXT_LOCALE;
  try {
    const { data } = await BackAPI.get(apiEndpoints.city, {
      headers: {
        locale: selectedLanguage ?? 'de',
      },
    });
    const transformedData = getCitiesFieldsResponseTransformer.parse({
      ...(data as Object),
    });
    return res.status(httpCode.SUCCESS).send(transformedData);
  } catch (e) {
    const error = ConvertApiError({ error: e });
    return res.status(error.status).json(error);
  }
};
