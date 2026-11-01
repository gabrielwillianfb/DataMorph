export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api',
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
          uri: 'http://localhost:8000/api/*',
          tokenOptions: {
            authorizationParams: {
              audience: 'https://api.datamorph',
              scope: 'openid profile email'
            }
          }
        },
        {
          uri: 'http://127.0.0.1:8000/api/*',
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
