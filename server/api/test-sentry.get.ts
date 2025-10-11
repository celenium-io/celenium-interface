export default defineEventHandler((event) => {
    const config = useRuntimeConfig(event);
    return { sentryDsn: config.public.sentry?.dsn || null };
});
