import '@mui/material/styles'

declare module '@mui/material/styles' {
    interface ThemeOptions {
        customSizes?: {
            body1: string;
            body2: string;
            icon1: string;
            icon2: string;
            icon3: string;
        };
    }
}