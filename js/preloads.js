
    (function() {
      var preconnectOrigins = ["https://cdn.shopify.com","https://extensions.shopifycdn.com"];
      var scripts = ["/cdn/shopifycloud/checkout-web/assets/c1/polyfills.CgsWKOqO.js","/cdn/shopifycloud/checkout-web/assets/c1/app.CNqzFthi.js","/cdn/shopifycloud/checkout-web/assets/c1/esnext-vendor.CpgHsLpk.js","/cdn/shopifycloud/checkout-web/assets/c1/browser.DDEuPV4X.js","/cdn/shopifycloud/checkout-web/assets/c1/phone-phoneCountryCode.BD3WGTuM.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useShopPayProgressIntercepts.DvyhPCqM.js","/cdn/shopifycloud/checkout-web/assets/c1/images-payment-icon.C_9SDN8i.js","/cdn/shopifycloud/checkout-web/assets/c1/utilities-shop-discount-offer.BZXAz5Q6.js","/cdn/shopifycloud/checkout-web/assets/c1/utilities-alternativePaymentCurrency.uKW58sFr.js","/cdn/shopifycloud/checkout-web/assets/c1/extensibility-shared.tK70Pcgr.js","/cdn/shopifycloud/checkout-web/assets/c1/shared-unactionable-errors.bWk01lRs.js","/cdn/shopifycloud/checkout-web/assets/c1/graphql-PaymentSessionMutation.I11c_EAk.js","/cdn/shopifycloud/checkout-web/assets/c1/graphql-ShopPayCheckoutSessionQuery.BQtfMbcu.js","/cdn/shopifycloud/checkout-web/assets/c1/helpers-setAddressErrors.p-iz05mQ.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useHasOrdersFromMultipleShops.BfmumLnO.js","/cdn/shopifycloud/checkout-web/assets/c1/images-flag-icon.C_eXYJRt.js","/cdn/shopifycloud/checkout-web/assets/c1/locale-en.CbjepNAQ.js","/cdn/shopifycloud/checkout-web/assets/c1/page-Information.B11N6jEa.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useGeneralPaymentErrorMessage.C_2VgynG.js","/cdn/shopifycloud/checkout-web/assets/c1/CrossBorderConsolidation.DLDG65EB.js","/cdn/shopifycloud/checkout-web/assets/c1/ShopPayLogo.BqqPz2J2.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useForceShopPayUrl.DO7rRGA3.js","/cdn/shopifycloud/checkout-web/assets/c1/ShippingGroupsSummaryLine.COmX28T5.js","/cdn/shopifycloud/checkout-web/assets/c1/StackedMerchandisePreview.D_3mxi48.js","/cdn/shopifycloud/checkout-web/assets/c1/ImpressionEventCapture.CE9fcecB.js","/cdn/shopifycloud/checkout-web/assets/c1/AutocompleteField-hooks.KHWFpYs4.js","/cdn/shopifycloud/checkout-web/assets/c1/Page.C5sAgHwr.js","/cdn/shopifycloud/checkout-web/assets/c1/component-RuntimeExtension.Dq08kImz.js","/cdn/shopifycloud/checkout-web/assets/c1/AnnouncementRuntimeExtensions.Dm_5dcAl.js","/cdn/shopifycloud/checkout-web/assets/c1/extension-targets-rendering-extension-targets.BaGIupRK.js","/cdn/shopifycloud/checkout-web/assets/c1/esm-browser-v4.BKrj-4V8.js","/cdn/shopifycloud/checkout-web/assets/c1/extension-targets-shipping-options.FoZAl7-P.js","/cdn/shopifycloud/checkout-web/assets/c1/ExtensionsInner.DY5QUBKv.js"];
      var styles = ["/cdn/shopifycloud/checkout-web/assets/c1/assets/app.DQm2XSFQ.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/phoneCountryCode.Bz45BrAn.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/useShopPayProgressIntercepts.CO286Meg.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/PaymentSessionMutation.CEMlQpma.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/useHasOrdersFromMultipleShops.o3WDCM8A.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/useGeneralPaymentErrorMessage.uqpm88mq.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/CrossBorderConsolidation.CRDql5Io.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/Page.BYM12A8B.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/ShopPayLogo.BrcQzLuH.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/StackedMerchandisePreview.D6OuIVjc.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/RuntimeExtension.DWkDBM73.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/AnnouncementRuntimeExtensions.qDifMJI9.css"];
      var fontPreconnectUrls = ["https://fonts.shopifycdn.com"];
      var fontPrefetchUrls = ["https://fonts.shopifycdn.com/titillium_web/titilliumweb_n4.dc3610b1c7b7eb152fc1ddefb77e83a0b84386b3.woff2?h1=cm9uaW4ucGs&hmac=63cb9c34df1104f7504b60b198beefaf233751fd0d64fbca5069064663846d3f","https://fonts.shopifycdn.com/titillium_web/titilliumweb_n7.d17ed1f3a767ca2dd9fcaa8710c651c747c3860e.woff2?h1=cm9uaW4ucGs&hmac=b02b8d596b3aadd589d8a00ab5ac1dc1a39ba95e57015f2e7c72c112f38720ef"];
      var imgPrefetchUrls = ["images/LOGO.jpg"];

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
  