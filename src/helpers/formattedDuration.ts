const formattedDuration = (duration: number) => {
  const strPadLeft = (value: number, pad: string, length: number) => {
    return (new Array(length + 1).join(pad) + value).slice(-length);
  };

  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration - hours * 3600) / 60);
  const seconds = duration - minutes * 60;

  return `${
    (hours >= 1 ? `${strPadLeft(hours, '0', 2)}:` : '') +
    strPadLeft(minutes, '0', 2)
  }:${strPadLeft(seconds, '0', 2)}`;
};

export default formattedDuration;
