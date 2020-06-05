import Cookies from "universal-cookie"

class TrackingUtil {
  constructor(options = {}) {
    // If window is not available don't do anything
    if (typeof window === `undefined`) {
      return null
    }

    // If the tracking is already set don't do anything
    if (window.TrackingUtil) return null

    // Default options
    const defaultOptions = {
      cookie: {
        name: `tracking-util-reacted`,
        options: {
          path: `/`,
          maxAge: 3600 * 24 * 365, // year
          secure: false,
        },
      },
      services: {
        gtm: {
          id: ``,
          dataLayerName: `dataLayer`,
        },
      },
    }

    this.options = {
      ...defaultOptions,
      ...options,
    }

    this.status = {
      userReacted: false,
      trackingAccepted: null,
      defaultGTMdataLayer: [],
    }

    this.cookies = new Cookies()

    this.init()

    window.TrackingUtil = this
  }

  /*
   * Init scripts if tracking's accepted
   */
  init() {
    const cookie = this.cookies.get(this.options.cookie.name)

    if (!cookie) {
      this.status = {
        ...this.status,
        userReacted: false,
      }
      return null
    }

    if (cookie.accepted === true || cookie.accepted === `true`) {
      this.status = {
        ...this.status,
        userReacted: true,
        trackingAccepted: true,
        defaultGTMdataLayer: cookie.defaultGTMdataLayer,
      }
      this.injectTrackingScripts()
      return true
    }

    this.status = {
      ...this.status,
      userReacted: true,
      trackingAccepted: false,
    }
    return false
  }

  /*
   * Checks if user has made a decision to allow or deny tracking
   */
  userReacted() {
    return this.status.userReacted
  }

  /*
   * Checks if tracking has been accepted by user
   */
  trackingAccepted() {
    return this.status.trackingAccepted
  }

  /*
   * Sets tracking decision and starts tracking if accepted
   *
   * @value Boolean
   * @options Object
   *   @defaultGTMdataLayer Array
   */
  setTrackingAccepted(value, options = {}) {
    const { defaultGTMdataLayer = [] } = options

    this.cookies.set(
      this.options.cookie.name,
      {
        accepted: value,
        defaultGTMdataLayer,
      },
      this.options.cookie.options
    )

    this.init()

    return true
  }

  /*
   * Will try inject all script tags and then track a page view
   */
  injectTrackingScripts() {
    this.injectGTMscripts()
  }

  /*
   * Checks if enough options provided to perform GTM tracking
   */
  isGTMtrackable() {
    const { gtm } = this.options.services
    return gtm && gtm.id && gtm.dataLayerName
  }

  /*
   * Inject GTM scripts
   */
  injectGTMscripts() {
    if (!this.isGTMtrackable()) {
      return false
    }

    const { gtm } = this.options.services
    const { defaultGTMdataLayer } = this.status

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
    })(window, document, "script", gtm.dataLayerName, gtm.id)
    /* eslint-enable */

    if (Array.isArray(defaultGTMdataLayer)) {
      defaultGTMdataLayer.forEach((dl) => this.registerGTMdata(dl))
    }

    return true
  }

  /*
   * Register GTM data
   *
   * @data Object
   */
  registerGTMdata(data) {
    if (!this.isGTMtrackable() || typeof data !== `object`) {
      return false
    }

    const { dataLayerName } = this.options.services.gtm
    if (typeof window[dataLayerName] === `undefined`) {
      window[dataLayerName] = []
    }
    window[dataLayerName].push(data)

    return true
  }

  /*
   * Get registered GTM data
   */
  registeredGTMdata() {
    if (!this.isGTMtrackable()) {
      return false
    }

    const { dataLayerName } = this.options.services.gtm
    return window[dataLayerName] || []
  }
}

export default TrackingUtil

// External helpers

export const userReacted = (...args) => {
  if (typeof window === `undefined`) return null
  return window.TrackingUtil.userReacted(...args)
}

export const trackingAccepted = (...args) => {
  if (typeof window === `undefined`) return null
  return window.TrackingUtil.trackingAccepted(...args)
}

export const setTrackingAccepted = (...args) => {
  if (typeof window === `undefined`) return null
  return window.TrackingUtil.setTrackingAccepted(...args)
}

export const registerGTMdata = (...args) => {
  if (typeof window === `undefined`) return null
  return window.TrackingUtil.registerGTMdata(...args)
}

export const registeredGTMdata = (...args) => {
  if (typeof window === `undefined`) return null
  return window.TrackingUtil.registeredGTMdata(...args)
}
