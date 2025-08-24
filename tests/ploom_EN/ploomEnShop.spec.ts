import { test, expect } from '@playwright/test';
import { waitForCartUpdateResponse } from '../helpers/api.helpers';

test.describe('Verify shop functionality', () => {
  test.beforeEach(async ({ page }) => {
    const closeShopMenu = page
      .locator('li.navigation__item--active')
      .getByTestId('CloseShopMenu');
    await page.goto('/');
    await page.getByRole('button', { name: 'GOT IT' }).click();
    await page.getByText('Yes, discover more').click();
    await page.getByTestId('headerItem-0').click();
    await closeShopMenu.click();
  });

  test(
    'Verify if it is possible to add a product to the cart.',
    { tag: ['@en', '@task_1', '@ui'] },
    async ({ page }) => {
      // Arrange
      const productName = 'Ploom X Advanced';
      const productFullName = 'Ploom X Advanced Silver';
      const shopURL = 'https://www.ploom.co.uk/en/shop';
      const addedToCartPopup = page.getByText('Product added to cart');
      const cartCount = page.locator('[data-testid="cartIcon"] span');
      const miniCartIcon = page.getByTestId('miniCart');
      const cartListSelector = '[data-testid="regular-cart-list"]';
      const productDetails = page.getByTestId('product-details');
      const productSelector = '[data-sku="ploom-x-advanced"]';
      const loaderSelector = '[class*="Loading-module-active"]';
      const cartMainSection = page.getByTestId('main-section');

      // Act
      await expect(page).toHaveURL(shopURL);
      await page.locator(productSelector).click();

      await expect(productDetails).toContainText(productName);
      const [response] = await Promise.all([
        page.waitForResponse(waitForCartUpdateResponse),
        page.getByTestId('pdpAddToProduct').click(),
      ]);

      // Assert
      const json = await response.json();
      expect(json.data.cart.items[0].product.name).toBe(productFullName);

      // Assert
      await expect(addedToCartPopup).toBeVisible();
      await expect(cartCount).toHaveText('1');
      await expect(miniCartIcon).toContainText(productFullName);

      // Act
      await page.getByTestId('miniCartCheckoutButton').click();
      await page.addStyleTag({
        content: `${loaderSelector} { display: none !important; }`,
      });

      // Assert
      await expect(page).toHaveURL(/cart-n-checkout/);
      await page.waitForSelector(cartListSelector);
      await expect(cartMainSection).toContainText(productFullName);
    },
  );

  test(
    'Verify if it is possible to remove a product from the cart.',
    { tag: ['@task_2', '@ui'] },
    async ({ page }) => {
      // Arrange
      const productSelector = '[data-sku="ploom-x-advanced"]';
      const cartCountSelector = '[data-testid="cartIcon"] span';
      const loaderSelector = '[class*="Loading-module-active"]';
      const emptyCartLocator = page.getByTestId('emptyCartContainer').nth(1);
      const emptyCartMessage =
        'You have no items in your shopping cart at the moment.';

      // Act
      await page.locator(productSelector).click();
      await page.getByTestId('pdpAddToProduct').click();

      // Assert
      await expect(page.locator(cartCountSelector)).toHaveText('1');

      // Act
      await page.getByTestId('miniCartCheckoutButton').click();

      await page.addStyleTag({
        content: `${loaderSelector} { display: none !important; }`,
      });

      // Assert
      await expect(page).toHaveURL(/cart-n-checkout/);

      // Act
      await expect(
        page.getByRole('button', { name: 'Remove Item' }),
      ).toBeVisible();
      await page.getByRole('button', { name: 'Remove Item' }).click();
      await page.getByTestId('remove-item-submit-button').click();

      // Assert
      await expect(emptyCartLocator).toHaveText(emptyCartMessage);
      await expect(page.locator(cartCountSelector)).toHaveCount(0);
    },
  );

  test(
    'Verify if there are no broken links or images on the product page',
    { tag: ['@task_3', '@ui'] },
    async ({ page, request }) => {
      // Arrange
      const productSelector = '[data-sku="ploom-x-advanced"]';

      // Act
      await page.locator(productSelector).click();
      await expect(page).toHaveURL(/ploom-x-advanced/);

      const links = await page.locator('aem-productDetails_container a').all();
      const images = await page
        .locator('aem-productDetails_container img')
        .all();

      // Assert
      for (const link of links) {
        const url = await link.getAttribute('href');
        if (url && !url.startsWith('#')) {
          const response = await request.get(
            url.startsWith('http') ? url : new URL(url, page.url()).toString(),
          );
          expect(response.status(), `Broken link: ${url}`).toBe(200);
        }
      }

      for (const img of images) {
        const src = await img.getAttribute('src');
        if (src) {
          const response = await request.get(src);
          expect(response.status(), `Broken image: ${src}`).toBe(200);

          const isVisible = await img.evaluate(
            (node: HTMLImageElement) => node.complete && node.naturalWidth > 0,
          );
          expect(isVisible, `Image not rendered: ${src}`).toBeTruthy();
        }
      }
    },
  );
});
