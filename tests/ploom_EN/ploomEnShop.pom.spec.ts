import { test, expect } from '@playwright/test';
import { waitForCartUpdateResponse } from '../helpers/api.helpers';
import { ShopEnPage } from '../pages/ploomEnShop.page';

test.describe('Verify shop functionality (POM, EN)', () => {
  let shopEnPage: ShopEnPage;
  test.beforeEach(async ({ page }) => {
    shopEnPage = new ShopEnPage(page);
    await shopEnPage.navigate();
  });

  test(
    'Verify if it is possible to add a product to the cart.',
    { tag: ['@task_1', '@ui'] },
    async ({ page }) => {
      // Arrange
      const productName = 'Ploom X Advanced';
      const productFullName = 'Ploom X Advanced Silver';
      const shopURL = 'https://www.ploom.co.uk/en/shop';

      // Act
      await expect(page).toHaveURL(shopURL);
      await shopEnPage.addProductToCart('ploom-x-advanced');
      await shopEnPage.verifyProductDetails(productName);
      const [response] = await Promise.all([
        page.waitForResponse(waitForCartUpdateResponse),
        page.getByTestId('pdpAddToProduct').click(),
      ]);

      // Assert
      const json = await response.json();
      expect(json.data.cart.items[0].product.name).toBe(productFullName);
      await shopEnPage.verifyProductAddedToCart(productFullName);
      await shopEnPage.goToCheckout();
      await shopEnPage.verifyProductInCart(productFullName);
    },
  );

  test(
    'Verify if it is possible to remove a product from the cart.',
    { tag: ['@task_2', '@ui'] },
    async () => {
      const product = 'ploom-x-advanced';
      // Arrange
      const emptyCartMessage =
        'You have no items in your shopping cart at the moment.';

      // Act
      await shopEnPage.addProductToCart(product);
      await expect(shopEnPage.cartCount).toHaveText('1');
      await shopEnPage.goToCheckout();
      await shopEnPage.removeProductFromCart();
      await shopEnPage.verifyEmptyCart(emptyCartMessage);
    },
  );

  test(
    'Verify if there are no broken links or images on the product page',
    { tag: ['@task_3', '@ui'] },
    async ({ request }) => {
      const product = 'ploom-x-advanced';
      // Act & Assert
      await shopEnPage.addProductToCart(product);
      await shopEnPage.verifyNoBrokenLinksAndImages(request);
    },
  );
});
