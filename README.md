# Kuuruprasath Nelamurthi: Portfolio Website

A static site (plain HTML, CSS and JavaScript; no build step). It's set up to be hosted on GitHub Pages at
**https://kuuruprasath.github.io/**.

```
index.html              the whole site (all content and SEO tags live here)
404.html                "page not found" page
robots.txt, sitemap.xml tell search engines what to index
site.webmanifest        app name and icons for phones
assets/css/style.css    all styling (light theme, fluid sizing for phones up to 4K)
assets/js/main.js       animations, smooth scrolling, menu, case studies, contact form
assets/lib/             GSAP, ScrollTrigger and Lenis (animation libraries, stored locally)
assets/img/             project and client screenshots (WebP)
assets/resume/          the two downloadable resume PDFs
assets/og-image.png     preview image shown when the link is shared on LinkedIn
```

## 1. Put it online (GitHub Pages)

1. Sign in to GitHub as **Kuuruprasath** and create a **public** repository named exactly
   `kuuruprasath.github.io`. The name has to match your username for the address to work.
2. Upload every file and folder in this directory to it, including the empty `.nojekyll` file.
   (You can drag and drop them with **Add file → Upload files**. You don't need to upload the `.claude` folder.)
3. Go to **Settings → Pages**, and under **Build and deployment** pick **Deploy from a branch**, then `main` / `root`.
4. After about a minute the site will be live at https://kuuruprasath.github.io/

## 2. Link it from LinkedIn (backlinks and SEO)

Search engines connect the site and your LinkedIn profile through links in both directions. The site already links
to LinkedIn (with `rel="me"` and in its structured data). To finish the loop:

- **LinkedIn → Edit contact info → Website**: add `https://kuuruprasath.github.io/` and choose type *Portfolio*.
- **LinkedIn → Add section → Featured → Add a link**: paste the URL. LinkedIn will show the preview card
  (`assets/og-image.png`).
- Mention the URL in your LinkedIn **About** section and in your resume header.
- **GitHub → Your profile → Edit profile → Website**: add the same URL.
- Optional: in **Google Search Console** (search.google.com/search-console), add the property
  `https://kuuruprasath.github.io/`, verify it, then submit `sitemap.xml`. This gets you indexed faster.

To check the LinkedIn preview card, paste the URL into https://www.linkedin.com/post-inspector/

## 3. Contact form (Formspree)

The form sends to `https://formspree.io/f/xzeeowvb`. The first time someone submits it, Formspree may ask you to
confirm the form by email. After that, messages go straight to your inbox. In the Formspree dashboard you can
also limit the form to your domain (`kuuruprasath.github.io`) to cut down on spam.

## 4. Updating things later

- **Resume**: replace the PDFs in `assets/resume/` and keep the same file names, so the buttons keep working.
- **Text**: edit `index.html`. Each section is marked with a comment like `<!-- ===== EXPERIENCE ===== -->`.
- After big content changes, update `<lastmod>` in `sitemap.xml` and `dateModified` in `index.html`.
- If you change `style.css` or `main.js`, also change the `?v=...` at the end of their links in `index.html`
  (for example `?v=20261106b` → `?v=20261201`). That makes visitors' browsers load the new version
  instead of an old saved copy.

## Notes

- If a visitor has "reduce motion" turned on in their device settings, the site skips the animations.
- If JavaScript fails to load, everything is still visible and readable.
