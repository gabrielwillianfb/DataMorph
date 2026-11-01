export const environment = {
  production: true,
  apiUrl: '/api',
  auth0: {
    domain: 'gabrielwillianfb.us.auth0.com',
    clientId: 'm6r6bPMDQptRXwFPLTcbPitCLTuI9N3g',
    authorizationParams: {
      redirect_uri: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4200',
      audience: 'https://api.datamorph',
      scope: 'openid profile email'
    },
    httpInterceptor: {
      allowedList: [
        {
          uri: '/api/*',
          tokenOptions: {
            authorizationParams: {
              audience: 'https://api.datamorph',
              scope: 'openid profile email'
            }
          }
        }
      ]
    }
  }
};
