import { PLAYBOOK_STEPS, SIGN_VIDEO } from '../lib/playbook';

export default function SignPlaybook({ steps = PLAYBOOK_STEPS }) {
  return (
    <div className="card">
      <h3 className="card__title">Sign language steps</h3>
      <p style={{ fontSize: 14, color: 'var(--neutral-600)' }}>
        Five visual signs you can show without sound. Plus a captioned disaster-readiness video (ASL) and NID SASL resources.
      </p>
      <ol className="sign-steps">
        {steps.map((s) => (
          <li key={s.n} className="sign-step">
            <div className="sign-step__glyph" aria-hidden="true">{s.n}</div>
            <div>
              <strong>{s.title}</strong>
              <p>{s.body}</p>
              <p className="sign-step__how"><span className="sign-step__tag">Sign</span> {s.sign}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="sign-video">
        <iframe
          title={SIGN_VIDEO.title}
          src={`https://www.youtube-nocookie.com/embed/${SIGN_VIDEO.youtubeId}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
        <p style={{ fontSize: 12, color: 'var(--neutral-500)' }}>
          {SIGN_VIDEO.credit}. SASL dictionary and Deaf resources: <a href={SIGN_VIDEO.extra} target="_blank" rel="noreferrer">nid.org.za</a>
        </p>
      </div>
    </div>
  );
}
