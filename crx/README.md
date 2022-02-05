# Wordler Browser Extension

This extension was designed to work in CHrome, but likely works in Firefox and Edge with a little tweaking.

### Setup

run `yarn` or `npm i` to install npm dependencies

Change `crx/source/customizable/solver.ts` to import / export your Solver and Recommendation types.

run `npm start` to start compilation

Open `chrome://extensions/` in Chrome

Make sure `Developer Mode` is enabled

Click `Load unpacked`

Navigate to this directory (including the `crx` path)

Confirm

Navigate your browser to `https://www.powerlanguage.co.uk/wordle/`

Confirm that recommendation cards are being rendered on the right side of the screen

### Customization

Some developers may have different properties on their recommendations, and want to show those on the cards.

Editing `RecommendationCard.tsx` is likely the first stop and easiest way to get custom information about a recommendation onto the Wordle page.

Take care when editing any files not under the `customizable/` folder, as these were not designed with extensibility in mind.