# Design Analyzer

Design token analyzer — paste a URL, get a `design.md`.

Extracts colors, typography, spacing, shadows, border radius, breakpoints, and UI components from any website.

## Usage

Open `index.html` in a browser, paste a URL, click **Analyze**.

Requires a backend proxy at `/fetch` that accepts `POST { "url": "..." }` and returns `{ "html": "..." }`.

## Output

Generates a structured `design.md` with:

- **Colors** — brand accent, surfaces, text, borders (semantic labels)
- **Typography** — font family, size hierarchy, weight range
- **Layout** — spacing scale, container widths, breakpoints
- **Elevation** — shadow levels
- **Shapes** — border radius tokens
- **Components** — buttons, inputs, images, nav, footer, modals, tabs
- **Do's & Don'ts** — extracted from the actual design language
- **Responsive** — detected breakpoints

## Author

Tom
