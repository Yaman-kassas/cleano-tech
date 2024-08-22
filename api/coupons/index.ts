import { apiEndpoints, httpCode } from '@/data';
import { BackAPI } from '@/lib';
import { getCouponResponseTransformer } from '@/store/coupon/responses-transformers';
import { ConvertApiError } from '@/utils/ConvertApiError';
import { NextApiRequest, NextApiResponse } from 'next';

export default async (req:NextApiRequest, res: NextApiResponse) => {
  try {
    const { data } = await BackAPI.get(apiEndpoints.coupons);
    const transformedData = getCouponResponseTransformer.parse({
      ...(data as Object),
    });
    return res.status(httpCode.NOT_FOUND).send(transformedData);
  } catch (e) {
    const error = ConvertApiError({ error: e });
    return res.status(error.status).json(error);
  }
};
