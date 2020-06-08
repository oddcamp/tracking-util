# Kollegorna Tracking Utility

GDPR compiliant tracking.

## Supported services

- Google Tag Manager

## Example code

```js
import TrackingUtil from "@kollegorna/tracking-util"

// automatically inserts scripts and starts tracking if tracking has been
// previously accepted by user
const tu = new TrackingUtil({
  services: {
    gtm: {
      id: `GTM-XXXX`,
      dataLayerName: `dataLayer`,
    },
  },
})

// displays cookie consent dialog if user hasn't already made a decision
if (tu.userReacted()) {
  document.querySelector(`.consent-dialog`).removeAttribute(`hidden`)
}

// sets tracking accepted on button click
document
  .querySelector(`.consent-dialog button[data-type="accept"]`)
  .addEventListener(`click`, () => 
    tu.setTrackingAccepted(true, [{ event: `pageView` }])
  )

// sets tracking denied on button click
document
  .querySelector(`.consent-dialog button[data-type="deny"]`)
  .addEventListener(`click`, () => tu.setTrackingAccepted(false))
```

Once `TrackingUtil` instance is created it also becomes accessible via
`window.trackingUtil`, e.g.:

```js
if (typeof window.trackingUtil !== `undefined`) {
  console.log(window.trackingUtil.trackingAccepted())
}
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

      /* Data layer name. Usually it's `dataLayer` */
      dataLayerName: `dataLayer`,
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

```js
/*
* Checks if tracking has been accepted by user
*/
trackingAccepted()
```

```js
/*
* Sets tracking decision and starts tracking if accepted
*
* @value Boolean
* @options Object
*   @defaultGTMdataLayer Array
*/
setTrackingAccepted(value, options = {})

// e.g.: setTrackingAccepted(true, [{ pageTitle: `Home` }, { event: `pageView` }])
```

Is tracking was accepted by user the `defaultGTMdataLayer` is saved in a cookie (Options → `cookie.name`) and the data is automatically injected in GTM's data layer every time `TrackingUtil` instance is created. Therefore it's useful for tracking page views and storing other default information. Check out `/example` for demo.

```js
/*
* Registers GTM data
*
* @data Object
*/
registerGTMdata(data)

// e.g.: registerGTMdata({ event: `click` })
```

```js
/*
* Get registered GTM data
*/
registeredGTMdata()
```

## Local development and testing

`$ yarn dev` or `$ yarn build`

## TODO

- [ ] Implement async callback functions, e.g.: `initCb()`.
- [ ] Support multiple trackers
- [ ] Support Google Analytics
