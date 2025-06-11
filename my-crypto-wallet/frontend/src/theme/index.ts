export const colors = {
    primary: '#2D3436',
    secondary: '#636E72',
    accent: '#00B894',
    background: '#FFFFFF',
    surface: '#F5F6FA',
    text: {
        primary: '#2D3436',
        secondary: '#636E72',
        inverse: '#FFFFFF',
        accent: '#00B894',
    },
    border: '#DFE6E9',
    error: '#FF7675',
    success: '#00B894',
    warning: '#FFEAA7',
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const typography = {
    h1: {
        fontSize: 32,
        fontWeight: '700',
        lineHeight: 40,
    },
    h2: {
        fontSize: 24,
        fontWeight: '600',
        lineHeight: 32,
    },
    h3: {
        fontSize: 20,
        fontWeight: '600',
        lineHeight: 28,
    },
    body1: {
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 24,
    },
    body2: {
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 20,
    },
    caption: {
        fontSize: 12,
        fontWeight: '400',
        lineHeight: 16,
    },
} as const;

export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.18,
        shadowRadius: 1.0,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
}; 