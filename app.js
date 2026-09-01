const searchInput = document.getElementById("search");
const clearButton = document.getElementById("clear");
const results = document.getElementById("results");
const boxCount = document.getElementById("boxCount");

boxCount.textContent = `${BOXES.length} boxes`;

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/samsung galaxy/g, "samsung")
    .replace(/oneplus/g, "one plus")
    .replace(/xiaomi/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function highlight(text, query) {
  const safe = escapeHtml(text);
  if (!query) return safe;
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  try {
    return safe.replace(new RegExp(`(${escapedQuery})`, "ig"), "<mark>$1</mark>");
  } catch {
    return safe;
  }
}

function findMatches(query) {
  const terms = normalize(query).split(/\s+/).filter(Boolean);

  return BOXES.map(box => {
    const matches = box.models.filter(model => {
      const normalizedModel = normalize(model);
      return terms.every(term => normalizedModel.includes(term));
    });
    return { ...box, matches };
  }).filter(box => box.matches.length);
}

function emptyState(title, body) {
  results.innerHTML = `
    <div class="col-span-full rounded-2xl border-2 border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center">
      <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-sky-100">
        <svg class="h-6 w-6 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"/>
        </svg>
      </div>
      <p class="font-semibold text-slate-800">${title}</p>
      <p class="mt-1 text-sm text-slate-500">${body}</p>
    </div>`;
}

function render(query = "") {
  query = query.trim();

  if (!query) {
    emptyState("Search for a phone model", "Try “Samsung A16”, “Redmi 13C”, or “Vivo Y21”.");
    return;
  }

  const matches = findMatches(query);

  if (!matches.length) {
    emptyState("No tempered glass found", "Try a shorter search, such as A16, Y21, or 13C.");
    return;
  }

  results.innerHTML = matches.map((box, i) => `
    <article class="card-enter group overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 shadow-sm ring-1 ring-white/60 backdrop-blur-sm transition hover:shadow-lg hover:-translate-y-0.5" style="animation-delay:${Math.min(i, 8) * 30}ms">
      <div class="box-image relative aspect-[4/3] w-full overflow-hidden">
        <img src="${escapeHtml(box.image)}" alt="${escapeHtml(box.id)} tempered glass box"
          class="h-full w-full object-cover"
          onerror="this.onerror=null;this.closest('.box-image').innerHTML='<div class=&quot;flex h-full w-full items-center justify-center text-slate-400&quot;><svg class=&quot;h-10 w-10&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;1.5&quot;><rect x=&quot;5&quot; y=&quot;3&quot; width=&quot;14&quot; height=&quot;18&quot; rx=&quot;2&quot;/><line x1=&quot;9&quot; y1=&quot;7&quot; x2=&quot;15&quot; y2=&quot;7&quot;/></svg></div>'">
      </div>
      <div class="p-4">
        <div class="flex items-center justify-between gap-2">
          <h2 class="text-base font-bold text-slate-900">${escapeHtml(box.id)}</h2>
          ${box.variant ? `<span class="inline-flex items-center rounded-full bg-slate-900 px-2.5 py-0.5 text-[11px] font-semibold text-white">${escapeHtml(box.variant)}</span>` : ""}
        </div>
        <p class="mt-1 text-xs font-medium text-gray-600 tracking-wide">${box.matches.length} matching model${box.matches.length === 1 ? "" : "s"}</p>
        <div class="mt-3 flex flex-wrap gap-1.5">
          ${box.matches.map(model =>
            `<span class="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700">${highlight(model, query)}</span>`
          ).join("")}
        </div>
      </div>
    </article>
  `).join("");
}

searchInput.addEventListener("input", event => render(event.target.value));

clearButton.addEventListener("click", () => {
  searchInput.value = "";
  searchInput.focus();
  render("");
});

render("");
