import { test, expect } from '@playwright/test';
import { waitForCartUpdateResponse } from '../helpers/api.helpers';

test.describe('End-2-End Shopping (PL)', () => {
  test(
    'Cart functionality add and remove product.',
    { tag: ['@pl', '@task_1', '@ui'] },
    async ({ page }) => {
      // Arrange
      const productName = 'Ploom X Advanced';
      const productFullName = 'Ploom X Advanced Black';
      const shopURL = 'https://www.ploom.pl/pl/sklep';
      const productSelector = '[data-sku="16355378"]';
      const cartCount = page.locator('[data-testid="cartIcon"] span');
      const cartCountSelector = '[data-testid="cartIcon"] span';
      const loaderSelector = '[class*="Loading-module-active"]';
      const cartListSelector = '[data-testid="regular-cart-list"]';
      const emptyCartMessage = 'W tym momencie Twój koszyk jest pusty.';

      await page.goto('/');
      await page
        .getByRole('button', { name: 'Akceptuj wszystkie pliki cookie' })
        .click();
      await page.getByRole('button', { name: 'Potwierdź' }).click();

      // Act
      await page
        .getByTestId('header')
        .getByRole('link', { name: 'Sklep' })
        .click();
      await page
        .locator('li.navigation__item--active')
        .getByTestId('CloseShopMenu')
        .click();
      await expect(page).toHaveURL(shopURL);
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
      expect(json.data.cart.items[0].product.name).toBe(productFullName);

      // Assert
      await expect(cartCount).toHaveText('1');
      await expect(page.getByTestId('miniCart')).toContainText(productFullName);

      // Act
      await page.getByTestId('miniCartCheckoutButton').click();

      // Assert
      await page.addStyleTag({
        content: `${loaderSelector} { display: none !important; }`,
      });
      await expect(page).toHaveURL(/cart/);
      await page.waitForSelector(cartListSelector);
      await expect(page.getByTestId('main-section')).toContainText(
        productFullName,
      );

      // Act
      await page.getByRole('button', { name: 'Usuń produkt' }).click();
      await page.getByTestId('remove-item-submit-button').click();

      // Assert
      await expect(page.getByTestId('emptyCartContainer').nth(1)).toHaveText(
        emptyCartMessage,
      );
      expect(await page.locator(cartCountSelector).count()).toBe(0);
    },
  );
});
