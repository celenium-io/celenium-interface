import * as Sentry from "@sentry/nuxt";

const config = useRuntimeConfig();
const sentryConfig = (config.public.sentry as { dsn: string });

const isForeignError = (event: Sentry.ErrorEvent): boolean => {
    const frames = event.exception?.values?.flatMap((value) => value.stacktrace?.frames ?? []) ?? [];

    if (!frames.length) return false;

    return !frames.some((frame) => frame.filename?.startsWith(window.location.origin));
};

Sentry.init({
    dsn: sentryConfig.dsn,

    sendDefaultPii: true,

    integrations: [
        Sentry.replayIntegration(),
        Sentry.feedbackIntegration({
            autoInject: false,
        }),
    ],

    beforeSend(event) {
        return isForeignError(event) ? null : event;
    },

    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    enableLogs: true,
});
