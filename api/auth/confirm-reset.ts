import type { NextApiRequest, NextApiResponse } from 'next';
import { apiEndpoints, httpCode } from '../../../data';
import { BackAPI } from '@/lib';
import { ConvertApiError } from '@/utils/ConvertApiError';
import { confirmPasswordResponseTransformer } from '@/store/confirm-reset/responses-transformers';
import { getCookies } from 'cookies-next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    try {
      const cookies = getCookies({ req });
      const selectedLanguage = cookies.NEXT_LOCALE;
      const { data } = await BackAPI.post(
        apiEndpoints.confirmReset,
        { data: req.body },
        {
          headers: {
            locale: selectedLanguage ?? 'de',
          },
        },
      );
      const transformedData = confirmPasswordResponseTransformer.parse({
        ...(data as Object),
      });
      return res.status(httpCode.SUCCESS).send(transformedData);
    } catch (e) {
      const error = ConvertApiError({ error: e });
      return res.status(error.status).json(error);
    }
  }
  return res.status(httpCode.BAD_REQUEST).send({ message: 'Error' });
};
