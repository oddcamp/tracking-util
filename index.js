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
      enabled: true,
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
      defaultGAcommands: [],
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
        defaultGAcommands: cookie.defaultGAcommands,
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
   *   @param defaultGAcommands {array} Default GA data
   */
  setTrackingAccepted(value, options = {}) {
    const { defaultGTMdataLayer = [], defaultGAcommands = [] } = options

    this.cookies.set(
      this.options.cookie.name,
      {
        accepted: value,
        defaultGTMdataLayer,
        defaultGAcommands,
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
   *
   *
   * GTM
   *
   *
   */

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
    if (
      !this.options.enabled ||
      !this.trackingAccepted() ||
      !this.isGTMtrackable()
    ) {
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
    if (
      !this.options.enabled ||
      !this.trackingAccepted() ||
      !this.isGTMtrackable() ||
      typeof data !== `object`
    ) {
      return false
    }

    const { dataLayerName } = this.options.services.gtm
    if (!Array.isArray(window[dataLayerName])) {
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
    if (
      !this.options.enabled ||
      !this.trackingAccepted() ||
      !this.isGTMtrackable()
    ) {
      return []
    }

    const { dataLayerName } = this.options.services.gtm
    if (!Array.isArray(window[dataLayerName])) {
      return []
    }

    return window[dataLayerName]
  }

  /*
   *
   *
   * GA
   *
   *
   */

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
    if (
      !this.options.enabled ||
      !this.trackingAccepted() ||
      !this.isGAtrackable()
    ) {
      return false
    }

    const { ga } = this.options.services
    const { defaultGAcommands } = this.status

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

    this.runGAcommand([`create`, ga.id, ga.createFields])

    if (Array.isArray(defaultGAcommands)) {
      defaultGAcommands.forEach((d) => this.runGAcommand(d))
    }

    return true
  }

  /*
   * Runs GA command
   *
   * @param {array} data Command params
   * @returns {bool} `true` on success and `false` on failure
   */
  runGAcommand(data) {
    if (
      !this.options.enabled ||
      !this.trackingAccepted() ||
      !this.isGAtrackable() ||
      !Array.isArray(data)
    ) {
      return false
    }

    const { commandQueue } = this.options.services.ga
    if (typeof window[commandQueue] !== `function`) {
      return false
    }

    window[commandQueue](...data)

    return true
  }
}

export default TrackingUtil
