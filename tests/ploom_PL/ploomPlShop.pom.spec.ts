import { test, expect } from '@playwright/test';
import { waitForCartUpdateResponse } from '../helpers/api.helpers';
import { ShopPlPage } from '../pages/ploomPlShop.page';

test.describe('Verify shop functionality (POM, PL)', () => {
  let shopPlPage: ShopPlPage;
  test.beforeEach(async ({ page }) => {
    shopPlPage = new ShopPlPage(page);
    await shopPlPage.navigate();
  });

  test(
    'Verify if it is possible to add a product to the cart.',
    { tag: ['@pl', '@task_1', '@ui'] },
    async ({ page }) => {
      // Arrange
      const productName = 'Ploom X Advanced';
      const productFullName = 'Ploom X Advanced Black';
      const shopURL = 'https://www.ploom.pl/pl/sklep';

      // Act
      await expect(page).toHaveURL(shopURL);
      await shopPlPage.addProductToCart('16355378');
      await shopPlPage.verifyProductDetails(productName);
      const [response] = await Promise.all([
        page.waitForResponse(waitForCartUpdateResponse),
        page.getByTestId('pdpAddToProduct').click(),
      ]);

      // Assert
      const json = await response.json();
      expect(json.data.cart.items[0].product.name).toBe(productFullName);
      await shopPlPage.verifyProductAddedToCart(productFullName);
      await shopPlPage.goToCheckout();
      await shopPlPage.verifyProductInCart(productFullName);
    },
  );

  test(
    'Verify if it is possible to remove a product from the cart.',
    { tag: ['@pl', '@task_2', '@ui'] },
    async () => {
      const product = '16355378';
      const emptyCartMessage = 'W tym momencie Twój koszyk jest pusty.';

      await shopPlPage.addProductToCart(product);
      await expect(shopPlPage.cartCount).toHaveText('1');
      await shopPlPage.goToCheckout();
      await shopPlPage.removeProductFromCart();
      await shopPlPage.verifyEmptyCart(emptyCartMessage);
    },
  );

  test(
    'Verify if there are no broken links or images on the product page',
    { tag: ['@pl', '@task_3', '@ui'] },
    async ({ request }) => {
      const product = '16355378';
      await shopPlPage.addProductToCart(product);
      await shopPlPage.verifyNoBrokenLinksAndImages(request);
    },
  );
});
