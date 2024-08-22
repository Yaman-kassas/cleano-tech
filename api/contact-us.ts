import type { NextApiRequest, NextApiResponse } from 'next';
import { apiEndpoints, httpCode } from '../../data';
import { BackAPI } from '../../lib';
import { ConvertApiError } from '@/utils/ConvertApiError';
import { contactUsResponseTransformer } from '@/store/contact-us';

import { getJWTToken } from '@/utils/get-jwt-token';
import { getCookies } from 'cookies-next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { sub } = await getJWTToken(req);
    const cookies = getCookies({ req });
    const selectedLanguage = cookies.NEXT_LOCALE;
    const requestData = {
      user: sub,
      ...req.body,
    };
    const { data } = await BackAPI.post(
      apiEndpoints.contactUs,
      { data: requestData },
      {
        headers: {
          locale: selectedLanguage ?? 'de',
        },
      },
    );
    const transformedData = contactUsResponseTransformer.parse({
      ...(data as Object),
    });
    return res.status(httpCode.SUCCESS).send(transformedData);
  } catch (e) {
    const error = ConvertApiError({ error: e });
    return res.status(error.status).json(error.message);
  }
};
