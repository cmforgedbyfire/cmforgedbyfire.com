CarTrev Towers one-level browser trial

This source belongs to the website repo. It is based on the local Pocket renderer and simulation, isolated here so building the browser demo does not modify Android or Windows releases. Native navigation is disabled and the only playable map is Iron Switchback.

Build from this directory:
  npm ci
  npm run build
  npm test
  node tests/browser.mjs

Node 24 is used by the TypeScript unit tests. Browser checks use installed Microsoft Edge through Playwright. Test output stays in ignored test-results/. The build copies only HTML and hashed bundles into ../../play/cartrev-towers. Existing hashed bundles are retained for cached pages. Static artwork, audio and map data live in that public directory.

Placement uses the Windows 1.3.5/catalog 83 Iron Switchback scenery and tower-base footprints. New towers store x/y coordinates; old browser saves keep their original site indices and positions. Upgrades retain the original placement footprint. Browser balance remains thirteen waves with six tower choices.

Publishing follows this website's existing main-branch GitHub Pages workflow. Commit only this tool and play/cartrev-towers changes, push main, then verify the deployed trial. Do not sync the Android app or create a release branch for this web-only update.
