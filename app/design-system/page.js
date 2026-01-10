'use client'

export default function DesignSystemPage() {
  return (
    <div style={{ backgroundColor: 'var(--color-surface)', minHeight: '100vh', paddingBottom: '4rem' }}>
      <div className="container-v2" style={{ paddingTop: '2rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <h1 className="text-heading-v2" style={{ fontSize: 'var(--font-size-4xl)', marginBottom: 'var(--spacing-4)' }}>
            Diversia Eternals Design System
          </h1>
          <p className="text-body-v2" style={{ fontSize: 'var(--font-size-lg)' }}>
            Version 0.2.0 • Light Mode • Corporate Style
          </p>
        </div>

        {/* Color Palette Section */}
        <section style={{ marginBottom: '4rem' }}>
          <h2 className="text-heading-v2" style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--spacing-6)' }}>
            🎨 Color Palette
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-4)' }}>
            <ColorSwatch label="Primary" color="var(--color-primary)" hex="#046BD2" />
            <ColorSwatch label="Primary Dark" color="var(--color-primary-dark)" hex="#045CB4" />
            <ColorSwatch label="Background" color="var(--color-bg)" hex="#FFFFFF" border />
            <ColorSwatch label="Surface" color="var(--color-surface)" hex="#F0F5FA" />
            <ColorSwatch label="Border" color="var(--color-border)" hex="#D1D5DB" />
            <ColorSwatch label="Text Heading" color="var(--color-text-heading)" hex="#1E293B" />
          </div>
        </section>

        {/* Typography Section */}
        <section style={{ marginBottom: '4rem' }}>
          <h2 className="text-heading-v2" style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--spacing-6)' }}>
            📝 Typography
          </h2>

          <div className="card-v2" style={{ marginBottom: 'var(--spacing-4)' }}>
            <h1 className="text-heading-v2" style={{ fontSize: 'var(--font-size-4xl)' }}>
              Heading 1 • 600 weight • 36px
            </h1>
            <h2 className="text-heading-v2" style={{ fontSize: 'var(--font-size-3xl)' }}>
              Heading 2 • 600 weight • 30px
            </h2>
            <h3 className="text-heading-v2" style={{ fontSize: 'var(--font-size-2xl)' }}>
              Heading 3 • 600 weight • 24px
            </h3>
            <p className="text-body-v2" style={{ fontSize: 'var(--font-size-base)', marginTop: 'var(--spacing-4)' }}>
              Body text • 400 weight • 16px • This is regular body text used for paragraphs and content.
              It uses the inherit font-family for maximum compatibility and performance.
            </p>
            <p className="text-secondary-v2" style={{ fontSize: 'var(--font-size-sm)' }}>
              Secondary text • 400 weight • 14px • Used for less important information
            </p>
          </div>
        </section>

        {/* Buttons Section */}
        <section style={{ marginBottom: '4rem' }}>
          <h2 className="text-heading-v2" style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--spacing-6)' }}>
            🔘 Buttons
          </h2>

          <div className="card-v2" style={{ marginBottom: 'var(--spacing-4)' }}>
            <h3 className="text-heading-v2" style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--spacing-4)' }}>
              Primary Buttons
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-4)', alignItems: 'center' }}>
              <button className="btn-v2 btn-primary-v2 btn-sm-v2">Small Button</button>
              <button className="btn-v2 btn-primary-v2">Default Button</button>
              <button className="btn-v2 btn-primary-v2 btn-lg-v2">Large Button</button>
              <button className="btn-v2 btn-primary-v2" disabled>Disabled</button>
            </div>
          </div>

          <div className="card-v2" style={{ marginBottom: 'var(--spacing-4)' }}>
            <h3 className="text-heading-v2" style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--spacing-4)' }}>
              Secondary & Outline
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-4)' }}>
              <button className="btn-v2 btn-secondary-v2">Secondary</button>
              <button className="btn-v2 btn-outline-v2">Outline</button>
              <button className="btn-v2 btn-secondary-v2" disabled>Disabled</button>
            </div>
          </div>
        </section>

        {/* Inputs Section */}
        <section style={{ marginBottom: '4rem' }}>
          <h2 className="text-heading-v2" style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--spacing-6)' }}>
            📝 Form Inputs
          </h2>

          <div className="card-v2">
            <div style={{ display: 'grid', gap: 'var(--spacing-6)' }}>
              <div>
                <label className="text-body-v2" style={{ display: 'block', marginBottom: 'var(--spacing-2)', fontWeight: 'var(--font-weight-semibold)' }}>
                  Default Input
                </label>
                <input
                  type="text"
                  className="input-v2"
                  placeholder="Enter your text here..."
                />
              </div>

              <div>
                <label className="text-body-v2" style={{ display: 'block', marginBottom: 'var(--spacing-2)', fontWeight: 'var(--font-weight-semibold)' }}>
                  Input with Value
                </label>
                <input
                  type="text"
                  className="input-v2"
                  value="Sample value"
                  readOnly
                />
              </div>

              <div>
                <label className="text-body-v2" style={{ display: 'block', marginBottom: 'var(--spacing-2)', fontWeight: 'var(--font-weight-semibold)' }}>
                  Error State
                </label>
                <input
                  type="text"
                  className="input-v2 input-error-v2"
                  placeholder="This field has an error"
                />
                <span style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-1)', display: 'block' }}>
                  This field is required
                </span>
              </div>

              <div>
                <label className="text-body-v2" style={{ display: 'block', marginBottom: 'var(--spacing-2)', fontWeight: 'var(--font-weight-semibold)' }}>
                  Disabled Input
                </label>
                <input
                  type="text"
                  className="input-v2"
                  placeholder="Disabled field"
                  disabled
                />
              </div>

              <div>
                <label className="text-body-v2" style={{ display: 'block', marginBottom: 'var(--spacing-2)', fontWeight: 'var(--font-weight-semibold)' }}>
                  Textarea
                </label>
                <textarea
                  className="textarea-v2"
                  placeholder="Enter your message here..."
                />
              </div>

              <div>
                <label className="text-body-v2" style={{ display: 'block', marginBottom: 'var(--spacing-2)', fontWeight: 'var(--font-weight-semibold)' }}>
                  Select
                </label>
                <select className="select-v2">
                  <option>Option 1</option>
                  <option>Option 2</option>
                  <option>Option 3</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Cards Section */}
        <section style={{ marginBottom: '4rem' }}>
          <h2 className="text-heading-v2" style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--spacing-6)' }}>
            🃏 Cards
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-6)' }}>
            <div className="card-v2">
              <h3 className="text-heading-v2" style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--spacing-3)' }}>
                Default Card
              </h3>
              <p className="text-body-v2">
                This is a standard card component with default styling and hover effects.
              </p>
            </div>

            <div className="card-v2 card-elevated-v2">
              <h3 className="text-heading-v2" style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--spacing-3)' }}>
                Elevated Card
              </h3>
              <p className="text-body-v2">
                This card has increased elevation with stronger shadows.
              </p>
            </div>

            <div className="card-v2 card-interactive-v2">
              <h3 className="text-heading-v2" style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--spacing-3)' }}>
                Interactive Card
              </h3>
              <p className="text-body-v2">
                This card is clickable and changes appearance on hover.
              </p>
            </div>
          </div>
        </section>

        {/* Badges Section */}
        <section style={{ marginBottom: '4rem' }}>
          <h2 className="text-heading-v2" style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--spacing-6)' }}>
            🏷️ Badges
          </h2>

          <div className="card-v2">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-4)', alignItems: 'center' }}>
              <span className="badge-v2 badge-primary-v2">Primary</span>
              <span className="badge-v2 badge-success-v2">Success</span>
              <span className="badge-v2 badge-warning-v2">Warning</span>
              <span className="badge-v2 badge-error-v2">Error</span>
            </div>
          </div>
        </section>

        {/* Links Section */}
        <section style={{ marginBottom: '4rem' }}>
          <h2 className="text-heading-v2" style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--spacing-6)' }}>
            🔗 Links
          </h2>

          <div className="card-v2">
            <p className="text-body-v2">
              This is a paragraph with a <a href="#" className="link-v2">standard link</a> that uses the primary color.
              Try hovering over it to see the interaction effect.
            </p>
          </div>
        </section>

        {/* Accessibility Note */}
        <section>
          <div className="card-v2" style={{ backgroundColor: 'var(--color-info-bg)', borderColor: 'var(--color-info)' }}>
            <h3 className="text-heading-v2" style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--spacing-3)', color: 'var(--color-info)' }}>
              ♿ Accessibility
            </h3>
            <p className="text-body-v2">
              All components meet WCAG 2.1 AA standards for color contrast. Focus states are clearly visible,
              and reduced motion preferences are respected.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

// Helper component for color swatches
function ColorSwatch({ label, color, hex, border }) {
  return (
    <div className="card-v2" style={{ padding: 'var(--spacing-4)' }}>
      <div
        style={{
          width: '100%',
          height: '80px',
          backgroundColor: color,
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--spacing-3)',
          border: border ? '1px solid var(--color-border)' : 'none'
        }}
      />
      <p className="text-strong-v2" style={{ marginBottom: 'var(--spacing-1)' }}>{label}</p>
      <p className="text-secondary-v2" style={{ fontSize: 'var(--font-size-sm)' }}>{hex}</p>
    </div>
  );
}
