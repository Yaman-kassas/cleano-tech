import { apiEndpoints, httpCode } from '@/data';
import { BackAPI } from '@/lib';
import { CouponPostResponseTransformer } from '@/store/apply-coupon';
import { ConvertApiError } from '@/utils/ConvertApiError';
import { getJWTToken } from '@/utils/get-jwt-token';
import { getCookies } from 'cookies-next';

import { NextApiRequest, NextApiResponse } from 'next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { token } = await getJWTToken(req);
    const cookies = getCookies({ req });
    const selectedLanguage = cookies.NEXT_LOCALE;

    const { data } = await BackAPI.post(
      apiEndpoints.applyCoupon,
      { data: req.body },
      {
        headers: {
          Authorization: `${token}`,
          locale: selectedLanguage ?? 'de',
        },
      },
    );

    const transformedData = CouponPostResponseTransformer.parse({
      ...(data as Object),
    });
    return res.status(httpCode.SUCCESS).send(transformedData);
  } catch (e) {
    const error = ConvertApiError({ error: e });
    return res.status(error.status).json(error.message);
  }
};
