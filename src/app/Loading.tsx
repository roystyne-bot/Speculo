/**
 * Speculo loading screen
 * Self-contained React component — no external assets or icon library required.
 */
export default function Loading() {
  return (
    <main className="speculo-loading" aria-busy="true" aria-live="polite">
      <style>{`
        :root { color-scheme: light; }
        .speculo-loading {
          --spring: #75f94c;
          --spring-hi: #b7ff8e;
          --spring-deep: #2dbb38;
          --onyx: #111411;
          --muted: #5c655b;
          min-height: 100dvh;
          display: grid;
          place-items: center;
          overflow: hidden;
          position: relative;
          isolation: isolate;
          background: #f6f9f2;
          color: var(--onyx);
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }
        .speculo-loading::before,
        .speculo-loading::after {
          content: "";
          position: absolute;
          border-radius: 999px;
          pointer-events: none;
          z-index: -1;
        }
        .speculo-loading::before {
          width: min(70vw, 760px);
          aspect-ratio: 1;
          top: -38%;
          left: -20%;
          background: radial-gradient(circle at 60% 60%, rgba(117,249,76,.4), rgba(183,255,142,.1) 38%, transparent 68%);
          filter: blur(8px);
          animation: drift 11s ease-in-out infinite alternate;
        }
        .speculo-loading::after {
          width: min(55vw, 620px);
          aspect-ratio: 1;
          bottom: -30%;
          right: -15%;
          background: radial-gradient(circle, rgba(117,249,76,.27), transparent 66%);
          animation: drift 9s -4s ease-in-out infinite alternate-reverse;
        }
        .speculo-loading__grain {
          position: absolute;
          inset: 0;
          opacity: .3;
          pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.16'/%3E%3C/svg%3E");
          mix-blend-mode: multiply;
        }
        .speculo-loading__content {
          width: min(100% - 40px, 440px);
          position: relative;
          text-align: center;
        }
        .speculo-loading__orb {
          width: 162px;
          height: 162px;
          margin: 0 auto 34px;
          display: grid;
          place-items: center;
          position: relative;
        }
        .speculo-loading__orb::before,
        .speculo-loading__orb::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 50%;
        }
        .speculo-loading__orb::before {
          background: conic-gradient(from 210deg, transparent 0 14%, var(--spring) 23%, #d8ffca 35%, transparent 50% 100%);
          animation: spin 2.8s linear infinite;
          mask: radial-gradient(transparent 56%, #000 58%);
        }
        .speculo-loading__orb::after {
          inset: 12px;
          border: 1px solid rgba(17,20,17,.1);
          box-shadow: inset 0 0 32px rgba(117,249,76,.24), 0 22px 44px rgba(37,67,32,.13);
        }
        .speculo-loading__mark {
          width: 82px;
          height: 82px;
          display: grid;
          place-items: center;
          color: #f8fff3;
          font-size: 34px;
          font-weight: 800;
          letter-spacing: -.12em;
          padding-right: .12em;
          border-radius: 28px;
          background: var(--onyx);
          box-shadow: 0 14px 24px rgba(17,20,17,.22);
          transform: rotate(-9deg);
          animation: breathe 2.2s ease-in-out infinite;
        }
        .speculo-loading__eyebrow {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          margin: 0 0 12px;
          color: var(--spring-deep);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .16em;
          text-transform: uppercase;
        }
        .speculo-loading__eyebrow i {
          width: 7px;
          height: 7px;
          display: inline-block;
          border-radius: 50%;
          background: var(--spring-deep);
          box-shadow: 0 0 0 5px rgba(117,249,76,.2);
          animation: blink 1.2s ease-in-out infinite;
        }
        .speculo-loading h1 {
          margin: 0;
          font-size: clamp(44px, 11vw, 64px);
          line-height: .95;
          letter-spacing: -.075em;
          font-weight: 800;
        }
        .speculo-loading__copy {
          max-width: 270px;
          margin: 17px auto 31px;
          color: var(--muted);
          font-size: 15px;
          line-height: 1.55;
        }
        .speculo-loading__progress {
          height: 7px;
          padding: 2px;
          overflow: hidden;
          border: 1px solid rgba(17,20,17,.1);
          border-radius: 999px;
          background: rgba(255,255,255,.62);
          box-shadow: 0 8px 18px rgba(17,20,17,.05);
        }
        .speculo-loading__progress span {
          display: block;
          height: 100%;
          width: 42%;
          border-radius: inherit;
          background: linear-gradient(90deg, var(--spring-deep), var(--spring), var(--spring-hi));
          box-shadow: 0 0 14px rgba(117,249,76,.7);
          animation: load 1.65s cubic-bezier(.65,0,.35,1) infinite;
        }
        .speculo-loading__footer {
          display: flex;
          justify-content: space-between;
          margin-top: 13px;
          color: #7a8378;
          font-size: 11px;
          font-weight: 650;
          letter-spacing: .04em;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes drift { to { transform: translate(32px, 24px) scale(1.07); } }
        @keyframes breathe { 50% { transform: rotate(-9deg) scale(.93); } }
        @keyframes blink { 50% { opacity: .35; transform: scale(.7); } }
        @keyframes load { 0% { transform: translateX(-115%); } 55%,100% { transform: translateX(270%); } }
        @media (prefers-reduced-motion: reduce) {
          .speculo-loading *, .speculo-loading::before, .speculo-loading::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; }
        }
      `}</style>

      <div className="speculo-loading__grain" />
      <section className="speculo-loading__content" aria-label="Loading Speculo">
        <div className="speculo-loading__orb" aria-hidden="true">
          <div className="speculo-loading__mark">S</div>
        </div>
        <p className="speculo-loading__eyebrow"><i /> Preparing your perspective</p>
        <h1>Speculo</h1>
        <p className="speculo-loading__copy">A clearer way to see what matters.</p>
        <div className="speculo-loading__progress" role="progressbar" aria-label="Loading" aria-valuetext="Loading content">
          <span />
        </div>
        <div className="speculo-loading__footer">
          <span>PLEASE WAIT</span><span>&#9679; &#9679; &#9679;</span>
        </div>
      </section>
    </main>
  );
}
