// import * as Sentry from "@sentry/nuxt";

// Sentry.init({
//     dsn: "https://examplePublicKey@o0.ingest.sentry.io/0",

//     sendDefaultPii: true,

//     integrations: [
//         Sentry.replayIntegration(),
//         Sentry.feedbackIntegration({
//             colorScheme: "system",
//         }),
//     ],

//     tracesSampleRate: 1.0,

//     replaysSessionSampleRate: 0.1,
//     replaysOnErrorSampleRate: 1.0,
//     enableLogs: true,
// });

import * as Sentry from "@sentry/nuxt";

const config = useRuntimeConfig();
const sentryConfig = (config.public.sentry as { dsn: string });

console.log("[SENTRY DSN CLIENT]", sentryConfig.dsn);

Sentry.init({
    dsn: sentryConfig.dsn,

    sendDefaultPii: true,

    integrations: [
        Sentry.replayIntegration(),
        Sentry.feedbackIntegration({
        colorScheme: "system",
        }),
    ],

    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    enableLogs: true,
});
