from pathlib import Path
import zipfile
root = Path(__file__).resolve().parent
out = root / "dist"
out.mkdir(exist_ok=True)
files = ["manifest.json", "newtab.html", "newtab.js", "style.css", "appearance.js", "options.html", "options.js", "options.css", "theme-export.js", "wallpaper.png", "README.md", "PRIVACY.md", "LICENSE", "ASSETS.md", "CHANGELOG.md", "DEVELOPMENT.md"]
with zipfile.ZipFile(out / "GlassyTab.zip", "w", zipfile.ZIP_DEFLATED) as archive:
    for name in files:
        archive.write(root / name, "GlassyTab/" + name)
print(out / "GlassyTab.zip")
