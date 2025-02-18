// Import utils
import helper from '@utils/helpers';
import testContext from '@utils/testContext';

// Import common tests
import {installHummingbird, uninstallHummingbird} from '@commonTests/BO/design/hummingbird';

// Import FO pages
import cartPage from '@pages/FO/hummingbird/cart';
import homePage from '@pages/FO/hummingbird/home';
import loginPage from '@pages/FO/hummingbird/login';
import productPage from '@pages/FO/hummingbird/product';
import checkoutPage from '@pages/FO/hummingbird/checkout';
import quickViewModal from '@pages/FO/hummingbird/modal/quickView';
import blockCartModal from '@pages/FO/hummingbird/modal/blockCart';

import {expect} from 'chai';
import type {BrowserContext, Page} from 'playwright';
import {
  dataProducts,
} from '@prestashop-core/ui-testing';

const baseContext: string = 'functional_FO_hummingbird_checkout_showDetails';

/*
Pre-condition:
- Install the theme hummingbird
Scenario:
- Add first and third product to cart
- Go to checkout page
- Click on show details
- Show all details
- Click on the product image
- Click on the product name
Post-condition:
- Uninstall the theme hummingbird
 */

describe('FO - Checkout : Show details', async () => {
  let browserContext: BrowserContext;
  let page: Page;

  // Pre-condition : Install Hummingbird
  installHummingbird(`${baseContext}_preTest`);

  before(async function () {
    browserContext = await helper.createBrowserContext(this.browser);
    page = await helper.newTab(browserContext);
  });

  after(async () => {
    await helper.closeBrowserContext(browserContext);
  });

  describe('Show details', async () => {
    it('should go to FO', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToFo', baseContext);

      await homePage.goToFo(page);
      await homePage.changeLanguage(page, 'en');

      const isHomePage = await homePage.isHomePage(page);
      expect(isHomePage, 'Fail to open FO home page').to.eq(true);
    });

    it('should add the first product to cart then close block cart modal', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'addProductToCart1', baseContext);

      await homePage.quickViewProduct(page, 1);
      await quickViewModal.addToCartByQuickView(page);

      const isModalClosed = await blockCartModal.closeBlockCartModal(page);
      expect(isModalClosed).to.eq(true);
    });

    it('should add the third product to cart', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'addProductToCart2', baseContext);

      await loginPage.goToHomePage(page);
      await homePage.quickViewProduct(page, 3);
      await quickViewModal.setQuantityAndAddToCart(page, 2);
      await blockCartModal.proceedToCheckout(page);

      const pageTitle = await cartPage.getPageTitle(page);
      expect(pageTitle).to.equal(cartPage.pageTitle);
    });

    it('should proceed to checkout and go to checkout page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'proceedToCheckout', baseContext);

      await cartPage.clickOnProceedToCheckout(page);

      const isCheckoutPage = await checkoutPage.isCheckoutPage(page);
      expect(isCheckoutPage).to.eq(true);
    });

    it('should check the items number', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'checkItemsNumber', baseContext);

      const itemsNumber = await checkoutPage.getItemsNumber(page);
      expect(itemsNumber).to.equal('3 items');
    });

    it('should click on \'Show details\' link', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'showDetails', baseContext);

      const isProductsListVisible = await checkoutPage.clickOnShowDetailsLink(page);
      expect(isProductsListVisible).to.eq(true);
    });

    it('should check the first product details', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'checkFirstProductDetails', baseContext);
      const result = await checkoutPage.getProductDetails(page, 1);
      await Promise.all([
        expect(result.image).to.contains(dataProducts.demo_1.coverImage),
        expect(result.name).to.equal(dataProducts.demo_1.name),
        expect(result.quantity).to.equal(1),
        expect(result.price).to.equal(dataProducts.demo_1.finalPrice),
      ]);

      const attributes = await checkoutPage.getProductAttributes(page, 1);
      expect(attributes).to.equal('Size: S');
    });

    it('should check the second product details', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'checkSecondProductDetails', baseContext);
      const result = await checkoutPage.getProductDetails(page, 2);
      await Promise.all([
        expect(result.image).to.contains(dataProducts.demo_6.coverImage),
        expect(result.name).to.equal(dataProducts.demo_6.name),
        expect(result.quantity).to.equal(2),
        expect(result.price).to.equal(dataProducts.demo_6.combinations[0].price),
      ]);

      const attributes = await checkoutPage.getProductAttributes(page, 2);
      expect(attributes).to.equal('Dimension: 40x60cm');
    });

    it('click on first product name', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'clickOnFirstProductName', baseContext);

      page = await checkoutPage.clickOnProductName(page, 1);

      const productInformation = await productPage.getProductInformation(page);
      expect(productInformation.name).to.equal(dataProducts.demo_1.name);
    });

    it('should close the page and click on the first product image', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'clickOnFirstProductImage', baseContext);

      page = await productPage.closePage(browserContext, page, 0);
      await checkoutPage.clickOnProductImage(page, 1);

      const productInformation = await productPage.getProductInformation(page);
      expect(productInformation.name).to.equal(dataProducts.demo_1.name);
    });
  });

  // Post-condition : Uninstall Hummingbird
  uninstallHummingbird(`${baseContext}_postTest`);
});
