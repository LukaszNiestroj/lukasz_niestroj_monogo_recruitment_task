import { test, expect } from '@playwright/test';
import { waitForCartUpdateResponse } from './helpers/api.helpers';

test.describe('Verify shop funcionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'GOT IT' }).click();
    await page.getByText('Yes, discover more').click();
  });

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
      // await page.getByTestId('pdpAddToProduct').click();

      // Assert
      await expect(page.getByText('Product added to cart')).toBeVisible();

      const cartCount = page.locator('[data-testid="cartIcon"] span');
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
    },
  );

  test(
    'Verify if it is possible to remove a product from the cart.',
    { tag: ['@task_2', '@ui'] },
    async ({ page }) => {
      test.setTimeout(120_000);
      // Arrange
      const productSelector = '[data-sku="ploom-x-advanced"]';
      const cartCountSelector = '[data-testid="cartIcon"] span';
      const emptyCartMessage =
        'You have no items in your shopping cart at the moment.';

      // Arrange
      await page.getByTestId('headerItem-0').click();
      await page.getByTestId('CloseShopMenu').first().click();

      // Act
      await page.locator(productSelector).click();
      await page.getByTestId('pdpAddToProduct').click();

      // Assert
      await expect(page.locator(cartCountSelector)).toHaveText('1');

      // Act
      await page.getByTestId('miniCartCheckoutButton').click();

      // Assert
      await expect(page).toHaveURL(/cart-n-checkout/);

      // Act
      await page
        .getByTestId('main-section')
        .waitFor({ state: 'visible', timeout: 120_000 });
      await page.getByRole('button', { name: 'Remove Item' }).click();
      await page.getByTestId('remove-item-submit-button').click();

      // Assert
      await expect(page.getByTestId('emptyCartContainer').nth(1)).toHaveText(
        emptyCartMessage,
      );
      expect(await page.locator(cartCountSelector).count()).toBe(0);
    },
  );

  test(
    'Verify if there are no broken links or images on the product page',
    { tag: ['@task_3', '@ui'] },
    async ({ page, request }) => {
      // Arrange
      const productSelector = '[data-sku="ploom-x-advanced"]';

      // Go to product page
      await page.getByTestId('headerItem-0').click();
      await page.getByTestId('CloseShopMenu').first().click();
      await page.locator(productSelector).click();
      await expect(page).toHaveURL(/ploom-x-advanced/);

      // Collect all links and images inside product-details container
      const links = await page.locator('aem-productDetails_container a').all();
      const images = await page
        .locator('aem-productDetails_container img')
        .all();

      // Check links
      for (const link of links) {
        const url = await link.getAttribute('href');
        if (url && !url.startsWith('#')) {
          const response = await request.get(
            url.startsWith('http') ? url : new URL(url, page.url()).toString(),
          );
          expect(response.status(), `Broken link: ${url}`).toBe(200);
        }
      }

      // Check images
      for (const img of images) {
        const src = await img.getAttribute('src');
        if (src) {
          const response = await request.get(src);
          expect(response.status(), `Broken image: ${src}`).toBe(200);

          // dodatkowe sprawdzenie czy obraz faktycznie się załadował
          const isVisible = await img.evaluate(
            (node: HTMLImageElement) => node.complete && node.naturalWidth > 0,
          );
          expect(isVisible, `Image not rendered: ${src}`).toBeTruthy();
        }
      }
    },
  );
});
