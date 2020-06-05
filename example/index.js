import TrackingUtil from "../index.js"

const tu = new TrackingUtil({
  services: {
    gtm: {
      id: `GTM-XXXX`,
      dataLayerName: `dataLayer`,
      defaultDataLayer: [{ pageTitle: `Home` }, { event: `pageView` }],
    },
  },
})

const responseEl = document.querySelector(`.consent-response`)
const dialogEl = document.querySelector(`.consent-dialog`)

const displayAccepted = () => {
  responseEl.innerHTML = `
    <p>Tracking accepted:</p>
    <pre>${JSON.stringify(tu.registeredGTMdata())}</pre>
  `
}

const displayDenied = () => {
  responseEl.innerHTML = `<p>Tracking denied</p>`
}

if (!tu.userReacted()) {
  dialogEl.removeAttribute(`hidden`)
} else {
  if (tu.trackingAccepted()) displayAccepted()
  else displayDenied()
}

dialogEl
  .querySelector(`button[data-type="accept"]`)
  .addEventListener(`click`, () => {
    tu.setTrackingAccepted(true)
    dialogEl.setAttribute(`hidden`, ``)
    displayAccepted()
  })

// sets tracking denied on button click
dialogEl
  .querySelector(`button[data-type="deny"]`)
  .addEventListener(`click`, () => {
    tu.setTrackingAccepted(false)
    dialogEl.setAttribute(`hidden`, ``)
    displayDenied()
  })
