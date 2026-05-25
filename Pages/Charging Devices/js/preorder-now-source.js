var loadScript = function (url, callback) {
  console.log('Production Ext *')
  /* JavaScript that will load the jQuery library on Google's CDN.
       We recommend this code: http://snipplr.com/view/18756/loadscript/.
       Once the jQuery library is loaded, the function passed as argument,
       callback, will be executed. */

  var script = document.createElement('script')
  script.type = 'text/javascript'

  if (script.readyState) {
    //IE
    script.onreadystatechange = function () {
      if (script.readyState == 'loaded' || script.readyState == 'complete') {
        script.onreadystatechange = null
        callback()
      }
    }
  } else {
    //Others
    script.onload = function () {
      callback()
    }
  }

  script.src = url
  document.getElementsByTagName('head')[0].appendChild(script)
}

var getPreloadedData = function($){
  if(typeof window.pn === "undefined"){window.pn = {};}
  if(typeof window.pn.shop === "undefined"){window.pn.shop = {};}
  if(typeof window.pn.settings === "undefined"){
    window.pn.settings = {};
  }
  $.ajax({
    url: "https://app.preordernowapp.com/get_preloaded_data?shop=" + Shopify.shop, // TODO: Deploy theme extension for applying changes
    method: "get",
    async: true,
    success: function(data){
      if(data.status === 200){
        window.pn.shop = data.shop_attributes.shop_record;
        window.pn.styles = data.shop_attributes.style_records;
        window.pn.datastore = data.theme_setting;
        window.pn.settings.defaultSetting = data.default_setting;
        window.pn.settings.singleProductSettings = data.single_product_settings;
        window.pn.settings.tagSettings = data.tag_settings;
        myFrontendJavascript($);
      }
    }
  });
}

