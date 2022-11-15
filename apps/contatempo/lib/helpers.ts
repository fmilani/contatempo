export function zeroPad(number: number, size: number = 2) {
  var s = String(number);
  while (s.length < size) {
    s = "0" + s;
  }
  return s;
}
