export function addH1(text: string): void {
  const h1 = document.createElement("h1");
  h1.textContent = text ?? "please provide a text";
  document.body.appendChild(h1);
}
