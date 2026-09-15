# Alpha iStore Migration Report

**Project:** Alpha iStore e-commerce application  
**Repository:** `alphaistore/alpha_istoregh`  
**Report status:** Migration completed; frontend rendering issue remains under investigation  
**Production environment:** Vercel frontend + Render backend + MongoDB Atlas

## Executive Summary

Alpha iStore was migrated from the former `alpha istore` GitHub account to the `alphaistore` account and deployed as a split full-stack application. The Next.js frontend is deployed to Vercel, the Express.js API is live on Render, and the database has been moved to a new MongoDB Atlas free-tier cluster after the original cluster became unresponsive.

The backend is operational and connected to the new database. The frontend production deployment completed successfully with 28 pages built. The remaining issue is a white screen when the frontend is run locally. This is currently classified as a frontend runtime or configuration issue rather than an infrastructure or database migration failure. Integration between the frontend and backend has been established, but the user interface is not yet rendering reliably in the affected local environment.

## 1. What Was Accomplished

### Source control migration

- Transferred the project from the old Alpha iStore GitHub account to the new `alphaistore` account.
- Confirmed the target repository as `alphaistore/alpha_istoregh`.
- Preserved the monorepo structure containing:
  - `frontend/`: Next.js application.
  - `backend/`: Express.js API.
- Retained the existing MongoDB and Cloudinary integration model.

### Frontend deployment

- Deployed the Next.js frontend to Vercel.
- Production URL: <https://alphaistoregh-one.vercel.app/>
- Environment: Production.
- Build result: 28 pages built successfully.
- Configured the frontend API URL to point to the Render backend.
- Configured the Cloudinary cloud name for frontend image-related functionality.

### Backend deployment

- Deployed the Express.js API to Render.
- Production URL: <https://alpha-istoregh-eoui.onrender.com>
- Runtime: Node.js running Express.js.
- Status: Live and connected to MongoDB Atlas.
- Configured the production MongoDB connection through Render environment variables.

### Database migration

- Retired the old MongoDB Atlas cluster at `cluster0.hi4mivb.mongodb.net` after repeated connection timeouts and the inability to obtain a usable backup.
- Provisioned a fresh MongoDB Atlas free-tier cluster at `cluster0.14wybkj.mongodb.net`.
- Created and configured the database user `alpha`.
- Selected the GCP Iowa region, `us-central1`.
- Connected the Render backend to the new cluster using `MONGODB_URI`.
- Confirmed that the new database is accessible to the deployed backend.

### Environment configuration

The required deployment variables were configured across the hosting platforms:

| Variable | Platform | Purpose |
|---|---|---|
| `MONGODB_URI` | Render | Connects the Express backend to MongoDB Atlas |
| `NEXT_PUBLIC_API_URL` | Vercel | Points the frontend to the Render API |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Vercel | Enables Cloudinary-aware frontend behavior |

Secrets were configured as platform environment variables rather than embedded in the repository.

## 2. Services Now in Use

| Layer | Service | Current endpoint / location | Status |
|---|---|---|---|
| Source control | GitHub | `alphaistore/alpha_istoregh` | Active |
| Frontend hosting | Vercel | <https://alphaistoregh-one.vercel.app/> | Deployed; rendering issue remains to be resolved |
| Backend hosting | Render | <https://alpha-istoregh-eoui.onrender.com> | Live and operational |
| Database | MongoDB Atlas | `cluster0.14wybkj.mongodb.net` | Connected and accessible |
| Media | Cloudinary | Configured through environment variables | Configured |

The application architecture is therefore:

```text
Browser
  |
  v
Vercel / Next.js frontend
  |
  | HTTPS API requests
  v
Render / Express.js backend
  |
  v
MongoDB Atlas

Frontend and backend media operations use Cloudinary where configured.
```

## 3. Migration Timeline

Exact calendar dates were not provided, so the timeline below records the migration sequence without inventing dates.

### Phase 1: Repository migration

- Identified the existing Alpha iStore codebase.
- Migrated the GitHub project from the old account to `alphaistore`.
- Confirmed the target repository: `alphaistore/alpha_istoregh`.
- Reviewed the monorepo's separate frontend and backend deployment requirements.

