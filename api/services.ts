import type { NextApiRequest, NextApiResponse } from 'next';
import { apiEndpoints, httpCode } from '../../data';
import { BackAPI } from '../../lib';
import { getServicesResponseTransformer } from '../../store/services/responses-transformers';
import { ConvertApiError } from '@/utils/ConvertApiError';
import { getCookies } from 'cookies-next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { query: params } = req;
  const cookies = getCookies({ req });
  const selectedLanguage = cookies.NEXT_LOCALE;
  const populateServiceInfo = params['populate[service_info]'] === 'true'
    ? { service_info: { populate: '*' } }
    : {};
  try {
    const { data } = await BackAPI.get(apiEndpoints.services(), {
      headers: {
        locale: selectedLanguage ?? 'de',
      },
      params: {
        populate: {
          ...populateServiceInfo,
        },
        sort: 'priority:ASC',
      },
    });
    const transformedData = getServicesResponseTransformer.parse({
      ...(data as Object),
    });
    return res.status(httpCode.SUCCESS).send(transformedData);
  } catch (e) {
    const error = ConvertApiError({ error: e });
    return res.status(error.status).json(e);
  }
};
