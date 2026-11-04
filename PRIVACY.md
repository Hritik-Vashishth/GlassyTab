# Privacy

GlassyTab 0.4.2 stores selected wallpapers in local IndexedDB and appearance preferences in local storage under its extension origin. They are not synced by GlassyTab. Color analysis and browser-theme ZIP generation happen locally.

The extension requests access to `https://suggestqueries.google.com/*`. While you type, it sends your query to Google's suggestion service. When you submit a search, the browser navigates to Google Search with your query. Google's handling of these requests is governed by Google's policies. GlassyTab is therefore not fully offline.

GlassyTab has no developer-operated server, analytics, accounts, advertising integration or paid API. It does not send wallpapers to Google for suggestions or searches. Generated theme ZIPs contain color definitions, not your wallpaper file.

Uninstalling the extension can remove local data. Retain your original images separately. To remove an exported Chrome theme, use Chrome's Appearance settings; its installed colors are separate from extension-local wallpaper data.
