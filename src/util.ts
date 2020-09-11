export function chunk(s: string, maxBytes: number): string {
  let buf = Buffer.from(s);
  const result = [];
  while (buf.length) {
    let i = buf.lastIndexOf(32, maxBytes + 1);
    if (i < 0) i = buf.indexOf(32, maxBytes);
    if (i < 0) i = buf.length;
    result.push(buf.slice(0, i).toString());
    buf = buf.slice(i + 1);
  }
  return result.join('');
}
