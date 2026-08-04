# Eddy Ramos, portfolio

My personal portfolio, plus the seven projects it links to. Everything here is
plain HTML, CSS and JavaScript. There is no build step and no dependencies, so
you can open `index.html` in a browser and it works.

**Live site:** add your Netlify URL here once it is deployed.

## Running it locally

Open `index.html` directly, or serve the folder so the project links resolve the
same way they do in production:

```bash
npx serve .
```

## What is in here

| Folder | Project | Built with |
| --- | --- | --- |
| `sports/` | Momentum Athletics, a five page community sports club site | HTML, CSS, JS |
| `to-do list/` | Task Dashboard, a task manager with search, filters and localStorage | HTML, CSS, JS |
| `barbershop/` | Elite Cuts, a dark barbershop landing page with a mobile menu | HTML, CSS, JS |
| `weather-app/` | Weather App, live data from the OpenWeather API in English and Spanish | HTML, CSS, JS |
| `BJJ/` | BJJ Basics, a gym landing page with a carousel written from scratch | HTML, CSS, JS |
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
[GitHub](https://github.com/alejoramos)
