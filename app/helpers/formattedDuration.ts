const formattedDuration = (duration: number) => {
  const str_pad_left = (value: number, pad: string, length: number) => {
    return (new Array(length + 1).join(pad) + value).slice(-length);
  };

  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration - hours * 3600) / 60);
  const seconds = duration - minutes * 60;

  const finalTime =
    (hours >= 1 ? str_pad_left(hours, "0", 2) + ":" : "") +
    str_pad_left(minutes, "0", 2) +
    ":" +
    str_pad_left(seconds, "0", 2);
  return finalTime;
}

export default formattedDuration;
