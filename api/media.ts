import type { NextApiRequest, NextApiResponse } from 'next';
import createApiResponse from '@/utils/create-api-response';
import createApiError from '@/utils/create-api-error';
import { ApiHandler } from '@/utils/api-handler';
import { getCookies } from 'cookies-next';
import { apiEndpoints, apiMethods } from '@/data';
import { BackAPI } from '@/lib';
import { getMediaResponseTransformer } from '@/store/media';

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const { query: params } = req;
  const cookies = getCookies({ req });
  const selectedLanguage = cookies.NEXT_LOCALE;
  try {
    const { data } = await BackAPI.get(apiEndpoints.media, {
      headers: {
        locale: selectedLanguage ?? 'de',
      },
      params: {
        populate: {
          public_coupon: {
            populate: params['populate[publicCoupon]'] === 'true' ? '*' : null,
          },
        },
      },
    });

    return createApiResponse(req, res, getMediaResponseTransformer, data);
  } catch (e) {
    const error = createApiError({ error: e });
    return res.status(error.code).json(error);
  }
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === apiMethods.GET) return GET(req, res);

  const error = createApiError({ error: {} });
  return res.status(500).json(error);
}

export default ApiHandler(handler, {
  guard: 'public',
});
