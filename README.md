# Eddy Ramos, portfolio

My personal portfolio, plus the projects it links to. The portfolio itself and
most of the demos are plain HTML, CSS and JavaScript with no build step, so you
can open `index.html` in a browser and it works. `store/` is the exception: it
is a React and TypeScript app built with Vite.

**Live site:** [eddy-dev.netlify.app](https://eddy-dev.netlify.app)

## Running it locally

Open `index.html` directly, or serve the folder so the project links resolve the
same way they do in production:

```bash
npx serve .
```

The store has its own dev server:

```bash
cd store && npm install && npm run dev
```

Its build output is committed to `store/dist` because the site is hosted as a
plain static folder with nothing to build on deploy. `netlify.toml` maps
`/store/*` onto that output so the app's own routes work on a refresh.

## What is in here

| Folder | Project | Built with |
| --- | --- | --- |
| `store/` | KINETA, a sportswear storefront with a catalogue, cart, wishlist and checkout | React, TypeScript, Vite, Tailwind, GSAP, Framer Motion, Three.js, Zustand |
| `sports/` | Momentum Athletics, a five page community sports club site | HTML, CSS, JS |
| `to-do list/` | Task Dashboard, a task manager with search, filters and localStorage | HTML, CSS, JS |
| `barbershop/` | Leland Barbers, a barbershop site with before and after cuts and a scroll driven photo stack | HTML, CSS, JS, GSAP |
| `weather-app/` | Weather App, live data from the OpenWeather API in English and Spanish | HTML, CSS, JS |
| `bjj/` | BJJ Basics, an academy site with a pinned horizontal photo track | HTML, CSS, JS, GSAP |
| `login/` | A sign up and sign in flow backed by localStorage | HTML, CSS, JS |
| `calculator/` | A calculator with history and keyboard input | HTML, CSS, JS |

## Portfolio structure

```
index.html        the whole page
css/style.css     all the styling
js/main.js        theme toggle, mobile menu, scroll reveal, contact form
images/           screenshots and the social preview
netlify.toml      publish settings and cache headers
```

## Notes

- The contact form posts to Formspree. It works without JavaScript too, because
  the `action` and `method` are in the HTML.
- Animations are gated behind `prefers-reduced-motion`.
- The weather app calls the OpenWeather API from the browser, so its API key is
  visible in `weather-app/script.js`. It is a free key, but it should be rotated
  or moved behind a small proxy before this gets much traffic.

## Contact

Looking for a junior front-end role or an internship.
[eddyalejramos@gmail.com](mailto:eddyalejramos@gmail.com) ·
[LinkedIn](https://www.linkedin.com/in/eddy-alejandro-ramos-94610815a/) ·
[GitHub](https://github.com/alejoramos)
