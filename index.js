import Cookies from "universal-cookie"

class TrackingUtil {
  constructor(options = {}) {
    // If window is not available don't do anything
    if (typeof window === `undefined`) {
      return null
    }
    // If the tracking is already set don't do anything
    if (window.TrackingUtil) return null

    // default options
    const defaultOptions = {
      cookie: {
        name: `tracking-cookie-accepted`,
        options: {
          path: `/`,
          maxAge: 3600 * 24 * 30 * 12, // year
          secure: false,
        },
      },
      services: {
        gtm: {
          id: ``,
          dataLayer: {},
        },
      },
    }

    this.options = {
      ...defaultOptions,
      ...options,
    }

    this.status = {
      enableModal: false,
      cookie: new Cookies(),
      trackingAccepted: false,
      trackingCategories: {
        performance: false,
        analytics: false,
        marketing: false,
      },
      services: {
        gtm: false,
      },
    }

    this.checkStatus()

    window.TrackingUtil = this
  }

  /*
   * Set cookie value to the specified cookie and rechecks status
   *
   * @value String || Boolean
   * @categories Object
   */
  setTrackingAccepted(value, categories) {
    this.status.cookie.set(
      this.options.cookie.name,
      JSON.stringify({ accepted: value, categories: categories }),
      this.options.cookie.options
    )

    this.checkStatus()

    return true
  }

  /*
   * Check the status if tracking is allowed or not
   * Will update the status object and inject scripts or the modal
   */
  checkStatus() {
    const cookie = JSON.parse(this.status.cookie.get(this.options.cookie.name))

    if (cookie && (cookie.accepred === true || cookie.accepred === `true`)) {
      this.status = {
        ...this.status,
        enableModal: false,
        trackingAccepted: true,
        trackingCategories: {
          performance: cookie.categories.performance,
          analytics: cookie.categories.analytics,
          marketing: cookie.categories.marketing,
        },
      }

      this.injectTrackingScripts()

      return true
    }

    this.status = {
      ...this.status,
      enableModal: false,
      trackingAccepted: false,
      services: {
        gtm: false,
      },
    }

    if (
      typeof this.status.cookie.get(this.options.cookie.name) === `undefined`
    ) {
      this.injectTrackingModal()
    }

    return false
  }

  /*
   *  Will track a page view on the accepted services
   */
  trackPageView() {
    if (!this.status.trackingAccepted) {
      return false
    }

    if (this.status.services.gtm && window.dataLayer) {
      window.dataLayer.push({ event: `pageView` })
    }

    return true
  }

  /*
   * Will try inject all script tags and then track a page view
   */
  injectTrackingScripts() {
    this.injectGTMscripts()

    if (this.status.services.gtm && window.dataLayer) {
      Object.keys(this.status.trackingCategories).map((category) => {
        if (this.status.trackingCategories[category]) {
          return window.dataLayer.push({
            event: `tracking_category_${category}`,
          })
        }
      })
    }

    this.trackPageView()
  }

  /*
   * Will inject GTM script tag if theres and gtm id
   */
  injectGTMscripts() {
    if (!this.options.services.gtm.id) {
      return false
    }

    /* eslint-disable */
    ;(function (w, d, s, l, i) {
      w[l] = w[l] || []
      w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" })
      var f = d.getElementsByTagName(s)[0],
        j = d.createElement(s),
        dl = l != "dataLayer" ? "&l=" + l : ""
      j.async = true
      j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl
      f.parentNode.insertBefore(j, f)
    })(window, document, "script", "dataLayer", this.options.services.gtm.id)
    /* eslint-enable */

    if (Object.keys(this.options.services.gtm.dataLayer).length !== 0) {
      window.dataLayer.push(this.options.services.gtm.dataLayer)
    }

    this.status.services.gtm = true

    return true
  }

  /*
   * Will set the status to enable modal
   */
  injectTrackingModal() {
    this.status.enableModal = true

    return true
  }
}
export default TrackingUtil

/*
 * External helper to check for if a modal should be rendered
 */
export const modalEnabled = () => {
  return window.TrackingUtil.status.enableModal
}

/*
 * External helper to set cookies
 *
 * @value String || Boolean
 * @categories Object
 */
export const setTrackingAccepted = (value, categories = {}) => {
  return window.TrackingUtil.setTrackingAccepted(value, categories)
}
