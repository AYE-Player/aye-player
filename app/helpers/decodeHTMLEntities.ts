const element = document.createElement("textarea");

export default function decodeHTMLEntities(str: string) {
  element.innerHTML = str;
  return element.value;
}
