
    (function() {
      var preconnectOrigins = ["https://cdn.shopify.com","https://extensions.shopifycdn.com"];
      var scripts = ["/cdn/shopifycloud/checkout-web/assets/c1/polyfills.CgsWKOqO.js","/cdn/shopifycloud/checkout-web/assets/c1/app.BPsK4DBl.js","/cdn/shopifycloud/checkout-web/assets/c1/esnext-vendor.CJ973sIo.js","/cdn/shopifycloud/checkout-web/assets/c1/browser.D_qfN0sR.js","/cdn/shopifycloud/checkout-web/assets/c1/phone-phoneCountryCode.BRClAM2D.js","/cdn/shopifycloud/checkout-web/assets/c1/types-UnauthenticatedErrorModalPayload.CCDsoKuV.js","/cdn/shopifycloud/checkout-web/assets/c1/images-payment-icon.C_9SDN8i.js","/cdn/shopifycloud/checkout-web/assets/c1/context-utilities.BtErasS5.js","/cdn/shopifycloud/checkout-web/assets/c1/utilities-shop-discount-offer.sWCrlod7.js","/cdn/shopifycloud/checkout-web/assets/c1/utilities-alternativePaymentCurrency.BTIwClWS.js","/cdn/shopifycloud/checkout-web/assets/c1/extensibility-shared.bmCEdpdq.js","/cdn/shopifycloud/checkout-web/assets/c1/shared-unactionable-errors.C5j6b21L.js","/cdn/shopifycloud/checkout-web/assets/c1/purchasing-company-isValidPurchasingCompanyBillingAddress.8jfhjkcz.js","/cdn/shopifycloud/checkout-web/assets/c1/NotFound.Qxc_FroW.js","/cdn/shopifycloud/checkout-web/assets/c1/FullScreenBackground._DJVB02G.js","/cdn/shopifycloud/checkout-web/assets/c1/graphql-ShopPayCheckoutSessionQuery.Bx3fmFr0.js","/cdn/shopifycloud/checkout-web/assets/c1/helpers-setAddressErrors.BRCdbksx.js","/cdn/shopifycloud/checkout-web/assets/c1/CaptureEvents-ButtonWithRegisterWebPixel.D8Ev0KPM.js","/cdn/shopifycloud/checkout-web/assets/c1/images-flag-icon.C_eXYJRt.js","/cdn/shopifycloud/checkout-web/assets/c1/locale-en.VBEjg99q.js","/cdn/shopifycloud/checkout-web/assets/c1/page-Information.BWbPemlJ.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useWalletsTimeout.Cj2Sj5Y_.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useUnauthenticatedErrorModal.C1favBVT.js","/cdn/shopifycloud/checkout-web/assets/c1/MarketsProDisclaimer.DrAq97Qc.js","/cdn/shopifycloud/checkout-web/assets/c1/CrossBorderConsolidation.D79_tbzf.js","/cdn/shopifycloud/checkout-web/assets/c1/useShopPayButtonClassName.CBdYPJXa.js","/cdn/shopifycloud/checkout-web/assets/c1/ChangeCompanyLocationLink.CpGGn1BE.js","/cdn/shopifycloud/checkout-web/assets/c1/WalletsSandbox-WalletSandbox.oLTwLqlV.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useForceShopPayUrl.DRbfPGKD.js","/cdn/shopifycloud/checkout-web/assets/c1/GooglePayButton-index.VvPCVje5.js","/cdn/shopifycloud/checkout-web/assets/c1/ShippingGroupsSummaryLine.BzBgCOTj.js","/cdn/shopifycloud/checkout-web/assets/c1/StackedMerchandisePreview.0FiEonlt.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useShopPayCheckoutGqlVersion.DcFSoWyO.js","/cdn/shopifycloud/checkout-web/assets/c1/AutocompleteField-hooks.UDL1qZ2l.js","/cdn/shopifycloud/checkout-web/assets/c1/component-RuntimeExtension.Byxm0HhN.js","/cdn/shopifycloud/checkout-web/assets/c1/AnnouncementRuntimeExtensions.CiBbiE9b.js","/cdn/shopifycloud/checkout-web/assets/c1/MobileOrderSummary.1V27AMCx.js","/cdn/shopifycloud/checkout-web/assets/c1/extension-targets-rendering-extension-targets.B9JHfMRp.js","/cdn/shopifycloud/checkout-web/assets/c1/esm-browser-v4.BKrj-4V8.js","/cdn/shopifycloud/checkout-web/assets/c1/extension-targets-shipping-options.Cgcqcjax.js","/cdn/shopifycloud/checkout-web/assets/c1/ExtensionsInner.CBS5tIaq.js","/cdn/shopifycloud/checkout-web/assets/c1/OffsitePaymentFailed.D4lkD9PS.js","/cdn/shopifycloud/checkout-web/assets/c1/NoAddressLocationFullDetour.vglNVNMC.js"];
      var styles = ["/cdn/shopifycloud/checkout-web/assets/c1/assets/app.DQm2XSFQ.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/phoneCountryCode.Bz45BrAn.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/UnauthenticatedErrorModalPayload.CO286Meg.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/FullScreenBackground.B_iZlQze.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/ButtonWithRegisterWebPixel.kRY6S0Td.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/CrossBorderConsolidation.CRDql5Io.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/ChangeCompanyLocationLink.uqpm88mq.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/useShopPayButtonClassName.Ho_Bkwiw.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/WalletSandbox.CnR7qNLY.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/StackedMerchandisePreview.D6OuIVjc.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/RuntimeExtension.DWkDBM73.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/AnnouncementRuntimeExtensions.qDifMJI9.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/MobileOrderSummary.BLCAQEbk.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/NoAddressLocationFullDetour.CpFaJIpx.css"];
      var fontPreconnectUrls = ["https://fonts.shopifycdn.com"];
      var fontPrefetchUrls = ["https://fonts.shopifycdn.com/titillium_web/titilliumweb_n4.dc3610b1c7b7eb152fc1ddefb77e83a0b84386b3.woff2?h1=cm9uaW4ucGs&hmac=63cb9c34df1104f7504b60b198beefaf233751fd0d64fbca5069064663846d3f","https://fonts.shopifycdn.com/titillium_web/titilliumweb_n7.d17ed1f3a767ca2dd9fcaa8710c651c747c3860e.woff2?h1=cm9uaW4ucGs&hmac=b02b8d596b3aadd589d8a00ab5ac1dc1a39ba95e57015f2e7c72c112f38720ef"];
      var imgPrefetchUrls = ["https://cdn.shopify.com/s/files/1/0695/8832/0569/files/logo_2077bffd-0556-43b0-b944-c9d3d51cdb99_x320.png?v=1737565930"];

      function preconnect(url, callback) {
        var link = document.createElement('link');
        link.rel = 'dns-prefetch preconnect';
        link.href = url;
        link.crossOrigin = '';
        link.onload = link.onerror = callback;
        document.head.appendChild(link);
      }

      function preconnectAssets() {
        var resources = preconnectOrigins.concat(fontPreconnectUrls);
        var index = 0;
        (function next() {
          var res = resources[index++];
          if (res) preconnect(res, next);
        })();
      }

      function prefetch(url, as, callback) {
        var link = document.createElement('link');
        if (link.relList.supports('prefetch')) {
          link.rel = 'prefetch';
          link.fetchPriority = 'low';
          link.as = as;
          if (as === 'font') link.type = 'font/woff2';
          link.href = url;
          link.crossOrigin = '';
          link.onload = link.onerror = callback;
          document.head.appendChild(link);
        } else {
          var xhr = new XMLHttpRequest();
          xhr.open('GET', url, true);
          xhr.onloadend = callback;
          xhr.send();
        }
      }

      function prefetchAssets() {
        var resources = [].concat(
          scripts.map(function(url) { return [url, 'script']; }),
          styles.map(function(url) { return [url, 'style']; }),
          fontPrefetchUrls.map(function(url) { return [url, 'font']; }),
          imgPrefetchUrls.map(function(url) { return [url, 'image']; })
        );
        var index = 0;
        function run() {
          var res = resources[index++];
          if (res) prefetch(res[0], res[1], next);
        }
        var next = (self.requestIdleCallback || setTimeout).bind(self, run);
        next();
      }

      function onLoaded() {
        try {
          if (parseFloat(navigator.connection.effectiveType) > 2 && !navigator.connection.saveData) {
            preconnectAssets();
            prefetchAssets();
          }
        } catch (e) {}
      }

      if (document.readyState === 'complete') {
        onLoaded();
      } else {
        addEventListener('load', onLoaded);
      }
    })();
  