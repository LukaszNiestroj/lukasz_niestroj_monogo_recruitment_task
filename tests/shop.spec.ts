import { test, expect } from '@playwright/test';
import { waitForCartUpdateResponse } from './helpers/api.helpers';

test.describe('Verify shop funcionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://www.ploom.co.uk/en');
    await page.getByRole('button', { name: 'GOT IT' }).click();
    await page.getByText('Yes, discover more').click();
  });

  test(
    'Verify if it is possible to add a product to the cart.',
    { tag: ['@task_1', '@ui'] },
    async ({ page }) => {
      // Arrange
      const productName = 'Ploom X Advanced';
      const productFullName = 'Ploom X Advanced Silver';
      const shopURL = 'https://www.ploom.co.uk/en/shop';
      const productSelector = '[data-sku="ploom-x-advanced"]';
      const cartCheckoutURL = 'https://www.ploom.co.uk/en/cart-n-checkout#/';

      // Act
      await page.getByTestId('headerItem-0').click();
      await expect(page).toHaveURL(shopURL);

      await page.getByTestId('CloseShopMenu').first().click();
      await page.locator(productSelector).click();

      await expect(page.getByTestId('product-details')).toContainText(
        productName,
      );
      await page.getByTestId('pdpAddToProduct').click();

      // Assert
      await expect(page.getByText('Product added to cart')).toBeVisible();

      const cartCount = page.locator('[data-testid="cartIcon"] span');
      await expect(cartCount).toHaveText('1');

      await expect(page.getByTestId('miniCart')).toContainText(productFullName);

      // Act
      await page.getByTestId('miniCartCheckoutButton').click();

      // Assert
      await expect(page).toHaveURL(cartCheckoutURL);
      await expect(page.getByTestId('main-section')).toContainText(
        productFullName,
      );
    },
  );

  test(
    'Verify API response after adding product to cart',
    { tag: ['@task_1', '@api'] },
    async ({ page }) => {
      // Arrange
      const productSelector = '[data-sku="ploom-x-advanced"]';
      const expectedProductName = 'Ploom X Advanced Silver';

      await page.getByTestId('headerItem-0').click();
      await page.getByTestId('CloseShopMenu').first().click();
      await page.locator(productSelector).click();

      // Act
      const [response] = await Promise.all([
        page.waitForResponse(waitForCartUpdateResponse),
        page.getByTestId('pdpAddToProduct').click(),
      ]);

      // Assert
      const json = await response.json();
      expect(json.data.cart.items[0].product.name).toBe(expectedProductName);
    },
  );
});
