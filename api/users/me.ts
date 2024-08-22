import { apiEndpoints, httpCode } from '@/data';
import { BackAPI } from '@/lib';
import { updateUserRequestTransformer } from '@/store/user/request-transformer';

import { userResponseTransformer } from '@/store/user/responses-transformers';
import { ConvertApiError } from '@/utils/ConvertApiError';
import { getJWTToken } from '@/utils/get-jwt-token';
import { getCookies } from 'cookies-next';
import { NextApiRequest, NextApiResponse } from 'next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    try {
      const { token } = await getJWTToken(req);
      const cookies = getCookies({ req });
      const selectedLanguage = cookies.NEXT_LOCALE;

      const { data } = await BackAPI.get(apiEndpoints.usersMe, {
        headers: {
          Authorization: token,

          locale: selectedLanguage ?? 'de',
        },
      });
      const transformedData = userResponseTransformer.parse({
        ...(data as Object),
      });
      return res.status(httpCode.SUCCESS).send(transformedData);
    } catch (e) {
      const error = ConvertApiError({ error: e });
      return res.status(error.status).json(error.message);
    }
  } else {
    try {
      const { token, sub } = await getJWTToken(req);
      const cookies = getCookies({ req });
      const selectedLanguage = cookies.NEXT_LOCALE;

      const { data } = await BackAPI.put(
        apiEndpoints.updateUser(`${sub}`),
        updateUserRequestTransformer.parse(req.body),
        {
          headers: {
            Authorization: token,
            locale: selectedLanguage ?? 'de',
          },
        },
      );
      const transformedData = userResponseTransformer.parse({
        ...(data as Object),
      });

      return res.status(httpCode.SUCCESS).send(transformedData);
    } catch (e) {
      const error = ConvertApiError({ error: e });
      return res.status(error.status).json(error.message);
    }
  }
};
