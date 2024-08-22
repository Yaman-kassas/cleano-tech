import type { NextApiRequest, NextApiResponse } from 'next';
import { apiEndpoints, apiMethods, httpCode } from '../../../data';
import { BackAPI } from '../../../lib';
import { downloadBackendRequestSchema } from '@/store/order';

import { ApiToken } from '@/types/backend-types';
import createApiError from '@/utils/create-api-error';
import { ApiHandler } from '@/utils/api-handler';

const POST = async (
  req: NextApiRequest,
  res: NextApiResponse,
  token: ApiToken | null,
) => {
  const { body } = req;

  try {
    const transformedRequest = downloadBackendRequestSchema.parse({
      ...body,
    });
    const { data } = await BackAPI.post(
      apiEndpoints.downloadOrder,
      transformedRequest,
      {
        responseType: 'arraybuffer',

        headers: {
          Authorization: token?.token,
        },
      },
    );

    return res
      .status(httpCode.SUCCESS)
      .json({ message: 'successfulRequest', url: data });
  } catch (e) {
    const error = createApiError({ error: e });
    return res.status(httpCode.BAD_REQUEST).json(error);
  }
};

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  token: ApiToken | null,
) {
  if (req.method === apiMethods.POST) return POST(req, res, token);

  const error = createApiError({ error: {} });
  return res.status(500).json(error);
}

export default ApiHandler(handler, {
  guard: 'auth',
});
