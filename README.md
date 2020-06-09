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
      defaultGAdata: [
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

    window.trackingUtil.registerGAdata([
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
*/
userReacted()
```
---
```js
/*
* Checks if tracking has been accepted by user
*/
trackingAccepted()
```
---
```js
/*
* Sets tracking decision and starts tracking if accepted
*
* @value Boolean
* @options Object
*   @defaultGTMdataLayer Array
*   @defaultGAdata Array
*/
setTrackingAccepted(value, options = {})
```

If tracking was accepted by user the `defaultGTMdataLayer/defaultGAdata` are 
saved in a cookie (Options → `cookie.name`) and the data is automatically 
injected in GTM's data layer every time `TrackingUtil` instance is created. 
Therefore it's useful for tracking page views and storing other default 
information. Check out `/example` for demo.

---
```js
/*
* Registers GTM data
*
* @data Object
*/
registerGTMdata(data)

// e.g.: registerGTMdata({ event: `click` })
```
---
```js
/*
* Gets registered GTM data
*/
registeredGTMdata()
```
---
```js
/*
  * Registers GA data
  *
  * @data Array
  */
registerGAdata(data)

// e.g.: registerGAdata([`send`, `event`, `click`, `download-me`, { transport: `beacon` }])
```

## Local development and testing

`$ yarn dev` or `$ yarn build`

## TODO

- [ ] Implement async callback functions, e.g.: `initCb()`.
- [ ] Support multiple trackers
- [x] Support Google Analytics
