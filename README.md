# TaskFlow

TaskFlow is a React project-management demo based on the TaskFlow capstone in the
Advanced React Web Development guide. Use it to organize projects on kanban boards,
create and edit tasks, filter work by assignee, and save appearance preferences.
The app demonstrates feature-based React architecture, routing, form validation,
query caching, and optimistic task updates.

The project was built from the
[Advanced React Web Development — The Complete Guide](<./Advanced React Web Development — The Complete Guide.md>).

## Run locally

```sh
npm install
npm run dev
```

Sign in with any valid email address. This is a browser-only demo: session, project,
task, and preference data are saved in local storage. It does not provide production
authentication, an API server, or server-sent events. Tasks can be dragged between
columns or moved with the accessible status selector.

## Checks

```sh
npm run build
npm run lint
npm run test
```
