// Fixture for scripts/quill-check.test.mjs — one of each finding the check must produce.
// Never shipped: lives under scripts/, outside registry/.
export function Fixture() {
  return (
    <section className="bg-white text-gray-500 md:hover:bg-red-600 font-serif rounded-lg">
      <p className="text-[13px] tracking-[0.15em] rounded-[10px] text-[var(--accent-pigment-text)]">bracket values</p>
      <span className="text-indigo-brand" style={{ color: 'var(--text-strong)' }}>retired names</span>
      <div style={{ background: 'rgb(245, 237, 221)' }} className="bg-[#F5EDDD] w-[420px] h-[24px] max-w-[880px]">raw + layout</div>
      {/* quill-check: allow raw-color — Google brand mark */}
      <svg><path fill="#4285F4" d="M0 0h1v1H0z" /></svg>
      {/* quill-check: allow palette */}
      <em className="text-black">allow without a reason</em>
      <a href="#pricing" id="top" className="text-foreground">not a colour</a>
      <b className="bg-nope text-2xs">unresolved (rule 1)</b>
    </section>
  )
}
