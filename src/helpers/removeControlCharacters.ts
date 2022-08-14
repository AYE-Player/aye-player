const removeControlCharacters = (str: string) => {
  return str
    .split('')
    .filter((x) => {
      const n = x.charCodeAt(0);

      return n > 31 && n < 127;
    })
    .join('');
};

export default removeControlCharacters;
