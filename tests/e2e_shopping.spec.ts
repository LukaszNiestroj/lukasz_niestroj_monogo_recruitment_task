import { test, expect } from '@playwright/test';
import { waitForCartUpdateResponse } from './helpers/api.helpers';

test.describe('End-2-End Shopping', () => {
  test(
    'Verify if it is possible to add a product to the cart.',
    { tag: ['@task_1', '@ui'] },
    async ({ page }) => {
      test.setTimeout(120_000);
      // Arrange
      const productName = 'Ploom X Advanced';
      const productFullName = 'Ploom X Advanced Silver';
      const shopURL = 'https://www.ploom.co.uk/en/shop';
      const productSelector = '[data-sku="ploom-x-advanced"]';
      const expectedProductName = 'Ploom X Advanced Silver';
      const cartCount = page.locator('[data-testid="cartIcon"] span');
      const cartCountSelector = '[data-testid="cartIcon"] span';
      const emptyCartMessage =
      'You have no items in your shopping cart at the moment.';

      await page.goto('/');
      await page.getByRole('button', { name: 'GOT IT' }).click();
      await page.getByText('Yes, discover more').click();

      // Act
      await page.getByTestId('headerItem-0').click();
      await expect(page).toHaveURL(shopURL);
      await page.getByTestId('CloseShopMenu').first().click();
      await page.locator(productSelector).click();

      await expect(page.getByTestId('product-details')).toContainText(
        productName,
      );
      const [response] = await Promise.all([
        page.waitForResponse(waitForCartUpdateResponse),
        page.getByTestId('pdpAddToProduct').click(),
      ]);

      // Assert
      const json = await response.json();
      expect(json.data.cart.items[0].product.name).toBe(expectedProductName);

      // Assert
      await expect(page.getByText('Product added to cart')).toBeVisible();
      await expect(cartCount).toHaveText('1');
      await expect(page.getByTestId('miniCart')).toContainText(productFullName);

      // Act
      await page.getByTestId('miniCartCheckoutButton').click();

      // Assert
      await expect(page).toHaveURL(/cart-n-checkout/);
      await page
        .getByTestId('main-section')
        .waitFor({ state: 'visible', timeout: 120_000 });
      await expect(page.getByTestId('main-section')).toContainText(
        productFullName,
      );

      // Act
      await page.getByRole('button', { name: 'Remove Item' }).click();
      await page.getByTestId('remove-item-submit-button').click();

      // Assert
      await expect(page.getByTestId('emptyCartContainer').nth(1)).toHaveText(
        emptyCartMessage,
      );
      expect(await page.locator(cartCountSelector).count()).toBe(0);
    },
  );
});
