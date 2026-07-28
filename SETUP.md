# Setup — what to download after cloning

This is a **Vite + TypeScript** app. After you `git clone` (or download) the repo,
here's everything you need to get it running.

## 1. Install Node.js (includes npm)

You need **Node.js 18 or newer** (this bundles `npm`, the package manager).

- Download: <https://nodejs.org> — grab the **LTS** installer for your OS.
- Verify it's installed:

  ```bash
  node -v   # should print v18.x or higher
  npm -v    # should print a version number
  ```

macOS users can alternatively use Homebrew:

```bash
brew install node
```

That's the only thing you have to install by hand. Everything else is pulled in
by `npm install` below.

## 2. Install the project dependencies

From the project folder (the one with `package.json`):

```bash
npm install
```

This downloads the dev dependencies listed in `package.json` — **Vite** and
**TypeScript** — into a local `node_modules/` folder. You do **not** install
these globally; they live inside the project. (`node_modules/` is not committed
to Git, which is why you must run this after cloning.)

## 3. Make sure the data and map image are present

- **`data/*.csv`** — the five sensor files. These are committed, so cloning gets
  them automatically. The app reads them at build time.
- **`public/map.jpg`** — the campus map background. If this file didn't come with
  the clone (large binaries are sometimes excluded), save your campus screenshot
  as `public/map.jpg`. Without it the markers still appear, just over a blank
  placeholder. To use a different filename, edit `MAP_SRC` in `src/main.ts`.

## 4. Run it

```bash
npm run dev
```

Open the URL it prints (default <http://localhost:5173>). The dev server
hot-reloads when you edit files.

To make a production build instead:

```bash
npm run build      # outputs static files to dist/
npm run preview    # serves the built dist/ locally to check it
```

## Summary

| Thing | How to get it | Committed to repo? |
|-------|---------------|--------------------|
| Node.js + npm | Install once from nodejs.org | n/a (system tool) |
| Vite, TypeScript | `npm install` | No — `node_modules/` is generated |
| CSV data | Comes with the clone | Yes |
| `public/map.jpg` | Comes with clone, or add your own | Maybe — verify after cloning |
