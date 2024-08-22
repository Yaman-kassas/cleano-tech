import type { NextApiRequest, NextApiResponse } from 'next';
import { apiEndpoints, httpCode } from '../../../data';
import { BackAPI } from '@/lib';
import { ConvertApiError } from '@/utils/ConvertApiError';
import {
  resetPasswordRequestSchema,
  resetPasswordResponseTransformer,
} from '@/store/reset-password';
import { getCookies } from 'cookies-next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { body } = req;
  const cookies = getCookies({ req });
  const selectedLanguage = cookies.NEXT_LOCALE;
  if (req.method === 'POST') {
    try {
      const transformedData = resetPasswordRequestSchema.parse(body);
      const { data } = await BackAPI.post(
        apiEndpoints.resetPassword,
        { data: transformedData },
        {
          headers: {
            locale: selectedLanguage ?? 'de',
          },
        },
      );

      const finalTransformedData = resetPasswordResponseTransformer.parse(data);

      return res.status(httpCode.SUCCESS).send(finalTransformedData);
    } catch (e) {
      const error = ConvertApiError({ error: e });
      return res.status(error.status).json(e);
    }
  }
  return res.status(httpCode.BAD_REQUEST).send({ message: 'Error occurred' });
};
