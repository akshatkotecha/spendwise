# SpendWise — Expense & Budget Management System

MERN mini-project: **M**ongoDB (Mongoose) · **E**xpress · **R**eact (Vite) · **N**ode.js, styled with Bootstrap 5.

## Features
- Home (landing) page
- 4 validated forms: **Register**, **Login**, **Add/Edit Expense**, **Set Budget** (client-side + server-side validation)
- JWT authentication, bcrypt-hashed passwords
- Expense CRUD with search / category / month filters
- Monthly budgets per category with live progress bars
- Dashboard with totals and category breakdown

## Run locally (no MongoDB install needed)
```
npm run build            # installs deps and builds the client
npm run dev:server       # API + in-memory MongoDB + built site at http://localhost:5000
```
Or for hot reload: run `npm run dev:server` in one terminal and `npm run dev:client` in another (http://localhost:5173).

## Deploy (MongoDB Atlas + Render, both free)
1. **Database** — create a free cluster at https://www.mongodb.com/atlas, add a database user, allow network access `0.0.0.0/0`, and copy the connection string (append `/spendwise`).
2. **Code** — push this folder to a GitHub repository.
3. **Web service** — on https://render.com choose *New → Blueprint*, select the repo (uses `render.yaml`), and set `MONGODB_URI` to the Atlas string. `JWT_SECRET` is generated automatically.
4. After the build finishes, open the `https://spendwise-xxxx.onrender.com` URL.

Environment variables: `MONGODB_URI`, `JWT_SECRET`, `PORT` (set by Render).
