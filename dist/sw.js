// Before Chrome 93, the service worker file must be in the root path.
// https://stackoverflow.com/a/66115801/13151903
try {
  // eslint-disable-next-line no-undef
  importScripts('js/background.js')
} catch (e) {
  // eslint-disable-next-line no-console
  console.error(e)
}
