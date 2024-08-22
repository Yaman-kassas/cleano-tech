import type { NextApiRequest, NextApiResponse } from 'next';
import { apiEndpoints, httpCode } from '../../data';
import { BackAPI } from '../../lib';
import { ConvertApiError } from '@/utils/ConvertApiError';
import { companyOfferResponseTransformer } from '@/store/company-offers';
import { companyOfferRequestTransformer } from '@/store/company-offers/request-transformers';
import { getCookies } from 'cookies-next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const cookies = getCookies({ req });
  const selectedLanguage = cookies.NEXT_LOCALE;
  try {
    const { data } = await BackAPI.post(
      apiEndpoints.companyOffers,
      companyOfferRequestTransformer.parse({ data: req.body }),
      {
        headers: {
          locale: selectedLanguage ?? 'de',
        },
      },
    );

    const transformedData = companyOfferResponseTransformer.parse({
      ...(data as Object),
    });
    return res.status(httpCode.SUCCESS).send(transformedData);
  } catch (e) {
    const error = ConvertApiError({ error: e });
    return res.status(error.status).json(error);
  }
};
