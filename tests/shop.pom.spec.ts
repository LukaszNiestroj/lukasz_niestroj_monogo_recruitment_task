import { test, expect } from '@playwright/test';
import { waitForCartUpdateResponse } from './helpers/api.helpers';
import { ShopPage } from './pages/shop.page';

test.describe('Verify shop funcionality (POM)', () => {
  let shopPage: ShopPage;
  test.beforeEach(async ({ page }) => {
    shopPage = new ShopPage(page);
    await shopPage.navigate();
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
      const expectedProductName = 'Ploom X Advanced Silver';

      // Act
      await expect(page).toHaveURL(shopURL);
      await shopPage.addProductToCart('ploom-x-advanced');
      await shopPage.verifyProductDetails(productName);
      const [response] = await Promise.all([
        page.waitForResponse(waitForCartUpdateResponse),
        page.getByTestId('pdpAddToProduct').click(),
      ]);

      // Assert
      const json = await response.json();
      expect(json.data.cart.items[0].product.name).toBe(expectedProductName);
      await shopPage.verifyProductAddedToCart(productFullName);
      await shopPage.goToCheckout();
      await shopPage.verifyProductInCart(productFullName);
    },
  );

  test(
    'Verify if it is possible to remove a product from the cart.',
    { tag: ['@task_2', '@ui'] },
    async () => {
      test.setTimeout(120_000);
      // Arrange
      const emptyCartMessage =
        'You have no items in your shopping cart at the moment.';

      // Act
      await shopPage.addProductToCart('ploom-x-advanced');
      await expect(shopPage.cartCount).toHaveText('1');
      await shopPage.goToCheckout();
      await shopPage.removeProductFromCart();
      await shopPage.verifyEmptyCart(emptyCartMessage);
    },
  );

  test(
    'Verify if there are no broken links or images on the product page',
    { tag: ['@task_3', '@ui'] },
    async ({ request }) => {
      // Act & Assert
      await shopPage.addProductToCart('ploom-x-advanced');
      await shopPage.verifyNoBrokenLinksAndImages(request);
    },
  );
});
