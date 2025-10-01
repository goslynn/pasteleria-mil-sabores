export default [
    'strapi::logger',
    'strapi::errors',
    'strapi::security',
    'strapi::cors',
    'strapi::poweredBy',
    'strapi::query',
    'strapi::body',
    {
        name: 'strapi::session',
        config: {
            key: 'sid',
            httpOnly: true,   // sigue siendo buena práctica
            secure: false,    // <- permite cookies por HTTP (sin "Secure")
            sameSite: 'lax',  // evita problemas típicos; usa 'strict' si quieres
            rolling: true,
            renew: true,
        },
    },
    'strapi::favicon',
    'strapi::public',
];
