// Section 1: mirrors travel-planner's own hero (eyebrow, heading, CTA), just
// with packing-list's copy and purple in place of red.
export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="gradient-blob" aria-hidden="true" />
      <div className="hero-inner">
        <p className="eyebrow">Plan Smart</p>
        <div className="hero-group">
          <h1>Packing<br />List</h1>
          <div className="hero-copy">
            <p className="subhead">A packing list that scales to your trip and checks the weather.</p>
            <a href="#plan" className="secondary">TRY NOW</a>
          </div>
        </div>
      </div>
    </section>
  )
}
