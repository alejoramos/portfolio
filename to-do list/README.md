# Task Dashboard

A task manager that keeps its list in the browser. Plain HTML, CSS and
JavaScript, with no framework, no build step and no dependencies, so opening
`index.html` in a browser is all it takes to run it.

**Live:** [eddy-dev.netlify.app/to-do list](https://eddy-dev.netlify.app/to-do%20list/index.html)

## What it does

- Each task carries a title, a person, a due date, a priority, a category and
  notes.
- Search runs across the title, the person, the category and the notes at the
  same time, not just the title.
- Filter by status and by priority, and sort by date, priority or name.
- Counters for total, pending, completed and overdue, plus a progress figure
  that follows the list as it changes.
- A task can be opened in Google Calendar or Outlook as a prefilled event, with
  the person, priority, category and notes carried into the description.

## How it is put together

Tasks live in one array. The list on screen is drawn from that array again each
time something changes, and the array is written to `localStorage` so it is
still there on the next visit.

Search, status filter, priority filter and sort run in sequence over that array
before anything is rendered. Because each is separate, another filter can be
added without touching the ones already there.

## Overdue

Overdue is not stored on the task. `isOverdue()` compares the task's due date
with today's date every time the list is drawn:

```js
const dueDate = new Date(`${task.date}T00:00:00`);
return dueDate < today;
```

A task therefore becomes overdue on its own once the date passes, with nothing
having to run to update it. Storing a flag instead would leave a task marked on
time until something explicitly changed it.

## Files

```
index.html    markup and the form
style.css     all the styling
script.js     state, rendering, filtering, sorting and the calendar links
```
