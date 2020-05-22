import Cookies from "universal-cookie"

class KollegornaGDPRTracking {
  constructor(options = {}) {
    // If window is not available don't do anything
    if (typeof window === `undefined`) {
      return null
    }
    // If the tracking is already set don't do anything
    if (window.GDPRTracking) return null

    // default options
    const defaultOptions = {
      cookie: {
        name: `cookie-accepted`,
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
        ga: {
          id: ``,
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
      services: {
        gtm: false,
        ga: false,
      },
    }

    this.checkStatus()

    window.KollegornaGDPRTracking = this
  }

  /*
   * Set cookie value to the specified cookie and rechecks status
   */
  setTrackingAccepted(value) {
    this.status.cookie.set(
      this.options.cookie.name,
      value,
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
    const cookie = this.status.cookie.get(this.options.cookie.name)

    if (cookie && (cookie === true || cookie === `true`)) {
      this.status = {
        ...this.status,
        enableModal: false,
        trackingAccepted: true,
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
        ga: false,
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

    if (this.status.services.ga && window.ga) {
      window.ga(`send`, `pageview`, window.location.pathname)
    }

    return true
  }

  /*
   * Will try inject all script tags and then track a page view
   */
  injectTrackingScripts() {
    this.injectGTMscripts()
    this.injectGAscripts()

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
   * Will inject GA script tag if theres and ga id
   */
  injectGAscripts() {
    if (!this.options.services.ga.id) {
      return false
    }

    /* eslint-disable */
    ;(function (i, s, o, g, r, a, m) {
      i["GoogleAnalyticsObject"] = r
      ;(i[r] =
        i[r] ||
        function () {
          ;(i[r].q = i[r].q || []).push(arguments)
        }),
        (i[r].l = 1 * new Date())
      ;(a = s.createElement(o)), (m = s.getElementsByTagName(o)[0])
      a.async = 1
      a.src = g
      m.parentNode.insertBefore(a, m)
    })(
      window,
      document,
      "script",
      "https://www.google-analytics.com/analytics.js",
      "ga"
    )
    /* eslint-enable */

    window.ga(`create`, this.options.services.ga.id, `auto`)

    this.status.services.ga = true

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
export default KollegornaGDPRTracking

/*
 * External helper to check for if a modal should be rendered
 */
export const modalEnabled = () => {
  return window.KollegornaGDPRTracking.status.enableModal
}

/*
 * External helper to set cookies
 */
export const setTrackingAccepted = (value) => {
  return window.KollegornaGDPRTracking.setTrackingAccepted(value)
}
