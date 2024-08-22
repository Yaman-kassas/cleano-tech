import type { NextApiRequest, NextApiResponse } from 'next';
import { BackAPI } from '@/lib';
import { ConvertApiError } from '@/utils/ConvertApiError';
import { createUserBackendRequestSchema } from '@/store/register';
import { apiEndpoints, httpCode } from '@/data';
import { getCookies } from 'cookies-next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { body } = req;
  const cookies = getCookies({ req });
  const selectedLanguage = cookies.NEXT_LOCALE;
  if (req.method === 'POST') {
    try {
      const transformedData = createUserBackendRequestSchema.parse(body);
      await BackAPI.post(
        apiEndpoints.register,
        { data: transformedData },
        {
          headers: {
            locale: selectedLanguage ?? 'de',
          },
        },
      );

      // const transformedData = createUserBackendRequestSchema.parse(data);
      return res.status(httpCode.SUCCESS).send({});
    } catch (e) {
      const error = ConvertApiError({ error: e });

      return res.status(error.status).json(error);
    }
  }
  return res.status(httpCode.BAD_REQUEST).send({ message: 'Error occurred' });
};
