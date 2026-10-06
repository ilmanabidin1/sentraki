(function (root) {
  async function* readSSE(body) {
    if (!body?.getReader) throw new Error('Streaming body unavailable');
    const reader = body.getReader(), decoder = new TextDecoder();
    let buffer = '';
    try {
      while (true) {
        const { value, done } = await reader.read();
        buffer += decoder.decode(value, { stream:!done });
        if (buffer.length > 262144) throw new Error('Stream frame too large');
        if (done && buffer.trim()) buffer += '\n\n';
        let boundary;
        while ((boundary = /\r?\n\r?\n|\r\r/.exec(buffer))) {
          const frame = buffer.slice(0, boundary.index);
          buffer = buffer.slice(boundary.index + boundary[0].length);
          let event = 'message'; const data = [];
          for (const line of frame.split(/\r\n|\r|\n/)) {
            if (line.startsWith(':')) continue;
            const colon = line.indexOf(':');
            const field = colon < 0 ? line : line.slice(0, colon);
            const text = colon < 0 ? '' : line.slice(colon + 1).replace(/^ /, '');
            if (field === 'event') event = text;
            if (field === 'data') data.push(text);
          }
          if (data.length) yield { event, data:data.join('\n') };
        }
        if (done) break;
      }
    } finally {
      await reader.cancel().catch(() => {});
      reader.releaseLock();
    }
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { readSSE };
  else root.P2KIEvents = { readSSE };
})(globalThis);
