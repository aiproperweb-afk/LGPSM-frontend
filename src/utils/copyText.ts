/** Puts text on the clipboard; false when the browser would not (the modern way needs https, so an older way is tried too) */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const box = document.createElement("textarea");
    box.value = text;
    box.setAttribute("readonly", "");
    box.style.position = "fixed";
    box.style.opacity = "0";
    document.body.appendChild(box);
    box.select();
    let done = false;
    try { done = document.execCommand("copy"); } catch { done = false; }
    box.remove();
    return done;
  }
}
