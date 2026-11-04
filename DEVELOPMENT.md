# Development and engineering notes

## Stack and scripts

Plain JavaScript, HTML and CSS; Chrome Manifest V3. No framework, bundler, transpiler or paid API. `appearance.js` opens IndexedDB, decodes images and samples a 48 × 48 canvas to derive a palette. `options.js` validates uploads and manages settings. `newtab.js` debounces suggestion requests, cancels stale requests and handles keyboard selection. `theme-export.js` generates a theme manifest and an uncompressed ZIP with CRC32 checksums locally.

Python's standard-library `zipfile` packages the release. Node's `--check` checks JavaScript syntax. Development regression checks used Node VM with mocked DOM/storage services for upload recovery, plus Python ZIP/JSON validation and contrast calculations for generated themes. These checks do not replace live Chrome testing.

## Challenges and decisions

- **Chrome footer:** the browser adds an extension attribution and Customize Chrome button. Removing HTML branding cannot hide browser-owned UI. Users hide it through Chrome's footer setting; no flags are required.
- **Browser colors:** a new-tab extension cannot use page CSS to recolor browser chrome. A separately installed theme carries the generated colors. Changing wallpaper requires exporting and installing a new theme.
- **Monochrome artwork:** white can become the sampled accent, producing grey surfaces instead of pitch black. The separate pitch-black theme is the explicit workaround; automatic palette extraction has not been changed to guarantee black for monochrome images.
- **Large files:** uploads over 25 MiB are rejected. A reported failure after restoring the original image was subsequently traced to a 30 MB+ upload, not proven to be a restore bug. Restore was removed at the owner's request.
- **Upload lifecycle:** validation completes before storage; image rendering is awaited; the picker is cleared for same-file retries and re-enabled in a finally block.
- **Persistence:** wallpapers use IndexedDB rather than localStorage size-limited strings. Preferences use localStorage; storage events refresh other open extension pages.
- **Suggestions:** typed queries leave the device for Google's suggestion service. Debouncing and cancellation reduce stale results, not that privacy tradeoff.

## Compatibility and remaining validation

Targets desktop Chrome with Manifest V3. No claim is made for every Chrome version, every Chromium-derived browser, mobile Chrome, or every OS. User testing reported the core workflow working; exact Chrome version and OS were not recorded. Browser rendering and unpacked theme installation still need a recorded version/OS test matrix before broad compatibility claims.

Screenshots must be actual captures, with browser version, OS and capture date recorded. Do not substitute artwork or mockups for product screenshots.

## Release checklist

- Run syntax checks on all JavaScript files.
- Load unpacked in current desktop Chrome and record version/OS.
- Upload two different images, retry the same image, reject an oversized image, then successfully upload a valid image.
- Reopen a tab and verify persistence, transparency, each fit mode and palette changes.
- Test suggestion navigation, dismissal, click and Enter submission.
- Install the exported browser theme and check text readability.
- Hide the Chrome footer and capture new-tab and settings screenshots.
- Review ZIP contents for personal data, temporary files and stale names.
