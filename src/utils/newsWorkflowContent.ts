export type NewsWorkflowContent = {
  tlgp: string;
  rulesAnalysis: string;
  fullAnalysis: string;
};

const sectionNames = new Map<string, keyof NewsWorkflowContent>([
  ["tlgp", "tlgp"],
  ["rules analysis", "rulesAnalysis"],
  ["full analysis", "fullAnalysis"],
]);

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const htmlToPlainText = (html: string) => {
  const container = document.createElement("div");
  container.innerHTML = html;
  container.querySelectorAll("br").forEach((element) => {
    element.replaceWith("\n");
  });
  return (container.textContent ?? "").trim();
};

export function composeNewsWorkflowContent(content: NewsWorkflowContent): string {
  const tlgp = escapeHtml(content.tlgp).replace(/\n/g, "<br>");
  return [
    `<h2>TLGP</h2><p>${tlgp}</p>`,
    `<h2>Rules Analysis</h2>${content.rulesAnalysis}`,
    `<h2>Full Analysis</h2>${content.fullAnalysis}`,
  ].join("");
}

export function parseNewsWorkflowContent(
  content: string,
  fallbackTlgp = "",
): NewsWorkflowContent {
  const result: NewsWorkflowContent = {
    tlgp: fallbackTlgp.trim(),
    rulesAnalysis: "",
    fullAnalysis: "",
  };

  const root = document.createElement("div");
  root.innerHTML = content;

  let activeSection: keyof NewsWorkflowContent | null = null;
  const sections: Record<keyof NewsWorkflowContent, string[]> = {
    tlgp: [],
    rulesAnalysis: [],
    fullAnalysis: [],
  };

  for (const node of root.childNodes) {
    if (node instanceof HTMLHeadingElement && node.tagName === "H2") {
      const heading = (node.textContent ?? "").trim().toLowerCase();
      activeSection = sectionNames.get(heading) ?? null;
      continue;
    }

    if (activeSection) {
      const wrapper = document.createElement("div");
      wrapper.append(node.cloneNode(true));
      sections[activeSection].push(wrapper.innerHTML);
    }
  }

  const hasWorkflowSections = Object.values(sections).some(
    (section) => section.length > 0,
  );
  if (!hasWorkflowSections) {
    result.fullAnalysis = content;
    return result;
  }

  const parsedTlgp = htmlToPlainText(sections.tlgp.join(""));
  result.tlgp = parsedTlgp || result.tlgp;
  result.rulesAnalysis = sections.rulesAnalysis.join("").trim();
  result.fullAnalysis = sections.fullAnalysis.join("").trim();
  return result;
}
