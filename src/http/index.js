import http from './http';

function plugin({ defaults }) {
  defaults.adapter = http;
}

plugin.request = http;

export default plugin;
