import { z } from 'zod';
import { insertTermSchema, terms } from './schema';

export const api = {
  terms: {
    list: {
      method: 'GET' as const,
      path: '/api/terms',
      responses: {
        200: z.array(z.custom<typeof terms.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/terms/:id',
      responses: {
        200: z.custom<typeof terms.$inferSelect>(),
        404: z.object({ message: z.string() }),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/terms',
      input: insertTermSchema,
      responses: {
        201: z.custom<typeof terms.$inferSelect>(),
        400: z.object({ message: z.string() }),
      },
    },
  },
};

// Helper to build URLs with params
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
