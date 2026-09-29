# Make VeriOS Functional with Enter Cloud

## Context
The current VeriOS screen is a visual dashboard with hard-coded decisions, no authentication gate, and no persisted data. The requested first pass is to connect the app to real Enter Cloud data and authentication while preserving the existing visual direction and preview boot. The implementation will stay within the current Vite + React runtime; generated integration files remain untouched.

## Recommended approach
1. **Add secure user data foundations in Enter Cloud**
   - Create a `profiles` table keyed to `auth.users`, populated by a signup trigger, with RLS scoped to the current user.
   - Create a `decisions` table for dashboard records with owner, title, project, prompt, risk, score, status, and timestamps.
   - Enable RLS in the same migration and add policies for authenticated users to read, create, update, and delete only their own decisions.
   - Confirm the resulting schema and policies after migration.

2. **Implement authentication flow**
   - Add a reusable auth page with both login and signup modes, validation, loading, and visible error handling.
   - Configure email signup for auto-confirmed development access and use the required origin redirect.
   - Add an auth provider/hook that registers `onAuthStateChange` before restoring the existing session, stores both user and session, and redirects unauthenticated users to auth.
   - Add a sign-out action to the dashboard profile control.

3. **Replace dashboard mocks with database queries**
   - Refactor `src/pages/Index.tsx` into smaller dashboard/auth components or hooks rather than keeping all data and behavior in one component.
   - Load the signed-in user’s decisions with the Enter Cloud client, map database rows to the existing typed display model, and render explicit loading, empty, and error states.
   - Keep filtering and selected-decision behavior local to the loaded rows; do not make authorization decisions in the client.
   - Make “New decision” open a validated form and insert a decision into Enter Cloud, then refresh/select the created row.
   - Make the navigation, search, notification, workspace/profile controls provide honest interactive behavior; avoid presenting unavailable modules as connected.

4. **Keep the existing design system intact**
   - Reuse the current semantic tokens and shadcn primitives in `src/index.css`, `src/App.css`, and `src/components/ui/*`.
   - Add only the auth/form/loading/empty/error styles needed for accessible responsive behavior, without editing generated client or types files.

## Critical files and boundaries
- `src/App.tsx`: provide the auth/session context and route-level gating.
- `src/router.tsx`: preserve `/` and add the auth route if needed.
- `src/pages/Index.tsx`: replace hard-coded dashboard data with query/mutation-backed UI and split reusable pieces.
- `src/pages/Auth.tsx` and `src/hooks/use-auth.tsx`: login/signup and session lifecycle.
- `src/lib/validation.ts` or feature-local schemas: form validation for auth and new decisions.
- `src/index.css`, `src/App.css`: only semantic UI additions required by the new states.
- `supabase/migrations/*` through the Enter Cloud migration tool: profiles, decisions, trigger, RLS, and indexes.
- `src/integrations/supabase/client.ts` and `src/integrations/supabase/types.ts`: generated files; do not edit.

## Implementation checklist
- [ ] Create `profiles` with signup trigger, user-scoped RLS, and safe profile policies.
- [ ] Create `decisions` with owner-scoped RLS, timestamps, status/risk fields, and an owner/time index.
- [ ] Confirm migration results show RLS enabled and expected policies for every new table.
- [ ] Configure email authentication for login/signup testing with auto-confirm and origin redirect.
- [ ] Add session state that stores both user and session and handles auth changes without callback deadlocks.
- [ ] Add login and signup forms with validation, pending state, and actionable error feedback.
- [ ] Gate the dashboard for unauthenticated users and add working sign-out.
- [ ] Replace hard-coded decision arrays with an authenticated Enter Cloud query and typed row mapping.
- [ ] Add loading, empty, query-error, and retry states for the decision list/dashboard.
- [ ] Make New decision validate and insert a user-owned row, then update the selected detail view.
- [ ] Preserve responsive sidebar/mobile behavior and ensure visible controls do not claim unsupported backend functionality.

## Verification checklist
- [ ] Signed-out visit to `/` shows the auth screen and cannot read dashboard rows.
- [ ] Valid signup creates an auth user and exactly one profile row through the trigger.
- [ ] Valid login restores after refresh with both user and session available.
- [ ] Invalid credentials and invalid form fields show errors without duplicate submissions.
- [ ] A signed-in user sees only their own decisions; a second user cannot read or mutate the first user’s rows.
- [ ] New decision rejects missing/invalid fields, inserts a valid row, and appears in the list after creation.
- [ ] Empty database, query failure, mobile navigation, and sign-out all render usable states.
- [ ] No generated Enter Cloud client/type file is edited and no private credential is exposed to client code.
- [ ] Run the repository lint/type/build verification scope after implementation and resolve reported errors.
