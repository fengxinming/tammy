export default function ({ internalHooks }) {
  if (window && window.window === window) {
    internalHooks.request.use((options) => {
      // HTTP basic authentication
      const { auth, headers } = options;
      if (auth) {
        const username = auth.username || '';
        const password = auth.password || '';
        headers.Authorization = 'Basic ' + window.btoa(username + ':' + password);
      }
      return options;
    });
  }
}
