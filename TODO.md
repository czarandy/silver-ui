# TODO

## Button Follow-Ups

- Add a real Silver UI tooltip primitive and replace the temporary native `title` fallback in `Button`.
- Add a shared Spinner component and use it for `Button` loading state instead of the inline CSS spinner.
- Decide whether Button should support link rendering through `LinkProvider` or whether that belongs in a separate link-button component.
- Add ButtonGroup support for shared disabled state, grouped border radii, and separator styling.
- Add edge compensation support for flat/ghost buttons if the layout primitives need flush alignment.
- Revisit button overlay and focus tokens once the Panda theme has dedicated action-state tokens.

## Link Follow-Ups

- Add a real Silver UI tooltip primitive and replace the temporary native `title` fallback in `Link`.
- Decide whether to port the XDS `useLinkify` utility for turning URLs, emails, and custom text patterns into links.
