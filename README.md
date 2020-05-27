# Kollegorna Tracking Utility

A utility library to inject gtm and track views/events

Example code

```
// Startup script
const tracking = new TrackingUtil()

// Check if the modal should be shown or not (CookieConsent)
tracking.modalEnabled()

// Enable tracking (and inject gtm) and set what categories was checked
tracking.setTrackingAccepted(true, {performance: true, marketing: true, analytics: false})

```
