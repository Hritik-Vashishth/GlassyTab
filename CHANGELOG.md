# Changelog

## 0.4.2

- Renamed the project GlassyTab.
- Expanded engineering, compatibility and release documentation.
- Added five real product screenshots to the README.
- Added automated source, screenshot-reference, theme-ZIP and packaging checks through `check-project.cjs` and GitHub Actions.


## 0.4.1

- Removed Restore original wallpaper at the user's request.
- Made uploads await image rendering and recover the file picker after errors.
- Clear the file input so the same image can be selected again.
- Clarified the 25 MiB wallpaper limit. The reported 30 MB+ upload failure was due to this limit; it was not evidence that Restore caused the failure.

## 0.4.0

- Added matching Chrome theme ZIP export and a browser color preview.
- Documented the separate manual installation required for browser themes.

## 0.3.0

- Added local wallpaper uploads and wallpaper-derived page colors.
- Added settings for automatic palette matching.

## 0.2.0

- Added settings for wallpaper fit and glass transparency.
- Added Google suggestions with keyboard navigation.
- Kept the extension's own new-tab layout free of bottom branding. Chrome's own footer remains controlled by Chrome settings.
