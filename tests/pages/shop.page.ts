import { Page, Locator, expect, APIRequestContext } from '@playwright/test';

export class ShopPage {
  readonly page: Page;
  readonly cartCount: Locator;
  readonly miniCart: Locator;
  readonly miniCartCheckoutButton: Locator;
  readonly closeShopMenu: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartCount = page.locator('[data-testid="cartIcon"] span');
    this.miniCart = page.getByTestId('miniCart');
    this.miniCartCheckoutButton = page.getByTestId('miniCartCheckoutButton');
    this.closeShopMenu = page
      .locator('li.navigation__item--active')
      .getByTestId('CloseShopMenu');
  }

  async navigate() {
    await this.page.goto('/');
    await this.page.getByRole('button', { name: 'GOT IT' }).click();
    await this.page.getByText('Yes, discover more').click();
    await this.page.getByTestId('headerItem-0').click();
    await this.page.getByTestId('CloseShopMenu').first().click();
  }

  async addProductToCart(sku: string) {
    await this.page.locator(`[data-sku="${sku}"]`).click();
    await this.page.getByTestId('pdpAddToProduct').click();
  }

  async removeProductFromCart() {
    await this.page.getByRole('button', { name: 'Remove Item' }).click();
    await this.page.getByTestId('remove-item-submit-button').click();
  }

  async goToCheckout() {
    await this.miniCartCheckoutButton.click();
    await expect(this.page).toHaveURL(/cart-n-checkout/);
    await this.page
      .getByTestId('main-section')
      .waitFor({ state: 'visible', timeout: 120_000 });
  }

  async verifyProductInCart(productFullName: string) {
    await expect(this.page.getByTestId('main-section')).toContainText(
      productFullName,
    );
  }

  async verifyEmptyCart(emptyCartMessage: string) {
    await expect(this.page.getByTestId('emptyCartContainer').nth(1)).toHaveText(
      emptyCartMessage,
    );
    await expect(this.cartCount).toHaveCount(0);
  }

  async verifyProductDetails(productName: string) {
    await expect(this.page.getByTestId('product-details')).toContainText(
      productName,
    );
  }

  async verifyProductAddedToCart(productFullName: string) {
    await expect(
      this.page.getByText('Product added to cart').last(),
    ).toBeVisible();
    await expect(this.cartCount).toHaveText('1');
    await expect(this.miniCart).toContainText(productFullName);
  }

  async verifyNoBrokenLinksAndImages(request: APIRequestContext) {
    const links = await this.page
      .locator('aem-productDetails_container a')
      .all();
    const images = await this.page
      .locator('aem-productDetails_container img')
      .all();

    for (const link of links) {
      const url = await link.getAttribute('href');
      if (url && !url.startsWith('#')) {
        const response = await request.get(
          url.startsWith('http')
            ? url
            : new URL(url, this.page.url()).toString(),
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
  }
}
