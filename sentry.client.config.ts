import * as Sentry from "@sentry/nuxt";

const config = useRuntimeConfig();
const sentryConfig = (config.public.sentry as { dsn: string });

Sentry.init({
    dsn: sentryConfig.dsn,

    sendDefaultPii: true,

    integrations: [
        Sentry.replayIntegration(),
        Sentry.feedbackIntegration({
            autoInject: false,
        }),
    ],

    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    enableLogs: true,
});
