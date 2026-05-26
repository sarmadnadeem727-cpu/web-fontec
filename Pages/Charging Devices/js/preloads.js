
    (function() {
      var preconnectOrigins = ["https://cdn.shopify.com","https://extensions.shopifycdn.com"];
      var scripts = ["/cdn/shopifycloud/checkout-web/assets/c1/polyfills.iRHCMwIP.js","/cdn/shopifycloud/checkout-web/assets/c1/app.TdO5T-Uw.js","/cdn/shopifycloud/checkout-web/assets/c1/esnext-vendor.DIMGU94m.js","/cdn/shopifycloud/checkout-web/assets/c1/browser.DL4me7US.js","/cdn/shopifycloud/checkout-web/assets/c1/shared-is-shop-pay-active.BVwFZx78.js","/cdn/shopifycloud/checkout-web/assets/c1/types-UnauthenticatedErrorModalPayload.USmlHhB-.js","/cdn/shopifycloud/checkout-web/assets/c1/images-payment-icon.C_9SDN8i.js","/cdn/shopifycloud/checkout-web/assets/c1/context-utilities.DJcMcEah.js","/cdn/shopifycloud/checkout-web/assets/c1/utilities-shop-discount-offer.Yf3C7TxM.js","/cdn/shopifycloud/checkout-web/assets/c1/NotFound.Bulev4e7.js","/cdn/shopifycloud/checkout-web/assets/c1/shared-unactionable-errors.BPOqfwr6.js","/cdn/shopifycloud/checkout-web/assets/c1/helpers-installmentsNotSupportedForAddress.C7sWh81p.js","/cdn/shopifycloud/checkout-web/assets/c1/utils-getCommonShopPayExternalTelemetryAttributes.DHJOBJFY.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useShopPayCheckoutGqlVersion.DGpjqT3Y.js","/cdn/shopifycloud/checkout-web/assets/c1/graphql-ShopPayCheckoutSessionQuery.BMHsrL4d.js","/cdn/shopifycloud/checkout-web/assets/c1/helpers-setAddressErrors.BaFnaoDa.js","/cdn/shopifycloud/checkout-web/assets/c1/types-index.BE0UD4Nk.js","/cdn/shopifycloud/checkout-web/assets/c1/images-flag-icon.C_eXYJRt.js","/cdn/shopifycloud/checkout-web/assets/c1/locale-en.D_zw2QX-.js","/cdn/shopifycloud/checkout-web/assets/c1/page-Information.5d6gR5-n.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useWalletsTimeout.BGhhyUC_.js","/cdn/shopifycloud/checkout-web/assets/c1/remember-me-hooks.C4X9Al7u.js","/cdn/shopifycloud/checkout-web/assets/c1/MarketsProDisclaimer.BlKZ_CPP.js","/cdn/shopifycloud/checkout-web/assets/c1/SplitDeliveryMerchandiseContainer.BpymsSp1.js","/cdn/shopifycloud/checkout-web/assets/c1/useShopPayButtonClassName.D1cm3cTK.js","/cdn/shopifycloud/checkout-web/assets/c1/ChangeCompanyLocationLink.DbPFApFY.js","/cdn/shopifycloud/checkout-web/assets/c1/WalletsSandbox-WalletSandbox.DWF8SZ0Q.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useUnauthenticatedErrorModal.EpBysKGB.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useForceShopPayUrl.YL7lFZiL.js","/cdn/shopifycloud/checkout-web/assets/c1/GooglePayButton-index.KQabuzPi.js","/cdn/shopifycloud/checkout-web/assets/c1/ShippingGroupsSummaryLine.ChJFENLP.js","/cdn/shopifycloud/checkout-web/assets/c1/StackedMerchandisePreview.D3JEvRm-.js","/cdn/shopifycloud/checkout-web/assets/c1/AutocompleteField-hooks.CUKyFqJQ.js","/cdn/shopifycloud/checkout-web/assets/c1/component-RuntimeExtension.BQxg3bfM.js","/cdn/shopifycloud/checkout-web/assets/c1/AnnouncementRuntimeExtensions.BMJjH2Lu.js","/cdn/shopifycloud/checkout-web/assets/c1/MobileOrderSummary.Bn0y_Fb1.js","/cdn/shopifycloud/checkout-web/assets/c1/extension-targets-rendering-extension-targets.C0n2GtQB.js","/cdn/shopifycloud/checkout-web/assets/c1/esm-browser-v4.BKrj-4V8.js","/cdn/shopifycloud/checkout-web/assets/c1/extension-targets-shipping-options.r2X1WVLe.js","/cdn/shopifycloud/checkout-web/assets/c1/ExtensionsInner.B5NsihwI.js","/cdn/shopifycloud/checkout-web/assets/c1/OffsitePaymentFailed.BnqF1_Et.js","/cdn/shopifycloud/checkout-web/assets/c1/NoAddressLocationFullDetour.DP14_4Ht.js"];
      var styles = ["/cdn/shopifycloud/checkout-web/assets/c1/assets/app.DQm2XSFQ.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/is-shop-pay-active.Bz45BrAn.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/UnauthenticatedErrorModalPayload.D1hsMvAK.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/index.CZTotsbB.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/SplitDeliveryMerchandiseContainer.CRDql5Io.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/ChangeCompanyLocationLink.uqpm88mq.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/useShopPayButtonClassName.BrcQzLuH.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/WalletSandbox.CnR7qNLY.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/StackedMerchandisePreview.D6OuIVjc.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/RuntimeExtension.DWkDBM73.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/AnnouncementRuntimeExtensions.qDifMJI9.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/MobileOrderSummary.BLCAQEbk.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/NoAddressLocationFullDetour.CpFaJIpx.css"];
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
  