import type { NextApiRequest, NextApiResponse } from 'next';
import { apiEndpoints, apiMethods, httpCode } from '../../../data';
import { BackAPI } from '../../../lib';
import {
  getOrdersResponseTransformer,
  paymentBackendRequestSchema,
  updateStatusBackendRequestSchema,
} from '@/store/order';

import { ApiToken } from '@/types/backend-types';
import createApiResponse from '@/utils/create-api-response';
import createApiError from '@/utils/create-api-error';
import { ApiHandler } from '@/utils/api-handler';
import { getCookies } from 'cookies-next';

const GET = async (
  req: NextApiRequest,
  res: NextApiResponse,
  token: ApiToken | null,
) => {
  const { query: params } = req;
  const status = params['filters[status]'];
  const cookies = getCookies({ req });
  const selectedLanguage = cookies.NEXT_LOCALE;
  try {
    const { data } = await BackAPI.get(apiEndpoints.orders(), {
      headers: {
        Authorization: token?.token,
        locale: selectedLanguage ?? 'de',
      },
      params: {
        'filters[user]': token?.sub,
        'filters[status]': status ?? null,
        populate: {
          city: {
            populate: params['populate[city]'] === 'true' ? '*' : null,
          },
          service: {
            populate: params['populate[service]'] === 'true' ? '*' : null,
          },
          house: {
            populate: params['populate[house]'] === 'true' ? '*' : null,
          },
          addons: {
            populate: params['populate[addons]'] === 'true' ? '*' : null,
          },
          coupon: {
            populate: params['populate[coupon]'] === 'true' ? '*' : null,
          },
        },
        pagination: {
          page: params['pagination[page]'],
          pageSize: params['pagination[pageSize]'],
        },
      },
    });

    return createApiResponse(req, res, getOrdersResponseTransformer, data);
  } catch (e) {
    const error = createApiError({ error: e });
    return res.status(error.code).json(error);
  }
};

const PUT = async (
  req: NextApiRequest,
  res: NextApiResponse,
  token: ApiToken | null,
) => {
  const { body, query: params } = req;
  const cookies = getCookies({ req });
  const selectedLanguage = cookies.NEXT_LOCALE;
  try {
    const transformedRequest = updateStatusBackendRequestSchema.parse({
      ...body,
    });
    await BackAPI.put(
      apiEndpoints.orders(params.id as string),
      transformedRequest,
      {
        headers: {
          Authorization: token?.token,
          locale: selectedLanguage ?? 'de',
        },
      },
    );
    return res.status(httpCode.SUCCESS).json({ message: 'successfulRequest' });
  } catch (e) {
    const error = createApiError({ error: e });
    return res.status(httpCode.BAD_REQUEST).json(error);
  }
};

const DELETE = async (
  req: NextApiRequest,
  res: NextApiResponse,
  token: ApiToken | null,
) => {
  const { query: params } = req;
  const cookies = getCookies({ req });
  const selectedLanguage = cookies.NEXT_LOCALE;
  try {
    await BackAPI.delete(apiEndpoints.orders(params.id as string), {
      headers: {
        Authorization: token?.token,
        locale: selectedLanguage ?? 'en',
      },
    });
    return res.status(httpCode.SUCCESS).json({ message: 'successfulRequest' });
  } catch (e) {
    const error = createApiError({ error: e });
    return res.status(httpCode.BAD_REQUEST).json(error);
  }
};

const POST = async (
  req: NextApiRequest,
  res: NextApiResponse,
  token: ApiToken | null,
) => {
  const { body, query: params } = req;
  const cookies = getCookies({ req });
  const selectedLanguage = cookies.NEXT_LOCALE;
  try {
    const transformedRequest = paymentBackendRequestSchema.parse({
      ...body,
    });
    const { data } = await BackAPI.post(
      apiEndpoints.orders(undefined, !!params?.payment, !!params?.download),
      { data: transformedRequest },

      {
        headers: {
          Authorization: token?.token,
          locale: selectedLanguage ?? 'en',
        },
      },
    );
    return res
      .status(httpCode.SUCCESS)
      .json({ message: 'successfulRequest', url: data.url });
  } catch (e) {
    // const error = createApiError({ error: e });
    return res.status(httpCode.BAD_REQUEST).json(e);
  }
};

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  token: ApiToken | null,
) {
  if (req.method === apiMethods.GET) return GET(req, res, token);
  if (req.method === apiMethods.PUT) return PUT(req, res, token);
  if (req.method === apiMethods.DELETE) return DELETE(req, res, token);
  if (req.method === apiMethods.POST) return POST(req, res, token);

  const error = createApiError({ error: {} });
  return res.status(500).json(error);
}

export default ApiHandler(handler, {
  guard: 'auth',
});
