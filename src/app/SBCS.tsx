import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowLeft, ArrowRight, Cake, CalendarCheck, CheckCircle2, ClipboardCheck, Instagram, Link as LinkIcon, Mail, MessageCircle, Music, Palette, ShieldCheck, Sparkles, Users, Workflow } from 'lucide-react';
import './SBCS.css';

const whatsappBase = 'https://wa.me/2348068483718?text=';

const features = [
  { icon: CalendarCheck, title: 'Birthday calendar', text: 'Keep upcoming birthdays organised by date, class and school year.' },
  { icon: Palette, title: 'School-branded cards', text: 'Create reusable birthday-card designs with your school colours, logo and approved wording.' },
  { icon: MessageCircle, title: 'WhatsApp greetings', text: 'Prepare personalised greetings for guardians through an approved WhatsApp Business provider.' },
  { icon: Mail, title: 'Email delivery', text: 'Send a matching greeting by email when a guardian has provided an eligible address.' },
  { icon: ClipboardCheck, title: 'Staff approval first', text: 'Review each message and card before delivery during the pilot phase.' },
  { icon: ShieldCheck, title: 'Privacy-conscious workflow', text: 'Use permission checks, role-based access, delivery records and duplicate-send safeguards.' },
];

const steps = [
  ['01', 'Connect your records', 'Start with a school-approved spreadsheet or a carefully controlled data import.'],
  ['02', 'Set your school identity', 'Add the logo, colours, preferred greeting style and message templates.'],
  ['03', 'Review the birthday queue', 'The system prepares eligible greetings for staff review ahead of each birthday.'],
  ['04', 'Approve and track', 'Staff approve messages, then view channel status and delivery history.'],
];

