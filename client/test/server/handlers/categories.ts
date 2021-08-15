import { rest } from 'msw';

import { fakeCategories } from '@/test/fake-data';
import { API_URL } from '@/utils/constants';

export const categoriesHandlers = [
  rest.get(`${API_URL}/categories`, (_, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        data: fakeCategories,
      })
    );
  }),
];
