// Application configuration
export const appConfig = {
  // Authentication settings
  auth: {
    enabled: process.env.NEXT_PUBLIC_AUTH_ENABLED === 'true',
    providers: {
      google: process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === 'true',
      email: process.env.NEXT_PUBLIC_EMAIL_AUTH_ENABLED === 'true',
    }
  },
  
  // Environment settings
  environment: {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
  },
  
  // API settings
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
    timeout: 30000,
  },
  
  // App settings
  app: {
    name: 'QR Listener Admin',
    version: '1.0.0',
    description: 'Admin panel for managing QR code redirects',
  },
  
  // Demo mode settings
  demo: {
    enabled: process.env.NEXT_PUBLIC_DEMO_MODE === 'true',
    skipAuth: process.env.NEXT_PUBLIC_SKIP_AUTH === 'true',
  }
}

// Helper functions
export const isAuthEnabled = () => appConfig.auth.enabled && !appConfig.demo.skipAuth
export const isDemoMode = () => appConfig.demo.enabled
export const isDevelopment = () => appConfig.environment.isDevelopment
export const isProduction = () => appConfig.environment.isProduction
