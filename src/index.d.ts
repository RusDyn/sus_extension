declare namespace NodeJS {
    interface ProcessEnv {
    }
}

interface Window {
    dataLayer: Array
    gtag: (a: string, b: any, c?: any) => void
}