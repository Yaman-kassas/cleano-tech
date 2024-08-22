import type { NextApiRequest, NextApiResponse } from 'next';
import { apiEndpoints, httpCode } from '../../data';
import { BackAPI } from '../../lib';
import { getHousesResponseTransformer } from '../../store/houses/responses-transformers';
import { ConvertApiError } from '@/utils/ConvertApiError';
import { getCookies } from 'cookies-next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { query: params } = req;
  const cookies = getCookies({ req });
  const selectedLanguage = cookies.NEXT_LOCALE;

  const populateFields = params['populate[house_fields][populate][fields][populate]'] === 'values'
    ? { house_fields: { populate: { fields: { populate: 'values' } } } }
    : {};
  try {
    const { data } = await BackAPI.get(apiEndpoints.houses(), {
      headers: {
        locale: selectedLanguage ?? 'de',
      },
      params: {
        populate: {
          ...populateFields,
        },
        sort: 'priority:ASC',
      },
    });

    const transformedData = getHousesResponseTransformer.parse({
      ...(data as Object),
    });

    return res.status(httpCode.SUCCESS).send(transformedData);
  } catch (e) {
    const error = ConvertApiError({ error: e });
    return res.status(error.status).json(error);
  }
};
