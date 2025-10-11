import * as Sentry from "@sentry/nuxt";

const config = useRuntimeConfig();
const sentryConfig = config.public.sentry as { dsn: string };

Sentry.init({
    dsn: sentryConfig.dsn,
    tracesSampleRate: 1.0,
    enableLogs: true,
});
