import { apiEndpoints, httpCode } from '@/data';
import { BackAPI } from '@/lib';
import { submitOrderRequestTransformer } from '@/store/order/request-transformers';
import { submitOrderResponseTransformer } from '@/store/order/responses-transformers';
import { ConvertApiError } from '@/utils/ConvertApiError';
import { getJWTToken } from '@/utils/get-jwt-token';
import { getCookies } from 'cookies-next';

import { NextApiRequest, NextApiResponse } from 'next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { sub, token } = await getJWTToken(req);
  const cookies = getCookies({ req });
  const selectedLanguage = cookies.NEXT_LOCALE;
  const requestTransformedData = submitOrderRequestTransformer.parse({
    ...req.body,
  });
  const requestData = {
    ...requestTransformedData,
    user: sub,
  };

  try {
    const { data } = await BackAPI.post(
      apiEndpoints.orders(),
      { data: requestData },
      {
        headers: {
          Authorization: `${token}`,
          locale: selectedLanguage ?? 'de',
        },
      },
    );

    const transformedData = submitOrderResponseTransformer.parse({
      ...(data as Object),
    });

    return res.status(httpCode.SUCCESS).send(transformedData);
  } catch (e) {
    const error = ConvertApiError({ error: e });
    return res.status(error.status).json(error.message);
  }
};
