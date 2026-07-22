export function Hero() {
  return (
    <div className="pt-20 pb-11">
      <div className="mb-[22px] flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
        <span className="eyebrow-dot h-[7px] w-[7px] shrink-0 rounded-full bg-[#4ade80]" />
        Engenharia de Software · Backend &amp; Infra
      </div>
      <h1 className="mb-[18px] text-[clamp(40px,6vw,68px)] font-bold leading-[1.06] tracking-[-0.03em]">
        Hub de
        <br />
        <span className="text-gradient-accent">Conhecimento</span>
      </h1>
      <p className="max-w-[480px] text-[15px] leading-[1.65] text-muted">
        Referência técnica para engenharia de software — arquitetura, infraestrutura, banco de dados e linguagens.
      </p>
    </div>
  );
}
