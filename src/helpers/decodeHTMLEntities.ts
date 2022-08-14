const element = document.createElement('textarea');

const decodeHTMLEntities = (str: string) => {
  element.innerHTML = str;
  return element.value;
};

export default decodeHTMLEntities;