### Phase 2: Database recovery and replacement

- Investigated connectivity to the original MongoDB cluster.
- Encountered connection timeouts and determined that the old cluster was not reliably reachable.
- Attempted recovery and backup assessment; no usable backup could be obtained.
- Created a fresh MongoDB Atlas free-tier cluster in GCP Iowa (`us-central1`).
- Created the `alpha` database user and updated the backend connection configuration.

### Phase 3: Backend deployment

- Configured Render environment variables, including `MONGODB_URI`.
- Deployed the Express.js server on Node.js.
- Verified that the backend is live and connected to the replacement MongoDB Atlas cluster.

### Phase 4: Frontend deployment

- Configured Vercel environment variables, including `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`.
- Built and deployed the Next.js frontend.
- Confirmed that the production build completed successfully with 28 pages.

### Phase 5: Integration validation

- Established the frontend-to-backend API relationship between Vercel and Render.
- Identified runtime 404 behavior during deployment troubleshooting.
- Identified a remaining white-screen problem when the frontend is run locally.
- Classified the remaining work as frontend runtime/rendering validation.

## 4. Challenges Encountered

- The original MongoDB cluster was unresponsive and timed out during connection attempts.
- Network, ISP, or firewall restrictions affected MongoDB connectivity.
- Environment variables had to be configured consistently across GitHub, Vercel, Render, and MongoDB Atlas.
- The monorepo required separate build, start, root-directory, and environment settings for the frontend and backend.
- Runtime 404 errors appeared during Vercel deployment troubleshooting.
- The production frontend completed its build, but a white screen remains when the frontend is run locally.

## 5. Outstanding Issues and Risk Assessment

### Frontend white screen

**Status:** Open; high priority for user-facing validation.

A successful Vercel build proves that the application compiles, but it does not prove that every page can hydrate and render in the browser. The local white screen is most likely caused by one of the following:

- A client-side JavaScript exception during application startup.
- A missing or incorrectly named public environment variable.
- A frontend API request or configuration path that is evaluated before rendering.
- A browser-only API being accessed during server-side rendering or hydration.
- A route or import mismatch that is not caught by the production build.
- A stale `.next` build, dependency installation, or local port/process conflict.

### Deployment/runtime 404s

**Status:** Previously encountered; requires regression verification.

Every production route and API route should be checked after the white-screen fix. A successful homepage response alone does not verify dynamic product, authentication, order, or admin routes.

### Database continuity

**Status:** Operational, with data-loss risk from the original cluster failure.

The new cluster is fresh because the old cluster could not be backed up. Existing production records should therefore be treated as unavailable unless they were recreated or restored from another source.

### Operational observability

**Status:** Improvement recommended.

The migration is functional, but production troubleshooting will be slower without centralized logs, uptime monitoring, database alerts, and error tracking.

## 6. Next Steps to Resolve the Frontend Rendering Issue

Perform these steps in order so the first failing layer is identified quickly.

### Step 1: Reproduce with a clean local frontend start

From the repository root:

```powershell
cd frontend
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm install
npm run dev
```

Open `http://localhost:3000` and inspect the browser DevTools **Console**. The first red exception is the primary diagnostic signal; later errors may be cascading failures.

### Step 2: Verify the frontend API variable

The frontend should use the deployed API in production and a reachable local API during local development. Confirm the variable name used by the application matches the configured variable exactly:

```env
NEXT_PUBLIC_API_URL=https://alpha-istoregh-eoui.onrender.com/api
```

If the application reads `NEXT_PUBLIC_API_ENDPOINT` instead, configure that name as well or standardize the code and deployment settings to one variable name. Do not expose secrets through `NEXT_PUBLIC_*` variables.

### Step 3: Test the backend independently

Check the Render health endpoint directly:

```text
https://alpha-istoregh-eoui.onrender.com/api/health
```

Expected result is a successful JSON response from the Express API. Then test one read-only product endpoint and inspect the browser Network tab for its status, response body, and CORS headers.

### Step 4: Separate rendering failures from API failures

