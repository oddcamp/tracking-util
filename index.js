import Cookies from "universal-cookie"
import merge from "lodash/merge"

class TrackingUtil {
  constructor(options = {}) {
    // If `window` is not available don't do anything
    if (typeof window === `undefined`) {
      return null
    }

    // If the tracking is already set don't do anything
    if (window.trackingUtil) return null

    // Default options
    this.options = {
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
        ga: {
          id: ``,
          commandQueue: `ga`,
          createFields: {},
        },
      },
    }

    merge(this.options, options)

    this.status = {
      userReacted: false,
      trackingAccepted: null,
      defaultGTMdataLayer: [],
      defaultGAdata: [],
    }

    this.cookies = new Cookies()

    this.init()

    window.trackingUtil = this
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
        defaultGAdata: cookie.defaultGAdata,
      }
      this.initTrackers()
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
   * @param {bool} value `true` if accepted, `false` if denied
   * @param {object} options
   *   @param defaultGTMdataLayer {array} Default GTM data layer
   *   @param defaultGAdata {array} Default GA data
   */
  setTrackingAccepted(value, options = {}) {
    const { defaultGTMdataLayer = [], defaultGAdata = [] } = options

    this.cookies.set(
      this.options.cookie.name,
      {
        accepted: value,
        defaultGTMdataLayer,
        defaultGAdata,
      },
      this.options.cookie.options
    )

    this.init()

    return true
  }

  /*
   * Initiates tracking
   */
  initTrackers() {
    this.initGTM()
    this.initGA()
  }

  /*
   * Checks if enough options provided to perform GTM tracking
   */
  isGTMtrackable() {
    const { gtm } = this.options.services
    return gtm && gtm.id && gtm.dataLayerName
  }

  /*
   * Initiates GTM tracking
   */
  initGTM() {
    if (!this.isGTMtrackable() || !this.trackingAccepted()) {
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
   * Registers GTM data
   *
   * @param {object} data
   * @returns {bool} `true` on success and `false` on failure
   */
  registerGTMdata(data) {
    const { dataLayerName } = this.options.services.gtm

    if (
      !this.isGTMtrackable() ||
      !this.trackingAccepted() ||
      typeof data !== `object` ||
      typeof window[dataLayerName] !== `object`
    ) {
      return false
    }

    window[dataLayerName].push(data)

    return true
  }

  /*
   * Gets registered GTM data
   * @returns {array}
   */
  registeredGTMdata() {
    if (!this.isGTMtrackable()) {
      return false
    }

    const { dataLayerName } = this.options.services.gtm
    return window[dataLayerName] || []
  }

  /*
   * Checks if enough options provided to perform GA tracking
   */
  isGAtrackable() {
    const { ga } = this.options.services
    return ga && ga.id && ga.commandQueue
  }

  /*
   * Initiates GA tracking
   */
  initGA() {
    if (!this.isGAtrackable() || !this.trackingAccepted()) {
      return false
    }

    const { ga } = this.options.services
    const { defaultGAdata } = this.status

    /* eslint-disable */
    ;(function (i, s, o, g, r, a, m) {
      i[`GoogleAnalyticsObject`] = r
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
      `script`,
      `https://www.google-analytics.com/analytics.js`,
      ga.commandQueue
    )
    /* eslint-enable */

    window[ga.commandQueue](`create`, ga.id, ga.createFields)

    if (Array.isArray(defaultGAdata)) {
      defaultGAdata.forEach((d) => this.registerGAdata(d))
    }

    return true
  }

  /*
   * Registers GA data
   *
   * @param {array} data
   */
  registerGAdata(data) {
    const { commandQueue } = this.options.services.ga

    if (
      !this.isGAtrackable() ||
      !this.trackingAccepted() ||
      !Array.isArray(data) ||
      typeof window[commandQueue] !== `function`
    ) {
      return false
    }

    window[commandQueue](...data)

    return true
  }
}

export default TrackingUtil
