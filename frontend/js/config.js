/**
 * Siap Santap - Configuration Module
 * Environment-based configuration for different deployment targets
 */

const CONFIG = {
    // Auto-detect environment
    isDevelopment:
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1",
    isDemo: false, // Will be set by API module on failure

    // API Configuration
    get API_BASE() {
        // For Vercel deployment
        if (window.location.hostname.includes("vercel.app")) {
            return "/api";
        }
        // For local development with Vercel CLI
        if (this.isDevelopment) {
            return "/api";
        }
        // For GitHub Pages (demo mode will be used)
        return "/api";
    },

    // Feature flags
    ENABLE_DEMO_MODE: true,
    DEMO_NOTIFICATION: true,

    // App settings
    APP_NAME: "Siap Santap",
    CURRENCY: "IDR",
    TAX_RATE: 0.11, // 11% PPN

    // Placeholder image for failed loads
    PLACEHOLDER_IMAGE: "../assets/placeholder.jpg",
};

// Freeze config to prevent accidental modifications
Object.freeze(CONFIG);
