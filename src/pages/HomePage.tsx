import { ArrowRight } from 'lucide-react';
import { BRAND, HOME_HERO, IMAGES } from '../lib/brand';
import SiteNav from '../components/marketing/SiteNav';
import Reveal from '../components/marketing/Reveal';
import BrandMark, { NavBrandMark } from '../components/brand/BrandMark';

function Waves({ pos }: { pos: 'tl' | 'br' }) {
  return (
    <svg className={`mk-waves mk-waves--${pos}`} viewBox="0 0 280 120" aria-hidden>
      <path className="mk-waves__stroke--a" d="M4 70c40-40 80 40 120 0s80-40 120 0" />
      <path className="mk-waves__stroke--b" d="M4 86c40-32 80 32 120 0s80-32 120 0" />
      <path className="mk-waves__stroke--c" d="M4 102c40-24 80 24 120 0s80-24 120 0" />
    </svg>
  );
}

export default function HomePage({ onSignIn, onEnter }: { onSignIn: () => void; onEnter: () => void }) {
  return (
    <div className="uzima-site">
      <a className="skip-link" href="#main">Skip to content</a>
      <SiteNav overlay onSignIn={onSignIn} onEnter={onEnter} />

      <section className="mk-hero">
        <div className="mk-hero__media" style={{ backgroundImage: `url('${HOME_HERO}')` }} aria-hidden />
        <div className="mk-hero__shade" aria-hidden />
        <div className="mk-hero__grain" aria-hidden />
        <div className="container mk-hero__inner" id="main">
          <p className="mk-brand">{BRAND.lockup}</p>
          <div className="mk-hero__rule" />
          <h1>{BRAND.tagline}</h1>
          <p className="sub">{BRAND.support}</p>
          <div className="jump">
            <button type="button" className="btn btn-lime" onClick={onEnter}>
              Enter studio
              <span className="node"><ArrowRight size={14} /></span>
            </button>
            <a className="btn btn-ghost-light" href="#flow">
              How it works
            </a>
          </div>
        </div>
      </section>

      <section id="problem" className="mk-problem">
        <Waves pos="tl" />
        <div className="container mk-problem__grid">
          <Reveal>
            <p className="label dark">The bind</p>
            <h2>Board calls and field audio do not fit a 25 MB inbox.</h2>
            <p className="lead">
              Multi-gigabyte recordings stall on ordinary uploaders. We keep the file in your storage,
              transcribe from a signed URL, and return a document you can file.
            </p>
          </Reveal>
          <Reveal delay={2}>
            <aside>
              <p className="lead" style={{ maxWidth: '36ch' }}>
                Resumable 6 MB chunks. Private bucket. Transcript plus an AI title and description as a downloadable PDF.
                No dashboard collage on the first screen — one job, then the studio.
              </p>
            </aside>
          </Reveal>
        </div>
        <div className="mk-problem__big" aria-hidden>FILE</div>
      </section>

      <div className="mk-slash" aria-hidden />

      <section id="flow" className="mk-flow">
        <div className="container">
          <Reveal>
            <p className="label">Method</p>
            <h2>Four steps. One record.</h2>
            <p className="section-lead">From a file too large to attach, to a transcript you can archive.</p>
          </Reveal>
          <div className="mk-rail">
            {[
              ['01', 'Upload', 'Drop mp4, mp3, wav, or m4a. The transfer resumes if the line drops.'],
              ['02', 'Transcribe', 'AssemblyAI reads a 48-hour signed URL. The media never re-uploads.'],
              ['03', 'Review', 'Speaker labels, duration, and an AI title and description land in your library.'],
              ['04', 'Export', 'Download a branded PDF or copy the text from the studio.'],
            ].map(([n, t, b], i) => (
              <Reveal key={n} delay={(i + 1) as 1 | 2 | 3 | 4}>
                <article className="mk-step">
                  <div className="disc">{n}</div>
                  <h3>{t}</h3>
                  <p>{b}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <div className="mk-ribbon">
        <div className="mk-ribbon-row">
          <div className="mk-ribbon__copy">
            <span className="idx">01 — INTAKE</span>
            <h2>The session is the source. The file is just the carrier.</h2>
            <p className="section-lead">Drop the media, leave the tab. Title and description come from the recording.</p>
          </div>
          <div className="mk-ribbon__media mk-panel--mist">
            <img className="mk-panel-photo" src={IMAGES.ribbonUpload} alt="Recording booth with headphones" />
          </div>
        </div>
        <div className="mk-ribbon-row">
          <div className="mk-ribbon__copy">
            <span className="idx">02 — RECORD</span>
            <h2>A transcript that files like an archive document.</h2>
            <p className="section-lead">Mono IDs, status badges, and a dense library — not a card wall.</p>
          </div>
          <div className="mk-ribbon__media mk-panel--forest">
            <img className="mk-panel-photo" src={IMAGES.ribbonDesk} alt="Documents on a working desk" />
          </div>
        </div>
        <div className="mk-ribbon-row">
          <div className="mk-ribbon__copy">
            <span className="idx">03 — VOICE</span>
            <h2>Built for the recording, not the thumbnail.</h2>
            <p className="section-lead">Long sessions, speaker turns, and a PDF you can send without the original file.</p>
          </div>
          <div className="mk-ribbon__media mk-panel--mist">
            <img className="mk-panel-photo" src={IMAGES.ribbonStudio} alt="Studio microphone" />
          </div>
        </div>
      </div>

      <section id="portals" className="mk-portals">
        <div className="container">
          <Reveal>
            <p className="label dark">Portals</p>
            <h2>Where the work happens.</h2>
            <p className="section-lead">Two rooms after you sign in. Dense, tabular, forest chrome.</p>
          </Reveal>
          <div className="mk-portals-grid">
            <article className="card">
              <div className="card-body">
                <div className="ic"><BrandMark className="w-7 h-7" /></div>
                <h3>New job</h3>
                <p>Resumable upload. Title and description are written from the transcript.</p>
                <ul className="ticks">
                  <li><span className="dot" /> Up to 5 GB on Pro storage</li>
                  <li><span className="dot" /> mp4 · mp3 · wav · m4a</li>
                </ul>
              </div>
            </article>
            <article className="card">
              <div className="card-body">
                <div className="ic"><BrandMark className="w-7 h-7" /></div>
                <h3>Library</h3>
                <p>Search, status, copy, and PDF. Mobile stacks as cards; desktop stays a table.</p>
                <ul className="ticks">
                  <li><span className="dot" /> Gold for in-flight, mint for ready</li>
                  <li><span className="dot" /> Detail tiles + transcript body</li>
                </ul>
              </div>
            </article>
          </div>
        </div>
      </section>

      <div className="mk-slash" aria-hidden />

      <section className="mk-statement">
        <div className="container">
          <p className="statement">Keep the <span className="lime">file</span>. Ship the words.</p>
          <div className="mk-metrics">
            <div><strong>5 GB</strong><span>Designed file ceiling</span></div>
            <div><strong>6 MB</strong><span>Resumable chunk size</span></div>
            <div><strong>48 h</strong><span>Signed URL window</span></div>
          </div>
        </div>
      </section>

      <div className="mk-slash" aria-hidden />
      <section className="cta-band">
        <div className="container">
          <h2>Open the studio.</h2>
          <p className="section-lead">Sign in with email. Your jobs stay behind RLS on your project.</p>
          <div className="jump" style={{ marginTop: 24 }}>
            <button type="button" className="btn btn-dark" onClick={onEnter}>
              Enter studio
              <span className="node"><ArrowRight size={14} /></span>
            </button>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="brand-tile" style={{ width: 38, height: 38, borderRadius: 10 }}>
                <NavBrandMark />
              </span>
              <strong>{BRAND.lockup}</strong>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.62)', maxWidth: '36ch', margin: 0 }}>{BRAND.support}</p>
          </div>
          <div>
            <h4>Product</h4>
            <a href="#flow">How it works</a>
            <a href="#portals">Studio</a>
            <button type="button" onClick={onSignIn}>Sign in</button>
          </div>
          <div>
            <h4>Record</h4>
            <a href="#problem">The bind</a>
            <a href="#flow">Method</a>
          </div>
          <div>
            <h4>Studio</h4>
            <button type="button" onClick={onEnter}>Enter</button>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>{BRAND.lockup}</span>
          <span>Private jobs. Forest chrome. No glassmorphism.</span>
        </div>
      </footer>
    </div>
  );
}