export default function SBCS() {
  const [school, setSchool] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [size, setSize] = useState('100–500 students');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Student Birthday Celebration System | BlueHaven Studios';
    let description = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!description) {
      description = document.createElement('meta');
      description.name = 'description';
      document.head.appendChild(description);
    }
    const previousDescription = description.content;
    description.content = 'A school-branded birthday greeting workflow by BlueHaven Studios. Personalised cards, guardian messaging, staff approvals and delivery tracking.';
    return () => {
      document.title = previousTitle;
      description!.content = previousDescription;
    };
  }, []);

  const submitEnquiry = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = [
      'Hello BlueHaven Studios, I would like to discuss the Student Birthday Celebration System (SBCS).',
      '',
      `School: ${school}`,
      `Contact person: ${contact}`,
      `Work email: ${email || 'Not provided'}`,
      `Approximate student count: ${size}`,
      `Notes: ${message || 'No additional notes'}`,
      '',
      'Please share the pilot setup and next steps.',
    ].join('\n');
    setSubmitted(true);
    window.open(whatsappBase + encodeURIComponent(text), '_blank', 'noopener,noreferrer');
  };

  return (
    <main className="sbcs-page">
      <header className="sbcs-nav">
        <a className="sbcs-back" href="/services"><ArrowLeft size={16} /> All services</a>
        <a className="sbcs-wordmark" href="/" aria-label="BlueHaven Studios home"><span>BLUE</span>HAVEN<span className="sbcs-dot">.</span></a>
        <a className="sbcs-nav-cta" href="#sbcs-enquire">Talk to us <ArrowRight size={15} /></a>
      </header>

      <section className="sbcs-hero">
        <div className="sbcs-hero-copy">
          <p className="sbcs-eyebrow"><span /> A BLUEHAVEN STUDIOS PRODUCT</p>
          <h1>Make every student birthday feel <em>remembered.</em></h1>
          <p className="sbcs-lede">A school-branded birthday celebration workflow that helps your team prepare thoughtful greetings for parents and guardians — without searching through spreadsheets every morning.</p>
          <div className="sbcs-hero-actions">
            <a className="sbcs-button sbcs-button-primary" href="#sbcs-enquire">Discuss a school pilot <ArrowRight size={17} /></a>
            <a className="sbcs-button sbcs-button-secondary" href="#sbcs-how">See how it works</a>
          </div>
          <div className="sbcs-trust-line"><ShieldCheck size={16} /> Staff-reviewed workflow · Permission checks · Delivery records</div>
        </div>
        <div className="sbcs-preview-wrap" aria-label="Illustration of a school birthday greeting dashboard">
          <div className="sbcs-preview-glow" />
          <div className="sbcs-preview">
            <div className="sbcs-preview-top"><span className="sbcs-mini-mark">BH</span><div><strong>Birthday desk</strong><small>School communications</small></div><span className="sbcs-status">PILOT PREVIEW</span></div>
            <div className="sbcs-preview-date"><div><small>TODAY'S OVERVIEW</small><h2>Birthday queue</h2></div><div className="sbcs-date-tile"><span>OCT</span><strong>18</strong></div></div>
            <div className="sbcs-stat-grid"><div><small>Upcoming</small><strong>08</strong><span>Next 7 days</span></div><div><small>Needs review</small><strong>03</strong><span>Staff approval</span></div><div><small>Sent this month</small><strong>24</strong><span>Illustrative only</span></div></div>
            <div className="sbcs-preview-label">NEXT IN QUEUE</div>
            <div className="sbcs-queue-row"><div className="sbcs-avatar">A</div><div className="sbcs-queue-name"><strong>Student greeting</strong><small>Guardian · WhatsApp + email</small></div><span className="sbcs-review">Review</span></div>
            <div className="sbcs-queue-row"><div className="sbcs-avatar sbcs-avatar-gold">B</div><div className="sbcs-queue-name"><strong>Birthday card</strong><small>School template · Awaiting approval</small></div><span className="sbcs-review">Review</span></div>
            <div className="sbcs-preview-foot"><Sparkles size={14} /> Preview concept — no real student records shown</div>
          </div>
          <div className="sbcs-floating-note"><CheckCircle2 size={17} /><span><strong>Human approval built in</strong><small>Review before sending</small></span></div>
        </div>
      </section>

      <section className="sbcs-metrics" aria-label="System principles">
        <div><strong>01</strong><span>School-branded</span></div><div><strong>02</strong><span>Multi-channel ready</span></div><div><strong>03</strong><span>Approval-led</span></div><div><strong>04</strong><span>Built for repeatability</span></div>
      </section>

      <section className="sbcs-section sbcs-features">
        <div className="sbcs-section-heading"><p className="sbcs-eyebrow">THE WORKFLOW</p><h2>Thoughtful greetings.<br /><em>Less manual work.</em></h2><p>Bring the repetitive parts together while keeping school staff in control of what gets sent.</p></div>
        <div className="sbcs-feature-grid">{features.map(({ icon: Icon, title, text }) => <article className="sbcs-feature" key={title}><span className="sbcs-feature-icon"><Icon size={21} /></span><h3>{title}</h3><p>{text}</p></article>)}</div>
      </section>

      <section className="sbcs-how" id="sbcs-how">
        <div className="sbcs-how-heading"><p className="sbcs-eyebrow">FROM RECORDS TO GREETINGS</p><h2>A clear process.<br /><em>One birthday at a time.</em></h2></div>
        <div className="sbcs-steps">{steps.map(([number, title, text]) => <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div>
      </section>

      <section className="sbcs-safety">
        <div className="sbcs-safety-icon"><ShieldCheck size={27} /></div>
        <div><p className="sbcs-eyebrow">DESIGNED WITH CARE</p><h2>Student data deserves care, not shortcuts.</h2><p>Before any live messaging is enabled, each school must confirm its authority to use the records, guardian contact permissions and preferred channels. Access controls, message logs, retention rules and duplicate-send safeguards are part of the implementation plan.</p></div>
        <ul><li><CheckCircle2 size={16} /> No public student directory</li><li><CheckCircle2 size={16} /> Staff approval during pilot</li><li><CheckCircle2 size={16} /> Separate school access</li><li><CheckCircle2 size={16} /> Provider integration before live delivery</li></ul>
      </section>

      <section className="sbcs-enquire" id="sbcs-enquire">
        <div className="sbcs-enquire-copy"><p className="sbcs-eyebrow">LET'S SET UP YOUR SCHOOL</p><h2>Make birthdays part of your school's <em>care culture.</em></h2><p>Tell us a little about your school. We’ll open a pre-filled WhatsApp enquiry so we can discuss the pilot, data setup and suitable messaging options.</p><div className="sbcs-enquire-note"><Users size={17} /> No student records are requested in this enquiry form.</div></div>
        <form className="sbcs-form" onSubmit={submitEnquiry}>
          <label>School name<input required value={school} onChange={e => setSchool(e.target.value)} placeholder="e.g. Stonebridge School" /></label>
          <label>Your name<input required value={contact} onChange={e => setContact(e.target.value)} placeholder="Name of school contact" /></label>
          <label>Work email <span>(optional)</span><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@school.edu.ng" /></label>
          <label>Approximate student count<select value={size} onChange={e => setSize(e.target.value)}><option>Under 100 students</option><option>100–500 students</option><option>501–1,000 students</option><option>1,000+ students</option></select></label>
          <label>What would you like to automate? <span>(optional)</span><textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Birthday cards, WhatsApp, email, approvals..." rows={3} /></label>
          <button className="sbcs-button sbcs-button-primary sbcs-submit" type="submit">Continue on WhatsApp <MessageCircle size={17} /></button>
          {submitted && <p className="sbcs-form-hint" role="status">Your enquiry details are ready in WhatsApp. Complete the send there to contact BlueHaven.</p>}
          <small>Submitting opens WhatsApp. This form does not store your details on this website.</small>
        </form>
      </section>

      <footer className="sbcs-footer" id="contact">
        <div className="sbcs-footer-glow sbcs-footer-glow-one" aria-hidden="true" />
        <div className="sbcs-footer-glow sbcs-footer-glow-two" aria-hidden="true" />
        <div className="sbcs-footer-inner">
          <div className="sbcs-footer-grid">
            <div className="sbcs-footer-brand">
              <h2>Ready to Get Started?</h2>
              <span className="sbcs-footer-rule" />
              <p>Let's create something amazing together. Partner with us to build unique identities and unforgettable digital experiences.</p>
              <a className="sbcs-footer-chat" href="https://wa.me/2348068483718?text=I%20would%20love%20to%20make%20enquiries%20about%20your%20service" target="_blank" rel="noopener noreferrer"><MessageCircle size={17} /> Chat with us <ArrowRight size={15} /></a>
            </div>
            <nav className="sbcs-footer-links" aria-label="Explore BlueHaven">
              <h3>Explore</h3>
              <a href="/">Home</a><a href="/services">Services</a><a href="/stories">Stories</a><a href="/work">Work</a><a href="/about">About</a><a href="/process">Process</a><a href="/inquire">Inquire</a>
            </nav>
            <div className="sbcs-footer-contact">
              <h3>Contact Us</h3>
              <div className="sbcs-footer-icon-links">
                <a className="sbcs-contact-icon sbcs-contact-email" href="mailto:bluehavens.studios@gmail.com" title="Email BlueHaven" aria-label="Email BlueHaven"><Mail size={20} /></a>
                <a className="sbcs-contact-icon sbcs-contact-phone" href="https://wa.me/2348068483718?text=I%20would%20love%20to%20make%20enquiries%20about%20your%20service" target="_blank" rel="noopener noreferrer" title="Contact BlueHaven" aria-label="Contact BlueHaven"><MessageCircle size={20} /></a>
                <a className="sbcs-contact-icon sbcs-contact-whatsapp" href="https://wa.me/2348068483718?text=Hello%20BlueHaven%20Studios" target="_blank" rel="noopener noreferrer" title="WhatsApp Business" aria-label="WhatsApp Business"><MessageCircle size={20} /></a>
              </div>
            </div>
            <div className="sbcs-footer-social">
              <h3>Follow Us</h3>
              <div className="sbcs-social-list">
                <a className="sbcs-social-instagram" href="https://www.instagram.com/blue.havenstudios" target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram"><Instagram size={20} /></a>
                <a className="sbcs-social-tiktok" href="https://www.tiktok.com/@bluehaven.studio" target="_blank" rel="noopener noreferrer" aria-label="TikTok" title="TikTok"><Music size={20} /></a>
                <a className="sbcs-social-threads" href="https://www.threads.com/@blue.havenstudios" target="_blank" rel="noopener noreferrer" aria-label="Threads" title="Threads"><LinkIcon size={20} /></a>
                <a className="sbcs-social-whatsapp" href="https://chat.whatsapp.com/Lf3Vw6FaRtZFDevqjOq3EA" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp community" title="WhatsApp community"><MessageCircle size={20} /></a>
                <a className="sbcs-social-links" href="https://campsite.bio/blue.havenstudios" target="_blank" rel="noopener noreferrer" aria-label="All BlueHaven links" title="All links"><ArrowRight size={20} /></a>
              </div>
            </div>
          </div>
          <div className="sbcs-footer-bottom">
            <p>© {new Date().getFullYear()} BlueHaven Studios. All rights reserved.</p>
            <div><a href="/privacy">Privacy</a><a href="/terms">Terms of service</a><a href="/services/sbcs">Student Birthday Celebration System</a></div>
          </div>
        </div>
      </footer>
    </main>
  );
}
