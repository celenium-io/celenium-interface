// import * as Sentry from "@sentry/nuxt";

// Sentry.init({
//     dsn: "https://examplePublicKey@o0.ingest.sentry.io/0",

//     tracesSampleRate: 1.0,

//     enableLogs: true,
// });

import * as Sentry from "@sentry/nuxt";

const config = useRuntimeConfig();
const sentryConfig = config.public.sentry as { dsn: string };

console.log("[SENTRY DSN SERVER]", sentryConfig.dsn);

Sentry.init({
    dsn: sentryConfig.dsn,
    tracesSampleRate: 1.0,
    enableLogs: true,
});
