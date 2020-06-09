# Kollegorna Tracking Utility

GDPR compliant tracking.

## Supported services

- Google Tag Manager (GTM)
- Google Analytics (GA)

## Example code

```js
import TrackingUtil from "@kollegorna/tracking-util"

// Initiates util, automatically inserts scripts and starts tracking if tracking
// has been previously accepted by user
const tu = new TrackingUtil({
  services: {
    gtm: {
      id: `GTM-XXXX`,
    },
    ga: {
      id: `UA-XXXXX-Y`,
    }
  },
})

// Displays cookie consent dialog if user hasn't already made a decision
if (tu.userReacted()) {
  document.querySelector(`.consent-dialog`).removeAttribute(`hidden`)
}

// Sets tracking accepted on button click
document
  .querySelector(`.consent-dialog button[data-type="accept"]`)
  .addEventListener(`click`, () => {
    tu.setTrackingAccepted(true, {
      defaultGTMdataLayer: [
        { pageTitle: `Home` },
        { event: `pageView` },
      ],
      defaultGAcommands: [
        [`set`, `anonymizeIp`, true],
        [`send`, `pageview`],
      ],
    })
  })

// Sets tracking denied on button click
document
  .querySelector(`.consent-dialog button[data-type="deny"]`)
  .addEventListener(`click`, () => tu.setTrackingAccepted(false))
```

Once `TrackingUtil` instance is created it also becomes accessible via
`window.trackingUtil`, e.g.:

```js
document.querySelector(`a.logo`).addEventListener(`click`, () => {
  if (window.trackingUtil) {
    window.trackingUtil.registerGTMdata({
      event: `Click`,
      eventCategory: `Links`,
      eventLabel: `Logo`,
    })

    window.trackingUtil.runGAcommand([
      `send`,
      `event`,
      {
        eventCategory: `Links`,
        eventAction: `Click`,
        eventValue: `Logo`,
      },
    ])
  }
})
```

## Default options

```js
{
  /* Cookie options */
  cookie: {
    name: `tracking-util-reacted`,
    options: {
      path: `/`,
      maxAge: 3600 * 24 * 30 * 12, // year
      secure: false,
    },
  },

  /* Services */
  services: {

    /* Google Tag Manager options */
    gtm: {
      /* E.g.: GTM-XXXX */
      id: ``,

      /* Data layer name. Usually it's `dataLayer`, i.e. `window.dataLayer` */
      dataLayerName: `dataLayer`,
    },

    /* Google Analytics options */
    gtm: {
      /* E.g.: UA-XXXX-Y */
      id: ``,

      /* Command queue name. Usually it's `ga`, i.e. `window.ga` */
      commandQueue: `ga`,

      /*
        Fields for `create` method. For example:

          createFields: {
            name: `myTracker`,
            alwaysSendReferrer: true,
          }

        ...is equal to:

          window.ga('create', 'UA-XXXX-Y', { name: `myTracker`, alwaysSendReferrer: true })

        All options available at
          https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#create
      */
      createFields: {},
    },
  },
}
```

## Methods

```js
/*
* Checks if user has made a decision to allow or deny tracking
* @returns {bool}
*/
userReacted()
```
---
```js
/*
* Checks if tracking has been accepted by user
* @returns {bool}
*/
trackingAccepted()
```
---
```js
/*
* Sets tracking decision and starts tracking if accepted
*
* @param {bool} value `true` if accepted, `false` if denied
* @param {object} options 
*   @param defaultGTMdataLayer {array} Default GTM data layer
*   @param defaultGAcommands {array} Default GA data
*/
setTrackingAccepted(value, options = {})
```
If tracking was accepted by user the `defaultGTMdataLayer/defaultGAcommands` are 
saved in a cookie (Options → `cookie.name`) and the data is automatically 
injected in GTM's data layer every time `TrackingUtil` instance is created. 
Therefore it's useful for tracking page views and storing other default 
information. Check out `/example` for demo.

---
```js
/*
* Registers GTM data
*
* @param {object} data
* @returns {bool} `true` on success and `false` on failure
*/
registerGTMdata(data)

// e.g.: registerGTMdata({ event: `click` })
```
Doesn't do anything if tracking hasn't been accepted by user.

---
```js
/*
* Gets registered GTM data
* @returns {array}
*/
registeredGTMdata()
```
---
```js
/*
* Registers GA data
*
* @param {array} data
*/
runGAcommand(data)

// e.g.: runGAcommand([`send`, `event`, `click`, `download-me`, { transport: `beacon` }])

// All options available at
//   https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#general
```
Doesn't do anything if tracking hasn't been accepted by user.

## Local development and testing

`$ yarn dev` or `$ yarn build`

## TODO

- [ ] Implement async callback functions, e.g.: `initCb()`.
- [ ] Support multiple trackers
- [x] Support Google Analytics
