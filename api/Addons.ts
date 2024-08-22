import type { NextApiRequest, NextApiResponse } from 'next';
import { apiEndpoints, httpCode } from '../../data';
import { BackAPI } from '../../lib';

import { ConvertApiError } from '@/utils/ConvertApiError';
import { addonsResponseTransformer } from '@/store/Addons';
import { getCookies } from 'cookies-next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { query: params } = req;
  const cookies = getCookies({ req });
  const selectedLanguage = cookies.NEXT_LOCALE;
  try {
    const populateIcon = params['populate[icon]'] === 'true' ? { icon: { populate: '*' } } : {};
    const { data } = await BackAPI.get(apiEndpoints.addon, {
      headers: {
        locale: selectedLanguage ?? 'de',
      },
      params: {
        populate: {
          ...populateIcon,
        },

      },
    });

    const transformedData = addonsResponseTransformer.parse({
      ...(data as Object),
    });
    return res.status(httpCode.SUCCESS).send(transformedData);
  } catch (e) {
    const error = ConvertApiError({ error: e });
    return res.status(error.status).json(e);
  }
};
