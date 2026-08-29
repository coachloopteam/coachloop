// Fixed, deterministic credentials for the e2e checkout test's coach account.
// global-setup.ts (re)creates this user fresh before each run, so it's safe
// to hardcode rather than pass through env/files between the setup process
// and test workers.
export const E2E_COACH_EMAIL = "playwright-checkout@coachloop.test";
export const E2E_COACH_PASSWORD = "playwright-test-password-1";