var myFrontendJavascript = function ($) {
  var SWATCH_SELECTORS =
    ".product-form__input input, form[action^='/cart/add'] select[name='options[Size]'], input.ColorSwatch__Radio, li.swatch-view-item, .swatchColor, .panda-swatch, button.swatch, div.swatch-element, div.swatch-item, .product-variant ul li, div.swatches-container ul.options li a, div.template--product-variants-container div.product-variant-group label, .gf_swatch, .variant-input-wrap label, ul.clickyboxes li a, .product-single__thumbnail, .Popover__Value, .selectric-scroll li, .select-dropdown li, .VariantSelector__Button, .bc-quickview-single-option-swatch-item,.variant-options input[type='radio'],.variant-swatch, .option-value, .collection-swatch-wrap li, .collection-swatch-wrap li div, .product-options__value, .product-item__radio, .basel-swatch, .swatch, .SizeSwatch, .js-variant-thumbnail-trigger, .btn--selector, .options .opt, .HorizontalList__Item"
  var TEST_SHOPS = [
    'crazy-apps-house.myshopify.com',
    'ajax-collection.myshopify.com',
    'wnteststore4.myshopify.com',
    'preorder-now.myshopify.com',
    'xyz-edsil.myshopify.com',
  ]
  var PREORDER_BUTTON_CLASS = 'sbb'
  var PREORDER_BUTTON_SELECTOR = '.' + PREORDER_BUTTON_CLASS

  var PREORDER_DESCRIPTION_CLASS = 'preorder-description'
  var PREORDER_DESCRIPTION_SELECTOR = '.' + PREORDER_DESCRIPTION_CLASS

  var PREORDER_STOCK_COUNTER_CLASS = 'preorder-stock-counter'
  var PREORDER_STOCK_COUNTER_SELECTOR = '.' + PREORDER_STOCK_COUNTER_CLASS

  var PARTIAL_PREORDER_NOTE_CLASS = 'notify-partial-preorder'
  var PARTIAL_PREORDER_NOTE_SELECTOR = '.' + PARTIAL_PREORDER_NOTE_CLASS

  var QUANTITY_FIELD_SELECTOR =
    "input[name^='updates['], .cart-drawer__item-quantity"
  var CHECKOUT_BUTTON_SELECTOR = "button[name='checkout']"
  var CART_FORM_SELECTOR = "form[action='/cart']"

  var BUY_NOW_BUTTON_SELECTOR = '.shopify-payment-button'
  var PN_ACTIVE_CLASS = 'preorder-now-active'

  var styles = window.pn.styles

  var buttonClicked = false
  var cartChecked = false

  function Helper() {}

  Helper.prototype.getCurrentVariantIdOnProductPage = function (shop) {
    var currentVariant = location.search.match(/variant=([0-9]+)/)

    //If the URL contains a variant ID, return that
    if (currentVariant != null) {
      return currentVariant[1]

      //Otherwise return the first variant's ID
    } else {
      if (
        $(shop.form_selector)
          .find('select[name="id"], input[name="id"]')
          .attr('type') == 'radio'
      ) {
        return $(shop.form_selector).find('input[name="id"]:checked').val()
      } else {
        if (helper.getShopifyDomain() === 'getuglyco.myshopify.com') {
          return $('form[action="/cart/add.js"]')
            .find('select[name="id"]')
            .val()
        } else if (
          helper.getShopifyDomain() === 'fastenersplus.myshopify.com'
        ) {
          return $('form[data-cart-submit]')
            .find('select[name="id"], input[name="id"]')
            .val()
        } else {
          return $(shop.form_selector)
            .find('select[name="id"], input[name="id"]')
            .val()
        }
      }
    }
  }

  function hideAdditionalCheckoutButtons() {
    setInterval(function() {
      var checkOutButtons = document.querySelectorAll(".additional-checkout-buttons, .dynamic-checkout__content");
      if(checkOutButtons.length > 0){
        checkOutButtons[0].style.visibility = 'hidden';
      }
    }, 1000)
  }

  if(window.pn.shop.show_express_checkout_buttons === undefined || !window.pn.shop.show_express_checkout_buttons){
    hideAdditionalCheckoutButtons();
  }


  Helper.prototype.cartItemIsActivePreOrder = function (item) {
    var shop = this.getShop()

    return item.properties.hasOwnProperty(shop.pn_note_label)
  }

  Helper.prototype.variantSetting = function (id) {
    return $.ajax({
      method: 'GET',
      url:
        helper.getServerAddress() +
        '/variant/settings?shopify_domain=' +
        helper.getShopifyDomain(),
      data: {
        variant_id: id,
      },
      success: function (variantData) {
        return variantData
      },
    })
  }

  Helper.prototype.hasDiscount = function (decodeSetting) {
    var defaultSetting = decodeSetting(window.pn.settings.defaultSetting)
    var singleProductSettings = window.pn.settings.singleProductSettings
    var tagSettings = window.pn.settings.tagSettings
    var hasDiscount = false

    if (!hasDiscount) {
      $.each(singleProductSettings, function (index, setting) {
        setting = decodeSetting(setting)
        if (
          setting.discount_type == 'percentage' ||
          setting.discount_type == 'fixed_amount'
        ) {
          hasDiscount = true

          return false
        }
      })
    }

    if (!hasDiscount) {
      $.each(tagSettings, function (index, setting) {
        setting = decodeSetting(setting)
        if (
          setting.discount_type == 'percentage' ||
          setting.discount_type == 'fixed_amount'
        ) {
          hasDiscount = true

          return false
        }
      })
    }

    if (!hasDiscount && defaultSetting.settings_enabled) {
      return true
    }

    return hasDiscount
  }

  Helper.prototype.hasPartialPayment = function (decodeSetting) {
    var defaultSetting = decodeSetting(window.pn.settings.defaultSetting)
    var singleProductSettings = window.pn.settings.singleProductSettings
    var tagSettings = window.pn.settings.tagSettings
    var hasPartialPayment = false

    if (!hasPartialPayment) {
      $.each(singleProductSettings, function (index, setting) {
        setting = decodeSetting(setting)
        if (
          setting.partial_payment_discount_type == 'partial_percentage' ||
          setting.partial_payment_discount_type == 'partial_fixed_amount'
        ) {
          hasPartialPayment = true

          return false
        }
      })
    }

    if (!hasPartialPayment) {
      $.each(tagSettings, function (index, setting) {
        setting = decodeSetting(setting)
        if (
          setting.partial_payment_discount_type == 'partial_percentage' ||
          setting.partial_payment_discount_type == 'partial_fixed_amount'
        ) {
          hasPartialPayment = true

          return false
        }
      })
    }

    if (!hasPartialPayment && defaultSetting.settings_enabled) {
      return true
    }

    return hasPartialPayment
  }

  Helper.prototype.objectChecker = function (objectToCheck) {
    return typeof objectToCheck !== 'undefined' && objectToCheck != null
  }

  Helper.prototype.stringChecker = function (stringToCheck) {
    return (
      this.objectChecker(stringToCheck) &&
      stringToCheck !== '' &&
      typeof stringToCheck !== 'undefined'
    )
  }

  Helper.prototype.beforePreorderStartDate = function (setting) {
    if (this.stringChecker(setting.preorder_start_date)) {
      var startDate = new Date(setting.preorder_start_date)
      var currentDate = new Date()
      return currentDate < startDate
    } else {
      return false
    }
  }

  Helper.prototype.afterPreorderEndDate = function (setting) {
    if (this.stringChecker(setting.preorder_end_date)) {
      var endDate = new Date(setting.preorder_end_date)
      var currentDate = new Date()
      return currentDate > endDate
    } else {
      return false
    }
  }

  Helper.prototype.checkPn = function () {
    return typeof window.pn !== 'undefined'
  }

  Helper.prototype.getShop = function () {
    return this.getShopInDatastore()
  }

  Helper.prototype.getShopInDatastore = function () {
    if (this.checkPn()) {
      this.createShop()
    }

    return window.pn.shop
  }

  Helper.prototype.createShop = function () {
    if (this.checkDatastore() && typeof window.pn.shop !== 'undefined') {
      if (typeof window.pn.datastore.theme_setting !== 'undefined') {
        window.pn.shop = this.mergeThemeSettingsWithShop()
      }
    } else {
      window.pn.shop = false
    }
  }

  Helper.prototype.checkDatastore = function () {
    return (
      typeof window.pn !== 'undefined' &&
      typeof window.pn.datastore !== 'undefined'
    )
  }

  Helper.prototype.mergeThemeSettingsWithShop = function () {
    var theme_setting = window.pn.datastore.theme_setting,
      shop = window.pn.shop,
      helper = this,
      mergeMapping = [
        ['product_page_price_selector', 'product_page_price_selector'],
        [
          'product_page_sale_price_selector',
          'product_page_sale_price_selector',
        ],
        ['cart_subtotal_selector', 'cart_subtotal_selector'],
        ['checkout_button_selector', 'checkout_button_selector'],
        ['quantity_button_selector', 'quantity_button_selector'],
        ['quantity_field_selector', 'quantity_field_selector'],
        ['variant_selector', 'variant_selector'],
        ['mutation_ids', 'mutation_ids'],
        ['mutation_classes', 'mutation_classes'],
        [
          'ajax_line_item_original_price_selector',
          'ajax_line_item_original_price_selector',
        ],
        [
          'ajax_line_item_total_price_selector',
          'ajax_line_item_total_price_selector',
        ],
        ['ajax_cart_item_key', 'ajax_cart_item_key'],
        ['cart_item_key', 'cart_item_key'],
        ['notify_alert_button_selector', 'notify_alert_button_selector'],
      ]

    $.each(mergeMapping, function (index, mapping) {
      shop[mapping[0]] = helper.mergeValues(
        shop[mapping[0]],
        theme_setting[mapping[1]]
      )
    })

    return shop
  }

  Helper.prototype.mergeValues = function (firstValue, secondValue) {
    if (this.stringChecker(firstValue)) {
      return firstValue
    } else {
      return secondValue
    }
  }

  Helper.prototype.getShopifyDomain = function () {
    var page_scripts = document.getElementsByTagName('script'),
      sourceURL = '',
      shopify_domain = ''
    for (var i = 0; i < page_scripts.length; i++) {
      if (
        (sourceURL = page_scripts[i].getAttribute('src')) &&
        (sourceURL = sourceURL.match(/^(.*)widget\/javascript(\?\s*(.+))?\s*/))
      ) {
        shopify_domain = sourceURL[3].match(/shop=(.+).myshopify.com/)[1]
        break
      }
    }

    shopify_domain = shopify_domain + '.myshopify.com'

    if (
      shopify_domain === '.myshopify.com' &&
      this.objectChecker(window.Shopify) &&
      this.objectChecker(window.Shopify.shop)
    ) {
      shopify_domain = window.Shopify.shop
    }

    if (shopify_domain === '.myshopify.com') {
      console.log('PN: unable to get shop domain')
    }

    return shopify_domain
  }

  Helper.prototype.inArray = function (needle, haystack) {
    var found = false
    $.each(haystack, function (index, element) {
      if (element === needle) {
        found = true
        return false
      }
    })
    return found
  }

  Helper.prototype.getServerAddress = function () {
    var shopifyDomain = this.getShopifyDomain()
    if (this.inArray(shopifyDomain, TEST_SHOPS)) {
      return 'https://bubblybunny.ngrok.io' // Edsil's development
    } else if (shopifyDomain == 'pn-marc-local.myshopify.com') {
      return 'https://pn-staging.herokuapp.com' // Staging
    } else if(shopifyDomain == 'pn-staging-env.myshopify.com'){
      return 'https://pn-staging.herokuapp.com' // Staging
    } else {
      // return 'https://pn-staging.herokuapp.com/' // Staging
      // return 'https://preorder-now.herokuapp.com' // Production
      return 'https://app.preordernowapp.com' // TODO: deploy theme extension for applying new domain changes
    }
  }

  Helper.prototype.validateEmailRegex = function (email) {
    return email.match(
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
  }

  Helper.prototype.sleep = function (time) {
    return new Promise(function (resolve) {
      setTimeout(resolve, time)
    })
  }

  Helper.prototype.onProductPage = function () {
    return window.location.href.indexOf('/products/') > -1
  }

  Helper.prototype.onCartPage = function () {
    var url = window.location.href
    var lastPart = url.substr(url.lastIndexOf('/') + 1)
    if(Shopify.shop === "glico-admin.myshopify.com" && lastPart === "cart?checked=1"){
      return lastPart === 'cart?checked=1'
    }
    else{
      return lastPart === 'cart'
    }
  }

  Helper.prototype.onCollectionPage = function () {
    return window.location.href.indexOf('/collections/') > -1
  }

  Helper.prototype.setupEnv = function () {
    if (shop.custom_css != null && shop.custom_css !== '') {
      $('head').append('<style type="text/css">' + shop.custom_css + '</style>')
    }
    var buttonStyles =
      '<style type="text/css">' + PREORDER_BUTTON_SELECTOR + '{'
    if (styles[0]['background_color']) {
      buttonStyles +=
        'background-color: ' + styles[0]['background_color'] + ' !important;'
    }
    if (styles[0]['border_color']) {
      buttonStyles +=
        'border-color: ' + styles[0]['border_color'] + ' !important;'
    }
    if (styles[0]['border_radius']) {
      buttonStyles +=
        'border-radius: ' + styles[0]['border_radius'] + 'px !important;'
    }
    if (styles[0]['border_width']) {
      buttonStyles +=
        'border-width: ' + styles[0]['border_width'] + 'px !important;'
    }
    if (styles[0]['font_family']) {
      buttonStyles +=
        'font-family: ' + styles[0]['font_family'] + ' !important;'
    }
    if (styles[0]['font_size']) {
      buttonStyles += 'font-size: ' + styles[0]['font_size'] + 'px !important;'
    }
    if (styles[0]['margin']) {
      buttonStyles += 'margin: ' + styles[0]['margin'] + 'px !important;'
    }
    if (styles[0]['padding']) {
      buttonStyles += 'padding: ' + styles[0]['padding'] + 'px !important;'
    }
    if (styles[0]['text_color']) {
      buttonStyles += 'color: ' + styles[0]['text_color'] + ' !important;'
    }
    buttonStyles += '}</style>'
    $('head').append(buttonStyles)
  }

  Helper.prototype.applyStyles = function (selector, styleNum) {
    $(selector).css({
      'background-color': styles[styleNum]['background_color'],
      'border-color': styles[styleNum]['border_color'],
      'border-radius': styles[styleNum]['border_radius'] + 'px',
      'border-width': styles[styleNum]['border_width'] + 'px',
      'font-family': styles[styleNum]['font_family'],
      'font-size': styles[styleNum]['font_size'] + 'px',
      margin: styles[styleNum]['margin'] + 'px',
      padding: styles[styleNum]['padding'] + 'px',
      color: styles[styleNum]['text_color'],
    })
    if (styles[styleNum]['font_family']) {
      $('head').append(
        '<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=' +
          styles[styleNum]['font_family'] +
          '" />'
      )
    }
  }

  Helper.prototype.shadeColor2 = function (color, percent) {
    var f = parseInt(color.slice(1), 16),
      t = percent < 0 ? 0 : 255,
      p = percent < 0 ? percent * -1 : percent,
      R = f >> 16,
      G = (f >> 8) & 0x00ff,
      B = f & 0x0000ff
    return (
      '#' +
      (
        0x1000000 +
        (Math.round((t - R) * p) + R) * 0x10000 +
        (Math.round((t - G) * p) + G) * 0x100 +
        (Math.round((t - B) * p) + B)
      )
        .toString(16)
        .slice(1)
    )
  }

  Helper.prototype.stripFormSelector = function (selector) {
    if (selector.indexOf('form') > -1) {
      var formPart = selector.substring(
        selector.indexOf('form'),
        selector.indexOf(' ')
      )
      selector = selector.replace(formPart, '')
    }
    return selector
  }

  Helper.prototype.numberChecker = function (numberToCheck) {
    return this.objectChecker(numberToCheck) && !isNaN(numberToCheck)
  }

  Helper.prototype.noNegative = function (amount) {
    if (amount < 0) {
      return 0
    } else {
      return amount
    }
  }

  Helper.prototype.getRandomInt = function (minNum, maxNum) {
    return Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum
  }

  Helper.prototype.getRandomizedURL = function () {
    return window.location.href + '?' + this.getRandomInt(0, 10000)
  }

  Helper.prototype.checkStockShowBadge = function (theSetting) {
    if (theSetting.settings_enabled) {
      if (
        this.beforePreorderStartDate(theSetting) ||
        this.afterPreorderEndDate(theSetting)
      ) {
        return false
      } else {
        if (theSetting.use_stock_management) {
          if (theSetting.use_shopify_stock_management) {
            if (theSetting.shopify_stock_mgmt_method === 1) {
              if (
                theSetting.shopify_inventory > 0 ||
                theSetting.shopify_inventory == null
              ) {
                return true
              } else {
                return false
              }
            } else if (theSetting.shopify_stock_mgmt_method === 2) {
              if (
                theSetting.shopify_inventory <= 0 &&
                theSetting.oversell_enabled &&
                !(
                  typeof theSetting.shopify_preorder_limit == 'number' &&
                  theSetting.shopify_preorder_limit <= 0
                )
              ) {
                return true
              } else {
                return false
              }
            }
          } else {
            if (
              theSetting.preorder_stock > 0 ||
              theSetting.preorder_stock == null
            ) {
              return true
            } else {
              return false
            }
          }
        } else if (
          theSetting.shopify_inventory != null &&
          theSetting.shopify_inventory <= 0 &&
          !theSetting.oversell_enabled &&
          theSetting.inventory_management != '' &&
          theSetting.inventory_management != null
        ) {
          return false
        } else {
          return true
        }
      }
    } else {
      return false
    }
  }

  Helper.prototype.inStock = function (variantSetting) {
    return (
      variantSetting.shopify_inventory == null ||
      variantSetting.shopify_inventory > 0 ||
      variantSetting.oversell_enabled
    )
  }

  Helper.prototype.checkMutationIds = function (mutation, typeOfCheck) {
    var idArray = []
    if (typeOfCheck === 'quickview') {
      idArray = window.pn.quickviewSettings.modalLoadedMutationIdArray
    } else if (typeOfCheck === 'ajaxCollectionPage') {
      idArray = window.pn.collectionPageSettings.filterMutationIdArray
    } else if (typeOfCheck === 'ajaxCart') {
      idArray = window.pn.ajaxCartSettings.mutationIds

      if (
        this.stringChecker(shop.mutation_ids) &&
        this.hasDiscount(preorderSettingsCache.decodeSetting)
      ) {
        var spacelessIds = shop.mutation_ids.replace(/ /g, '')
        var shopMutationIdsArray = spacelessIds.split(',')
        idArray = idArray.concat(shopMutationIdsArray)
      }
    }
    return idArray.indexOf(mutation.target.id) > -1
  }

  Helper.prototype.checkMutationClasses = function (mutation, typeOfCheck) {
    var classArray = [],
      classFound = false
    if (typeOfCheck === 'quickview') {
      classArray = window.pn.quickviewSettings.modalLoadedMutationClassArray
    } else if (typeOfCheck === 'ajaxCollectionPage') {
      classArray = window.pn.collectionPageSettings.filterMutationClassArray
    } else if (typeOfCheck === 'ajaxCart') {
      classArray = window.pn.ajaxCartSettings.mutationClasses

      if (
        this.stringChecker(shop.mutation_classes) &&
        this.hasDiscount(preorderSettingsCache.decodeSetting)
      ) {
        var spacelessClasses = shop.mutation_classes.replace(/ /g, '')
        var shopMutationClassArray = spacelessClasses.split(',')
        classArray = classArray.concat(shopMutationClassArray)
      }
    }
    $.each(classArray, function (index, className) {
      if (
        typeof mutation.target.classList !== 'undefined' &&
        mutation.target.classList.contains(className)
      ) {
        classFound = true
      }
    })
    return classFound
  }

  Helper.prototype.checkMutations = function (mutation, typeOfCheck) {
    return (
      this.checkMutationIds(mutation, typeOfCheck) ||
      this.checkMutationClasses(mutation, typeOfCheck)
    )
  }

  // Formats the given amount in cents. Parameters:
  // cents - amount in cents e.g. 1234
  // format - the shop's currency format e.g. "${{amount}}"
  Helper.prototype.formatCents = function (cents, format) {
    if (typeof cents == 'undefined' || cents == null) {
      return ''
    }
    if (typeof cents == 'string' && cents.length == 0) {
      return ''
    }

    var moneyRegex = /\{\{\s*(\w+)\s*\}\}/
    if (typeof cents == 'string') {
      cents = cents.replace('.', '')
    }

    function defOpt(opt, def) {
      return typeof opt == 'undefined' ? def : opt
    }

    function displayDelims(n, p, t, d) {
      p = defOpt(p, 2)
      t = defOpt(t, ',')
      d = defOpt(d, '.')
      if (isNaN(n) || n == null) {
        return 0
      }
      n = (n / 100).toFixed(p)
      var parts = n.split('.'),
        dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + t),
        cents = parts[1] ? d + parts[1] : ''
      return dollars + cents
    }

    var val = ''
    switch (format.match(moneyRegex)[1]) {
      case 'amount':
        val = displayDelims(cents, 2)
        break
      case 'amount_no_decimals':
        val = displayDelims(cents, 0)
        break
      case 'amount_no_decimals_with_comma_separator':
        val = displayDelims(cents, 0, '.', ',')
        break
      case 'amount_with_comma_separator':
        val = displayDelims(cents, 2, '.', ',')
        break
    }
    return format.replace(moneyRegex, val)
  }

  Helper.prototype.showSpinner = function (spinnerTarget) {
    var opts = {
      top: '-50px',
      left: '50%',
      position: 'relative',
    }

    if (typeof Spinner === 'function') {
      var spinner = new Spinner(opts).spin().el
      $(spinnerTarget).first().parent().after(spinner)
    }
  }

  Helper.prototype.productPageCompareAtPriceAvailable = function (
    activeVariant
  ) {
    if (
      activeVariant.compareAtPrice !== '' &&
      activeVariant.compareAtPrice > 0
    ) {
      return true
    }

    return false
  }

  Helper.prototype.themeDifferentCompareAtPriceSelector = function () {
    if (
      window.pn.datastore.theme_setting.theme_name == 'Boundless' ||
      window.pn.datastore.theme_setting.theme_name == 'Debut'
    ) {
      return true
    }
  }

  function StockChecker() {
    this.cartItems = []
    this.checkedQuantity = false
  }

  StockChecker.prototype.getVariantIdFromQuantityField = function (field) {
    var variantId = false
    var variantImg = false
    if (helper.objectChecker($(field).data('id'))) {
      variantId = $(field)
        .data('id')
        .toString()
        .split(':')[0]
        .replace(/[^0-9]/g, '')
    } else if (helper.objectChecker($(field).attr('id'))) {
      variantId = $(field)
        .attr('id')
        .toString()
        .split(':')[0]
        .replace(/[^0-9]/g, '')
    } else {
      // added this only for supply theme
      variantImg = $(field)
        .parent()
        .parent()
        .parent()
        .parent()
        .parent()
        .find('img')
        .parent()
        .attr('href')
        .split('=')
      if (variantImg) {
        variantId = variantImg[variantImg.length - 1]
      }
    }
    return variantId
  }

  StockChecker.prototype.usingNarrativeTheme = function () {
    return $(CHECKOUT_BUTTON_SELECTOR).hasClass('cart-drawer__checkout')
  }

  StockChecker.prototype.getVariantIdsFromCartForm = function () {
    var variantIds = []
    $("form[action='/cart']")
      .find(QUANTITY_FIELD_SELECTOR)
      .each(function () {
        if ($(this).data('id') !== undefined) {
          variantIds.push(
            $(this)
              .data('id')
              .toString()
              .split(':')[0]
              .replace(/[^0-9]/g, '')
          )
        } else {
          var attrId = $(this).attr('id')
          if (attrId !== undefined) {
            variantIds.push(
              attrId
                .toString()
                .split(':')[0]
                .replace(/[^0-9]/g, '')
            )
          }
        }
      })
    return variantIds
  }

  StockChecker.prototype.getItems = function () {
    var self = this
    $.ajax({
      method: 'GET',
      url: '/cart.js',
      dataType: 'json',
      async: false,
      contentType: 'application/json; charset=utf-8',
      success: function (data) {
        self.cartItems = data
      },
    })
  }

  StockChecker.prototype.insufficientStockAlert = function (qty) {
    var stockInsufficientMessage = shop.stock_insufficient_message
    if (stockInsufficientMessage.indexOf('{{qty}}')) {
      stockInsufficientMessage = stockInsufficientMessage.replace(
        '{{qty}}',
        qty
      )
    }
    alert(stockInsufficientMessage)
  }

  StockChecker.prototype.inputChangeTrigger = function (current, stock_val) {
    var self = this
    current.val(stock_val)
    current.attr('value', stock_val)
    setTimeout(function () {
      current.val(stock_val)
      current.attr('value', stock_val)
      current.trigger('change')
      self.insufficientStockAlert(stock_val)
    }, 1000)
  }

  StockChecker.prototype.itemHasSufficientQuantityInVariantData = function (
    variant,
    current
  ) {
    var result = true
    var ind = variant.length - 1
    if (
      variant &&
      helper.numberChecker(variant[ind].preorder_stock) &&
      !variant[ind].use_shopify_stock_management
    ) {
      if (
        parseInt(current.val().replace(/[^0-9]/g, '')) >
        variant[ind].preorder_stock
      ) {
        result = false
        this.inputChangeTrigger(current, variant[ind].preorder_stock)
      }
    } else if (
      variant &&
      helper.numberChecker(variant[ind].shopify_preorder_limit) &&
      variant[ind].shopify_stock_mgmt_method === 2 &&
      variant[ind].use_shopify_stock_management
    ) {
      if (
        parseInt(current.val().replace(/[^0-9]/g, '')) >
        variant[ind].shopify_preorder_limit
      ) {
        result = false
        this.inputChangeTrigger(current, variant[ind].shopify_preorder_limit)
      }
    }
    return result
  }

  StockChecker.prototype.itemHasSufficientQuantity = function (
    quantityField,
    variantData
  ) {
    var sufficientQuantity = false
    var variantId = this.getVariantIdFromQuantityField(quantityField)
    var variant = false
    if (variantId) {
      variant = variantData[variantId]
    }
    if (
      !variant ||
      (variant &&
        this.itemHasSufficientQuantityInVariantData(variant, $(quantityField)))
    ) {
      sufficientQuantity = true
    }
    return sufficientQuantity
  }

  StockChecker.prototype.getCartItemWithVariantId = function (variantId) {
    var cartItem
    for (var i = 0; i < this.cartItems.items.length; i++) {
      if (this.cartItems.items[i].variant_id === variantId) {
        cartItem = this.cartItems.items[i]
      }
    }
    return cartItem
  }

  StockChecker.prototype.checkCartFormQuantitiesAgainstVariantData = function (
    variantData
  ) {
    var itemWithInsufficientQuantityFound = false
    var self = this
    $(CART_FORM_SELECTOR)
      .find(QUANTITY_FIELD_SELECTOR)
      .each(function () {
        if (!self.itemHasSufficientQuantity($(this), variantData)) {
          itemWithInsufficientQuantityFound = true
        }
      })
    if (!itemWithInsufficientQuantityFound) {
      cartChecked = true
      $(CHECKOUT_BUTTON_SELECTOR).trigger('click')
    }
  }

  StockChecker.prototype.getVariantSettingsFromServer = function (variantIds) {
    var self = this
    $.ajax({
      method: 'get',
      url: helper.getServerAddress() + '/widget/variant_collection',
      data: {
        ids: variantIds,
      },
      success: function (variantData) {
        self.checkCartFormQuantitiesAgainstVariantData(variantData)
      },
    })
  }

  StockChecker.prototype.checkCartFormQuantitiesOnQuantityButtonClick =
    function () {
      $('body').on(
        'click',
        '.js--qty-adjuster, .js-qty__adjust, .js-change-quantity, .ajaxifyCart--add, .ajaxifyCart--minus, .ajaxcart__qty-adjust',
        function (e) {
          var that = $(this)

          that.parent().find("input[name^='updates[']").trigger('change')
          that.parent().find('.ajaxifyCart--num').trigger('change')

          Shopify.changeItem = function (line, quantity, callback) {
            var params = {
              type: 'POST',
              url: '/cart/change.js',
              data: 'quantity=' + quantity + '&line=' + line,
              dataType: 'json',
              success: function (cart) {
                if (typeof callback === 'function') {
                  callback(cart)
                } else {
                  Shopify.onCartUpdate(cart)
                }
                if (that != false) {
                  that
                    .parent()
                    .find("input[name^='updates[']")
                    .val(quantity)
                    .trigger('change')
                  that
                    .parent()
                    .find('.ajaxifyCart--num')
                    .val(quantity)
                    .trigger('change')
                  that = false
                }
              },
              error: function (XMLHttpRequest, textStatus) {
                Shopify.onError(XMLHttpRequest, textStatus)
              },
            }
            jQuery.ajax(params)
          }
        }
      )
    }

  StockChecker.prototype.checkCartFormQuantitiesOnQuantityChange = function () {
    var self = this
    // partially match name
    $('body').on(
      'change',
      "input[name^='updates['], .ajaxifyCart--num",
      function (event) {
        if (!self.checkedQuantity) {
          event.stopPropagation()
          event.preventDefault()

          var variant_id = self.getVariantIdFromQuantityField($(this))
          var quantityField = $(this)

          $.ajax({
            url:
              helper.getServerAddress() +
              '/widget/get_variant_settings_for_cart',
            data: {
              variant_id: variant_id,
            },
            method: 'get',
            success: function (data) {
              if (
                helper.objectChecker(data.id) &&
                data.preorder_stock != null &&
                !data.use_shopify_stock_management &&
                parseInt(quantityField.val()) > data.preorder_stock
              ) {
                self.inputChangeTrigger(quantityField, data.preorder_stock)
              } else if (
                helper.objectChecker(data.id) &&
                data.shopify_preorder_limit != null &&
                data.shopify_stock_mgmt_method === 2 &&
                data.use_shopify_stock_management
              ) {
                if (
                  parseInt(quantityField.val().replace(/[^0-9]/g, '')) >
                  data.shopify_preorder_limit
                ) {
                  self.inputChangeTrigger(
                    quantityField,
                    data.shopify_preorder_limit
                  )
                }
              } else {
                $(quantityField).trigger('change')
              }
              self.checkedQuantity = true
            },
          })
        } else {
          self.checkedQuantity = false
        }
      }
    )
  }

  StockChecker.prototype.checkCartFormQuantitiesOnCheckoutClick = function () {
    var self = this
    $('body').on('click', CHECKOUT_BUTTON_SELECTOR, function (event) {
      var variantIds = self.getVariantIdsFromCartForm()
      if (!self.usingNarrativeTheme() && !cartChecked) {
        event.preventDefault()
        event.stopPropagation()
        self.getVariantSettingsFromServer(variantIds)
      }
    })
  }

  StockChecker.prototype.forSupplyTheme = function () {
    var variant
    var variants_ids = []
    var variant_indx
    var variant_id
    var curr_input
    var isvalid = true
    var alerted = true
    var hasValidData = true

    if (
      $("form[action='/cart']").find("input[name^='updates[']").length === 0
    ) {
      $('body').on('click', CHECKOUT_BUTTON_SELECTOR, function (event) {
        $("form[action='/cart']")
          .find('img')
          .each(function () {
            if (typeof $($(this).parent()[0]).attr('href') === undefined) {
              isvalid = false
              return false
            }
            variant_indx = $($(this).parent()[0]).attr('href').split('=')
            variant_id = $($(this).parent()[0]).attr('href').split('=')[
              variant_indx.length - 1
            ]
            variants_ids.push(variant_id)
          })
        if (isvalid && !cartChecked) {
          event.preventDefault()
          event.stopPropagation()
          $.ajax({
            method: 'get',
            url: helper.getServerAddress() + '/widget/variant_collection',
            data: {
              ids: variants_ids,
            },
            success: function (data) {
              $("form[action='/cart']")
                .find('img')
                .each(function () {
                  variant_indx = $($(this).parent()[0]).attr('href').split('=')
                  variant_id = $($(this).parent()[0]).attr('href').split('=')[
                    variant_indx.length - 1
                  ]
                  variant = data[variant_id]
                  curr_input = $(this)
                    .parent()
                    .parent()
                    .parent()
                    .parent()
                    .parent()
                    .find('input')
                  hasValidData = this.itemHasSufficientQuantityInVariantData(
                    variant,
                    curr_input
                  )
                })
              if (!hasValidData) {
                alerted = false
              }
              if (hasValidData && alerted) {
                cartChecked = true
                $("button[name='checkout']").trigger('click')
              }
            },
          })
        }
      })
    }
  }

  StockChecker.prototype.initStockChecker = function () {
    this.getItems()
    if (shop.limit_order_quantity || shop.notify_when_partial_preorder) {
      this.forSupplyTheme()
      this.checkCartFormQuantitiesOnCheckoutClick()
      this.checkCartFormQuantitiesOnQuantityChange()
      this.checkCartFormQuantitiesOnQuantityButtonClick()
    }
  }

  var helper = new Helper()
  var shop = helper.getShop()
  var stockChecker = new StockChecker()

  function PreorderLineItemProperty(args) {
    this.formSelector = args['formSelector']
  }

  PreorderLineItemProperty.prototype.removePreorderLineItemProperty =
    function () {
      $(this.formSelector).find('#preorder-note').remove()
    }

  PreorderLineItemProperty.prototype.showPreorderLineItemProperty = function (
    preorderProduct
  ) {
    if (preorderProduct.preorderActive()) {
      var cartLabel = ''
      if (helper.stringChecker(preorderProduct.activeVariant.cart_label_text)) {
        cartLabel = preorderProduct.activeVariant.cart_label_text
      } else {
        cartLabel = shop.cart_label_text
      }

      if (helper.stringChecker(cartLabel)) {
        if ($(this.formSelector).find('#preorder-note').length === 0) {
          $(this.formSelector).append(
            '<input type="hidden" id="preorder-note" name="properties[' +
              shop.pn_note_label +
              ']" value="' +
              cartLabel +
              '" />'
          )
        } else {
          $(this.formSelector).find('#preorder-note').val(cartLabel)
        }
      }
    }
  }

  function PartialPreorderNote(args) {
    this.formSelector = args['formSelector']
    this.partialPreorderNotePlacementSelector =
      args['partialPreorderNotePlacementSelector']
  }

  PartialPreorderNote.prototype.initPartialPreorderNotice = function (
    preorderProduct
  ) {
    var self = this
    this.checkIfPartialPreorderNoteNeeded(preorderProduct)
    $(document).on('change', 'input[name=quantity]:visible', function () {
      self.checkIfPartialPreorderNoteNeeded(preorderProduct)
    })
    $(document).on(
      'click',
      ".js-qty__adjust, .js-change-quantity, div[data-control='+'], div[data-control='-']",
      function () {
        self.checkIfPartialPreorderNoteNeeded(preorderProduct)
      }
    )
  }

  PartialPreorderNote.prototype.removePartialPreorderNote = function () {
    $('input[name=quantity]:visible').off('change')
    $(this.formSelector).find(PARTIAL_PREORDER_NOTE_SELECTOR).remove()
    $(PARTIAL_PREORDER_NOTE_SELECTOR).remove()
  }

  PartialPreorderNote.prototype.checkIfPartialPreorderNoteNeeded = function (
    preorderProduct
  ) {
    var self = this
    helper.sleep(250).then(function () {
      self.removePartialPreorderNote()
      var quantityDesired = preorderProduct.getQuantityDesired(preorderProduct)
      if (
        shop.notify_when_partial_preorder &&
        preorderProduct.activeVariant.shopify_inventory < quantityDesired
      ) {
        self.showPartialPreorderNote(preorderProduct)
      } else if (
        shop.notify_when_partial_preorder &&
        preorderProduct.activeVariant.shopify_inventory >= quantityDesired
      ) {
        self.removePartialPreorderNote()
      }
    })
  }

  PartialPreorderNote.prototype.showPartialPreorderNote = function (
    preorderProduct
  ) {
    var stockInsufficientMessage = shop.notify_when_partial_preorder_message
    stockInsufficientMessage = stockInsufficientMessage.replace(
      /{{qty}}/g,
      helper.noNegative(preorderProduct.activeVariant.shopify_inventory)
    )
    $(shop.partial_preorder_notice_placement_selector).after(
      "<div class='" +
        PARTIAL_PREORDER_NOTE_CLASS +
        "'>" +
        stockInsufficientMessage +
        '</div>'
    )
    $(this.formSelector).prepend(
      '<input type="hidden" id="preorder-note" class="' +
        PARTIAL_PREORDER_NOTE_CLASS +
        '" name="properties[' +
        shop.pn_note_label +
        ']" value="' +
        stockInsufficientMessage +
        '" />'
    )
  }

  function PreorderDescription(args) {
    this.formSelector = args['formSelector']
    this.buttonSelector = args['buttonSelector']
  }

  PreorderDescription.prototype.showPreorderDescription = function (
    preorderProduct
  ) {
    if (preorderProduct.preorderActive()) {
      if (
        helper.stringChecker(preorderProduct.activeVariant.preorder_description)
      ) {
        this.removePreorderDescription()
        if (
          preorderProduct.activeVariant.preorder_description_position ===
          'below'
        ) {
          if (helper.getShopifyDomain() === 'genevieve-lorange.myshopify.com') {
            $(this.buttonSelector)
              .parent()
              .after(
                "<div class='" +
                  PREORDER_DESCRIPTION_CLASS +
                  "'>" +
                  preorderProduct.activeVariant.preorder_description +
                  '</div>'
              )
          } else {
            $(this.buttonSelector).after(
              "<div class='" +
                PREORDER_DESCRIPTION_CLASS +
                "'>" +
                preorderProduct.activeVariant.preorder_description +
                '</div>'
            )
          }
        } else if (
          preorderProduct.activeVariant.preorder_description_position ===
          'above'
        ) {
          $(this.buttonSelector).before(
            "<div class='" +
              PREORDER_DESCRIPTION_CLASS +
              "'>" +
              preorderProduct.activeVariant.preorder_description +
              '</div>'
          )
        } else {
          $(this.buttonSelector).prop(
            'title',
            preorderProduct.activeVariant.preorder_description
          )
          $.getScript(
            'https://code.jquery.com/ui/1.12.1/jquery-ui.min.js',
            function () {
              $('head').append(
                '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.css" type="text/css" />'
              )
              $(this.buttonSelector).tooltip()
            }
          )
        }
      }
      helper.applyStyles(PREORDER_DESCRIPTION_SELECTOR + ', div.ui-tooltip', 1)
    }
  }

  PreorderDescription.prototype.removePreorderDescription = function () {
    $(this.buttonSelector).prop('title', '')
    $(this.formSelector).find(PREORDER_DESCRIPTION_SELECTOR).remove()
  }

  function StockCounter(args) {
    this.formSelector = args['formSelector']
    this.buttonSelector = args['buttonSelector']
  }

  StockCounter.prototype.showStockCounter = function (preorderProduct) {
    this.removeStockCounter()
    if (preorderProduct.preorderActive()) {
      if (preorderProduct.usingPreorderStock()) {
        if (
          preorderProduct.showStockRemainingEnabled() &&
          preorderProduct.hasPreorderStock()
        ) {
          var itemQuantity = this.getCartInclusivePreorderStock(preorderProduct)
          var stockMessage =
            preorderProduct.activeVariant.stock_remaining_message.replace(
              '{{qty}}',
              helper.noNegative(itemQuantity)
            )
          $(this.buttonSelector).after(
            "<div class='" +
              PREORDER_STOCK_COUNTER_CLASS +
              "'>" +
              stockMessage +
              '</div>'
          )
        }
      }
    }
  }

  StockCounter.prototype.removeStockCounter = function () {
    $(this.formSelector).find(PREORDER_STOCK_COUNTER_SELECTOR).remove()
  }

  StockCounter.prototype.getCartInclusivePreorderStock = function (
    preorderProduct
  ) {
    stockChecker.getItems()
    var cartItemQuantity = 0
    for (var i = 0; i < stockChecker.cartItems.items.length; i++) {
      if (
        stockChecker.cartItems.items[i].variant_id.toString() ===
        preorderProduct.activeVariant.settings_type_id.toString()
      ) {
        if (helper.numberChecker(stockChecker.cartItems.items[i].quantity)) {
          cartItemQuantity = stockChecker.cartItems.items[i].quantity
        }
      }
    }
    return (
      parseInt(preorderProduct.activeVariant.preorder_stock) - cartItemQuantity
    )
  }

  function PreorderBadge(args) {
    this.badgeSetting = {}
    this.productImageContainer = args['productImageContainer']
  }

  PreorderBadge.prototype.removePreorderBadge = function (productId) {
    $('.preorder-container-' + productId + ' div.preorder-badge')
      .not('.collection-badge')
      .remove()
    $('.preorder-container-' + productId)
      .not('.collection-badge-container')
      .removeClass('preorder-container-' + productId)
  }

  PreorderBadge.prototype.showPreorderBadge = function (
    preorderProduct,
    activeVariant,
    additionalBadgeClass,
    additionalContainerClass
  ) {
    if (
      preorderProduct.preorderActiveForSetting(activeVariant) &&
      activeVariant.badge_enabled
    ) {
      /**
       When on product page the product is not active pre-order.
       However, there are visible products in a carousel or thumbnail
       that are active pre-order that is why the badge appends to the container
       
       To fix, our app need to determine the main product on that page.
       if not the main product return/exit the function.
       */

      var shop = helper.getShop()

      if (
        helper.onProductPage() &&
        (helper.getShopifyDomain() === 'mk-toys-uk.myshopify.com' ||
          helper.getShopifyDomain() === 'mercadogames-com.myshopify.com') &&
        helper.getCurrentVariantIdOnProductPage(shop) !==
          activeVariant.settings_type_id.toString()
      ) {
        return
      }

      this.badgeSetting = activeVariant
      var containerObject = this.findProductImageContainer(
        activeVariant,
        $(this.productImageContainer)
      )
      if (
        containerObject.length &&
        containerObject.find('.preorder-badge').length === 0
      ) {
        if (!helper.stringChecker(activeVariant.badge_text)) {
          activeVariant.badge_text = 'Pre-Order'
        }

        containerObject.addClass(
          'preorder-container-' +
            activeVariant.product_id +
            ' ' +
            additionalContainerClass
        )
        containerObject.append(
          "<div class='preorder-badge " +
            activeVariant.badge_shape +
            ' ' +
            additionalBadgeClass +
            "'><span>" +
            activeVariant.badge_text +
            '</span></div>'
        )

        this.applyBadgeStyles(activeVariant)
      }
    }
  }

  PreorderBadge.prototype.applyBadgeStyles = function (activeVariant) {
    var ribbonBadge = $(
      '.preorder-container-' +
        activeVariant.product_id +
        ' .preorder-badge.' +
        activeVariant.badge_shape +
        ' span'
    )
    var nonRibbonBadge = $(
      '.preorder-container-' +
        activeVariant.product_id +
        ' .preorder-badge.' +
        activeVariant.badge_shape
    )
    var badgeSpan = $(
      '.preorder-container-' +
        activeVariant.product_id +
        ' .preorder-badge span'
    )

    this.applyBadgeBgStyles(
      activeVariant.badge_shape,
      ribbonBadge,
      nonRibbonBadge
    )
    this.applyBadgeTextStyles(badgeSpan)
  }

  PreorderBadge.prototype.applyBadgeBgStyles = function (
    shape,
    ribbonBadge,
    nonRibbonBadge
  ) {
    if (helper.stringChecker(styles[2].background_color)) {
      var darkColor = styles[2].background_color
      var lightColor = helper.shadeColor2(styles[2].background_color, 0.5)
      var linearGradient =
        'linear-gradient(' + lightColor + ' 0%, ' + darkColor + ' 100%)'

      if (shape === 'ribbon') {
        $(ribbonBadge).css('background', darkColor)
        if (styles[2].badge_gradient) {
          $(ribbonBadge).css('background', linearGradient)
        }
      } else {
        $(nonRibbonBadge).css('background', darkColor)
        if (styles[2].badge_gradient) {
          $(nonRibbonBadge).css('background', linearGradient)
        }
      }
    } else {
      if (shape === 'ribbon') {
        $(ribbonBadge).css('background', '#79A70A')
        if (styles[2].badge_gradient) {
          $(ribbonBadge).css(
            'background',
            'linear-gradient(#9BC90D 0%, #79A70A 100%)'
          )
        }
      } else {
        $(nonRibbonBadge).css('background', '#79A70A')
        if (styles[2].badge_gradient) {
          $(nonRibbonBadge).css(
            'background',
            'linear-gradient(#9BC90D 0%, #79A70A 100%)'
          )
        }
      }
    }
    if (styles[2].badge_shadow) {
      if (shape === 'ribbon') {
        $(ribbonBadge).css('box-shadow', '0 3px 10px -5px rgba(0, 0, 0, 1)')
      } else {
        $(nonRibbonBadge).css('box-shadow', '0 3px 10px -5px rgba(0, 0, 0, 1)')
      }
    }
  }

  PreorderBadge.prototype.applyBadgeTextStyles = function (badgeSpan) {
    if (helper.stringChecker(styles[2].text_color)) {
      $(badgeSpan).css('color', styles[2].text_color)
    }
    if (helper.stringChecker(styles[2].font_family)) {
      $(badgeSpan).css('font-family', styles[2].font_family)
      $('head').append(
        '<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=' +
          styles[2]['font_family'] +
          '" />'
      )
    }
    if (helper.stringChecker(styles[2].font_size)) {
      $(badgeSpan).css('font-size', styles[2].font_size + 'px')
    }
  }

  PreorderBadge.prototype.findProductImageContainer = function (
    variantSetting,
    imageContainer
  ) {
    if (
      helper.getShopifyDomain() === 'hearnshobbies.myshopify.com' ||
      helper.getShopifyDomain() === 'evie-grey.myshopify.com'
    ) {
      var productImageSrc = variantSetting.product_image_src
      try {
      productImageSrc = productImageSrc
        .substring(productImageSrc.lastIndexOf('/') + 1)
        .split('?')[0]
      productImageSrc = productImageSrc.split('.')[0]
      }
      catch(e){
      }

      if (
        $(imageContainer).find('img[src*=' + productImageSrc + ']').length === 0
      ) {
        imageContainer = []
      } else {
        var closestParent = 'div.product-inner'

        if (helper.getShopifyDomain() === 'hearnshobbies.myshopify.com') {
          if (helper.onProductPage()) {
            closestParent = 'div.product-single__photos'
          } else {
            closestParent = 'div.grid_collection_box'
          }
        }

        imageContainer = $(imageContainer)
          .find('img[src*=' + productImageSrc + ']')
          .closest(closestParent)
      }

      if (
        helper.getShopifyDomain() === 'okoliving.myshopify.com' &&
        !helper.onProductPage()
      ) {
        var productImageSrc = variantSetting.product_image_src
        productImageSrc = productImageSrc
          .substring(productImageSrc.lastIndexOf('/') + 1)
          .split('?')[0]
        productImageSrc = productImageSrc.split('.')[0]

        if (
          $('.product-card-figure').find('img[src*=' + productImageSrc + ']')
            .length > 0
        ) {
          imageContainer = $('.product-card-figure')
            .find('img[src*=' + productImageSrc + ']')
            .closest('.product-inner')
        } else {
          imageContainer = []
        }
      }

      if (productImageSrc === 'African_baby_swaddle_wrap') {
        imageContainer = imageContainer.last()
      }

      return imageContainer
    }

    if (
      $(imageContainer).length === 0 &&
      helper.stringChecker(variantSetting.product_image_src)
    ) {
      imageContainer = this.findMissingProductImageContainer(
        variantSetting,
        imageContainer
      )
    }

    return imageContainer
  }

  PreorderBadge.prototype.findMissingProductImageContainer = function (
    variantSetting,
    imageContainer
  ) {
    imageContainer = this.getImageContainerSelectorFromFilename(
      variantSetting.product_image_src
    )
    if (imageContainer.length > 1) {
      if (
        helper.getShopifyDomain() === 'rare-electronics-llc.myshopify.com' ||
        helper.getShopifyDomain() === 'addaday-com.myshopify.com'
      ) {
        imageContainer = imageContainer.last()[0]
      } else {
        imageContainer = this.findFirstImageContainerWithWidthGreaterThan(
          imageContainer,
          200
        )
      }
    }
    imageContainer = this.getImageContainerParent(imageContainer)

    return imageContainer
  }

  PreorderBadge.prototype.getImageContainerSelectorFromFilename = function (
    productImageSrc
  ) {
    productImageSrc = productImageSrc
      .substring(productImageSrc.lastIndexOf('/') + 1)
      .split('?')[0]
    productImageSrc = productImageSrc.split('.')[0]
    return $('img[src*=' + productImageSrc + ']')
  }

  PreorderBadge.prototype.findFirstImageContainerWithWidthGreaterThan =
    function (imageContainers, width) {
      var imageContainer = null
      for (var i = 0; i < imageContainers.length; i++) {
        if (imageContainers[i].offsetWidth > width) {
          imageContainer = imageContainers[i]
          break
        }
      }
      return imageContainer
    }

  PreorderBadge.prototype.getImageContainerParent = function (imageContainer) {
    if (helper.getShopifyDomain() === 'fairley.myshopify.com') {
      imageContainer = $($(imageContainer).parent())
    } else {
      imageContainer = $($(imageContainer).parent().parent())
    }
    return imageContainer
  }

  function ProductPrice(args) {
    this.priceSelector = args['priceSelector']
    this.salePriceSelector = args['salePriceSelector']
  }

  ProductPrice.prototype.enabledDefaultSetting = function (activeVariant) {
    var defaultSetting = window.pn.settings.defaultSetting

    activeVariant.discount_percentage = defaultSetting.aa
    activeVariant.discount_fixed_amount = defaultSetting.ab
    activeVariant.discount_type = defaultSetting.z

    return activeVariant
  }

  ProductPrice.prototype.validCurrentVariant = function (
    variantId,
    activeVariant
  ) {
    if (activeVariant.settings_type_id.toString() == variantId) {
      return true
    }

    return false
  }

  ProductPrice.prototype.noDiscount = function (activeVariant) {
    return (
      typeof activeVariant.discount_type == 'undefined' ||
      activeVariant.discount_type == 'no_discount'
    )
  }

  ProductPrice.prototype.noPartialDiscount = function (activeVariant) {
    return (
      typeof activeVariant.partial_payment_discount_type == 'undefined' ||
      activeVariant.partial_payment_discount_type == 'no_partial_discount'
    )
  }

  ProductPrice.prototype.replaceMoneyFormat = function (moneyFormat) {
    replacedMoneyFormat = "{{amount}}"
    moneyFormat = shop.money_format
    if (moneyFormat.indexOf("amount_no_decimals") !== -1){
      replacedMoneyFormat = "{{amount_no_decimals}}"
    }
    else if(moneyFormat.indexOf("amount_no_decimals_with_comma_separator") !== -1){
      replacedMoneyFormat = "{{amount_no_decimals_with_comma_separator}}"
    }
    else if(moneyFormat.indexOf("amount_with_comma_separator") !== -1){
      replacedMoneyFormat = "{{amount_with_comma_separator}}"
    }
    return replacedMoneyFormat;
  }

  ProductPrice.prototype.invalidRequiredDiscountPercentage = function (
    activeVariant
  ) {
    var discountPercentage = parseFloat(activeVariant.discount_percentage)
    return (
      activeVariant.discount_type == 'discount_percentage' &&
      discountPercentage <= 0.0
    )
  }

  ProductPrice.prototype.invalidRequiredPartialDiscountPercentage = function (
    activeVariant
  ) {
    var discountPercentage = parseFloat(activeVariant.partial_payment_discount_percentage)
    return (
      activeVariant.partial_payment_discount_type == 'partial_payment_discount_percentage' &&
      discountPercentage <= 0.0
    )
  }

  ProductPrice.prototype.invalidRequiredDiscountFixedAmount = function (
    activeVariant
  ) {
    var discountFixedAmount = activeVariant.discount_fixed_amount

    return (
      activeVariant.discount_type == 'discount_fixed_amount' &&
      discountFixedAmount <= 0
    )
  }

  ProductPrice.prototype.invalidRequiredPartialDiscountFixedAmount = function (
    activeVariant
  ) {
    var discountFixedAmount = activeVariant.partial_payment_discount_fixed_amount
    return (
      activeVariant.partial_payment_discount_type == 'partial_payment_discount_fixed_amount' &&
      discountFixedAmount <= 0
    )
  }

  ProductPrice.prototype.preorderActive = function (activeVariant) {
    return activeVariant.settings_enabled && activeVariant.preorder_status
  }

  ProductPrice.prototype.checkIfVariantPriceExist = function (activeVariant) {
    VARIANT_SETTINGS_SUPPORTED_SHOPS = [
      'fuegoshoes.myshopify.com',
      'carmen-liu-lingerie.myshopify.com',
    ]

    return new Promise(function (resolve, rejct) {
      if (
        activeVariant.price <= 0.0 &&
        $.inArray(helper.getShopifyDomain(), VARIANT_SETTINGS_SUPPORTED_SHOPS)
      ) {
        helper
          .variantSetting(activeVariant.settings_type_id)
          .then(function (variant) {
            resolve(parseFloat(variant.price) * 100)
          })
      } else {
        resolve(activeVariant.price)
      }
    })
  }


  ProductPrice.prototype.showDiscountedPrice = function (activeVariant, typeOfReq) {
    var typeOfReq = typeOfReq || "";
    var self = this
    var shop = helper.getShop()
    var appliedProductDiscountedPrice = $('.discounted-price').length > 0
    var currentVariantId = helper.getCurrentVariantIdOnProductPage(shop)

    if (currentVariantId == null || typeof currentVariantId == 'undefined') {
      return false
    }

    if (
      // appliedProductDiscountedPrice ||
      !helper.onProductPage() ||
      !this.preorderActive(activeVariant) ||
      !this.validCurrentVariant(currentVariantId, activeVariant) ||
      this.noDiscount(activeVariant) ||
      this.invalidRequiredDiscountPercentage(activeVariant) ||
      this.invalidRequiredDiscountFixedAmount(activeVariant)
    ) {
      if(typeOfReq === ""){
        $(".partial-payment-widget").remove();
        $(".partial-payment-field").remove();
      }
      return false
    }

    this.checkIfVariantPriceExist(activeVariant).then(function (variantPrice) {
      var originalPrice = variantPrice
      var discount = 0
      var discountedPrice = 0
      var moneyFormat = '${{amount}}'
      var formattedOriginalPrice = ''
      var formattedDiscountedPrice = ''
      var html = ''
      var priceSelector = ''
      var salePriceSelectors = self.salePriceSelector.split(',') || []

      if (
        !self.preorderActive(activeVariant) ||
        self.noDiscount(activeVariant) ||
        self.invalidRequiredDiscountPercentage(activeVariant) ||
        self.invalidRequiredDiscountFixedAmount(activeVariant)
      ) {
        return false
      }
      if (activeVariant.use_default) {
        activeVariant = self.enabledDefaultSetting(activeVariant)
      }
      if (activeVariant.discount_type == 'percentage') {
        discount = Math.floor(
          originalPrice * (activeVariant.discount_percentage / 100)
        )
      } else if (activeVariant.discount_type == 'fixed_amount') {
        discount = activeVariant.discount_fixed_amount
      }
      if (discount >= originalPrice) {
        discountedPrice = 0.0
      } else {
        discountedPrice = originalPrice - discount
      }

      if (window.pn.shop.money_format !== undefined) {
        moneyFormat = window.pn.shop.money_format
      }

      var initialPayment = ""
      // if both discount and partial Payment enabled at same time
      if(activeVariant.partial_payment_discount_type == 'partial_percentage' || activeVariant.partial_payment_discount_type == 'partial_fixed_amount'){
        if (activeVariant.partial_payment_discount_type == 'partial_percentage') {
          discount = Math.floor(
            discountedPrice * (activeVariant.partial_payment_discount_percentage / 100)
          )
        } else if (activeVariant.partial_payment_discount_type == 'partial_fixed_amount') {
          discount = activeVariant.partial_payment_discount_fixed_amount
        }
        if (discount >= discountedPrice) {
          discountedPrice = 0.0
        } else {
          discountedPrice = discountedPrice - discount
        }        
      }
      if(!$("#sd_partial_opt").prop("checked")){
        $("#sd_partial_opt").trigger("click");
      }
      // if both discount and partial Payment enabled at same time

      if (helper.onProductPage()) {
        formattedOriginalPrice = helper.formatCents(originalPrice, moneyFormat)
        formattedPartialDiscountedPrice = helper.formatCents(
          discountedPrice,
          moneyFormat
        )
        // From here: This whole chunk need to be refactored and dynamic on base of selectors 
        if(self.variantHasPartialPaymentSellingPlan(activeVariant) === false){
          if(activeVariant.partial_payment_discount_type !== 'no_partial_discount'){
            $(".partial-payment-field").remove();
              if($(".partial-payment-widget").length === 0){
                if(Shopify.shop === "silogro.myshopify.com" || Shopify.shop === "passsawa.myshopify.com"){
                  $('form[action="/cart/add"]').first().prepend(self.partialPaymentFormData())
                }
                // need to remove this hard coded logic starting from next month to make it dynamic
                else if(Shopify.shop === "solostrength.myshopify.com"){
                  $(self.partialPaymentFormData()).prependTo('.preorder-now-active');
                }
                else if (Shopify.shop === "tech4tourers.myshopify.com"){
                  $($('form[action="/cart/add"]')[1]).prepend(self.partialPaymentFormData())
                }
                else{
                  $(self.partialPaymentFormData()).prependTo('form[action="/cart/add"]');
                }
              }
              if($(".partial-payment-widget").length === 0){
                if(Shopify.shop === "silogro.myshopify.com"){
                  $('form[action="/cart/add"]').first().prepend(self.partialPaymentFormData())
                }
                else{
                  $(self.partialPaymentFormData()).prependTo('form[action="/cart/add"]');
                }
              }

          // To there from above: This whole chunk need to be refactored and dynamic on base of selectors

            if(Shopify.shop === "elitechstore.myshopify.com"){
              $(".partial-payment-widget").each(function(){
                  if($(this).parent().hasClass("variants")){
                      $(this).remove();
                  }
              });
            }
            $(".partial-initial-payment").html("Initial Payment: " + formattedPartialDiscountedPrice);
            var remainingBlance = self.remainingPartialBalance(activeVariant, originalPrice, discountedPrice);
            // have to clean it up in ehancement of this feature
            if(Shopify.shop === "bushbuck.myshopify.com"){
              remainingBlance = "$" + remainingBlance.match(/\d+/g).join(".")
            }
            if(Shopify.shop === "angry-cat-toys.myshopify.com"){
              remainingBlance = "£" + remainingBlance.match(/\d+/g).join(".")
            }
            if(Shopify.shop === "solostrength.myshopify.com"){
              remainingBlance = "$" + remainingBlance.match(/\d+/g).join(".")
              $('.preorder-now-active').append(
                '<input type="hidden" class="partial-payment-field" name="properties[Remaining-Amount-Per-Item]" value="'+  remainingBlance +'" />'
              )
            }
            else{
              // remainingBlance = "$" + remainingBlance.match(/\d+/g).join(".")
              // remainingBlance = "$" + remainingBlance.replace(/^[, ]+|[, ]+$|[, ]+/g, "").match(/\d+/g).join(".")
              remainingBlance = remainingBlance.replace(/<[^>]*>?/gm, '').replace(/^[, ]+|[, ]+$|[, ]+/g, "").match(/\d+/g).join(".")
              htmlregex = /(<([^>]+)>)/ig
              remainingBlance = moneyFormat.replace(self.replaceMoneyFormat(moneyFormat), remainingBlance).replace(htmlregex, "")
              $("form[action='/cart/add']").append(
                '<input type="hidden" class="partial-payment-field" name="properties[Remaining-Amount-Per-Item]" value="'+  remainingBlance +'" />'
              )
            }
            if(Shopify.shop === "bushbuck.myshopify.com"){
              if($(".partial-payment-widget").length > 1){
                $(".partial-payment-widget").first().remove();
                $(".partial-payment-widget").last().remove();
              }
            }
            else {
              if($(".partial-payment-field").length > 1){
                $(".partial-payment-field").last().hide();
              }
              if($(".partial-payment-widget").length > 1){
                $(".partial-payment-widget").last().remove();
              }
            }
          }
        }
        if(self.variantHasDiscountPaymentSellingPlan(activeVariant) === false){
          if (activeVariant.discount_type == 'percentage') {
            discount = Math.floor(
              originalPrice * (activeVariant.discount_percentage / 100)
            )
          } else if (activeVariant.discount_type == 'fixed_amount') {
            discount = activeVariant.discount_fixed_amount
          }
          if (discount >= originalPrice) {
            discountedPrice = 0.0
          } else {
            discountedPrice = originalPrice - discount
          }
          formattedDiscountedPrice = helper.formatCents(
            discountedPrice,
            moneyFormat
          )
          html = [
            "<span class='line-through dd-price-line'>" + formattedOriginalPrice + '</span>',
            "<span class='discounted-price' style='margin-left: 7px; text-decoration: none !important;'>" + initialPayment +
              formattedDiscountedPrice +
              '</span>',
          ].join('\n')
          if (
            helper.productPageCompareAtPriceAvailable(activeVariant) &&
            salePriceSelectors.length > 0
          ) {
            priceSelector = $(salePriceSelectors[0]).first()
            if (salePriceSelectors.length > 1) {
              $(salePriceSelectors[1]).hide()
            }
          } else {
            priceSelector = $(self.priceSelector).first()
          }
          // if ($('.discounted-price').length == 0) {
            priceSelector.empty().append(html)
          // }
          // if(!$("#sd_partial_opt").prop("checked")){
          //   $("#sd_partial_opt").trigger("click");
          // }
        }
      }
    })
  }




  ProductPrice.prototype.partialPaymentTypeHandler = function (activeVariant) {
    var self = this;
    $(document).on('change', '.sd_partial_fullpart', function(){
    var originalPrice = activeVariant.price;
    var discount = 0
    var discountedPrice = 0
    var moneyFormat = '${{amount}}'
    var formattedOriginalPrice = ''
    var formattedDiscountedPrice = ''
    var isDiscountEnable = false;
    var isPartialPaymentEnable = false;
    if (activeVariant.discount_type == 'percentage') {
      discount = Math.floor(
        originalPrice * (activeVariant.discount_percentage / 100)
      )
      isDiscountEnable = true
    } else if (activeVariant.discount_type == 'fixed_amount') {
      discount = activeVariant.discount_fixed_amount
      isDiscountEnable = true
    }
    if (discount >= originalPrice) {
      discountedPrice = 0.0
    } else {
      discountedPrice = originalPrice - discount
    }
    var initialPayment = '';
    if($(this).val() !== "full-payment"){
      if(activeVariant.partial_payment_discount_type == 'partial_percentage' || activeVariant.partial_payment_discount_type == 'partial_fixed_amount'){
        initialPayment = "Initial Payment: "
        if (activeVariant.partial_payment_discount_type == 'partial_percentage') {
          discount = Math.floor(
            originalPrice * (activeVariant.partial_payment_discount_percentage / 100)
          )
          isPartialPaymentEnable = true
        } else if (activeVariant.partial_payment_discount_type == 'partial_fixed_amount') {
          discount = activeVariant.partial_payment_discount_fixed_amount
          isPartialPaymentEnable = true
        }
        if (discount >= discountedPrice) {
          discountedPrice = 0.0
        } else {
          discountedPrice = discountedPrice - discount
        }
      }
    }
      if (helper.onProductPage()) {
        formattedOriginalPrice = helper.formatCents(originalPrice, moneyFormat)
        formattedDiscountedPrice = helper.formatCents(
          discountedPrice,
          moneyFormat
        )
      }
      if($(this).val() === "full-payment"){
        $(".partial-payment-field").remove();
        $(".partial-initial-payment").text("");
      }
      else if($(this).val() === "partial-payment"){
        $(".partial-initial-payment").text("");
        $(".partial-payment-field").remove();
        var remainingBlance = self.remainingPartialBalance(activeVariant, originalPrice, discountedPrice);
        if(activeVariant.discount_type !== 'no_discount' && activeVariant.partial_payment_discount_type !== 'no_partial_discount' ){
          self.showDiscountedPrice(activeVariant, "widget");
        }
        else if(activeVariant.partial_payment_discount_type !== 'no_partial_discount' && activeVariant.discount_type === 'no_discount' ) {
          self.showPartialDiscountedPrice(activeVariant, "widget");
        }
      }
    });
  }

  ProductPrice.prototype.remainingPartialBalance = function(activeVariant, originalPrice, discountedPrice){
    var remainingBlance = 0.0;
    var moneyFormat = '${{amount}}'
    if (window.pn.shop.money_format !== undefined) {
      moneyFormat = window.pn.shop.money_format
    }
    if(activeVariant.partial_payment_discount_type !== 'no_partial_discount' && activeVariant.discount_type === 'no_discount'){
      remainingBlance = originalPrice - discountedPrice
      remainingBlance = helper.formatCents(
        remainingBlance,
        moneyFormat
      )
    }
    else {
      if(activeVariant.discount_type === 'fixed_amount'){
        remainingBlance = originalPrice - discountedPrice - activeVariant.discount_fixed_amount
        remainingBlance = helper.formatCents(
          remainingBlance,
          moneyFormat
        )
      }
      else {
        var remainingDiscount = Math.floor(
          originalPrice * (activeVariant.discount_percentage / 100)
        )
        remainingBlance = originalPrice - discountedPrice - remainingDiscount
        remainingBlance = helper.formatCents(
            remainingBlance,
            moneyFormat
        )
      }
    }
    return remainingBlance;
  }

  ProductPrice.prototype.partialPaymentFormData = function(){
    return '<div class="c-widget partial-payment-widget" id="partial-payment-widget"><div class="sd_payment_type sd-custom-price-type"><label>Payment Type</label><span><input type="radio" id="sd_partial_opt" name="partial-payment" class="sd_partial_fullpart" checked="" value="partial-payment"><label for="sd_partial_opt" class="sd-label-payment-type">Partial Payment</label></span><span><input type="radio" id="sd_full_opt" name="partial-payment" class="sd_partial_fullpart" value="full-payment"><label for="sd_full_opt" class="sd-label-payment-type">Full Payment</label></span><h3><b class="partial-initial-payment">Initial Payment: $0.0</b></h3></div><div class="sd-span-custompart-price" style="visibility: hidden;"><span class="sd-cust-currency">$</span><input type="number" class="price-input-preorder"></div></div>';
  }

  ProductPrice.prototype.variantHasPartialPaymentSellingPlan = function(activeVariant){
    return this.checkPlanInPurchaseOptions(activeVariant, "partial")
  }

  ProductPrice.prototype.variantHasDiscountPaymentSellingPlan = function(activeVariant){
    return this.checkPlanInPurchaseOptions(activeVariant, "discount")
  }

  ProductPrice.prototype.checkPlanInPurchaseOptions = function(activeVariant, planItem){
    if(shop.shopify_purchase_option_enabled === true){
      $(".pn-selling-plan-purchase-options").css("display", "block");
    }
    else{
      $(".pn-selling-plan-purchase-options").remove();
    }
    var hasPartialPaymentPlan = false;
    var variantId = activeVariant.settings_type_id;
    $("#variant-"+ variantId +" option").each(function(){
      var optVal = $(this).text().toLowerCase();
      if(optVal.indexOf(planItem) !== -1){
        hasPartialPaymentPlan = true;
      }
    });
    return hasPartialPaymentPlan;
  }

  ProductPrice.prototype.showPartialDiscountedPrice = function (activeVariant, typeOfReq) {
    var typeOfReq = typeOfReq || "";
    var self = this
    var shop = helper.getShop()
    var appliedProductDiscountedPrice = $('.discounted-price').length > 0
    var currentVariantId = helper.getCurrentVariantIdOnProductPage(shop)

    if (currentVariantId == null || typeof currentVariantId == 'undefined') {
      return false
    }

    if (
      // appliedProductDiscountedPrice ||
      !helper.onProductPage() ||
      !this.preorderActive(activeVariant) ||
      !this.validCurrentVariant(currentVariantId, activeVariant) ||
      this.noPartialDiscount(activeVariant) ||
      this.invalidRequiredPartialDiscountPercentage(activeVariant) ||
      this.invalidRequiredPartialDiscountFixedAmount(activeVariant)
    ) {
      if(typeOfReq === ""){
        $(".partial-payment-widget").remove();
        $(".partial-payment-field").remove();
      }
      return false
    }

    this.checkIfVariantPriceExist(activeVariant).then(function (variantPrice) {
      var originalPrice = variantPrice
      var discount = 0
      var discountedPrice = 0
      var moneyFormat = '${{amount}}'
      var formattedOriginalPrice = ''
      var formattedDiscountedPrice = ''
      var html = ''
      var priceSelector = ''
      var salePriceSelectors = self.salePriceSelector.split(',') || []
      if (
        !self.preorderActive(activeVariant) ||
        self.noPartialDiscount(activeVariant) ||
        self.invalidRequiredPartialDiscountPercentage(activeVariant) ||
        self.invalidRequiredPartialDiscountFixedAmount(activeVariant)
      ) {
        return false
      }

      if (activeVariant.use_default) {
        activeVariant = self.enabledDefaultSetting(activeVariant)
      }

      if (activeVariant.partial_payment_discount_type == 'partial_percentage') {
        discount = Math.floor(
          originalPrice * (activeVariant.partial_payment_discount_percentage / 100)
        )
      } else if (activeVariant.partial_payment_discount_type == 'partial_fixed_amount') {
        discount = activeVariant.partial_payment_discount_fixed_amount
      }
      if (discount >= originalPrice) {
        discountedPrice = 0.0
      } else {
        discountedPrice = originalPrice - discount
      }

      if (window.pn.shop.money_format !== undefined) {
        moneyFormat = window.pn.shop.money_format
      }

      if (helper.onProductPage() && activeVariant.discount_type === 'no_discount' && activeVariant.partial_payment_discount_type !== 'no_partial_discount') {
        formattedOriginalPrice = helper.formatCents(originalPrice, moneyFormat)
        formattedDiscountedPrice = helper.formatCents(
          discountedPrice,
          moneyFormat
        )
        // html = [
        //   "<span class='line-through dd-price-line'>" + formattedOriginalPrice + '</span>',
        //   "<span class='discounted-price' style='margin-left: 7px; text-decoration: none !important;'> Initial Payment: " +
        //     formattedDiscountedPrice +
        //     '</span>',
        // ].join('\n')
        $(".partial-payment-field").remove();
        var remainingBlance = self.remainingPartialBalance(activeVariant, originalPrice, discountedPrice);

        if($(".partial-payment-widget").length === 0){
          if(Shopify.shop === "silogro.myshopify.com" || Shopify.shop === "passsawa.myshopify.com"){
            $('form[action="/cart/add"]').first().prepend(self.partialPaymentFormData())
          }
          // need to remove this hard coded logic starting from next month to make it dynamic
          else if(Shopify.shop === "solostrength.myshopify.com"){
            $(self.partialPaymentFormData()).prependTo('.preorder-now-active');
          }
          else if (Shopify.shop === "tech4tourers.myshopify.com"){
            $($('form[action="/cart/add"]')[1]).prepend(self.partialPaymentFormData())
          }
          else{
            $(self.partialPaymentFormData()).prependTo('form[action="/cart/add"]');
          }
        }
        if(Shopify.shop === "elitechstore.myshopify.com"){
          $(".partial-payment-widget").each(function(){
              if($(this).parent().hasClass("variants")){
                  $(this).remove();
              }
          });
        }
        $(".partial-initial-payment").html("Initial Payment: " + formattedDiscountedPrice);
        if(Shopify.shop === "bushbuck.myshopify.com"){
          remainingBlance = "$" + remainingBlance.match(/\d+/g).join(".")
        }
        if(Shopify.shop === "angry-cat-toys.myshopify.com"){
          remainingBlance = "£" + remainingBlance.match(/\d+/g).join(".")
        }
        if(Shopify.shop === "solostrength.myshopify.com"){
          remainingBlance = "$" + remainingBlance.match(/\d+/g).join(".")
          $('.preorder-now-active').append(
            '<input type="hidden" class="partial-payment-field" name="properties[Remaining-Amount-Per-Item]" value="'+  remainingBlance +'" />'
          )
        }
        else{
          // remainingBlance = "$" + remainingBlance.match(/\d+/g).join(".")
          // remainingBlance = "$" + remainingBlance.replace(/^[, ]+|[, ]+$|[, ]+/g, "").match(/\d+/g).join(".")
          remainingBlance = remainingBlance.replace(/<[^>]*>?/gm, '').replace(/^[, ]+|[, ]+$|[, ]+/g, "").match(/\d+/g).join(".")
          htmlregex = /(<([^>]+)>)/ig
          remainingBlance = moneyFormat.replace(self.replaceMoneyFormat(moneyFormat), remainingBlance).replace(htmlregex, "")
          // remainingBlance = moneyFormat.replace("{{amount}}", remainingBlance)
          $("form[action='/cart/add']").append(
            '<input type="hidden" class="partial-payment-field" name="properties[Remaining-Amount-Per-Item]" value="'+  remainingBlance +'" />'
          )
        }
        if (
          helper.productPageCompareAtPriceAvailable(activeVariant) &&
          salePriceSelectors.length > 0
        ) {
          priceSelector = $(salePriceSelectors[0]).first()
          if (salePriceSelectors.length > 1) {
            $(salePriceSelectors[1]).hide()
          }
        } else {
          priceSelector = $(self.priceSelector).first()
        }
        if(Shopify.shop === "bushbuck.myshopify.com"){
          if($(".partial-payment-widget").length > 1){
            $(".partial-payment-widget").first().remove();
            $(".partial-payment-widget").last().remove();
          }
        }
        else {
          if($(".partial-payment-field").length > 1){
            $(".partial-payment-field").last().hide();
          }
          if($(".partial-payment-widget").length > 1){
            $(".partial-payment-widget").last().remove();
          }
        }

        // if ($('.discounted-price').length == 0) {
          // priceSelector.empty().append(html)
        // }
        if(!$("#sd_partial_opt").prop("checked")){
          $("#sd_partial_opt").trigger("click");
        }
      }
    })
  }

  const buttonSelectorFallback = (btnSelector) => {
    if (btnSelector && btnSelector?.replace(/ /g,'').length > 0) {
      return btnSelector
    }

    let form_action_btn_query = $('form[action="/cart/add"]').find('input[type="submit"], button, input[type="image"]')
    if(!form_action_btn_query) return "form[action^='/cart/add']:first [type=submit]:visible:first"
    
    let form_action_btn_query_children = form_action_btn_query.children()
    let default_btn_selector;
    
    if(form_action_btn_query_children && form_action_btn_query_children.length > 0) {
      let overlay_spinner_present = form_action_btn_query_children.filter('.loading-overlay__spinner')
      if(overlay_spinner_present) default_btn_selector = "button[name='add'] span"
      else default_btn_selector = "form[action^='/cart/add']:first [type=submit]:visible:first"
    } else { 
      default_btn_selector = "form[action^='/cart/add']:first [type=submit]:visible:first"
    }
    return default_btn_selector
  }

  function PreorderProduct(args) {
    this.handle = args['handle'] || ''
    this.tags = args['tags'] || ''
    this.settings = args['settings'] || []
    this.formSelectors = {}
    this.activeVariant = {}
    this.collectionBadges = []
    this.uuid = Math.random().toString(36).substring(2, 15)

    this.configFormSelectors()

    this.preorderButton = new PreorderButton({
      buttonSelector: this.formSelectors.button_selector,
    })
    this.partialPreorderNote = new PartialPreorderNote({
      formSelector: this.formSelectors.form_selector,
      partialPreorderNotePlacementSelector:
        this.formSelectors.partial_preorder_notice_placement_selector,
    })
    this.preorderCartLabel = new PreorderLineItemProperty({
      formSelector: this.formSelectors.form_selector,
    })
    this.preorderDescription = new PreorderDescription({
      formSelector: this.formSelectors.form_selector,
      buttonSelector: this.formSelectors.button_selector,
    })
    this.stockCounter = new StockCounter({
      formSelector: this.formSelectors.form_selector,
      buttonSelector: this.formSelectors.button_selector,
    })
    this.preorderBadge = new PreorderBadge({
      productImageContainer:
        this.formSelectors.product_image_container_selector,
    })
    this.productPrice = new ProductPrice({
      priceSelector: this.formSelectors.priceSelector,
      salePriceSelector: this.formSelectors.salePriceSelector,
    })
    this.initPreorderForm()
  }

  PreorderProduct.prototype.updateFormSelectorsInObjects = function () {
    this.preorderButton.buttonSelector = this.formSelectors.button_selector
    this.partialPreorderNote.formSelector = this.formSelectors.form_selector
    this.partialPreorderNote.partialPreorderNotePlacementSelector =
      this.formSelectors.partial_preorder_notice_placement_selector
    this.preorderCartLabel.formSelector = this.formSelectors.form_selector
    this.preorderDescription.formSelector = this.formSelectors.form_selector
    this.preorderDescription.buttonSelector = this.formSelectors.button_selector
    this.stockCounter.formSelector = this.formSelectors.form_selector
    this.stockCounter.buttonSelector = this.formSelectors.button_selector
    this.preorderBadge.productImageContainer =
      this.formSelectors.product_image_container_selector
    this.productPrice.priceSelector = this.formSelectors.priceSelector
    this.productPrice.salePriceSelector = this.formSelectors.salePriceSelector
  }

  PreorderProduct.prototype.configFormSelectors = function () {
    if (this.inQuickview()) {
      this.configQuickviewFormSelectors()
    } else {
      this.configNormalFormSelectors()
    }
  }

  PreorderProduct.prototype.inQuickview = function () {
    return (
      typeof window.pn.quickviewClicked !== 'undefined' &&
      window.pn.quickviewClicked
    )
  }

  PreorderProduct.prototype.configQuickviewFormSelectors = function () {
    window.pn.quickviewClicked = false

    this.formSelectors.form_selector = $(
      window.pn.quickviewSettings.quickviewModalContainerSelectors
    ).find(window.pn.quickviewSettings.formSelectors)
    this.formSelectors.button_selector = $(
      window.pn.quickviewSettings.quickviewModalContainerSelectors
    ).find(window.pn.quickviewSettings.addToCartButtonSelectors)
    $(this.formSelectors.button_selector).addClass('pn-button-' + this.uuid)
    this.formSelectors.product_image_container_selector = $(
      window.pn.quickviewSettings.quickviewModalContainerSelectors
    ).find(window.pn.quickviewSettings.productImageContainerSelectors)
    this.formSelectors.variant_selector = $(
      window.pn.quickviewSettings.quickviewModalContainerSelectors
    ).find(window.pn.quickviewSettings.variantSelectors)
    $(this.formSelectors.variant_selector).addClass(
      'pn-variant-picker-' + this.uuid
    )

    if (helper.stringChecker(shop.partial_preorder_notice_placement_selector)) {
      this.formSelectors.partial_preorder_notice_placement_selector = $(
        window.pn.quickviewSettings.quickviewModalContainerSelectors
      ).find(shop.partial_preorder_notice_placement_selector)
    } else {
      this.formSelectors.partial_preorder_notice_placement_selector =
        this.formSelectors.button_selector
    }
    this.formSelectors.priceSelector = window.pn.quickviewSettings.priceSelector
    this.formSelectors.salePriceSelector =
      window.pn.quickviewSettings.salePriceSelector
  }

  // NOTE: CHECK THIS EDSIL
  PreorderProduct.prototype.configNormalFormSelectors = function () {
    shop.button_selector = buttonSelectorFallback(shop.button_selector)
    this.formSelectors.form_selector = $(
      shop.fss_selector_prefix +
        "input[value='" +
        this.settings[
          Object.keys(this.settings)[Object.keys(this.settings).length - 1]
        ].settings_type_id +
        "'], " +
        shop.fss_selector_prefix +
        "option[value='" +
        this.settings[
          Object.keys(this.settings)[Object.keys(this.settings).length - 1]
        ].settings_type_id +
        "']"
    ).parents(shop.fss_parent_selector)

    // this.settings contains settings for each variant in the product
    // If we can't find a form with an ID field containing the first setting's variant ID then we cycle through each setting's variant ID until we do
    if ($(this.formSelectors.form_selector).length === 0) {
      var minusIndex = 1
      while (
        $(this.formSelectors.form_selector).length === 0 &&
        Object.keys(this.settings).length > minusIndex
      ) {
        minusIndex++
        this.formSelectors.form_selector = $(
          shop.fss_selector_prefix +
            "input[value='" +
            this.settings[
              Object.keys(this.settings)[
                Object.keys(this.settings).length - minusIndex
              ]
            ].settings_type_id +
            "'], " +
            shop.fss_selector_prefix +
            "option[value='" +
            this.settings[
              Object.keys(this.settings)[
                Object.keys(this.settings).length - minusIndex
              ]
            ].settings_type_id +
            "']"
        ).parents(shop.fss_parent_selector)
      }
    }

    // for BroadCast Theme
    if(window.pn.datastore.theme_setting.theme_name === "Broadcast" || Shopify.theme.name.indexOf("Broadcast") !== -1){
      var formId = $(
        shop.fss_selector_prefix +
          "input[value='" +
          this.settings[
            Object.keys(this.settings)[Object.keys(this.settings).length - 1]
          ].settings_type_id +
          "'], " +
          shop.fss_selector_prefix +
          "option[value='" +
          this.settings[
            Object.keys(this.settings)[Object.keys(this.settings).length - 1]
          ].settings_type_id +
          "']"
      ).attr("form")
      this.formSelectors.form_selector = $("#" + formId);
    }

    if($(this.formSelectors.form_selector).length === 0){
      this.formSelectors.form_selector = $(window.pn.shop.form_selector);
    }

    if ($(this.formSelectors.form_selector).length !== 0) {
      if (
        helper.getShopifyDomain() === 'aswemove.myshopify.com' ||
        helper.getShopifyDomain() === 'dundas-dev.myshopify.com' ||
        helper.getShopifyDomain() === 'babe-is-busy.myshopify.com' ||
        helper.getShopifyDomain() === 'baby-online-direct.myshopify.com' ||
        helper.getShopifyDomain() === 'bfree-company.myshopify.com' ||
        helper.getShopifyDomain() === 'the-screen-surgery.myshopify.com' ||
        helper.getShopifyDomain() === 'hatch-trial.myshopify.com' ||
        helper.getShopifyDomain() === 'glory-facial.myshopify.com'
      ) {
        this.formSelectors.button_selector = $(shop.button_selector).last()
      } else if (
        (helper.getShopifyDomain() === 'wolfgypsy.myshopify.com' ||
          helper.getShopifyDomain() === 'shekou-woman.myshopify.com') &&
        helper.onProductPage()
      ) {
        this.formSelectors.button_selector = $(shop.button_selector).first()
      } else {
        this.formSelectors.button_selector =
          this.formSelectors.form_selector.find(
            helper.stripFormSelector(shop.button_selector)
          )
      }

      $(this.formSelectors.button_selector).addClass('pn-button-' + this.uuid)

      if (
        helper.getShopifyDomain() === 'okoliving.myshopify.com' &&
        !helper.onProductPage()
      ) {
        this.formSelectors.product_image_container_selector = $(
          shop.product_image_container_selector
        )
      }

      if (
        helper.getShopifyDomain() ===
          'rhythm-cbd-sparkling-water.myshopify.com' &&
        !helper.onProductPage()
      ) {
        this.formSelectors.product_image_container_selector = $(
          this.formSelectors.form_selector
        )
          .parents('.featured-product')
          .find(helper.stripFormSelector(shop.product_image_container_selector))
      } else {
        this.formSelectors.product_image_container_selector = $(
          helper.stripFormSelector(shop.product_image_container_selector)
        )
      }

      this.formSelectors.variant_selector =
        this.formSelectors.form_selector.find(
          helper.stripFormSelector(shop.variant_selector)
        )
      $(this.formSelectors.variant_selector).addClass(
        'pn-variant-picker-' + this.uuid
      )

      if (
        helper.stringChecker(shop.partial_preorder_notice_placement_selector)
      ) {
        this.formSelectors.partial_preorder_notice_placement_selector =
          this.formSelectors.form_selector.find(
            helper.stripFormSelector(
              shop.partial_preorder_notice_placement_selector
            )
          )
      } else {
        this.formSelectors.partial_preorder_notice_placement_selector =
          this.formSelectors.button_selector
      }
    } else {
      if (helper.getShopifyDomain() === 'evie-grey.myshopify.com') {
        this.formSelectors.product_image_container_selector = $(
          helper.stripFormSelector(shop.product_image_container_selector)
        )
      }
    }
    this.formSelectors.priceSelector =
      window.pn.shop.product_page_price_selector
    this.formSelectors.salePriceSelector =
      window.pn.shop.product_page_sale_price_selector
  }

  PreorderProduct.prototype.initPreorderForm = function () {
    this.createWidget()
    this.initVariantSelectorEventListeners()
  }

  PreorderProduct.prototype.initVariantSelectorEventListeners = function () {
    var self = this
    $(document).on(
      'change',
      '.pn-variant-picker-' + this.uuid,
      function (event) {
        self.variantChangeHandler()
      }
    )
    $(document).on('click', SWATCH_SELECTORS, function (event) {
      if (
        helper.onProductPage() ||
        $(event.target)
          .parents(shop.form_selector)
          .is(self.formSelectors.form_selector)
      ) {
        self.variantChangeHandler()
      }
      else if((window.pn.datastore.theme_setting.theme_name === "Dawn" || window.pn.datastore.theme_setting.theme_name === "Horizon") && typeof shop.quickview_support_enabled !== 'undefined' &&
      shop.quickview_support_enabled){
        self.variantChangeHandler();
      }
    })
    if((window.pn.datastore.theme_setting.theme_name === "Dawn" || window.pn.datastore.theme_setting.theme_name === "Horizon") && typeof shop.quickview_support_enabled !== 'undefined' && shop.quickview_support_enabled)
    {
      $(document).on(
        'change',
        '.product-form__input.product-form__input--dropdown select',
        function (event) {
          self.variantChangeHandler()
        }
      )
    }
    if (helper.onProductPage()) {
      var urlChangeListener = new URLChangeListener()
      urlChangeListener.setup(function () {
        self.variantChangeHandler()
      })
    }
  }

  PreorderProduct.prototype.initClickLogger = function () {
    var self = this
    if (self.preorderActive()) {
      $(document).on('click', '.pn-button-' + self.uuid, function (event) {
        if (self.preorderActive()) {
          stockChecker.getItems()
          self.logClick(event)
        }
      })
    }
  }

  PreorderProduct.prototype.preorderActive = function () {
    return (
      this.activeVariant.preorder_status && this.activeVariant.settings_enabled
    )
  }

  PreorderProduct.prototype.preorderActiveForSetting = function (setting) {
    return setting.preorder_status && setting.settings_enabled
  }

  PreorderProduct.prototype.createWidget = function () {
    
    // a merchant wants to change the tag due to his SEO isuue. gave us 1 star :(
    if(helper.getShopifyDomain() === 'turmerry.myshopify.com') {
      var text = $(".pn-notify-popup-heading").text();
      var tag = '<h3 class="pn-notify-popup-heading">'+ text +'</h3>'
      $(".pn-notify-popup-heading").replaceWith(tag);
    }

    this.activeVariant = this.getActiveVariantSetting()
    this.confirmButtonExists();
    if(this.productPrice.variantHasDiscountPaymentSellingPlan(this.activeVariant) === false && shop.shopify_purchase_option_enabled === false){
      this.productPrice.showDiscountedPrice(this.activeVariant);
    }
    if(this.productPrice.variantHasPartialPaymentSellingPlan(this.activeVariant) === false && shop.shopify_purchase_option_enabled === false){
      this.productPrice.showPartialDiscountedPrice(this.activeVariant)
    }
    $(document).off('change', '.sd_partial_fullpart');
    this.productPrice.partialPaymentTypeHandler(this.activeVariant);
    this.initPreorderButton()
    if (
      helper.getShop().enable_collection_page_button &&
      helper.getShopifyDomain() === 'dndportal.myshopify.com'
    ) {
      this.preorderDescription.showPreorderDescription(this)
    }

    if (helper.getShopifyDomain() !== 'dndportal.myshopify.com') {
      this.preorderDescription.showPreorderDescription(this)
    }

    this.preorderCartLabel.showPreorderLineItemProperty(this)

    this.preorderBadge.showPreorderBadge(this, this.activeVariant, '', '')

    this.initClickLogger()
    this.stockCounter.showStockCounter(this)
    this.initCollectionBadges()

    return this.preorderActive()
  }

  PreorderProduct.prototype.confirmButtonExists = function () {
    if ($(this.preorderButton.buttonSelector).closest('body').length < 1) {
      this.formSelectors.button_selector =
        this.formSelectors.form_selector.find(
          helper.stripFormSelector(shop.button_selector)
        )
      $(this.formSelectors.button_selector).addClass('pn-button-' + this.uuid)
      this.preorderButton.buttonSelector = this.formSelectors.button_selector
      this.preorderDescription.buttonSelector =
        this.formSelectors.button_selector
      this.stockCounter.buttonSelector = this.formSelectors.button_selector
    }
  }

  // NOTE: CHECK THIS ONE EDSIL
  PreorderProduct.prototype.initCollectionBadges = function () {
    var self = this
    if (shop.enable_collection_page_badge) {
      if (
        helper.getShopifyDomain() === 'evie-grey.myshopify.com' &&
        $('.product-inner').find('.preorder-badge').length > 0
      ) {
        return
      }
      var preorderMustBeEnabledForAllVariants =
        shop.show_collection_badge_only_if_all_variants_out_of_stock
      var productContainers = self.getProductContainerFromHandle(self.handle)
      if (productContainers.length > 0) {
        if (
          (preorderMustBeEnabledForAllVariants &&
            self.preorderEnabledForAllVariants(self.settings)) ||
          (!preorderMustBeEnabledForAllVariants &&
            self.preorderEnabledForSomeVariants(self.settings))
        ) {
          var activePreorderSetting = self.getSingleActivePreorderSetting(
            self.settings
          )
          if (activePreorderSetting) {
            $.each(productContainers, function (index, productContainer) {
              if ($(productContainer).find('.preorder-badge').length === 0) {
                var newBadge = new PreorderBadge({
                  productImageContainer: $(productContainer),
                })
                newBadge.showPreorderBadge(
                  self,
                  activePreorderSetting,
                  'collection-badge',
                  'collection-badge-container'
                )
                self.collectionBadges.push(newBadge)
              }
            })
          }
        }
      }
    }
  }

  PreorderProduct.prototype.usingInventoryMgmtMethod1 = function () {
    return (
      this.activeVariant.use_stock_management &&
      this.activeVariant.use_shopify_stock_management &&
      this.activeVariant.shopify_stock_mgmt_method === 1 &&
      helper.numberChecker(this.activeVariant.shopify_inventory)
    )
  }

  PreorderProduct.prototype.usingInventoryMgmtMethod2 = function () {
    return (
      this.activeVariant.oversell_enabled &&
      this.activeVariant.use_stock_management &&
      this.activeVariant.use_shopify_stock_management &&
      this.activeVariant.shopify_stock_mgmt_method === 2 &&
      helper.numberChecker(this.activeVariant.shopify_inventory)
    )
  }

  PreorderProduct.prototype.usingPreorderStock = function () {
    return (
      this.activeVariant.use_stock_management &&
      !this.activeVariant.use_shopify_stock_management &&
      helper.numberChecker(this.activeVariant.preorder_stock)
    )
  }

  PreorderProduct.prototype.hasPreorderStock = function () {
    var result =
      this.usingPreorderStock() && this.activeVariant.preorder_stock > 0
    return result
  }

  PreorderProduct.prototype.usingInventoryMgmtMethod2PreorderStock =
    function () {
      var result =
        this.usingInventoryMgmtMethod2() &&
        helper.numberChecker(this.activeVariant.shopify_preorder_limit)
      return result
    }

  PreorderProduct.prototype.showStockRemainingEnabled = function () {
    return (
      this.activeVariant.show_stock_remaining &&
      helper.stringChecker(this.activeVariant.stock_remaining_message)
    )
  }

  PreorderProduct.prototype.outOfInventoryMgmtMethod2PreorderStock =
    function () {
      var result =
        this.usingInventoryMgmtMethod2() &&
        helper.numberChecker(this.activeVariant.shopify_preorder_limit) &&
        this.activeVariant.shopify_preorder_limit < 1
      return result
    }

  PreorderProduct.prototype.inStockInShopify = function () {
    return (
      this.activeVariant.shopify_inventory != null &&
      this.activeVariant.shopify_inventory > 0
    )
  }

  PreorderProduct.prototype.outOfPreorderStock = function () {
    return (
      this.activeVariant.use_stock_management &&
      !this.activeVariant.use_shopify_stock_management &&
      helper.numberChecker(this.activeVariant.preorder_stock) &&
      this.activeVariant.preorder_stock < 1
    )

  }

  PreorderProduct.prototype.outOfStockInShopify = function () {
    return (
      helper.numberChecker(this.activeVariant.shopify_inventory) &&
      this.activeVariant.shopify_inventory < 1 &&
      !this.activeVariant.oversell_enabled &&
      this.activeVariant.inventory_management !== '' &&
      this.activeVariant.inventory_management !== null
    )
  }

  PreorderProduct.prototype.showNotifyEmailStockButton = function () {
    if(this.outOfStockInShopify()){
      this.activeVariant.shopify_inventory < 1 &&
      !this.activeVariant.oversell_enabled &&
      this.activeVariant.inventory_management !== '' &&
      this.activeVariant.inventory_management !== null
    }
  }

  PreorderProduct.prototype.initPreorderButton = function () {
    if (this.activeVariant.settings_enabled) {
      if (
        this.usingInventoryMgmtMethod2() &&
        this.outOfInventoryMgmtMethod2PreorderStock()
      ) {
        this.preorderButton.showOutOfStockButton()
      } else if (this.usingInventoryMgmtMethod2() && this.inStockInShopify()) {
        this.partialPreorderNote.initPartialPreorderNotice(this)
      }
      if (this.outOfPreorderStock() || this.preorderActive()) {
        $(this.formSelectors.form_selector).addClass(PN_ACTIVE_CLASS)
        if (shop.hide_buy_now_button) {
          if (helper.getShopifyDomain() === 'bettababy.myshopify.com') {
            $('.shopify-payment-button div').hide()
          } else {
            $(this.formSelectors.form_selector)
              .find(BUY_NOW_BUTTON_SELECTOR)
              .hide()
          }
        }
      }
      if (this.outOfPreorderStock()) {
        this.preorderButton.showOutOfPreorderStockButton(this.activeVariant)
      }
      if (this.preorderActive()) {
        if (this.outOfStockInShopify()) {
          this.preorderButton.showOutOfStockButton()
        } else {
          $(".notify-me-out-of-stock-btn").remove();
          this.preorderButton.showPreorderButton(this.activeVariant)
        }
      }
    }
    if(!shop.notify_alert_along_pn_btn){
      // if(this.outOfStockInShopify() && shop.show_nofify_me_button && !this.activeVariant.use_stock_management){
      if(this.outOfStockInShopify() && shop.show_nofify_me_button){
        if($(".notify-me-out-of-stock-btn").length === 0){
          this.initNotifyEmailSettings();
          this.notifyMeButtonClickHandler();
          this.customizeNotifyAlertPopup();
        }
        this.subscribeToEmailNotifications();
      }
      else {
        $(".notify-me-out-of-stock-btn").remove();
      }
    }
    else if(shop.notify_alert_along_pn_btn && this.preorderActive()){
      // if(shop.show_nofify_me_button && !this.activeVariant.use_stock_management){
      if(shop.show_nofify_me_button){
        if($(".notify-me-out-of-stock-btn").length === 0){
          this.initNotifyEmailSettings();
          this.notifyMeButtonClickHandler();
          this.customizeNotifyAlertPopup();
        }
        this.subscribeToEmailNotifications();
      }
      else {
        $(".notify-me-out-of-stock-btn").remove();
      }
    }
    else {
      $(".notify-me-out-of-stock-btn").remove();
    }
    this.addSellingPlanEventListener();
  }

  PreorderProduct.prototype.addSellingPlanEventListener = function(){
    if(shop.shopify_purchase_option_enabled === true){
      $(".pn-selling-plan-purchase-options").css("display", "block");
      this.addSellingPlanToCart();
    }
    else{
      $(".pn-selling-plan-purchase-options").remove();
    }
  }

  PreorderProduct.prototype.hideIfMoreThenOnePnorNotifyButtons = function(){
    if(Shopify.shop === 'prolux-cleaners.myshopify.com'){
      if($('[id=addToCartCopy]').length > 2){
        if($(".notify-me").length > 2){
          $(".notify-me").remove();
          $(".button--full.button--primary").last().remove()
        }
      }
    }
  }

  PreorderProduct.prototype.customizeNotifyAlertPopup = function () {
    $(".pn-notify-popup-heading").text(shop.notify_popup_heading);
    $(".pn-notify-popup-desc").text(shop.notify_popup_desc);
    $(".pn-notify-btn-text").text(shop.notify_btn_text);
    $(".pn-notify-popup-footer-text").text(shop.notify_popup_footer_text);
    $(".pn-notify-btn-text").css('background-color', shop.notify_popup_notify_btn_color);

  }

  PreorderProduct.prototype.initNotifyEmailSettings = function () {
    // seperate function
    var classes = $(this.preorderButton.buttonSelector).attr("class");
    if(Shopify.shop === 'prolux-cleaners.myshopify.com'){
      $(this.preorderButton.buttonSelector).first().after("<button style='margin-top:10px;background-color: "+shop.notify_bg_color+";border-color: "+shop.notify_border_color+"' class='notify-me-out-of-stock-btn "+classes +"'>" + shop.main_notify_btn + "</button>");
      setTimeout(function () {
        $(".btn.button.button--full.button--primary").each(function(){
          if(!$(this).hasClass("hide-cart-button") && $(this).text().trim() === "Preorder Now"){
            $(this).addClass("dup-pn-need-to-remove");
          }
          else if(!$(this).hasClass("hide-cart-button") && $(this).text().trim() === "Notify Me when back in stock"){
            $(this).addClass("dup-nt-need-to-remove");
          }
        });
        // $(".dup-pn-need-to-remove:gt(0)").hide()
        $(".dup-nt-need-to-remove:gt(0)").hide();
        if($(".dup-pn-need-to-remove").length > 1){
          $(".dup-pn-need-to-remove").first().hide();
        }
        // $(".dup-nt-need-to-remove").first().hide();
        $(".dup-pn-need-to-remove").css("margin-top","2px");
        $("body").on("click", ".notify-me-out-of-stock-btn", function(event){
        // $(".notify-me-out-of-stock-btn").click(function(event){
          event.preventDefault();
          event.stopPropagation();
          $(".notify-for-content").show();
          $(".notify-success-content").hide();
          $(".notify-pn-bk-stock-input-email").val("");
          $(".notify-recurring-box").prop('checked', false);
          var notify_stock_back_modal = document.getElementById("notify-stock-back-modal");
          if (notify_stock_back_modal.style.display === "none") {
            notify_stock_back_modal.style.display = "block";
          } else {
            notify_stock_back_modal.style.display = "none";
          }
        });
      }, 1500);
        $("body").on("click", ".notify-me-out-of-stock-btn", function(event){
        // $(".notify-me-out-of-stock-btn").click(function(event){
          event.preventDefault();
          event.stopPropagation();
          $(".notify-for-content").show();
          $(".notify-success-content").hide();
          $(".notify-pn-bk-stock-input-email").val("");
          $(".notify-recurring-box").prop('checked', false);
          var notify_stock_back_modal = document.getElementById("notify-stock-back-modal");
          if (notify_stock_back_modal.style.display === "none") {
            notify_stock_back_modal.style.display = "block";
          } else {
            notify_stock_back_modal.style.display = "none";
          }
        });
    }
    else {
      if(shop.notify_alert_button_selector !== undefined && shop.notify_alert_button_selector !== '' && shop.notify_alert_button_selector.length > 0){
        if(Shopify.shop === "the-sawmill-shop.myshopify.com"){
          $(shop.notify_alert_button_selector).after("<button style='margin-top:107px !important;background-color: "+shop.notify_bg_color+";border-color: "+shop.notify_border_color+"' class='button--full-width button button--secondary notify-me-out-of-stock-btn "+classes +"'>" + shop.main_notify_btn + "</button>");
        }
        else{
          $(shop.notify_alert_button_selector).after("<button style='margin-top:10px;background-color: "+shop.notify_bg_color+";border-color: "+shop.notify_border_color+"' class='notify-me-out-of-stock-btn "+classes +"'>" + shop.main_notify_btn + "</button>");
        }
      }
      else {
        if(Shopify.shop === "the-sawmill-shop.myshopify.com"){
          $(this.preorderButton.buttonSelector).after("<button style='margin-top:107px !important;background-color: "+shop.notify_bg_color+";border-color: "+shop.notify_border_color+"' class='button--full-width button button--secondary notify-me-out-of-stock-btn "+classes +"'>" + shop.main_notify_btn + "</button>");
        }
        else{
          $(this.preorderButton.buttonSelector).after("<button style='margin-top:10px;background-color: "+shop.notify_bg_color+";border-color: "+shop.notify_border_color+"' class='notify-me-out-of-stock-btn "+classes +"'>" + shop.main_notify_btn + "</button>");
        }
      }
    }
    var clonned_btn = $(".notify-me-out-of-stock-btn");
    clonned_btn.attr("disabled", false);
    clonned_btn.addClass("notify-me");
    clonned_btn.attr("aria-disabled", false);
    clonned_btn.off('click');
    clonned_btn.off('submit');
    clonned_btn.removeAttr('aria-disabled');
    clonned_btn.removeAttr('type');
    $.each(clonned_btn.data(), function (i) {
      clonned_btn.removeAttr("aria-" + i);
      clonned_btn.removeAttr("aria-disabled" + i);
    });
  }

  PreorderProduct.prototype.addSellingPlanToCart = function(){
    var self = this;
    var activeVariant = this.activeVariant;
    var activeVariantID = activeVariant.settings_type_id;
    if($('#selling-plan-variant-id-' + activeVariantID).length > 0){
      const sellingPlanId = $('.subscribe-to-plan-btn-'+activeVariantID).prev().closest("fieldset").find('select').val();
      const variantId = $('.subscribe-to-plan-btn-'+activeVariantID).prev().closest("fieldset").find('select').attr('data-variant-id')
      self.appendSellingPlanPropertiesToForm(sellingPlanId);
      $('body').on('change', '#variant-'+ activeVariantID, function(){
        self.appendSellingPlanPropertiesToForm($(this).val());
      });
    }
  }

  PreorderProduct.prototype.appendSellingPlanPropertiesToForm = function(sellingPlanId){
    if ($(this.formSelectors.form_selector).find('.selling-plan-input').length === 0) {
      $(this.formSelectors.form_selector).append(
       '<input type="hidden" class="selling-plan-input" name="selling_plan" value="' +
          sellingPlanId +
          '" />'
      );
    } else {
      $(this.formSelectors.form_selector).find('.selling-plan-input').val(sellingPlanId);
    }
  }

  PreorderProduct.prototype.notifyMeButtonClickHandler = function () {
    $(".notify-me-out-of-stock-btn").click(function(event){
      event.preventDefault();
      $(".notify-for-content").show();
      $(".notify-success-content").hide();
      $(".notify-pn-bk-stock-input-email").val("");
      $(".notify-recurring-box").prop('checked', false);
      var notify_stock_back_modal = document.getElementById("notify-stock-back-modal");
      if (notify_stock_back_modal.style.display === "none") {
        notify_stock_back_modal.style.display = "block";
      } else {
        notify_stock_back_modal.style.display = "none";
      }
    });
  }

  PreorderProduct.prototype.subscribeToEmailNotifications = function () {
    // seperate function
    var storeActiveVariant = this.activeVariant.settings_type_id;
    $(".notify-btn-submit").unbind("click");
    $(".notify-btn-submit").click(function(){
      var $notifyEmailField = document.getElementsByClassName('notify-pn-bk-stock-input-email');
      var $notifyEmailError = document.getElementsByClassName('empty-email-error');
      if($notifyEmailField.length > 0 && $notifyEmailField[0].value.length === 0){
        $notifyEmailError[0].style.display = "block"
      }
      else if($notifyEmailField.length > 0 && $notifyEmailField[0].value.length > 0 && helper.validateEmailRegex($notifyEmailField[0].value) === null){
        $notifyEmailError[0].style.display = "block";
        $notifyEmailError[0].textContent = "Please enter valid email";
      }
      else if($notifyEmailField.length > 0 && helper.validateEmailRegex($notifyEmailField[0].value) !== null){
        $notifyEmailError[0].style.display = "none";
        // seperate function
        $.ajax({
          url: helper.getServerAddress() + '/widget/notify_email',
          method: 'get',
          data: {email: $(".notify-pn-bk-stock-input-email").val(), variant_id: storeActiveVariant, shopify_domain: helper.getShopifyDomain(), is_recurring: $(".notify-recurring-box").is(':checked')},
          success: function (data){
            if(data.msg === true){
              $(".notify-for-content").hide();
              $(".notify-success-content").show();
              $(".success-msg-text").text(shop.notify_popup_already_subscribed_msg)
            }
            else {
              $(".notify-for-content").hide();
              $(".notify-success-content").show();
              $(".success-msg-text").text(shop.notify_popup_success_msg);
            }
          }
        });
      }
      else {
       $notifyEmailError[0].style.display = "none";
      }
    });
  }

  PreorderProduct.prototype.productVariantAvailable = function () {
    var availableCriteriaOne =
      $(this.formSelectors.form_selector)
        .find(PREORDER_BUTTON_SELECTOR)
        .attr('aria-label') !== 'Unavailable'
    var availableCriteriaTwo =
      $(this.formSelectors.form_selector)
        .parents('#ProductSection-product-template')
        .find('.visually-hidden[data-product-status]')
        .text() !== 'Unavailable'
    var availableCriteriaThree = !$(this.formSelectors.form_selector)
      .find(PREORDER_BUTTON_SELECTOR)
      .hasClass('btn--disabled')

    return (
      availableCriteriaOne && availableCriteriaTwo && availableCriteriaThree
    )
  }

  PreorderProduct.prototype.variantChangeHandler = function () {
    var self = this

    helper.sleep(250).then(function () {
      setTimeout(function () {
        if(self.activeVariant === false){
          $(".dn-selling-plan-container").css("display", "none");
        }
      }, 500)
      //Check if the newly selected variant is available - if it's unavailable, disable the button and show unavailable and remove all our app's widgets
      $(document).off('click', '.pn-button-' + self.uuid)
      if (self.productVariantAvailable()) {
        setTimeout(function () {
          if(self.activeVariant !==  false){
            $(".dn-selling-plan-container").css("display", "none");
            $("#selling-plan-variant-id-"+self.activeVariant.settings_type_id).css("display", "block");
            var sellingPlanId = $('.subscribe-to-plan-btn-'+self.activeVariant.settings_type_id).prev().closest("fieldset").find('select').val();
            self.sellingPlanChangeHandler(sellingPlanId);
            $('body').on('change', '#variant-'+ self.activeVariant.settings_type_id, function(){
              self.sellingPlanChangeHandler($(this).val());
            });
          }
        }, 500)
        if (!$(self.formSelectors.button_selector).is(':visible')) {
          self.formSelectors.button_selector = $(
            self.formSelectors.form_selector
          ).find(helper.stripFormSelector(shop.button_selector))
        }
        self.restoreDefaults()
        buttonClicked = false
        setTimeout(function () {
          if (!self.createWidget()) {
            $(document).off('click', '.pn-button-' + self.uuid)
          }
        }, 500)
      } else {
        self.preorderButton.showUnavailableButton()
        self.preorderCartLabel.removePreorderLineItemProperty()
        self.preorderDescription.removePreorderDescription()
        self.partialPreorderNote.removePartialPreorderNote()
        $(self.formSelectors.form_selector)
          .parents('#ProductSection-product-template')
          .find('.preorder-badge')
          .remove()
      }
    })
  }

  PreorderProduct.prototype.sellingPlanChangeHandler = function(sellingPlanId){
    if ($(this.formSelectors.form_selector).find('.selling-plan-input').length === 0) {
      if(shop.shopify_purchase_option_enabled === true){
        $(this.formSelectors.form_selector).append(
         '<input type="hidden" class="selling-plan-input" name="selling_plan" value="' +
            sellingPlanId +
            '" />'
        );
      }
    } else {
      $(this.formSelectors.form_selector).find('.selling-plan-input').val(sellingPlanId);
    }
  }

  PreorderProduct.prototype.restoreDefaults = function () {
    this.activeVariant = this.getActiveVariantSetting()
    $(this.formSelectors.form_selector).removeClass(PN_ACTIVE_CLASS)
    if (shop.hide_buy_now_button) {
      if (helper.getShopifyDomain() === 'bettababy.myshopify.com') {
        $('.shopify-payment-button div').show()
      } else {
        $(this.formSelectors.form_selector).find(BUY_NOW_BUTTON_SELECTOR).show()
      }
    }
    this.partialPreorderNote.removePartialPreorderNote()
    this.preorderCartLabel.removePreorderLineItemProperty()
    this.preorderButton.removePreorderFromButton(this)
    this.preorderDescription.removePreorderDescription()
    this.stockCounter.removeStockCounter()
    this.preorderBadge.removePreorderBadge(this.activeVariant.product_id)
  }

  PreorderProduct.prototype.getActiveVariantSetting = function () {
    var currentVariantSetting = false
    var currentVariantId = this.getCurrentVariantId()
    if (helper.stringChecker(currentVariantId)) {
      $.each(this.settings, function (index, setting) {
        if (
          setting &&
          setting.settings_type_id.toString() === currentVariantId.toString()
        ) {
          currentVariantSetting = setting
        }
      })
    } else if (Object.keys(this.settings).length === 1) {
      var key = Object.keys(this.settings)[0]
      currentVariantSetting = this.settings[key]
    }
    return currentVariantSetting
  }

  PreorderProduct.prototype.getCurrentVariantId = function () {
    var currentVariant = null

    if (helper.onProductPage() || !helper.onCollectionPage()) {
      currentVariant = location.search.match(/variant=([0-9]+)/)
    }

    //If the URL contains a variant ID, return that
    if (currentVariant != null) {
      return currentVariant[1]
      //Otherwise return the first variant's ID
    } else {
      if (helper.getShopifyDomain() === 'babaubarcelona.myshopify.com') {
        var selectFields = $(this.formSelectors.form_selector).find(
          "select[name='id']:first option"
        )
        var variantId = ''
        $.each(selectFields, function (index, element) {
          if ($(element).attr('selected') === 'selected') {
            variantId = $(element).val()
          }
        })
        return variantId
      } else if (
        $(this.formSelectors.form_selector)
          .find(
            "select[name='id'], input[name='id'], select[name='id[]'], input[name='id[]']"
          )
          .attr('type') === 'radio'
      ) {
        currentVariant = $(this.formSelectors.form_selector)
          .find("input[name='id']:checked, input[name='id[]']:checked")
          .val()

        if (
          helper.getShopifyDomain() === 'xn-2kbh0bucy6aq9bxf5c.myshopify.com' &&
          typeof currentVariant == 'undefined'
        ) {
          return $('form[action="/cart/add"]').find('select[name="id"]').val()
        }

        return currentVariant
      } else {
        currentVariant = $(this.formSelectors.form_selector)
          .find(
            "select[name='id'], input[name='id'], select[name='id[]'], input[name='id[]']"
          )
          .val()

        if (
          helper.getShopifyDomain() === 'xn-2kbh0bucy6aq9bxf5c.myshopify.com' &&
          typeof currentVariant == 'undefined'
        ) {
          return $('form[action="/cart/add"]').find('select[name="id"]').val()
        }

        return currentVariant
      }
    }
  }

  PreorderProduct.prototype.getSingleActivePreorderSetting = function (
    settings
  ) {
    var activePreorderSetting = false
    $.each(settings, function (index, setting) {
      if (helper.checkStockShowBadge(setting)) {
        if (!activePreorderSetting) {
          activePreorderSetting = setting
        } else {
          if (setting.tag == null || setting.tag === '') {
            activePreorderSetting = setting
          } else if (activePreorderSetting.tag === 'all') {
            activePreorderSetting = setting
          }
        }
      }
    })
    return activePreorderSetting
  }

  PreorderProduct.prototype.preorderEnabledForAllVariants = function (
    settings
  ) {
    var enabledForAllVariants = true
    $.each(settings, function (index, setting) {
      if (!helper.checkStockShowBadge(setting)) {
        enabledForAllVariants = false
      }
    })
    return enabledForAllVariants
  }

  PreorderProduct.prototype.preorderEnabledForSomeVariants = function (
    settings
  ) {
    var enabledForSomeVariants = false
    $.each(settings, function (index, setting) {
      if (helper.checkStockShowBadge(setting)) {
        enabledForSomeVariants = true
      }
    })
    return enabledForSomeVariants
  }

  PreorderProduct.prototype.getProductContainerFromHandle = function (handle) {
    var productContainer = []

    if (helper.getShopifyDomain() === 'minasan-us-outlet.myshopify.com') {
      productContainer = $(
        "a[href$='products/" + handle + "'].grid-view-item__image-container"
      )
    } else if (
      helper.getShopifyDomain() === 'ecococonut-store.myshopify.com' ||
      helper.getShopifyDomain() === 'tutu-shop.myshopify.com' ||
      helper.getShopifyDomain() === 'prime-party.myshopify.com' ||
      helper.getShopifyDomain() === 'snakehive-store.myshopify.com' ||
      helper.getShopifyDomain() === 'entry-surf.myshopify.com' ||
      helper.getShopifyDomain() === 'hearnshobbies.myshopify.com' ||
      helper.getShopifyDomain() === 'okoliving.myshopify.com' ||
      helper.getShopifyDomain() === 'addaday-com.myshopify.com'
    ) {
      productContainer = $("a[href*='products/" + handle + "']").has('img')
    } else if (
      helper.getShopifyDomain() === 'js-collectables-games.myshopify.com'
    ) {
      productContainer = $("a[href$='products/" + handle + "']")
        .has('img')
        .closest('div, li, article, figure')
        .last()
    } else if (helper.getShopifyDomain() === 'picollet-global.myshopify.com') {
      productContainer = $("a[href$='products/" + handle + "']").has('img')
    } else if (window.pn.datastore.theme_setting.theme_name === 'Dawn') {
      productContainer = $("a[href$='products/" + handle + "']")
        .closest('div.card-wrapper')
        .has('img')
    } else {
      var handleSelector =
        shop.product_container_handle_element_selector.replace(
          /{{handle}}/g,
          handle
        )
      productContainer = $(handleSelector)

      if (
        helper.stringChecker(shop.product_container_handle_element_selector_has)
      ) {
        productContainer = $(productContainer).has(
          shop.product_container_handle_element_selector_has
        )
      }

      if (
        helper.stringChecker(
          shop.product_container_handle_element_selector_closest
        )
      ) {
        productContainer = $(productContainer).closest(
          shop.product_container_handle_element_selector_closest
        )
      }

      if ($(productContainer).length === 0) {
        if (
          helper.stringChecker(
            shop.product_container_handle_element_selector_has
          )
        ) {
          productContainer = $(handleSelector)
            .parent(shop.product_container_handle_element_selector_closest)
            .has(shop.product_container_handle_element_selector_has)
        }
      }
    }
    return productContainer
  }

  PreorderProduct.prototype.setQuantityField = function (
    quantityAvailable,
    preorderProduct
  ) {
    if (
      $(preorderProduct.formSelectors.form_selector).find(
        'input[name=quantity]:visible'
      )
    ) {
      $(preorderProduct.formSelectors.form_selector)
        .find('input[name=quantity]:visible')
        .val(quantityAvailable)
    }
  }

  PreorderProduct.prototype.getQuantityDesired = function (preorderProduct) {
    var quantityDesired = 1
    if (
      $(preorderProduct.formSelectors.form_selector).find(
        'input[name=quantity]:visible'
      ).length > 0
    ) {
      quantityDesired = $(preorderProduct.formSelectors.form_selector)
        .find('input[name=quantity]:visible')
        .val()
    } else if (
      $('input[name=quantity]:visible').length > 0
    ) {
      quantityDesired = $('input[name=quantity]:visible').first().val()
    }
    return quantityDesired
  }

  PreorderProduct.prototype.hasSufficientQuantity = function (quantityDesired) {
    var inventoryMgmtMethod1InventoryCheckFailed =
      this.usingInventoryMgmtMethod1() &&
      this.activeVariant.shopify_inventory < quantityDesired
    var inventoryMgmtMethod2PreorderLimitInventoryCheckFailed =
      this.usingInventoryMgmtMethod2PreorderStock() &&
      this.activeVariant.shopify_preorder_limit < quantityDesired
    var preorderStockCheckFailed =
      this.usingPreorderStock() &&
      this.activeVariant.preorder_stock < quantityDesired

    return (
      !shop.limit_order_quantity ||
      !(
        inventoryMgmtMethod1InventoryCheckFailed ||
        inventoryMgmtMethod2PreorderLimitInventoryCheckFailed ||
        preorderStockCheckFailed
      )
    )
  }

  PreorderProduct.prototype.logClick = function (event) {
    var quantityDesired = this.getCartInclusiveQuantityDesired()
    if (this.hasSufficientQuantity(quantityDesired)) {
      this.logClickInGoogleAnalytics()
      /* DELETE this code if commenting out this code hasn't caused any problems
            if (!buttonClicked && !$(event.target).is(this.formSelectors.button_selector)) {
                buttonClicked = true;
                $(this.formSelectors.button_selector).trigger("click");
            }
            */
    } else {
      this.showInsufficientStockAlert(event)
    }
  }

  PreorderProduct.prototype.getCartInclusiveQuantityDesired = function () {
    var quantityDesired = this.getQuantityDesired(this)
    var cartItem = stockChecker.getCartItemWithVariantId(
      this.activeVariant.settings_type_id
    )
    if (cartItem !== undefined) {
      quantityDesired = parseInt(quantityDesired) + cartItem.quantity
    }
    return quantityDesired
  }

  PreorderProduct.prototype.showInsufficientStockAlert = function (event) {
    var stockInsufficientMessage = shop.stock_insufficient_message
    var inventory = this.calculateAvailableInventory()

    this.setQuantityField(helper.noNegative(inventory), this)
    stockInsufficientMessage = stockInsufficientMessage.replace(
      '{{qty}}',
      helper.noNegative(inventory)
    )

    alert(stockInsufficientMessage)
    event.preventDefault()
    return false
  }

  PreorderProduct.prototype.calculateAvailableInventory = function () {
    var cartItem = stockChecker.getCartItemWithVariantId(
      this.activeVariant.settings_type_id
    )
    var availableQuantity = 0

    var cartItemQuantity = 0
    if (helper.objectChecker(cartItem)) {
      cartItemQuantity = cartItem.quantity
    }

    if (this.usingInventoryMgmtMethod1()) {
      availableQuantity =
        this.activeVariant.shopify_inventory - cartItemQuantity
    } else if (this.usingInventoryMgmtMethod2PreorderStock()) {
      availableQuantity =
        this.activeVariant.shopify_preorder_limit - cartItemQuantity
    } else if (this.usingPreorderStock()) {
      availableQuantity = this.activeVariant.preorder_stock - cartItemQuantity
    }

    return availableQuantity
  }

  PreorderProduct.prototype.logClickInGoogleAnalytics = function () {
    window.ga &&
      ga.loaded &&
      ga(
        'send',
        'event',
        'Preorder Now',
        'Preorder Now: Preorder button clicked',
        this.activeVariant.handle
      )
  }

  function PreorderButton(args) {
    this.buttonSelector = args['buttonSelector']
    this.outOfStockText = shop.out_of_stock_text
  }

  PreorderButton.prototype.showUnavailableButton = function () {
    var $textContent = $(this.buttonSelector).find('.add-to-cart-text__content')
    if ($textContent.length > 0) {
      $textContent.text('Unavailable')
    } else if ($(this.buttonSelector).find('span').length > 0) {
      $(this.buttonSelector).find('span').text('Unavailable')
    } else {
      $(this.buttonSelector).text('Unavailable')
    }
    $(this.buttonSelector).val('Unavailable')
    $(this.buttonSelector).off('click', this.buttonSelector)
    $(this.buttonSelector).removeClass(PREORDER_BUTTON_CLASS)
  }

  PreorderButton.prototype.showOutOfPreorderStockButton = function (variant) {
    $(this.buttonSelector).addClass(PREORDER_BUTTON_CLASS)
    $(this.buttonSelector).val(variant.out_of_stock_message)
    var $textContent = $(this.buttonSelector).find('.add-to-cart-text__content')
    if ($textContent.length > 0) {
      $textContent.text(variant.out_of_stock_message)
    } else if ($(this.buttonSelector).find('span').length > 0) {
      $(this.buttonSelector).find('span').text(variant.out_of_stock_message)
    } else {
      $(this.buttonSelector).text(variant.out_of_stock_message)
    }
    $(this.buttonSelector).prop('disabled', true)
  }

  PreorderButton.prototype.showPreorderButton = function (variant) {
    if (
      shop.enable_collection_page_button &&
      helper.getShopifyDomain() === 'dndportal.myshopify.com'
    ) {
      $(this.buttonSelector).addClass(PREORDER_BUTTON_CLASS)
      $(this.buttonSelector).prop('disabled', false)
      $(this.buttonSelector).text(variant.preorder_button_text)
      $(this.buttonSelector).val(variant.preorder_button_text)
    }

    if (helper.getShopifyDomain() !== 'dndportal.myshopify.com') {
      $(this.buttonSelector).addClass(PREORDER_BUTTON_CLASS)
      $(this.buttonSelector).prop('disabled', false)
      $(this.buttonSelector).val(variant.preorder_button_text)

      if (
        Shopify.theme.name === 'Dawn' || Shopify.theme.name === 'Sense' ||
        Shopify.theme.name === 'Horizon' ||
        window.pn.datastore.theme_setting.theme_name === 'Dawn' ||
        window.pn.datastore.theme_setting.theme_name === 'Horizon'
      ) {
        var $textContent = $(this.buttonSelector).find('.add-to-cart-text__content')
        if ($textContent.length > 0) {
          $textContent.text(variant.preorder_button_text)
        } else if ($(this.buttonSelector).find('span').length > 0) {
          $(this.buttonSelector).find('span').text(variant.preorder_button_text)
        } else {
          $(this.buttonSelector).text(variant.preorder_button_text)
        }
      } else {
        $(this.buttonSelector).text(variant.preorder_button_text)
      }
    }

    if (shop.enable_collection_page_button) {
      // TODO:
      // Add option that support can modify the selector
      // for the collection button.
      if (helper.getShopifyDomain() === 'baby-online-direct.myshopify.com') {
        var collectionBtn = $(
          "button[data-variant-id='" + variant.settings_type_id + "']"
        )
      } else {
        var collectionBtn = $(
          "button[data-product-variant-id='" + variant.settings_type_id + "']"
        )
      }

      if (collectionBtn.length > 0) {
        $(collectionBtn).text(variant.preorder_button_text)
      }
    }
  }

  PreorderButton.prototype.showOutOfStockButton = function () {
    $(this.buttonSelector).val(this.outOfStockText)
    var $textContent = $(this.buttonSelector).find('.add-to-cart-text__content')
    if ($textContent.length > 0) {
      $textContent.text(this.outOfStockText)
    } else if ($(this.buttonSelector).find('span').length > 0) {
      $(this.buttonSelector).find('span').text(this.outOfStockText)
    } else {
      $(this.buttonSelector).text(this.outOfStockText)
    }
    $(this.buttonSelector).prop('disabled', true)
    $(this.buttonSelector).removeClass(PREORDER_BUTTON_CLASS)
  }

  PreorderButton.prototype.showAddToCartButton = function () {
    if (
      Shopify.theme.name === 'Dawn' ||
      Shopify.theme.name === 'Horizon' ||
      window.pn.datastore.theme_setting.theme_name === 'Dawn' ||
      window.pn.datastore.theme_setting.theme_name === 'Horizon'
    ) {
      var $textContent = $(this.buttonSelector).find('.add-to-cart-text__content')
      if ($textContent.length > 0) {
        $textContent.text(shop.add_to_cart_text)
      } else if ($(this.buttonSelector).find('span').length > 0) {
        $(this.buttonSelector).find('span').text(shop.add_to_cart_text)
      } else {
        $(this.buttonSelector).text(shop.add_to_cart_text)
      }
    } else {
      $(this.buttonSelector).text(shop.add_to_cart_text)
    }

    $(this.buttonSelector).val(shop.add_to_cart_text)
    $(this.buttonSelector).prop('disabled', false)
    $(this.buttonSelector).removeClass(PREORDER_BUTTON_CLASS)
  }

  PreorderButton.prototype.removePreorderFromButton = function (
    preorderProduct
  ) {
    if (helper.objectChecker(preorderProduct.activeVariant)) {
      if (preorderProduct.outOfStockInShopify()) {
        this.showOutOfStockButton()
      } else {
        this.showAddToCartButton()
      }
    }
    if (
      typeof $(this.buttonSelector).tooltip === 'function' &&
      $(this.buttonSelector).is('ui-tooltip')
    ) {
      $(this.buttonSelector).tooltip('disable')
    }
  }

  function PreorderSettingsCache() {}

  PreorderSettingsCache.prototype.initPreorderSettingCache = function () {
    if (typeof window.pn === 'undefined') {
      window.pn = {}
    }
    if (typeof window.pn.cP === 'undefined') {
      window.pn.cP = {}
    }
    if (typeof window.pn.settings === 'undefined') {
      window.pn.settings = {}
      window.pn.settings.defaultSetting = {}
      window.pn.settings.singleProductSettings = {}
      window.pn.settings.tagSettings = {}
    }
    if (typeof window.pn.shop === 'undefined') {
      window.pn.shop = {}
    }
    if (typeof window.pn.quickviewSettings === 'undefined') {
      window.pn.quickviewSettings = {}
    }
    if (typeof window.pn.collectionPageSettings === 'undefined') {
      window.pn.collectionPageSettings = {}
    }
    if (typeof window.pn.cache === 'undefined') {
      window.pn.cache = {}
      this.createSettings()
    }
  }

  PreorderSettingsCache.prototype.createSettings = function () {
    var self = this
    if (Object.keys(window.pn.cP).length > 0 && self.hasSettingsInLiquid()) {
      //For each product in cP
      $.each(window.pn.cP, function (index, product) {
        //Create product settings object
        var productSettings = {}
        var tags = product.t

        //For each variant in product
        $.each(product.v, function (index, variant) {
          var variantSetting = false

          //Get single product setting
          variantSetting = self.getSingleProductSettingForVariant(
            product,
            variant
          )

          //If no single product setting, get tag setting
          if (!variantSetting) {
            variantSetting = self.getTagSettingForVariant(
              product,
              tags,
              variant
            )

            //If no tag setting, get all product setting
            if (!variantSetting) {
              variantSetting = self.getAllProductsSettingForVariant(
                product,
                variant
              )
            }
          }

          //If setting was created for this variant, add to product setting object
          if (variantSetting) {
            variantSetting.preorder_status =
              helper.checkStockShowBadge(variantSetting)
            productSettings[variant.id] = variantSetting
          } else {
            productSettings[variant.id] = self.createNonPreorderSetting(
              product,
              variant
            )
          }
        })

        //Add product setting object to cache
        if (Object.keys(productSettings).length > 0) {
          window.pn.cache[product.id] = new PreorderProduct({
            handle: product.h,
            tags: product.t,
            settings: productSettings,
          })
        }
      })
    }
  }

  PreorderSettingsCache.prototype.createNonPreorderSetting = function (
    product,
    variant
  ) {
    var setting = {}
    setting = this.createVariantSetting(product, variant, setting)
    setting.settings_type_id = variant.id
    setting.preorder_status = false
    return setting
  }

  PreorderSettingsCache.prototype.hasSettingsInLiquid = function () {
    return (
      (Object.keys(window.pn.settings.defaultSetting).length > 1 &&
        shop.apply_default_to_all) ||
      window.pn.settings.singleProductSettings.length > 0 ||
      window.pn.settings.tagSettings.length > 0
    )
  }

  PreorderSettingsCache.prototype.getSingleProductSettingForVariant = function (
    product,
    variant
  ) {
    var variantSetting = false
    var self = this
    $.each(window.pn.settings.singleProductSettings, function (index, setting) {
      setting = self.decodeSetting(setting)
      if (setting.settings_type_id === variant.id.toString()) {
        variantSetting = self.createVariantSetting(product, variant, setting)
      }
    })
    return variantSetting
  }

  PreorderSettingsCache.prototype.getTagSettingForVariant = function (
    product,
    tags,
    variant
  ) {
    var variantSetting = false
    var self = this
    $.each(window.pn.settings.tagSettings, function (index, setting) {
      setting = self.decodeSetting(setting)
      $.each(tags, function (index, tag) {
        if (
          typeof tag !== 'undefined' &&
          typeof setting.tag !== 'undefined' &&
          tag.toUpperCase() === setting.tag.toUpperCase()
        ) {
          variantSetting = self.createVariantSetting(product, variant, setting)
        }
      })
    })
    return variantSetting
  }

  PreorderSettingsCache.prototype.getAllProductsSettingForVariant = function (
    product,
    variant
  ) {
    var variantSetting = false
    if (
      Object.keys(window.pn.settings.defaultSetting).length > 0 &&
      typeof shop.apply_default_to_all !== 'undefined' &&
      shop.apply_default_to_all
    ) {
      variantSetting = this.createVariantSetting(
        product,
        variant,
        this.decodeSetting(window.pn.settings.defaultSetting)
      )
    }
    return variantSetting
  }

  PreorderSettingsCache.prototype.decodeSetting = function (oldSetting) {
    var newSetting = {}
    newSetting.preorder_button_text = oldSetting.a
    newSetting.settings_enabled = oldSetting.b
    newSetting.preorder_stock = oldSetting.c
    newSetting.out_of_stock_message = oldSetting.d
    newSetting.show_stock_remaining = oldSetting.e
    newSetting.stock_remaining_message = oldSetting.f
    newSetting.preorder_description = oldSetting.g
    newSetting.preorder_description_position = oldSetting.h
    newSetting.badge_enabled = oldSetting.i
    newSetting.badge_text = oldSetting.j
    newSetting.preorder_start_date = oldSetting.k
    newSetting.preorder_end_date = oldSetting.l
    newSetting.settings_type = oldSetting.m
    newSetting.settings_type_id = oldSetting.n
    newSetting.use_default = oldSetting.o
    newSetting.product_id = oldSetting.p
    newSetting.use_stock_management = oldSetting.q
    newSetting.use_shopify_stock_management = oldSetting.r
    newSetting.shopify_inventory = oldSetting.s
    newSetting.shopify_preorder_limit = oldSetting.t
    newSetting.shopify_stock_mgmt_method = oldSetting.u
    newSetting.oversell_enabled = oldSetting.v
    newSetting.badge_shape = oldSetting.w
    newSetting.cart_label_text = oldSetting.x
    newSetting.product_image_src = oldSetting.y
    newSetting.discount_type = oldSetting.z
    newSetting.discount_percentage = oldSetting.aa
    newSetting.discount_fixed_amount = oldSetting.ab
    newSetting.partial_payment_discount_type = oldSetting.partial_payment_z
    newSetting.partial_payment_discount_percentage = oldSetting.partial_payment_aa
    newSetting.partial_payment_discount_fixed_amount = oldSetting.partial_payment_ab

    newSetting.tag = oldSetting.tag
    newSetting.handle = oldSetting.handle
    return newSetting
  }

  PreorderSettingsCache.prototype.createVariantSetting = function (
    product,
    variant,
    setting
  ) {
    var variantSetting = JSON.parse(JSON.stringify(setting))

    variantSetting.handle = product.h
    variantSetting.product_id = product.id

    if (typeof product.i !== 'undefined') {
      if (typeof product.i === 'string') {
        variantSetting.product_image_src = product.i
      }
    }

    variantSetting.settings_type_id = variant.id
    variantSetting.inventory_management = variant.m
    variantSetting.shopify_inventory = variant.q
    variantSetting.oversell_enabled = variant.p === 'continue'
    variantSetting.price = variant.r
    variantSetting.compareAtPrice = variant.s || ''

    return variantSetting
  }

  PreorderSettingsCache.prototype.checkIfSettingsExistForProduct = function (
    theProduct
  ) {
    if (
      !this.preorderSettingsForProductInCache(theProduct.product.id) ||
      helper.getShopifyDomain() === 'the-tinkers-packs.myshopify.com' ||
      helper.getShopifyDomain() === 'stitchy-fish.myshopify.com' ||
      helper.getShopifyDomain() === 'squizzasuk.myshopify.com' ||
      helper.getShopifyDomain() === 'stage-four-motorsports.myshopify.com' ||
      helper.getShopifyDomain() === 'gametradersseaford-com-au.myshopify.com' ||
      helper.getShopifyDomain() === 'bronte-company.myshopify.com' ||
      helper.getShopifyDomain() === 'ninja-shark.myshopify.com' ||
      helper.getShopifyDomain() === 'xn-y8j7b5c7b.myshopify.com' ||
      helper.getShopifyDomain() === 'olea-herbals.myshopify.com'
    ) {
      this.populateCache("product", [], [theProduct.product.id], [], function () {})
    } else {
      if (window.pn.quickviewClicked) {
        var preorderProduct = this.retrievePreorderSettingsForProductFromCache(
          theProduct.product.id
        )
        preorderProduct.configFormSelectors()
        preorderProduct.updateFormSelectorsInObjects()
        preorderProduct.initPreorderForm()
      }
    }
  }

  PreorderSettingsCache.prototype.preorderSettingsForProductInCache = function (
    productId
  ) {
    return productId in window.pn.cache
  }

  PreorderSettingsCache.prototype.retrievePreorderSettingsForProductFromCache =
    function (productId) {
      return window.pn.cache[productId]
    }

  PreorderSettingsCache.prototype.populateCache = function (
    pageType = "product",
    handles,
    productIds,
    variantIds,
    callback
  ) {
    var settings = []
    var self = this

    var uncachedHandles = self.filterHandles(handles)
    var uncachedProductIds = self.filterProductIds(productIds)
    var uncachedVariantIds = self.filterVariantIds(variantIds)
    var url = window.location.href

    if (
      uncachedHandles.length === 0 &&
      uncachedProductIds.length === 0 &&
      uncachedVariantIds.length === 0
    ) {
      callback()
    } else {
      
      let metaVariants = []
      if(shop?.apply_default_to_all) {
        if(pageType == "collection") {
          metaVariants = window?.meta?.products?.flatMap(product => product.variants);
        }
        if(pageType == "product") {
          metaVariants = window?.meta?.product?.variants
        }
      }
      
      $.post(
        helper.getServerAddress() + '/widget/settings',
        {
          shopify_domain: helper.getShopifyDomain(),
          product_handles: uncachedHandles,
          product_ids: uncachedProductIds,
          variant_ids: uncachedVariantIds,
          url: url,
          meta_variant_ids: metaVariants.map(variant => variant.id)
        },
        function (data) {
          settings = data
        }
      ).done(function () {
        self.addSettingsFromServerToCache(settings)
        callback()
      })
    }
  }

  PreorderSettingsCache.prototype.addSettingsFromServerToCache = function (
    settings
  ) {
    this.addPreorderProductsToCache(this.groupSettingsIntoProducts(settings))
  }

  PreorderSettingsCache.prototype.groupSettingsIntoProducts = function (
    settings
  ) {
    var preorderProducts = {}
    $.each(settings, function (index, setting) {
      setting.preorder_status = helper.checkStockShowBadge(setting)
      if (!(setting.product_id in preorderProducts)) {
        preorderProducts[setting.product_id] = {}
        preorderProducts[setting.product_id].handle = setting.handle
        preorderProducts[setting.product_id].product_id = setting.product_id
        preorderProducts[setting.product_id].tag = setting.tag
        preorderProducts[setting.product_id].settings = {}
        preorderProducts[setting.product_id].settings[
          setting.settings_type_id
        ] = setting
      } else {
        //Product has no setting for this variant ID
        if (
          !(
            setting.settings_type_id in
            preorderProducts[setting.product_id].settings
          )
        ) {
          preorderProducts[setting.product_id].settings[
            setting.settings_type_id
          ] = setting
        } else {
          //Setting is a single product setting which always takes priority
          if (setting.tag == null) {
            preorderProducts[setting.product_id].settings[
              setting.settings_type_id
            ] = setting
            //New setting is a tag setting and existing setting is not a single product setting
          } else if (
            setting.tag !== 'all' &&
            preorderProducts[setting.product_id].settings[
              setting.settings_type_id
            ].tag != null
          ) {
            preorderProducts[setting.product_id].settings[
              setting.settings_type_id
            ] = setting
          }
        }
      }
    })
    return preorderProducts
  }

  PreorderSettingsCache.prototype.addPreorderProductsToCache = function (
    preorderProducts
  ) {
    $.each(preorderProducts, function (index, preorderProduct) {
      window.pn.cache[preorderProduct.product_id] = new PreorderProduct({
        handle: preorderProduct.handle,
        tags: preorderProduct.tag,
        settings: preorderProduct.settings,
      })
    })
  }

  PreorderSettingsCache.prototype.filterHandles = function (handles) {
    var uncachedHandles = []
    var self = this
    if (
      helper.getShopifyDomain() === 'the-tinkers-packs.myshopify.com' ||
      helper.getShopifyDomain() === 'stitchy-fish.myshopify.com' ||
      helper.getShopifyDomain() === 'squizzasuk.myshopify.com' ||
      helper.getShopifyDomain() === 'stage-four-motorsports.myshopify.com' ||
      helper.getShopifyDomain() === 'gametradersseaford-com-au.myshopify.com' ||
      helper.getShopifyDomain() === 'bronte-company.myshopify.com' ||
      helper.getShopifyDomain() === 'ninja-shark.myshopify.com' ||
      helper.getShopifyDomain() === 'xn-y8j7b5c7b.myshopify.com' ||
      helper.getShopifyDomain() === 'olea-herbals.myshopify.com'
    ) {
      uncachedHandles = handles
    } else {
      $.each(handles, function (index, handle) {
        if (!self.handleInCache(handle)) {
          uncachedHandles.push(handle)
        }
      })
    }
    return uncachedHandles
  }

  PreorderSettingsCache.prototype.filterProductIds = function (ids) {
    var uncachedIds = []
    var self = this
    if (
      helper.getShopifyDomain() === 'the-tinkers-packs.myshopify.com' ||
      helper.getShopifyDomain() === 'stitchy-fish.myshopify.com' ||
      helper.getShopifyDomain() === 'squizzasuk.myshopify.com' ||
      helper.getShopifyDomain() === 'stage-four-motorsports.myshopify.com' ||
      helper.getShopifyDomain() === 'gametradersseaford-com-au.myshopify.com' ||
      helper.getShopifyDomain() === 'bronte-company.myshopify.com' ||
      helper.getShopifyDomain() === 'ninja-shark.myshopify.com' ||
      helper.getShopifyDomain() === 'xn-y8j7b5c7b.myshopify.com' ||
      helper.getShopifyDomain() === 'olea-herbals.myshopify.com'
    ) {
      uncachedIds = ids
    } else {
      $.each(ids, function (index, id) {
        if (!self.productIdInCache(id)) {
          uncachedIds.push(id)
        }
      })
    }
    return uncachedIds
  }

  PreorderSettingsCache.prototype.filterVariantIds = function (ids) {
    var uncachedIds = []
    var self = this
    $.each(ids, function (index, id) {
      if (!self.variantIdInCache(id)) {
        uncachedIds.push(id)
      }
    })
    return uncachedIds
  }

  PreorderSettingsCache.prototype.handleInCache = function (handle) {
    var handleInCache = false
    $.each(window.pn.cache, function (index, preorderProduct) {
      if (preorderProduct.handle === handle) {
        handleInCache = true
      }
    })
    return handleInCache
  }

  PreorderSettingsCache.prototype.productIdInCache = function (id) {
    var idInCache = false
    if (id in window.pn.cache) {
      idInCache = true
    }
    return idInCache
  }

  PreorderSettingsCache.prototype.variantIdInCache = function (id) {
    var idInCache = false
    $.each(window.pn.cache, function (index, preorderProduct) {
      if (id in preorderProduct.settings) {
        idInCache = true
      }
    })
    return idInCache
  }

  PreorderSettingsCache.prototype.refreshPreorderForms = function (
    preorderProducts
  ) {
    $.each(preorderProducts, function (index, preorderProduct) {
      preorderProduct.configFormSelectors()
      preorderProduct.updateFormSelectorsInObjects()
      preorderProduct.initPreorderForm()
    })
  }

  PreorderSettingsCache.prototype.getPreorderProductsForVariantIds = function (
    variantIds
  ) {
    var self = this
    var preorderProducts = []
    $.each(variantIds, function (index, variantId) {
      var preorderProduct = self.getPreorderProductForVariantId(variantId)
      if (preorderProduct) {
        preorderProducts.push(preorderProduct)
      }
    })
    return preorderProducts
  }

  PreorderSettingsCache.prototype.getPreorderProductForVariantId = function (
    variantId
  ) {
    var preorderProduct = false
    $.each(window.pn.cache, function (index, cacheProduct) {
      if (variantId in cacheProduct.settings) {
        preorderProduct = cacheProduct
      }
    })
    return preorderProduct
  }

  function URLChangeListener() {}

  URLChangeListener.prototype.track = function (fn, _handler, before) {
    return function interceptor() {
      if (before) {
        _handler.apply(this, arguments)
        return fn.apply(this, arguments)
      } else {
        var result = fn.apply(this, arguments)
        _handler.apply(this, arguments)
        return result
      }
    }
  }

  URLChangeListener.prototype.setup = function (_handler) {
    history.pushState = this.track(history.pushState, _handler)
    history.replaceState = this.track(history.replaceState, _handler)
    window.addEventListener('popstate', _handler)
  }

  function MixedCartWarning() {}

  MixedCartWarning.prototype.getCartItems = function (_callback) {
    var cartItems = []
    $.ajax({
      cache: false,
      type: 'GET',
      url: 'https://' + window.location.hostname + '/cart.js',
      dataType: 'json',
      contentType: 'application/json; charset=utf-8',
      success: function (data) {
        cartItems = data['items']
        if (cartItems.length > 0) {
          _callback(cartItems)
        }
      },
    })
  }

  MixedCartWarning.prototype.initMixedCartWarning = function () {
    if (shop.mixed_cart_warning_enabled) {
      window.pn.ajaxCartSettings = {}
      window.pn.ajaxCartSettings.mutationIds = [
        'ajaxifyCart',
        'cart-loading',
        'AjaxifyCart',
        'layer-addcart-modal',
      ]
      window.pn.ajaxCartSettings.mutationClasses = [
        'drawer',
        'cart-drawer__item-list',
        'cart-item__qty',
        'mm-opened',
        'cart-sidebar',
        'opened',
        'cart-preview',
        'ajaxcart__inner',
        'cart--is-visible',
        'hs-open-cart',
        'template-product',
      ]
      this.initAjaxCartObserver()
      if (helper.onCartPage()) {
        this.checkCartItemsAndShowWarning()
      }
    }
  }

  MixedCartWarning.prototype.initAjaxCartObserver = function () {
    var trigger = false
    var self = this
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (!trigger && helper.checkMutations(mutation, 'ajaxCart')) {
          setTimeout(function () {
            self.checkCartItemsAndShowWarning()
          }, 250)
          trigger = true
        }
      })
      trigger = false
    })

    var observerConfig = {
      attributes: true,
      childList: true,
      characterData: true,
      subtree: true,
    }

    var targetNode = document.body
    observer.observe(targetNode, observerConfig)
  }

  MixedCartWarning.prototype.checkCartItemsAndShowWarning = function () {
    if (
      helper.getShopifyDomain() === 'profound-3.myshopify.com' &&
      helper.getShopifyDomain() === 'dragonflyapothecary.myshopify.com' &&
      !helper.onCartPage()
    ) {
      return false
    }

    var self = this
    self.getCartItems(function (cartItems) {
      var preorderItemFound = false
      var nonPreorderItemFound = false
      var preorderNoteFoundOnThisItem = false

      $.each(cartItems, function (index, item) {
        if (
          item.properties != null &&
          Object.keys(item.properties).length > 0
        ) {
          $.each(
            Object.keys(item.properties),
            function (keyIndex, itemProperty) {
              if (
                Object.keys(item.properties)[keyIndex] === shop.pn_note_label
              ) {
                preorderItemFound = true
                preorderNoteFoundOnThisItem = true
              }
            }
          )
        }
        if (!preorderNoteFoundOnThisItem) {
          nonPreorderItemFound = true
        }
        preorderNoteFoundOnThisItem = false
      })

      if (
        preorderItemFound &&
        nonPreorderItemFound &&
        typeof window.pn.mixedCartWarningShown === 'undefined'
      ) {
        self.showWarning()
        window.pn.mixedCartWarningShown = true
      }
    })
  }

  MixedCartWarning.prototype.showWarning = function () {
    var mixed_cart_warning_title =
      shop.mixed_cart_warning_title ||
      'Warning: you have pre-order and in-stock items in the same cart'

    var mixed_cart_warning_text =
      shop.mixed_cart_warning_text ||
      'Shipment of your in-stock items may be delayed until your pre-order item is ready for shipping. To ensure faster delivery of your in-stock items, we recommend making two separate orders - one for your pre-order items and one for your in-stock items.'

    $('#pn-mixed-cart-warning').addClass('pn-manual-modal-container')
    $('#pn-mixed-cart-warning-content').addClass('pn-manual-modal-content')
    $('#pn-mixed-cart-warning').show()

    $('#pn-mixed-cart-warning-title').html(mixed_cart_warning_title)
    $('#pn-mixed-cart-warning-text').html(mixed_cart_warning_text)

    $(window).click(function (event) {
      if (event.target.classList.contains('pn-manual-modal-container')) {
        $('#pn-mixed-cart-warning').hide()
      }
    })

    $('#pn-modal-close-btn').click(function (event) {
      $('#pn-mixed-cart-warning').hide()
    })
  }

  var preorderSettingsCache = new PreorderSettingsCache()

  function ProductPage() {}

  ProductPage.prototype.initProductPage = function () {
    if (helper.getShopifyDomain() === 'lea-france-online.myshopify.com') {
      $(document).on('click', '.sbb', function (event) {
        $(event.target).text('Added to Cart')
        $(event.target).val('Added to Cart')
      })
    }

    var theProduct = ''
    $.getJSON(helper.getRandomizedURL(), function (shopifyProduct) {
      theProduct = shopifyProduct
    }).done(function () {
      preorderSettingsCache.checkIfSettingsExistForProduct(theProduct)
      $(shop.button_selector).show()
    })
  }

  function CollectionPage() {}

  CollectionPage.prototype.collectionBadgesEnabled = function () {
    return shop.enable_collection_page_badge
  }

  CollectionPage.prototype.collectionButtonsEnabled = function () {
    return shop.enable_collection_page_button
  }

  CollectionPage.prototype.collectionBadgesOrButtonsEnabled = function () {
    return this.collectionBadgesEnabled() || this.collectionButtonsEnabled()
  }

  // NOTE: CHECK THIS ONE EDSIL
  CollectionPage.prototype.initializeAjaxCollectionPageSettingCache =
    function () {
      window.pn.collectionPageSettings.filterMutationClassArray = [
        'searchit-search-results',
        'snize-item-image',
        'aos-init',
        'indiv-product',
        'isp_product_review',
        'box__collection',
        'pt-product-listing',
        'collection-products',
        'jas-product-img-element',
        'collection__dynamic-part',
        'one-whole',
      ]
      window.pn.collectionPageSettings.filterMutationIdArray = [
        'bc-sf-filter-tree',
        'bc-sf-filter-products',
        'searchit_results',
        'gf-products',
        'isp_pagination_anchor',
      ]
    }

  // NOTE: CHECK THIS ONE EDSIL
  CollectionPage.prototype.initializeAjaxCollectionPageObserver = function () {
    var self = this
    this.initializeAjaxCollectionPageSettingCache()

    var trigger = false
    var observer = new MutationObserver(function (mutations) {
      // For the sake of...observation...let's output the mutation to console to see how this all works
      mutations.forEach(function (mutation) {
        if (!trigger) {
          if (helper.checkMutations(mutation, 'ajaxCollectionPage')) {
            helper.sleep(1000).then(function () {
              self.addBadgesAndButtonsToCollectionPage()
            })
            trigger = true

            helper.sleep(1000).then(function () {
              trigger = false
            })
          }
        }
      })
    })

    // Notify me of everything!
    var observerConfig = {
      attributes: true,
      childList: true,
      characterData: true,
      subtree: true,
    }

    // Node, config
    // In this case we'll listen to all changes to body and child nodes
    var targetNode = document.body
    observer.observe(targetNode, observerConfig)
  }

  CollectionPage.prototype.addBadgesAndButtonsToCollectionPage = function () {
    var productHandles = this.getProductHandlesFromLinks(this.getProductLinks())
    var variantIds = this.getVariantIds()

    if (productHandles.length > 0 || variantIds.length > 0) {
      preorderSettingsCache.populateCache(
        "collection",
        productHandles,
        [],
        variantIds,
        function () {
          // This change refreshes pre-order product forms / buttons when products on an AJAX collection page change.
          // I'm applying this change to new shops only for now. If it doesn't cause problems, the condition can be removed / the change can be applied to all shops.
          if (window.pn.shop.id >= 16170) {
            preorderSettingsCache.refreshPreorderForms(window.pn.cache)
          }
        }
      )
    }
  }

  CollectionPage.prototype.getProductLinks = function () {
    var productLinks = []

    if (
      (this.collectionBadgesOrButtonsEnabled() &&
        helper.getShopifyDomain() === 'olea-herbals.myshopify.com') ||
      helper.getShopifyDomain() === 'i-am-imber.myshopify.com'
    ) {
      productLinks = $("a[href*='/products/']")

      return productLinks
    }

    if (this.collectionBadgesEnabled()) {
      if (helper.getShopifyDomain() === 'the-brag-company.myshopify.com') {
        productLinks = $("a[href*='/products/']:not(.fancybox)").has('img')
      } else if (
        helper.getShopifyDomain() === 'minasan-us-outlet.myshopify.com'
      ) {
        productLinks = $(
          "a[href*='/products/'].grid-view-item__image-container"
        )
      } else {
        //Grab all the product handles
        if (helper.stringChecker(shop.product_link_selector)) {
          productLinks = $(shop.product_link_selector)
          if (helper.stringChecker(shop.product_link_selector_has)) {
            productLinks = $(productLinks).has(shop.product_link_selector_has)
          }
        } else {
          productLinks = $("a[href*='/products/']").has('img')
        }

        if ($(productLinks).length === 0) {
          productLinks = $(shop.product_link_selector)
        }
      }
    }
    return productLinks
  }

  CollectionPage.prototype.getProductHandlesFromLinks = function (
    productLinks
  ) {
    var productHandles = []
    for (var x = 0; x < productLinks.length; x++) {
      if (shop.shopify_domain === 'argentwork.myshopify.com') {
        productHandles[x] = $(productLinks[x])
          .attr('action')
          .substring(
            $(productLinks[x]).attr('action').lastIndexOf('/products/') + 10
          )
          .split('?')[0]
      } else {
        productHandles[x] = $(productLinks[x])
          .attr('href')
          .substring(
            $(productLinks[x]).attr('href').lastIndexOf('/products/') + 10
          )
          .split('?')[0]
      }
    }
    return productHandles
  }

  CollectionPage.prototype.getVariantIds = function () {
    var variantIds = []

    if (this.collectionButtonsEnabled()) {
      var variantSelectors = $(
        "form[action^='/cart/add'] select[name='id'], form[action^='/cart/add'] input[name='id'], #sca-qv-add-item-form select[name='id'], #sca-qv-add-item-form input[name='id']"
      )
      var counter = 0
      for (var x = 0; x < variantSelectors.length; x++) {
        if (
          helper.stringChecker($(variantSelectors[x]).val()) &&
          $.inArray($(variantSelectors[x]).val(), variantIds) < 0
        ) {
          variantIds[counter] = $(variantSelectors[x]).val()
          counter++
        }
      }
    }

    return variantIds
  }

  CollectionPage.prototype.reinitCollectionPageBadges = function () {
    setInterval(function () {
      $.each(window.pn.cache, function (index, preorderProduct) {
        preorderProduct.initCollectionBadges()
      })
    }, 3000)
  }

  CollectionPage.prototype.initCollectionPage = function () {
    if (this.collectionBadgesOrButtonsEnabled()) {
      this.initializeAjaxCollectionPageObserver()
      this.addBadgesAndButtonsToCollectionPage()
      if (
        typeof shop.reinit_collection_badges !== 'undefined' &&
        shop.reinit_collection_badges
      ) {
        this.reinitCollectionPageBadges()
      }
    }
  }

  function Quickview() {}

  Quickview.prototype.getHandleFromTarget = function (target) {
    var handle = $(target).attr('handle')
    if (typeof handle === 'undefined') {
      handle = $(target).data('handle')
    }
    if (typeof handle === 'undefined') {
      handle = $(target).attr('href')
      if (typeof handle !== 'undefined') {
        if (handle.indexOf('#qv') > -1) {
          handle = $(target)
            .parent()
            .children('.overlay-second-link:first')
            .attr('href')
        } else if (handle.indexOf('?view=quick_view') > -1) {
          handle = handle.replace('?view=quick_view', '')
          handle = handle.split('/')[handle.split('/').length - 1]
        } else if (handle.indexOf('?view=quickview') > -1) {
          handle = handle.replace('?view=quickview', '')
          handle = handle.split('/')[handle.split('/').length - 1]
        } else if ($(target).hasClass('button--quick-shop')) {
          handle = $(target).parent().attr('href')
          handle = handle.split('/')[handle.split('/').length - 1]
        } else if (handle.indexOf('?view=quick') > -1) {
          handle = handle.replace('?view=quick', '')
          handle = handle.split('/')[handle.split('/').length - 1]
        } else if (handle === 'javascript:;') {
          handle = $(target).data('src')
          handle = handle.replace('?view=quick', '')
          handle = handle.split('/')[handle.split('/').length - 1]
        } else if (handle === 'javascript:void(0)') {
          handle = $(target).data('id')
        }
      } else {
        handle = $(target).attr('data-handle')
        if (typeof handle !== 'undefined') {
          handle = $(target).attr('data-handle')
        } else if ($(target).parents('.grid-product__link').length > 0) {
          handle = $(target).parents('.grid-product__link').attr('href')
          handle = handle.split('/')[handle.split('/').length - 1]
        } else if ($(target).parents('.product-link').length > 0) {
          handle = $(target).parents('.product-link').attr('href')
          handle = handle.split('/')[handle.split('/').length - 1]
        } else if ($(target).parents('.product-card-overlay').length > 0) {
          handle = $(target).parents('.product-card-overlay').attr('href')
          handle = handle.split('/')[handle.split('/').length - 1]
        } else if ($(target).parents('.productgrid--item').length > 0) {
          handle = $(target)
            .parents('.productgrid--item')
            .find('.productitem--image-link')
            .attr('href')
          handle = handle.split('/')[handle.split('/').length - 1]
        } else if (
          $(target).parents('.one-third.column.thumbnail').length > 0
        ) {
          handle = $(target)
            .parents('.one-third.column.thumbnail')
            .find('a:first')
            .attr('href')
          handle = handle.split('/')[handle.split('/').length - 1]
        } else if ($(target).parents('.product-inner').length > 0) {
          handle = $(target)
            .parents('.product-inner')
            .find('figure > a')
            .attr('href')
          handle = handle.split('/')[handle.split('/').length - 1]
        } else if ($(target).parents('.product-image').length > 0) {
          handle = $(target).parents('.product-image').attr('href')
          handle = handle.split('/')[handle.split('/').length - 1]
        } else if ($(target).parents('a.quick-buy').length > 0) {
          handle = $(target).parents('a.quick-buy').attr('href')
          handle = handle.split('/')[handle.split('/').length - 1]
        } else if ($(target).parents('.product-item.grid-item').length > 0) {
          handle = $(target)
            .parents('.product-item.grid-item')
            .attr('data-prod-handle')
        } else if (typeof $(target).attr('data-product-url') !== 'undefined') {
          handle = $(target).attr('data-product-url')
          handle = handle.split('/')[handle.split('/').length - 1]
        } else if (
          typeof $(target)
            .parents('div.bc-quickview-btn-wrapper')
            .attr('data-bc-qv-template') !== 'undefined'
        ) {
          handle = $(target)
            .parents('div.bc-quickview-btn-wrapper')
            .attr('data-bc-qv-template')
          var re = /products\/([\w\-]*)\?/
          var resultArray = re.exec(handle)
          if (resultArray.length > 0) {
            handle = resultArray[1]
          }
        } else if ($(target).closest('[data-product-url]').length > 0) {
          handle = $(target).closest('[data-product-url]').attr('data-product-url')
          handle = handle.split('/')[handle.split('/').length - 1]
        } else if ($(target).closest('product-card').find('a[href*="/products/"]').length > 0) {
          handle = $(target).closest('product-card').find('a[href*="/products/"]').first().attr('href')
          handle = handle.split('/')[handle.split('/').length - 1]
        } else if (typeof $(target).data('id') !== 'undefined') {
          handle = $(target).data('id')
        }
      }
    }
    return handle
  }

  Quickview.prototype.getProductPageJsURL = function (handle) {
    if (handle.indexOf('/products/') < 0) {
      handle = '/products/' + handle
    }

    if (handle.indexOf('/') < 0) {
      handle = '/' + handle
    }

    if (handle.indexOf('.json') < 0) {
      handle = handle + '.json'
    }

    var url =
      'https://' +
      window.location.hostname +
      handle +
      '?' +
      helper.getRandomInt(0, 10000)
    return url
  }

  Quickview.prototype.getProductDataFromShopify = function (url) {
    var shopifyProduct = ''
    var self = this
    $.getJSON(url, function (data) {
      shopifyProduct = data
    }).done(function () {
      self.initializeQuickviewModalObserver(shopifyProduct)
    })
  }

  Quickview.prototype.getClickedProductIdFromHandle = function (handle) {
    var url = this.getProductPageJsURL(handle)
    this.getProductDataFromShopify(url)
  }

  Quickview.prototype.cleanupModal = function () {
    $(window.pn.quickviewSettings.quickviewModalContainerSelectors)
      .find('.preorder-badge')
      .remove()
    $(window.pn.quickviewSettings.quickviewModalContainerSelectors)
      .find(PREORDER_DESCRIPTION_SELECTOR)
      .remove()
    $(window.pn.quickviewSettings.quickviewModalContainerSelectors)
      .find('#preorder-note')
      .remove()
  }

  Quickview.prototype.appendVisibleToSelectors = function (selectors) {
    var selectorArray = selectors.split(',')
    var visibleSelectorArray = []
    $.each(selectorArray, function (index, selector) {
      selector = selector.trim()

      if (selector.indexOf(':visible') < 0) {
        selector = selector + ':visible'
      }

      visibleSelectorArray.push(selector)
    })
    selectors = visibleSelectorArray.join(',')
    return selectors
  }

  Quickview.prototype.initializeQuickviewModalObserver = function (
    shopifyProduct
  ) {
    var self = this
    //If modal already visible, apply pre-order settings to it
    if (
      $(
        self.appendVisibleToSelectors(
          window.pn.quickviewSettings.quickviewModalContainerSelectors
        )
      ).length > 0
    ) {
      helper.sleep(1000).then(function () {
        window.pn.quickviewClicked = true
        self.cleanupModal()
        preorderSettingsCache.checkIfSettingsExistForProduct(shopifyProduct)
      })
      //If not, initialize an observer and wait for it to become visible
    } else {
      var trigger = false
      var observer = new MutationObserver(function (mutations) {
        // For the sake of...observation...let's output the mutation to console to see how this all works
        mutations.forEach(function (mutation) {
          if (!trigger) {
            if (helper.checkMutations(mutation, 'quickview')) {
              self.cleanupModal()
              trigger = true
              helper.sleep(1000).then(function () {
                window.pn.quickviewClicked = true
                preorderSettingsCache.checkIfSettingsExistForProduct(
                  shopifyProduct
                )
              })
            }
          }
        })
      })

      helper.sleep(2000).then(function () {
        trigger = false
      })

      // Notify me of everything!
      var observerConfig = {
        attributes: true,
        childList: true,
        characterData: true,
        subtree: true,
      }

      // Node, config
      // In this case we'll listen to all changes to body and child nodes
      var targetNode = document.body
      observer.observe(targetNode, observerConfig)
    }
  }

  Quickview.prototype.getVariantIds = function () {
    var variantIds = []

    var variantSelectors = $(window.pn.quickviewSettings.formSelectors).find(
      "select[name='id'], input[name='id']"
    )
    var counter = 0
    for (var x = 0; x < variantSelectors.length; x++) {
      if (
        helper.stringChecker($(variantSelectors[x]).val()) &&
        $.inArray($(variantSelectors[x]).val(), variantIds) < 0
      ) {
        variantIds[counter] = $(variantSelectors[x]).val()
        counter++
      }
    }
    return variantIds
  }

  Quickview.prototype.initializeClicklessQuickviewModalObserver = function () {
    var self = this
    var trigger = false
    var observer = new MutationObserver(function (mutations) {
      // For the sake of...observation...let's output the mutation to console to see how this all works
      mutations.forEach(function (mutation) {
        if (!trigger) {
          if (helper.checkMutations(mutation, 'quickview')) {
            window.pn.quickviewClicked = true
            self.cleanupModal()
            trigger = true
            helper.sleep(1000).then(function () {
              var variantIds = self.getVariantIds()
              if (variantIds.length > 0) {
                preorderSettingsCache.populateCache(
                  "product",
                  [],
                  [],
                  variantIds,
                  function () {
                    var preorderProducts =
                      preorderSettingsCache.getPreorderProductsForVariantIds(
                        variantIds
                      )
                    preorderSettingsCache.refreshPreorderForms(preorderProducts)
                  }
                )
              }
            })
            helper.sleep(2000).then(function () {
              trigger = false
            })
          }
        }
      })
    })

    // Notify me of everything!
    var observerConfig = {
      attributes: true,
      childList: true,
      characterData: true,
      subtree: true,
    }

    // Node, config
    // In this case we'll listen to all changes to body and child nodes
    var targetNode = document.body
    observer.observe(targetNode, observerConfig)
  }

  Quickview.prototype.createQuickViewButtonListener = function () {
    var self = this
    $(document).on(
      'click',
      window.pn.quickviewSettings.buttonSelectors,
      function (event) {
        var handle = self.getHandleFromTarget(event.currentTarget)
        if (typeof handle !== 'undefined') {
          self.getClickedProductIdFromHandle(handle)
        }
      }
    )
  }

  // NOTE: CHECK THIS ONE EDSIL
  Quickview.prototype.initQuickviewSettingCache = function () {
    window.pn.quickviewSettings.buttonSelectors =
      ".quick-add__submit button, .quick-add__button--choose, .button--quick-shop, .sca-qv-button, .quick-view-btn, .bc-quickview-btn-wrapper, .sca-qv-cartbtn, .js-quick-shop-link, .searchit-quick-view-button, .quick-view, .js-quickbuy-button, .quick-product__btn, .product-card-interaction-quickshop, .product-modal, .productitem--action button, a.quickview, .overlay, a.quickview, .has-quick-view .btn .v-b, .shop-now-button, .quick-buy, .quick_shop, a[data-action='show-product'], .trigger-quick-view, .quickview-button, .quick_view, .qview-button, button.btn-addToCart:last"
    window.pn.quickviewSettings.modalLoadedMutationClassArray = [
      'quick-shop',
      'sca-fancybox-opened',
      'mfp-ready',
      'bc-quickview-popup-active',
      'remodal-is-opened',
      'searchit-no-scroll',
      'modal--is-active',
      'quickshop-loaded',
      'fancybox-opened',
      'fancybox-is-open',
      'modal-visible',
      'quickview-raised',
      'quick-shop-content',
      'popup',
      'js-drawer-open',
      'modal-open',
      'screen-layer-open',
      'preview',
      'fancybox-lock',
      'slick-slider',
      'quickview-tpl',
      'reveal-modal',
      'quickshop-loaded',
      'is-locked',
      'is-loading',
      'open-in',
      'quickview-image',
      'qview-img',
      'active',
      'load-content',
      'tshopify-popup',
      'loading',
      'in',
      'expanded',
      'quickbuy-container',
      'quick-add-modal',
    ]
    window.pn.quickviewSettings.modalLoadedMutationIdArray = ['colorbox', 'quick-add-modal-content']
    window.pn.quickviewSettings.formSelectors =
      "form[action^='/cart/add'], .product__form:visible, #sca-qv-add-item-form:visible, .shopify-product-form:visible, .bc-modal-wrapper:visible #bc-quickview-cart-form:visible, .product_form:visible, .searchit-quick-view-form-wrapper form:visible, .product-form:visible, .quick-buy__product-form:visible, .product-single__form:visible, form[action='/cart/add']:visible, #AddToCartForm:visible, form.module:visible, #add-to-cart-quickview-form:visible"

    if (helper.getShopifyDomain() === 'sanshee-test.myshopify.com') {
      window.pn.quickviewSettings.addToCartButtonSelectors =
        '.sca-qv-cartbtn:visible, #addToCart:visible, #bc-quickview-cart-btn:visible, .add_to_cart:visible, #searchit-quick-view-add-to-cart:visible, .product-form__cart-submit:visible, .quickbuy__submit:visible, .add-to-cart:visible, .product-submit:visible, .add:visible, .product-form--atc-button:visible, input.action-button.submit:visible, .addto.cart.sliding-cart:visible, #AddToCart:visible, .add-to-cart:visible, .product__submit__add:visible, .product-add-to-cart:visible, #add-to-cart:visible, .product-submit.action-button.product-submit, .product-form__add-button:visible, .add-to-cart-btn:visible, .qview-btn-addtocart:visible, button.btn-addToCart:last'
    } else {
      window.pn.quickviewSettings.addToCartButtonSelectors =
        'button[name="add"] span, button[name="add"], .sca-qv-cartbtn:visible, #addToCart:visible, #bc-quickview-cart-btn:visible, .add_to_cart:visible, #searchit-quick-view-add-to-cart:visible, .product-form__cart-submit:visible, .quickbuy__submit:visible, .add-to-cart:visible, .product-submit:visible, .add:visible, .product-form--atc-button:visible, input.action-button.submit:visible, .addto.cart.sliding-cart:visible, #AddToCart:visible, .product-add:visible, .add-to-cart:visible, .product__submit__add:visible, .product-add-to-cart:visible, #add-to-cart:visible, .product-submit.action-button.product-submit, .product-form__add-button:visible, .add-to-cart-btn:visible, .qview-btn-addtocart:visible, button.btn-addToCart:last'
    }

    window.pn.quickviewSettings.productImageContainerSelectors =
      '.quick-shop__slideshow:visible, .zoomWrapper:visible, .slides:visible, .bc-quickview-featured-image-wrapper:visible, .flickity-viewport:visible, .searchit-quick-view-image-wrapper:visible, .slick-slider:visible, .product-image-main:visible, .product-main-image:visible, .product-photos .bigimage:visible, .product-gallery:visible, .product-image-zoom:visible, .showcase .container:visible, .responsive-image:visible, .owl-stage:visible, .modal_image:visible, .quickview-featured-image:visible, .product_images:visible, .product-photo-container:visible, .quickview-image:visible'
    window.pn.quickviewSettings.variantSelectors =
      '.product-form__input select, .product-form__input input, #sca-qv-variant-options select.single-option-selector, .bc-quickview-single-option-selector, .searchit-option-selector-wrapper select, .qview-variants select'
    window.pn.quickviewSettings.quickviewModalContainerSelectors =
      '.quick-add-modal__content-info, .quick-add-modal__content, .quick-add-modal, .quickview-product .product-quickview:visible, .sca-fancybox-wrap:visible, .mfp-container:visible, .bc-modal-wrapper:visible, .quick-shop:visible, .searchit-modal:visible, #colorbox:visible, .modal--quick-shop:visible, .quickshop:visible, .fancybox-wrap:visible, .fancybox-container:visible, .modal-content:visible, .product-quick-view, section.quick-view, #ShopNowContainer, #ProductScreens, .product.preview, .modal__inner__wrapper:visible, .halo-modal-content:visible, #quickView:visible, .quickshop-content:visible, .modal__inner:visible, .quick-view .content:visible, .qview-product:visible'
    window.pn.quickviewSettings.priceSelector =
      '.sca-qv-price-container .sca-qv-product-price, snize-price, qview-price__current'
    window.pn.quickviewSettings.salePriceSelector =
      '.sca-qv-price-container .sca-qv-product-price, .sca-qv-price-container .sca-qv-product-compare-price'
  }

  Quickview.prototype.initQuickview = function () {
    if (
      typeof shop.quickview_support_enabled !== 'undefined' &&
      shop.quickview_support_enabled
    ) {
      this.initQuickviewSettingCache()
      this.createQuickViewButtonListener()
      if (
        typeof shop.clickless_quickview_support_enabled !== 'undefined' &&
        shop.clickless_quickview_support_enabled
      ) {
        this.initializeClicklessQuickviewModalObserver()
      }
    }
  }

  function Cart(args) {
    this.items = []
    this.originalTotalPrice = 0.0
    this.totalDiscount = 0.0
    this.totalPrice = 0.0
    this.totalWeight = 0.0
  }

  Cart.prototype.updateCart = function (_callback) {
    var self = this
    var itemArray = []

    $.ajax({
      cache: false,
      type: 'GET',
      url:
        'https://' + window.location.hostname + '/cart.json',
        // 'https://' + window.location.hostname + '/cart?view=preorder-now-cart',
      //NOTE: We have to do it this way. If we set datatype/contenttype to json then Shopify defaults to it's own JSON template view bypassing our cart helper which means collection IDs are missing from cart helper response.
      //dataType: 'json',
      //contentType: "application/json; charset=utf-8",
      success: function (data) {
        var preorderActive = false
        // before extension
        // data = data.replace(/(\r\n|\n|\r)/gm, '')
        // data = JSON.parse(data)
        // before extension
        // data = window.pn.cart;
        self.originalTotalPrice = data['original_total_price']
        self.totalDiscount = data['total_discount']
        self.totalPrice = data['total_price']
        self.totalWeight = data['total_weight']
        self.itemCount = data['item_count']

        $.each(data['items'], function (itemIndex, item) {
          preorderActive = helper.cartItemIsActivePreOrder(item)

          item.preorder_status = preorderActive
          itemArray.push(new CartItem(item))
        })

        self.items = itemArray

        _callback()
      },
    })
  }

  Cart.prototype.createDraftOrder = function () {
    var draftOrder = {}

    draftOrder.line_items = JSON.stringify(this.getLineItemsHash())
    draftOrder.order_notes = ''

    return draftOrder
  }

  Cart.prototype.loadCartPage = function (shop) {
    var pnDiscounts = Discount.getDiscountObjects()
    var discountApplicator = {}
    var pageUpdater = {}

    if (pnDiscounts.length > 0) {
      discountApplicator = new DiscountApplicator(this, pnDiscounts, shop)
      discountApplicator.applyDiscounts()
    }

    pageUpdater = new PageUpdater(this)
    pageUpdater.updatePage()
  }

  Cart.prototype.getLineItemsHash = function () {
    var lineItemsHash = []

    $.each(this.items, function (index, item) {
      lineItemsHash.push(item.getLineItemHash())
    })

    return lineItemsHash
  }

  Cart.prototype.pnCheckout = function () {
    var draftOrder = this.createDraftOrder()
    $.ajax({
      cache: false,
      type: 'POST',
      url:
        helper.getServerAddress() +
        '/get_checkout_url?shopify_domain=' +
        helper.getShopifyDomain(),
      data: JSON.stringify(draftOrder),
      dataType: 'json',
      contentType: 'application/json; charset=utf-8',
      success: function (data) {
        $(shop.checkout_button_selector).prop('disabled', false)
        if (data['invoice_url']) {
          var invoiceURL = data['invoice_url'].replace(
            'checkout.shopify.com',
            shop.primary_domain
          )

          if (typeof window.pn.extraCheckoutParams !== 'undefined') {
            window.location.href = invoiceURL
              .concat('?')
              .concat(window.qb.extraCheckoutParams)
          } else {
            window.location.href = invoiceURL
          }
        } else {
          alert(
            "An error occured, and we're unable to process your order at this time. Please contact customer service for assistance. "
          )
        }
        window.pn.checkingOut = false
      },
    })
  }

  Cart.prototype.createCheckoutEventListener = function () {
    var self = this

    setTimeout(function () {
      $(shop.checkout_button_selector).off('click', '**')
      $('#OffAmazonPaymentsWidgets0').unbind('click#OffAmazonPaymentsWidgets0')
      $('#OffAmazonPaymentsWidgets0').unbind(
        'apay-OffAmazonPayments_mec_#OffAmazonPaymentsWidgets0'
      )
      $(shop.checkout_button_selector).prop('onclick', null)
      $(shop.checkout_button_selector).click(function (event) {
        event.preventDefault()
        event.stopImmediatePropagation()
        $(shop.checkout_button_selector).prop('disabled', true)
        helper.showSpinner(shop.checkout_button_selector)
        self.pnCheckout()
      })
    }, 1000)
  }

  function CartItem(args) {
    this.title = args['title']
    this.quantity = args['quantity']
    this.variantId = args['variant_id']
    this.productId = args['product_id']
    this.price = args['price']
    this.giftCard = args['gift_card']
    this.productTitle = args['product_title']
    this.variantTitle = args['variant_title']
    this.variantOptions = args['variant_options']
    this.originalPrice = args['original_price']
    this.originalLinePrice = args['original_line_price']
    this.sellingPlanId = args['selling_plan_allocation_id']
    this.discountedPrice = args['discounted_price']
    this.linePrice = args['line_price']
    this.collectionIds = args['collection_ids']
    this.properties = args['properties']
    this.requiresShipping = args['requires_shipping']
    this.grams = args['grams']
    this.key = args['key']
    this.appliedDiscount = {}
    this.discountGroup = null
    this.minTierWarning = ''
    this.nextTierOffer = ''
    this.discountLogEntry = ''
    this.image = args['image']
    this.handle = args['handle']
    this.tags = args['tags']
    this.preorderStatus = args['preorder_status']
  }

  CartItem.prototype.getLineItemHash = function () {
    var lineItemHash = {}

    lineItemHash['title'] = this.title
    lineItemHash['variant_id'] = this.variantId
    lineItemHash['product_id'] = this.productId
    lineItemHash['image'] = this.image
    lineItemHash['quantity'] = this.quantity
    lineItemHash['grams'] = this.grams
    lineItemHash['requires_shipping'] = this.requiresShipping
    lineItemHash['price'] = this.price / 100.0
    lineItemHash['selling_plan_allocation_id'] = this.sellingPlanId

    lineItemHash['properties'] = this.getLineItemPropertiesArray()
    lineItemHash['applied_discount'] = this.appliedDiscount

    if (lineItemHash['applied_discount'].amount !== 'undefined') {
      lineItemHash['applied_discount'].amount =
        lineItemHash['applied_discount'].amount
    }

    return lineItemHash
  }

  CartItem.prototype.getLineItemPropertiesArray = function () {
    var lineItemPropertiesArray = []
    var self = this

    if (this.properties != null) {
      $.each(Object.keys(this.properties), function (index, propertyKey) {
        var lineItemProperty = {}
        lineItemProperty['name'] = propertyKey
        lineItemProperty['value'] = self.properties[propertyKey]
        lineItemPropertiesArray.push(lineItemProperty)
      })
    }

    return lineItemPropertiesArray
  }

  function Discount(args) {
    this.cartItem = args || {}
    this.discountType = args['discount_type'] || 'no_discount'
    this.discountPercent = (args['discount_percentage'] || 0.0) / 100.0
    this.discountAmount = args['discount_fixed_amount'] || 0.0
    // cart partial payment
    this.partialDiscountType = args['partial_payment_discount_type'] || 'no_partial_discount'
    this.partialDiscountPercent = (args['partial_payment_discount_percentage'] || 0.0) / 100.0
    this.partialDiscountAmount = args['partial_payment_discount_fixed_amount'] || 0.0
    this.settingsType = args['discount_settings_type'] || 'default_settings'
    this.variantId = args['variant_id'] || null
  }

  Discount.initDiscountObjects = function (cartItems, settings, decodeSetting) {
    var defaultSettings = settings.defaultSetting
    var singleProductSettings = settings.singleProductSettings
    var tagSettings = settings.tagSettings
    var variantFound = false
    var discountObject = {}
    window.pn.discounts = []

    $.each(cartItems, function (index, cartItem) {
      if (!variantFound) {
        $.each(singleProductSettings, function (_, setting) {
          setting = decodeSetting(setting)
          if (
            setting.settings_type_id == cartItem.variantId.toString() &&
            cartItem.preorderStatus &&
            setting.settings_enabled
          ) {
            discountObject = Object.assign({}, setting, {
              discount_settings_type: 'single_product_settings',
              variant_id: cartItem.variantId.toString(),
            })

            window.pn.discounts.push(new Discount(discountObject))
            variantFound = true
          }
        })
      }

      if (!variantFound) {
        $.each(tagSettings, function (_, setting) {
          setting = decodeSetting(setting)

          $.each(cartItem.tags, function (_, tag) {
            if (
              typeof tag !== 'undefined' &&
              typeof setting.tag !== 'undefined' &&
              setting.tag == tag &&
              cartItem.preorderStatus &&
              setting.settings_enabled
            ) {
              discountObject = Object.assign({}, setting, {
                discount_settings_type: 'tag_settings',
                variant_id: cartItem.variantId.toString(),
              })

              window.pn.discounts.push(new Discount(discountObject))
              variantFound = true
            }
          })
        })
      }

      if (
        !variantFound &&
        Object.keys(defaultSettings).length > 0 &&
        typeof shop.apply_default_to_all !== 'undefined' &&
        shop.apply_default_to_all &&
        cartItem.preorderStatus
      ) {
        setting = decodeSetting(defaultSettings)

        discountObject = Object.assign({}, setting, {
          discount_settings_type: 'default_settings',
          variant_id: cartItem.variantId.toString(),
        })

        window.pn.discounts.push(new Discount(discountObject))
        variantFound = true
      }

      variantFound = false
    })

    return window.pn.discounts
  }

  Discount.getDiscountObjects = function () {
    return window.pn.discounts || []
  }

  Discount.prototype.getAppliedDiscount = function (cartItem) {
    var appliedDiscount = {}
    if(this.discountType == 'fixed_amount' && this.partialDiscountType == 'partial_fixed_amount'){
      appliedDiscount = this.fixedAmountDiscountHash(cartItem)
    }
    else if(this.discountType == 'fixed_amount' && this.partialDiscountType == 'partial_percentage'){
      appliedDiscount = this.fixedAmountDiscountHash(cartItem)
    }
    else if(this.discountType == 'percentage' && this.partialDiscountType == 'partial_fixed_amount'){
      appliedDiscount = this.percentageDiscountHash(cartItem)
    }
    else if(this.discountType == 'percentage' && this.partialDiscountType == 'partial_percentage'){
      appliedDiscount = this.percentageDiscountHash(cartItem)
    }

    else if(this.partialDiscountType == 'partial_fixed_amount' && this.discountType == 'no_discount'){
      appliedDiscount = this.fixedAmountPartialDiscountHash(cartItem)
    } else if(this.partialDiscountType === 'partial_percentage' && this.discountType == 'no_discount'){
      appliedDiscount = this.percentagePartialDiscountHash(cartItem)
    }
    // cart partial payment
    else if (this.discountType == 'percentage') {
      appliedDiscount = this.percentageDiscountHash(cartItem)
    } else if (this.discountType == 'fixed_amount') {
      appliedDiscount = this.fixedAmountDiscountHash(cartItem)
    }

    return appliedDiscount
  }


  Discount.prototype.fixedAmountPartialDiscountHash = function (cartItem) {
    var discountMode = "only_partial"
    var discountAmount = Math.floor(this.partialDiscountAmount),
      appliedDiscount = {}

    if (discountAmount > cartItem.price) {
      discountAmount = cartItem.price
    }

    appliedDiscount['discount_amount'] = discountAmount
    appliedDiscount['original_line_price'] = cartItem.originalLinePrice
    appliedDiscount['total_discount_amount'] =
      discountAmount * cartItem.quantity
    appliedDiscount['value_type'] = 'fixed_amount'
    appliedDiscount['description'] = 'Partial Payment Fixed Amount'
    appliedDiscount['title'] = 'Partial Payment Fixed amount'
    appliedDiscount['value'] = discountAmount / 100.0
    appliedDiscount['amount'] = (discountAmount * cartItem.quantity) / 100.0
    appliedDiscount['discount_mode'] = discountMode
    appliedDiscount['org_partial_amount'] = this.partialDiscountAmount

    return appliedDiscount
  }

  Discount.prototype.fixedAmountDiscountHash = function (cartItem) {
    var discountMode = "only_disocunt"
    var discountModeType = ""
    var discountAmount = Math.floor(this.discountAmount),
      appliedDiscount = {}
      var title = "Fixed amount discount"
    if(this.partialDiscountType == 'partial_percentage' || this.partialDiscountType == 'partial_fixed_amount'){
      hasPnPartialPayments = true
      if (this.partialDiscountType == 'partial_percentage' && cartItem.properties["Remaining-Amount-Per-Item"] !== undefined) {
        title = "Fixed amount discount with Partial Payment"

        cp = cartItem.price - discountAmount
        partialAmount =  Math.floor((this.partialDiscountPercent * cp))
        discountAmount = partialAmount + discountAmount

        // partialDiscountVal = (cartItem.price * this.partialDiscountPercent)
        appliedDiscount['org_partial_amount'] = partialAmount
        discountModeType = "fixed_discount_percent_partial"
        // discountAmount = discountAmount + partialDiscountVal
        discountMode = "partial_plus_discount"
        appliedDiscount['org_discount_amount'] = this.discountAmount


      } else if (this.partialDiscountType == 'partial_fixed_amount' && cartItem.properties["Remaining-Amount-Per-Item"] !== undefined) {
        discountModeType = "fixed_discount_fixed_partial"
        title = "Fixed amount discount with Partial Payment"
        discountAmount = discountAmount + this.partialDiscountAmount
        appliedDiscount['org_partial_amount'] = this.partialDiscountAmount
        discountMode = "partial_plus_discount"
      }
    }
    if (discountAmount > cartItem.price) {
      discountAmount = cartItem.price
    }

    appliedDiscount['discount_amount'] = discountAmount
    appliedDiscount['original_line_price'] = cartItem.originalLinePrice
    appliedDiscount['total_discount_amount'] =
      discountAmount * cartItem.quantity
    appliedDiscount['value_type'] = 'fixed_amount'
    appliedDiscount['description'] = 'Fixed Amount Discount'
    appliedDiscount['title'] = title
    appliedDiscount['value'] = discountAmount / 100.0
    appliedDiscount['amount'] = (discountAmount * cartItem.quantity) / 100.0
    appliedDiscount['discount_mode'] = discountMode
    appliedDiscount['discount_mode_type'] = discountModeType
    appliedDiscount['org_discount_amount'] = discountAmount

    return appliedDiscount
  }

  Discount.prototype.percentageDiscountHash = function (cartItem) {
    var discountMode = "only_disocunt"
    var appliedDiscount = {}
    var discountAmount = this.discountPercent
    discountAmount = Math.floor((this.discountPercent * cartItem.price))
    var title = "Percentage Discount"
    var discountModeType = ""
    if(this.partialDiscountType == 'partial_percentage' || this.partialDiscountType == 'partial_fixed_amount'){
      hasPnPartialPayments = true
      if (this.partialDiscountType == 'partial_percentage' && cartItem.properties["Remaining-Amount-Per-Item"] !== undefined) {
        title = "Percentage Discount with Partial Payment"
        cp = cartItem.price - discountAmount
        partialAmount =  Math.floor((this.partialDiscountPercent * cp))
        discountAmount = partialAmount + discountAmount
        discountMode = "partial_plus_discount"
        appliedDiscount['org_partial_amount'] = partialAmount
        appliedDiscount['org_discount_amount'] = this.discountPercent
        discountModeType = "percent_discount_percent_partial"
      }
      else if (this.partialDiscountType == 'partial_fixed_amount' && cartItem.properties["Remaining-Amount-Per-Item"] !== undefined) {
        discountModeType = "percent_discount_fixed_partial"
        title = "Percentage Discount with Partial Payment"
        discountMode = "partial_plus_discount"
        // discountAmount = (this.partialDiscountAmount / 1000) + this.discountPercent
        // partial_discountAmount = (this.partialDiscountAmount / cartItem.price)
        // discountAmount = partial_discountAmount  + discountAmount
        discountAmount = this.partialDiscountAmount  + discountAmount
        appliedDiscount['org_partial_amount'] = this.partialDiscountAmount
      }
    }

    appliedDiscount['discount_amount'] = discountAmount
    appliedDiscount['original_line_price'] = cartItem.originalLinePrice
    appliedDiscount['total_discount_amount'] =
      discountAmount * cartItem.quantity
    appliedDiscount['value_type'] = 'fixed_amount'
    appliedDiscount['description'] = 'Fixed Amount Discount'
    appliedDiscount['title'] = title
    appliedDiscount['value'] = discountAmount / 100.0
    appliedDiscount['amount'] = (discountAmount * cartItem.quantity) / 100.0
    appliedDiscount['discount_mode'] = discountMode
    appliedDiscount['discount_mode_type'] = discountModeType
    appliedDiscount['org_disocunt_amount'] = discountAmount
    appliedDiscount['discount_mode'] = discountMode
    appliedDiscount['org_disocunt_amount'] = discountAmount
    appliedDiscount['discount_mode_type'] = discountModeType

    return appliedDiscount
  }

  Discount.prototype.percentagePartialDiscountHash = function (cartItem) {
    var appliedDiscount = {}
    var discountMode = "only_partial"
    appliedDiscount['value'] = (this.partialDiscountPercent * 100).toFixed(2)
    appliedDiscount['original_line_price'] = cartItem.originalLinePrice
    appliedDiscount['discount_amount'] = Math.floor(
      Math.floor(cartItem.price * appliedDiscount.value) / 100
    )
    appliedDiscount['total_discount_amount'] = Math.floor(
      Math.floor(cartItem.price * appliedDiscount.value * cartItem.quantity) /
        100
    )
    appliedDiscount['value_type'] = 'percentage'
    appliedDiscount['description'] = 'Partial Payment Percentage'
    appliedDiscount['title'] = 'Partial Payment Percentage'
    appliedDiscount['amount'] =
      Math.floor(
        Math.floor(cartItem.price * appliedDiscount.value * cartItem.quantity) /
          100
      ) / 100
    appliedDiscount['discount_mode'] = discountMode

    return appliedDiscount
  }

  Discount.prototype.tagSettings = function (variantId, tags) {
    var defaultSetting = window.pn.settings.defaultSetting
    var discount = false
    var self = this

    if (
      this.settingsType == 'tag_settings' &&
      variantId.toString() == this.variantId
    ) {
      $.each(tags, function (index, tag) {
        if (
          typeof tag !== 'undefined' &&
          typeof self.cartItem.tag !== 'undefined' &&
          tag == self.cartItem.tag
        ) {
          discount = self
        }
      })

      if (typeof discount == 'object' && this.cartItem.use_default) {
        discount.discountPercent = (defaultSetting.aa || 0.0) / 100.0
        discount.discountAmount = defaultSetting.ab || 0.0
        discount.discountType = defaultSetting.z
        // cart partial payment
        discount.partialDiscountType = defaultSetting.partial_payment_z
        discount.partialDiscountAmount = defaultSetting.partial_payment_ab
        discount.partialDiscountPercent = defaultSetting.partial_payment_aa
      }
    }

    return discount
  }

  Discount.prototype.singleProductSettings = function () {
    var defaultSetting = window.pn.settings.defaultSetting
    if (this.settingsType == 'single_product_settings') {
      if (this.cartItem.use_default) {
        this.discountPercent = (defaultSetting.aa || 0.0) / 100.0
        this.discountAmount = defaultSetting.ab || 0.0
        this.discountType = defaultSetting.z
        // cart partial payment
        this.partialDiscountType = (defaultSetting.partial_payment_z || 0.0) / 100.0
        this.partialDiscountAmount = defaultSetting.partial_payment_ab || 0.0
        this.partialDiscountPercent = defaultSetting.partial_payment_aa
      }

      return this
    }

    return false
  }

  Discount.prototype.defaultSettings = function () {
    var shop = helper.getShop()

    if (
      typeof shop.apply_default_to_all !== 'undefined' &&
      shop.apply_default_to_all
    ) {
      return this
    }

    return false
  }

  function DiscountApplicator(cart, pnDiscounts, shop) {
    this.cart = cart
    this.discounts = pnDiscounts
    this.shop = shop
  }

  DiscountApplicator.prototype.findDiscountItem = function (item) {
    var discountForItem = false
    var discountFound = false
    $.each(this.discounts, function (index, discount) {
      if (item.variantId.toString() == discount.variantId) {
        if ((discountForItem = discount.singleProductSettings())) {
        } else if (
          (discountForItem = discount.tagSettings(item.variantId, item.tags))
        ) {
        } else {
          discountForItem = discount.defaultSettings()
        }
      }

      if (typeof discountForItem == 'object' && discountForItem != false) {
        return false
      }
    })

    return discountForItem
  }

  DiscountApplicator.prototype.applyDiscounts = function () {
 
    var self = this
    var discount = {}
    with (window) {
      hasPnDiscountEnables = false;
      hasPnPartialPayments = false;
    }
    $.each(this.cart.items, function (index, item) {
      discount = self.findDiscountItem(item)
      if (
        discount &&
        discount.discountType != 'no_discount' &&
        item.preorderStatus
      ) {
        hasPnDiscountEnables = true;
        window.pn.gettingPreorderDiscount = true
        self.applyDiscountToItems(item, discount)
      }
      // cart partial payment
      if (
        discount &&
        discount.partialDiscountType != 'no_partial_discount' &&
        item.preorderStatus && discount.discountType === 'no_discount'
      ) {
        window.pn.gettingPreorderDiscount = true
        if(item.properties['Remaining-Amount-Per-Item'] !== undefined){
          hasPnPartialPayments = true
          $(shop.checkout_button_selector).text("Partial Checkout");
          self.applyDiscountToItems(item, discount)
        }
      }
    })
  }

  DiscountApplicator.prototype.applyDiscountToItems = function (
    cartItem,
    discount
  ) {

    // cart partial payment
    cartItem.appliedDiscount = discount.getAppliedDiscount(cartItem)
    this.cart.totalDiscount += cartItem.appliedDiscount.total_discount_amount
    this.cart.totalPrice -= cartItem.appliedDiscount.total_discount_amount
  }

  function PageUpdater(cart) {
    this.cart = cart || {}
  }

  PageUpdater.prototype.updatePage = function () {
    if (
      this.cart.totalDiscount > 0 &&
      helper.getShopifyDomain() !== 'purescooters.myshopify.com' &&
      helper.objectChecker(window.pn.gettingPreorderDiscount) &&
      window.pn.gettingPreorderDiscount
    ) {
      if(shop.shopify_purchase_option_enabled === false){
        this.showDiscountedSubtotal(shop)
        this.partialPaymentLog(shop);
      }

      if (shop.enabled_line_item_discount) {
        if(shop.shopify_purchase_option_enabled === false){
          this.showLineItemDiscount(this.cart.items)
        }
      }

      if (shop.quantity_field_selector !== '' && shop.shopify_purchase_option_enabled === false) {
        $(document).on('change', shop.quantity_field_selector, function (e) {
          e.preventDefault()
          e.stopImmediatePropagation()

          setTimeout(function () {
            $(CART_FORM_SELECTOR).submit()
          }, 500)
        })
      }

      if (shop.quantity_button_selector !== '' && shop.shopify_purchase_option_enabled === false) {
        $(document).on('click', shop.quantity_button_selector, function (e) {
          e.preventDefault()
          e.stopImmediatePropagation()

          setTimeout(function () {
            $(CART_FORM_SELECTOR).submit()
          }, 500)
        })
      }
      if(shop.shopify_purchase_option_enabled === false){
        this.cart.createCheckoutEventListener()
      }
    }
  }

  PageUpdater.prototype.showLineItemDiscount = function (cartItems) {
    var priceElements = $('.pn-price-item')
    var totalPriceElements = $('.pn-total-line-item')
    var moneyFormat = shop.money_format
    $.each(cartItems, function (index, item) {
      var preorderActive = helper.cartItemIsActivePreOrder(item)

      // cart partial payment
      // if (item.appliedDiscount.total_discount_amount > 0 && preorderActive && item.properties["Remaining-Amount-Per-Item"] !== undefined) {
      if (item.appliedDiscount.total_discount_amount > 0 && preorderActive) {
        var itemDiscountedPrice =
          item.price -
          item.appliedDiscount.total_discount_amount / item.quantity
        var lineItemdiscountedPrice =
          item.appliedDiscount.original_line_price -
          item.appliedDiscount.total_discount_amount
        var originalLinePrice = item.appliedDiscount.original_line_price
        var itemPrice = item.price

          if(item.appliedDiscount.discount_mode !== undefined && item.appliedDiscount.discount_mode === 'only_partial'){
            var cartLineItem =
              '</span><span class="pn-line-item-discounted-price">' +
              helper.formatCents(originalLinePrice, moneyFormat) +
              '</span>'
            var cartItem =
              '</span><span class="pn-line-item-discounted-price">' +
              helper.formatCents(itemPrice, moneyFormat) +
              '</span>'
          }
          else if (item.appliedDiscount.discount_mode !== undefined && item.appliedDiscount.discount_mode === 'partial_plus_discount'){
            if(item.appliedDiscount.discount_mode_type === 'fixed_discount_fixed_partial') {
            var cartLineItem =
              '<span class="pn-line-item-original-price">' +
              helper.formatCents(originalLinePrice, moneyFormat) +
              '</span><span class="pn-line-item-discounted-price">' +
              helper.formatCents(lineItemdiscountedPrice + (item.appliedDiscount.org_partial_amount * item.quantity), moneyFormat) +
              '</span>'
            var cartItem =
              '<span class="pn-line-item-original-price">' +
              helper.formatCents(itemPrice, moneyFormat) +
              '</span><span class="pn-line-item-discounted-price">' +
              helper.formatCents(itemDiscountedPrice + item.appliedDiscount.org_partial_amount, moneyFormat) +
              '</span>'
            }
            else if(item.appliedDiscount.discount_mode_type === 'percent_discount_percent_partial'){
                var itemPrice = (item.price * item.quantity) - (item.appliedDiscount.org_discount_amount * item.price * item.quantity)
            var cartLineItem =
              '<span class="pn-line-item-original-price">' +
              helper.formatCents(originalLinePrice, moneyFormat) +
              '</span><span class="pn-line-item-discounted-price">' +
              helper.formatCents(itemPrice , moneyFormat)   +
              '</span>'
            var cartItem =
              '<span class="pn-line-item-original-price">' +
              helper.formatCents(item.price, moneyFormat) +
              '</span><span class="pn-line-item-discounted-price">' +
              helper.formatCents(item.price - (item.appliedDiscount.org_discount_amount * item.price), moneyFormat) +
              '</span>'
            }
            else if(item.appliedDiscount.discount_mode_type === 'fixed_discount_percent_partial'){
              var cartLineItem =
                '<span class="pn-line-item-original-price">' +
                helper.formatCents(originalLinePrice, moneyFormat) +
                '</span><span class="pn-line-item-discounted-price">' +
                helper.formatCents(lineItemdiscountedPrice + (item.appliedDiscount.org_partial_amount * item.quantity), moneyFormat) +
                '</span>'
              var cartItem =
                '<span class="pn-line-item-original-price">' +
                helper.formatCents(itemPrice, moneyFormat) +
                '</span><span class="pn-line-item-discounted-price">' +
                helper.formatCents(itemDiscountedPrice + (item.appliedDiscount.org_partial_amount), moneyFormat) +
                '</span>'
            }
            else if(item.appliedDiscount.discount_mode_type === 'percent_discount_fixed_partial'){
              var cartLineItem =
                '<span class="pn-line-item-original-price">' +
                helper.formatCents(originalLinePrice, moneyFormat) +
                '</span><span class="pn-line-item-discounted-price">' +
                helper.formatCents(lineItemdiscountedPrice + (item.appliedDiscount.org_partial_amount * item.quantity), moneyFormat) +
                '</span>'
              var cartItem =
                '<span class="pn-line-item-original-price">' +
                helper.formatCents(itemPrice, moneyFormat) +
                '</span><span class="pn-line-item-discounted-price">' +
                helper.formatCents(itemDiscountedPrice + (item.appliedDiscount.org_partial_amount), moneyFormat) +
                '</span>'
            }
          }
          else {
            var cartLineItem = 
              '<span class="pn-line-item-original-price">' +
              helper.formatCents(originalLinePrice, moneyFormat) +
              '</span><span class="pn-line-item-discounted-price">' +
              helper.formatCents(lineItemdiscountedPrice, moneyFormat) +
              '</span>'
            var cartItem =
              '<span class="pn-line-item-original-price">' +
              helper.formatCents(itemPrice, moneyFormat) +
              '</span><span class="pn-line-item-discounted-price">' +
              helper.formatCents(itemDiscountedPrice, moneyFormat) +
              '</span>'
          }
        $.each(priceElements, function (index, priceElement) {
          if ($(priceElement).data('id') === item.key) {
            $(priceElement).html(cartItem)
          }
        })
        $.each(totalPriceElements, function (index, totalPriceElement) {
          if ($(totalPriceElement).data('id') === item.key) {
            $(totalPriceElement).html(cartLineItem)
          }
        })
      }
    })
  }

  PageUpdater.prototype.showDiscountedSubtotal = function (shop) {
    if ($('.pn-original-subtotal').length == 0) {
      if(hasPnPartialPayments && hasPnDiscountEnables == false){
        var newSubtotal =
          '</span><span class="pn-discounted-subtotal">' +
          helper.formatCents(this.cart.originalTotalPrice, shop.money_format) +
          '</span>'
      }
      else if(hasPnPartialPayments && hasPnDiscountEnables){
        $(shop.checkout_button_selector).text("Partial Checkout");
        var partialAmountSum = 0
        var bothPercentage = false
        $.each(this.cart.items, function (index, item) {
          if(item.appliedDiscount.discount_mode_type === "fixed_discount_fixed_partial"){
            partialAmountSum += item.appliedDiscount.org_partial_amount * item.quantity
          }
          else if(item.appliedDiscount.discount_mode_type === "percent_discount_percent_partial"){
            partialAmountSum += item.appliedDiscount.org_partial_amount * item.quantity
          }
          else if(item.appliedDiscount.discount_mode_type === "fixed_discount_percent_partial"){
            partialQtyPrice = (item.appliedDiscount.org_partial_amount)
            partialAmountSum += (partialQtyPrice *  item.quantity)

          }
          else if(item.appliedDiscount.discount_mode_type === 'percent_discount_fixed_partial'){
            partialAmountSum += (item.appliedDiscount.org_partial_amount * item.quantity)
          }
        });

        if(bothPercentage === true){
          totalSubtotal = partialAmountSum
        }
        else {
          totalSubtotal = this.cart.totalPrice + partialAmountSum
        }
        var newSubtotal =
          '<span class="pn-original-subtotal">' +
          helper.formatCents(this.cart.originalTotalPrice, shop.money_format) +
          '</span><span class="pn-discounted-subtotal">' +
          helper.formatCents(totalSubtotal, shop.money_format) +
          '</span>'
      }

      else {
        var newSubtotal =
          '<span class="pn-original-subtotal">' +
          helper.formatCents(this.cart.originalTotalPrice, shop.money_format) +
          '</span><span class="pn-discounted-subtotal">' +
          helper.formatCents(this.cart.totalPrice, shop.money_format) +
          '</span>'
      }

      $(shop.cart_subtotal_selector).last().html(newSubtotal)
    } else {
      $('.pn-discounted-subtotal').html(
        helper.formatCents(this.cart.totalPrice, shop.money_format)
      )
      $('.pn-original-subtotal').html(
        helper.formatCents(this.cart.originalTotalPrice, shop.money_format)
      )
    }
  }

  PageUpdater.prototype.partialPaymentLog = function (shop) {
    var partialLineItemPrice = 0
    $.each(this.cart.items, function (index, item) {
      if(item['properties']['Remaining-Amount-Per-Item'] !== undefined){
        remainBl = item['properties']['Remaining-Amount-Per-Item']
        partialLineItemPrice += (parseFloat(remainBl.replace(/\,/g,'').replace( /^\D+/g, '')) * 100) * item.quantity;
      }

    });
    if(partialLineItemPrice > 0){
      if(hasPnDiscountEnables === true){
        var remainingBlc = this.cart.originalTotalPrice - partialLineItemPrice;
      }
      else {
        var remainingBlc = this.cart.totalPrice;
      }
      if($(".pn-partial-payment").length === 0){
        // have to remove this explicit shop domains conditions when start working
         // on adding new enhancements to partial payment feature
        if(Shopify.shop === 'infinitee-vn.myshopify.com'){
         partialLineItemPrice = partialLineItemPrice * 1000
        }
        else if (Shopify.shop === 'jaime-les-raviolis.myshopify.com'){
          partialLineItemPrice = partialLineItemPrice / 100
        }
        var partialLog = 
        '<div class="pn-partial-payment">' +
          '<ul>' +
            '<li class="active"><span>Partial Deposit:</span> <strong>' +
            helper.formatCents(this.cart.totalPrice, shop.money_format) + '</strong></li>' +
            '<li><span>Remaining Balance:</span> <strong>' +
            helper.formatCents(partialLineItemPrice, shop.money_format) + '</strong></li>' +
          '</ul>' +
        '</div>';
        $(partialLog).insertAfter(shop.checkout_button_selector);
      }
    }
    else {
      var remainingBlc = this.cart.originalTotalPrice - partialLineItemPrice
    }

  }

  PageUpdater.prototype.initializeAjaxCartObserver = function () {
    var cart = this.cart
    var trigger = false
    var pnDiscounts = []
    var discountApplicator = {}
    var pageUpdater = {}

    var observer = new MutationObserver(function (mutations) {
      // For the sake of...observation...let's output the mutation to console to see how this all works
      mutations.forEach(function (mutation) {
        if (!trigger && helper.checkMutations(mutation, 'ajaxCart')) {
          setTimeout(function () {
            cart.updateCart(function () {
              Discount.initDiscountObjects(
                cart.items,
                window.pn.settings,
                preorderSettingsCache.decodeSetting
              )
              pnDiscounts = Discount.getDiscountObjects()

              if (pnDiscounts.length > 0) {
                discountApplicator = new DiscountApplicator(
                  cart,
                  pnDiscounts,
                  shop
                )
                discountApplicator.applyDiscounts()
              }

              pageUpdater = new PageUpdater(cart)
              pageUpdater.updatePage()
            })
          }, 250)

          trigger = true
        }
      })
      trigger = false
    })

    // Notify me of everything!
    var observerConfig = {
      attributes: true,
      childList: true,
      characterData: true,
      subtree: true,
    }

    // Node, config
    // In this case we'll listen to all changes to body and child nodes
    var targetNode = document.body
    observer.observe(targetNode, observerConfig)
  }

  $(document).ready(function () {
    $.getScript(
      'https://cdnjs.cloudflare.com/ajax/libs/spin.js/2.3.2/spin.min.js'
    )

    window.pn.ajaxCartSettings = {}
    window.pn.ajaxCartSettings.mutationIds = [
      'ajaxifyCart',
      'cart-loading',
      'AjaxifyCart',
      'layer-addcart-modal',
    ]
    window.pn.ajaxCartSettings.mutationClasses = [
      'drawer',
      'cart-drawer__item-list',
      'cart-item__qty',
      'mm-opened',
      'cart-sidebar',
      'opened',
      'cart-preview',
      'ajaxcart__inner',
      'cart--is-visible',
    ]

    preorderSettingsCache.initPreorderSettingCache()
    stockChecker.initStockChecker()

    var cart = new Cart()

    if (typeof window.pn === 'undefined') {
      window.pn = {}
    }
    if (typeof window.pn.running === 'undefined' || Shopify.shop === "preordernow-demo-store.myshopify.com") {
      window.pn.running = true
      if (helper.onProductPage()) {
        var productPage = new ProductPage()
        productPage.initProductPage()
      } else if (!helper.onCartPage()) {
        var collectionPage = new CollectionPage()
        collectionPage.initCollectionPage()
        var quickView = new Quickview()
        quickView.initQuickview()
      }

      var mixedCartWarning = new MixedCartWarning()
      mixedCartWarning.initMixedCartWarning()
      helper.setupEnv()

      if (helper.onCartPage() || helper.onProductPage()) {
        if (helper.hasDiscount(preorderSettingsCache.decodeSetting)) {
          cart.updateCart(function () {
            Discount.initDiscountObjects(
              cart.items,
              window.pn.settings,
              preorderSettingsCache.decodeSetting
            )
            cart.loadCartPage(shop)
          })
        }
      }

      if (shop.enabled_ajax_cart) {
        pageUpdater = new PageUpdater(cart)
        pageUpdater.initializeAjaxCartObserver()
      }
    }
  })
}

try {
  var neverLoadJquery = window.pn.shop.never_load_jquery
} catch (err) {
  var neverLoadJquery = false
}

with (window) {
  hasPNLoaded = false;
}

if (
  !neverLoadJquery &&
  (typeof jQuery === 'undefined' || parseFloat(jQuery.fn.jquery) < 2.2)
) {
  loadScript(
    '//ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js',
    function () {
      loadScript('//code.jquery.com/ui/1.12.1/jquery-ui.min.js', function () {
        jQuery341 = jQuery.noConflict(true)
        // myFrontendJavascript(jQuery341)
        getPreloadedData(jQuery341);
        hasPNLoaded = true;
      })
    }
  )
} else {
  window.addEventListener('load', function () {
    if (window.jQuery) {
      // myFrontendJavascript(window.jQuery)
      getPreloadedData(window.jQuery);
      hasPNLoaded = true;
    } else {
      console.log(
        'Unable to load Pre-order Now - jQuery not present and jQuery loading disabled.'
      )
    }
  })
}
