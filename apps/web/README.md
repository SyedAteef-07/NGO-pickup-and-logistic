# AaharaConnect — Volunteer Management

A frontend prototype for an NGO coordinator managing volunteers, teams, availability and food rescue assignments. Events, drivers and vehicles are included only as assignment support data.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. Use `npm run build` to run TypeScript checks and create a production build.

The prototype uses React state and fictional mock data. Changes made during a demo last for the current browser session; refreshing returns to the original sample data. Use the **English | ಕನ್ನಡ** switch in the top bar to change the interface language; the language choice is remembered in this browser.

For the UI regression checks, run `npm run test:smoke` and `npm run check:i18n`.

## Suggested class demo

Open **Dashboard**, choose **Create Assignment** for the Sharma Wedding pickup, select **Team Alpha**, **Ramesh Kumar**, and **Van 02**, review the details, then create the assignment. The new record appears at the top of **Assignments** with a Pending status.
