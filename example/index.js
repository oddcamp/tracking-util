import TrackingUtil from "../index.js"

const tu = new TrackingUtil({
  services: {
    gtm: {
      id: `GTM-XXXX`,
      dataLayerName: `dataLayer`,
    },
  },
})

const responseEl = document.querySelector(`.consent-response`)
const dialogEl = document.querySelector(`.consent-dialog`)
const dummyBtnEl = document.querySelector(`.dummy-btn`)

const displayAccepted = () => {
  dummyBtnEl.removeAttribute(`hidden`)

  responseEl.innerHTML = `
    <p>Tracking accepted:</p>
    <pre style="white-space: pre-line;">
      ${JSON.stringify(tu.registeredGTMdata())}
    </pre>
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
    const defaultGTMdataLayer = [{ pageTitle: `Home` }, { event: `pageView` }]

    if (dialogEl.querySelector(`input[name="performance"]`).checked)
      defaultGTMdataLayer.push({ event: `trackingCategory:performance` })

    if (dialogEl.querySelector(`input[name="marketing"]`).checked)
      defaultGTMdataLayer.push({ event: `trackingCategory:marketing` })

    if (dialogEl.querySelector(`input[name="analytics"]`).checked)
      defaultGTMdataLayer.push({ event: `trackingCategory:analytics` })

    tu.setTrackingAccepted(true, { defaultGTMdataLayer })

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

dummyBtnEl.addEventListener(`click`, () => {
  tu.registerGTMdata({
    event: `buttonClick`,
    eventCategory: `Homepage`,
    eventLabel: dummyBtnEl.innerText,
  })

  displayAccepted()
})
