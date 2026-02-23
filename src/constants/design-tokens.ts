/**
 * JusticeLynk Design Token System
 * Highly consistent scales for a world-class enterprise SaaS.
 */

export const DESIGN_TOKENS = {
    spacing: {
        none: '0',
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '32px',
        '3xl': '48px',
        '4xl': '64px',
    },
    radius: {
        none: '0',
        sm: '4px',
        md: '8px',  // buttons
        lg: '12px',
        xl: '16px',
        '2xl': '24px', // cards
        full: '9999px',
    },
    shadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.05)',
    },
    zIndex: {
        hide: -1,
        auto: 'auto',
        base: 0,
        docked: 10,
        dropdown: 1000,
        sticky: 1100,
        banner: 1200,
        overlay: 1300,
        modal: 1400,
        popover: 1500,
        skipLink: 1600,
        toast: 1700,
        tooltip: 1800,
    },
    animation: {
        durations: {
            fast: '100ms',
            normal: '200ms',
            slow: '300ms',
        },
        easing: {
            default: 'ease-out',
            linear: 'linear',
            in: 'ease-in',
            out: 'ease-out',
            'in-out': 'ease-in-out',
        },
    },
    container: {
        maxWidth: '1350px',
        padding: '2rem',
    }
} as const;
