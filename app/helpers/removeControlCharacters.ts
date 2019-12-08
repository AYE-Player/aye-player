const removeControlCharacters = (str: string) => {
  return str
    .split("")
    .filter(x => {
      var n = x.charCodeAt(0);

      return 31 < n && 127 > n;
    })
    .join("");
};

export default removeControlCharacters;
