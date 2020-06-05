# Kollegorna Tracking Utility

GDPR compiliant tracking.

## Currently supported services

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
  .addEventListener(`click`, () => tu.setTrackingAccepted(true))

// sets tracking denied on button click
document
  .querySelector(`.consent-dialog button[data-type="deny"]`)
  .addEventListener(`click`, () => tu.setTrackingAccepted(false))
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
*/
setTrackingAccepted(value)

// e.g.: setTrackingAccepted(true)
```

```js
/*
* Registers GTM data
*
* @data Object
* @options Object
*   @defaultGTMdataLayer Array
*/
registerGTMdata(data, options = {})

// e.g.: registerGTMdata({ event: `click` })
```

```js
/*
* Get registered GTM data
*/
registeredGTMdata()
```

All the methods above are available as external imports, e.g.:

```js
import { registeredGTMdata } from "@kollegorna/tracking-util"

console.log(registeredGTMdata)
```

## Local development and testing

`$ yarn dev` or `$ yarn build`
