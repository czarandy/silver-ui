// Installs @js-temporal/polyfill as the global `Temporal` where the runtime has
// none (Safari, Node). This is the same snippet the README's "Temporal"
// section tells apps to use, so the repo exercises it: the test setup,
// Storybook and the docs site import this file. Not part of the package.
if (!('Temporal' in globalThis)) {
  const polyfill = await import('@js-temporal/polyfill');
  Object.assign(globalThis, {Temporal: polyfill.Temporal});
  // Lets Intl.DateTimeFormat#format accept the polyfill's Temporal objects.
  Object.assign(Intl, {DateTimeFormat: polyfill.Intl.DateTimeFormat});
}

export {};
