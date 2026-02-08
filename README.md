# A Curious Critter — Personal Website

A clean, literary personal website with multilingual essays, a quotes collection, and English/Chinese UI toggle.

## Structure

```
├── index.html                          # Home page
├── essays.html                         # Essays listing (dynamic from manifest)
├── quotes.html                         # Quotes & reflections
├── essays/
│   ├── _template.html                  # Template for new essays
│   ├── manifest.json                   # Auto-generated essay index
│   └── *.html                          # Individual essay files
├── css/
│   └── style.css                       # Stylesheet
├── js/
│   └── main.js                         # Language toggle, essay loader, filters
├── build.py                            # Build script (generates manifest)
└── README.md
```

## Writing a New Essay

1. **Copy the template:**
   ```bash
   cp essays/_template.html essays/my-essay-title.html
   ```

2. **Edit the three `<meta>` tags** at the top of the new file:
   ```html
   <meta name="essay-title" content="Your Essay Title">
   <meta name="essay-excerpt" content="A one-sentence summary.">
   <meta name="essay-lang" content="en">   <!-- en, zh, or ja -->
   ```

3. **Set `lang="..."` on the `<article>` tag** to match the essay language.

4. **Write your content** inside the `<article>` tag using standard HTML.

5. **Run the build script** to update the manifest (which generates dates automatically):
   ```bash
   python3 build.py
   ```

6. **Commit and push.** The essays listing page reads from `essays/manifest.json` — you never need to edit `essays.html`.

### Date Handling

Dates are **automatic**. The build script reads git history:
- **Published date** = when the file was first committed
- **Updated date** = when the file was last committed
- If the file hasn't been committed yet, it falls back to the file's modification time

Dates are displayed in the essay's own language format (e.g., "February 2026" for English, "2026年2月" for Chinese).

### Writing Features

**Math** (via KaTeX, loaded automatically on essay pages):
- Inline: `\(E = mc^2\)`
- Display: `$$\int_0^\infty e^{-x^2} dx = \sqrt{\pi}$$`

**Block quotes with citation:**
```html
<blockquote>
  <p>Your quote here.</p>
  <footer>Author, <cite>Source</cite></footer>
</blockquote>
```

**Footnotes:**
```html
<p>A claim.<sup><a href="#fn1" id="fnref1">1</a></sup></p>

<section class="footnotes">
  <ol>
    <li id="fn1">Footnote text. <a href="#fnref1">↩</a></li>
  </ol>
</section>
```

## Adding a Quote

Add a new `<div class="quote-entry">` block in `quotes.html`. Each entry has a `<blockquote>` for the quote and a `.reflection` div for your analysis.

## Language Toggle

Click the 中文/EN button in the navigation. The toggle:
- Switches site chrome (nav, headings, labels) between English and Chinese
- Saves your preference in localStorage
- **Does not** change essay content — each essay stays in its original language and font

## Fonts

| Language | Font | Style |
|----------|------|-------|
| English  | Cormorant Garamond | Classic literary serif |
| Chinese  | Noto Serif SC (思源宋体) | Refined Song/Ming typeface |
| Japanese | Noto Serif JP (思源明朝) | Matching Japanese serif |

Each piece of content uses its language's font via the `lang` attribute, regardless of the site-wide language toggle. Numbers and punctuation also render in the correct font.

## Local Preview

Use a local server (required for the dynamic essay loading):

```bash
python3 -m http.server 8000
```

Or use the **Live Server** extension in VS Code / Cursor.

## Deploy to GitHub Pages

1. Push to GitHub
2. Go to Settings → Pages
3. Select your branch and `/ (root)` folder
4. Your site will be live at `https://yourusername.github.io/repo-name`
