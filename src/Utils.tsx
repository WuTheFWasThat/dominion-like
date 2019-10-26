export function encode_query_params(dict: {[key: string]: string}): string {
  return Object.keys(dict).map((k: string) => (k + '=' + encodeURIComponent(dict[k] + ''))).join('&');
}

export function parse_query_string() {
    const querystring = window.location.search;
    if (querystring.length === 0) {
      return {};
    }
    if (querystring[0] !== '?') {
      throw new Error("query string " + querystring);
    }
    var result: {[key: string]: string} = {};
    var pairs = querystring.substr(1).split('&');
    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        result[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }
    return result;
}

