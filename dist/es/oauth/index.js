export default function ({ xhrHeaderHooks }) {
  xhrHeaderHooks[xhrHeaderHooks.length] = ({ auth, headers }) => {
    // HTTP basic authentication
    if (auth) {
      const username = auth.username || '';
      const password = auth.password || '';
      headers.Authorization = 'Basic ' + window.btoa(username + ':' + password);
    }
  };
}
