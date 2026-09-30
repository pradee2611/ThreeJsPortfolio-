// Splits "plain *highlighted* plain" into an array of
// { text, strong } chunks so components can render the *…* runs
// as an accent-colored <strong>, without a Markdown dependency.
export function splitHighlight(str) {
  return str
    .split(/(\*[^*]+\*)/g)
    .filter(Boolean)
    .map((chunk) => {
      const strong = chunk.startsWith("*") && chunk.endsWith("*");
      return { text: strong ? chunk.slice(1, -1) : chunk, strong };
    });
}
