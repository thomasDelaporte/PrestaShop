// Import utils
import helper from '@utils/helpers';
import testContext from '@utils/testContext';

// Import FO pages
import {cartPage} from '@pages/FO/classic/cart';
import {homePage} from '@pages/FO/classic/home';
import {productPage} from '@pages/FO/classic/product';
import {blockCartModal} from '@pages/FO/classic/modal/blockCart';
import {searchResultsPage} from '@pages/FO/classic/searchResults';

import {expect} from 'chai';
import type {BrowserContext, Page} from 'playwright';
import {
  dataProducts,
} from '@prestashop-core/ui-testing';

const baseContext: string = 'functional_FO_classic_cart_cart_displayModalProductCustomization';

describe('FO - cart : Display modal of product customization', async () => {
  let browserContext: BrowserContext;
  let page: Page;
  const customText: string = 'Hello world!';

  before(async function () {
    browserContext = await helper.createBrowserContext(this.browser);
    page = await helper.newTab(browserContext);
  });

  after(async () => {
    await helper.closeBrowserContext(browserContext);
  });

  it('should open the shop page', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'goToFo', baseContext);

    await homePage.goToFo(page);
    await homePage.changeLanguage(page, 'en');

    const isHomePage = await homePage.isHomePage(page);
    expect(isHomePage, 'Fail to open FO home page').to.eq(true);
  });

  it(`should search for the product '${dataProducts.demo_14.name}'`, async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'searchProduct', baseContext);

    await homePage.searchProduct(page, dataProducts.demo_14.name);

    const pageTitle = await searchResultsPage.getPageTitle(page);
    expect(pageTitle).to.equal(searchResultsPage.pageTitle);
  });

  it('should go to the product page', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'goToProductPage', baseContext);

    await searchResultsPage.goToProductPage(page, 1);

    const pageTitle = await productPage.getPageTitle(page);
    expect(pageTitle).to.contains(dataProducts.demo_14.name);
  });

  it('should add custom text and add the product to cart', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'addProductToCart', baseContext);

    await productPage.setProductCustomizations(page, [customText]);

    await productPage.clickOnAddToCartButton(page);

    const isBlockCartModal = await blockCartModal.isBlockCartModalVisible(page);
    expect(isBlockCartModal).to.equal(true);

    const successMessage = await blockCartModal.getBlockCartModalTitle(page);
    expect(successMessage).to.contains(homePage.successAddToCartMessage);
  });

  it('should click on continue shopping button', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'continueShopping', baseContext);

    const isModalNotVisible = await blockCartModal.continueShopping(page);
    expect(isModalNotVisible).to.equal(true);
  });

  it('should go to the cart page', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'goToCartPage', baseContext);

    await productPage.goToCartPage(page);

    const pageTitle = await cartPage.getPageTitle(page);
    expect(pageTitle).to.equal(cartPage.pageTitle);
  });

  it('should click on product customization and check the modal', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'clickCustomization', baseContext);

    const isModalVisible = await cartPage.clickOnProductCustomization(page, 1);
    expect(isModalVisible).to.equal(true);
  });

  it('should check the customization modal content', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'getModalContent', baseContext);

    const modalContent = await cartPage.getProductCustomizationModal(page);
    expect(modalContent).to.equal(`Type your text here ${customText}`);
  });

  it('should close the modal', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'closeModal', baseContext);

    const isModalNotVisible = await cartPage.closeProductCustomizationModal(page, 1);
    expect(isModalNotVisible).to.equal(true);
  });
});
