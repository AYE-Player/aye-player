const timestringToSeconds = (time: string) => {
  const hms = time.split(':');

  if (hms.length === 3) {
    return +hms[0] * 60 * 60 + +hms[1] * 60 + +hms[2];
  }
  if (hms.length === 2) {
    return +hms[0] * 60 + +hms[1];
  }
  return +hms[0];
};

export default timestringToSeconds;