Temporarily determine whether the homepage fails before or after data loading:

- If the page is blank and the Console contains an exception before any request, fix the component/import/runtime exception first.
- If the page shell renders but product content fails, fix the API URL, CORS policy, response shape, or loading/error state.
- If the request is blocked by CORS, verify the backend allows both `http://localhost:3000` and `https://alphaistoregh-one.vercel.app`.
- If the request returns `404`, verify the frontend path includes the backend's `/api` prefix exactly once.
- If the request returns `5xx`, inspect Render logs and the backend route/controller.

### Step 5: Check production browser errors

Open the Vercel URL in a private browser window and inspect:

- Console exceptions.
- Failed JavaScript chunks.
- Failed API requests.
- Hydration warnings.
- Network redirects or 404 responses.

This distinguishes a local-only issue from a deployed frontend issue. Record the first failing URL and status code before changing configuration.

### Step 6: Verify Vercel project settings

Confirm the Vercel project configuration:

- Framework preset is Next.js.
- Root directory points to `frontend`.
- Build command is appropriate for the frontend package.
- Install command runs in the frontend directory or from the monorepo configuration.
- Production environment variables are present and have the expected names.
- A new deployment was triggered after changing environment variables.

### Step 7: Retest representative routes

After the fix, validate at least:

- Homepage.
- Shop/product listing.
- Product detail route.
- Login and signup.
- Cart and checkout.
- Order confirmation or tracking.
- Admin login and one protected admin page.

Use a clean browser session to avoid stale local storage or authentication state hiding the result.

## 7. Recommendations for Production

### Security

- Rotate any credentials that may have appeared in local files, shell history, logs, or screenshots.
- Use long, unique secrets for `JWT_SECRET` and `SESSION_SECRET`.
- Keep MongoDB Atlas network access restricted to the required Render egress strategy where practical; avoid broad `0.0.0.0/0` access as a permanent setting.
- Use a least-privilege MongoDB user for the application instead of an administrative account.
- Confirm production cookies use `secure: true`, `httpOnly: true`, and an appropriate `sameSite` policy.
- Keep Cloudinary and email credentials server-side; only publish the Cloudinary values explicitly intended for browser use.

### Reliability and backups

- Configure scheduled MongoDB Atlas backups or periodic exports before accepting important customer data.
- Document the restore procedure and test it against a non-production database.
- Add uptime monitoring for the Render health endpoint and Vercel homepage.
- Configure Render log retention and an error tracking service such as Sentry.

### Deployment quality

- Add CI checks for frontend build, linting, backend tests, and environment validation.
- Use separate development, staging, and production environment variables.
- Pin and regularly audit dependency versions.
- Add a deployment smoke test covering the frontend URL, backend health endpoint, CORS, authentication, and product retrieval.
- Document the correct root directory and start command for both Vercel and Render.

### Application behavior

- Add a visible frontend error boundary and user-friendly API failure state so runtime exceptions do not present as a blank page.
- Ensure every data-dependent page has loading, empty, and error states.
- Avoid making browser-only calls during server rendering; place `window`, `localStorage`, and similar access behind client-side lifecycle boundaries.
- Add automated tests for API response contracts between the frontend and backend.
- Confirm dynamic routes are generated or handled correctly in the chosen Next.js routing configuration.

## 8. Final Status

| Area | Status | Notes |
|---|---|---|
| GitHub migration | Complete | Repository is under `alphaistore/alpha_istoregh` |
| Vercel deployment | Complete with follow-up | 28 pages built; white-screen rendering issue remains to be resolved |
| Render backend | Complete | Live and connected to MongoDB Atlas |
| MongoDB migration | Complete | Fresh GCP Iowa free-tier cluster is accessible |
| Environment variables | Configured | Render and Vercel variables are in place |
| Frontend-backend integration | Partially validated | Connection established; full UI workflow validation remains |
| Production readiness | In progress | Resolve frontend rendering, add monitoring, and establish backups |

**Overall assessment:** The core infrastructure migration is complete and operational. The remaining priority is to identify and fix the frontend runtime rendering failure, then perform an end-to-end production smoke test across customer and administrative workflows.
