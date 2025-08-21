import { type Response } from '@playwright/test';

export const waitForCartUpdateResponse = async (
  resp: Response,
): Promise<boolean> => {
  if (!resp.url().includes('/graphql') || resp.request().method() !== 'POST') {
    return false;
  }
  const postData = resp.request().postData() || '';
  if (!postData.includes('getCartItems')) {
    return false;
  }
  try {
    const json = await resp.json();
    const items = json?.data?.cart?.items;
    return Array.isArray(items) && items.length > 0;
  } catch {
    return false;
  }
};
