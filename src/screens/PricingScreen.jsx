// Stripe Payment Links — replace these with real links from your Stripe dashboard
const STRIPE_LINKS = {
  starter: 'https://buy.stripe.com/placeholder_starter',
  pro: 'https://buy.stripe.com/placeholder_pro',
};

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: null,
    color: '#8B8B9B',
    features: ['Play any quest', 'Join with a code', 'Track your score'],
    locked: ['Build quests', 'GPS check-ins', 'Photo challenges'],
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 9,
    color: '#F97316',
    badge: 'Popular',
    features: ['Everything in Free', 'Build up to 3 quests', 'Up to 20 stops per quest', 'All activity types', 'GPS check-ins'],
    locked: ['Unlimited quests'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    color: '#7C3AED',
    features: ['Everything in Starter', 'Unlimited quests', 'Unlimited stops', 'Custom branding', 'Priority support'],
    locked: [],
  },
];

function CheckIcon({ color }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="8" fill={color} fillOpacity="0.15" />
      <path d="M4.5 8l2.5 2.5 4.5-5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="2" y="6" width="10" height="7" rx="2" stroke="#C0BFC8" strokeWidth="1.5" />
      <path d="M4.5 6V4.5a2.5 2.5 0 015 0V6" stroke="#C0BFC8" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function PricingScreen({ currentPlan = 'free', onSelectPlan, onBack, appUrl }) {
  const handleUpgrade = (planId) => {
    const link = STRIPE_LINKS[planId];
    const successUrl = encodeURIComponent(`${appUrl || window.location.origin}?plan=${planId}`);
    window.location.href = `${link}?success_url=${successUrl}`;
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--qf-bg)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{
          width: 36, height: 36, borderRadius: 10, border: 'none',
          background: 'var(--qf-surface)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          touchAction: 'manipulation',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 19l-7-7 7-7" stroke="var(--qf-ink)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: 'var(--qf-accent)', textTransform: 'uppercase' }}>Plans</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--qf-ink)', lineHeight: 1.2 }}>Choose your plan</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--qf-ink-soft)', textAlign: 'center', paddingBottom: 4 }}>
          Build quests with a paid plan. Players always join for free.
        </p>

        {PLANS.map(plan => {
          const isCurrent = currentPlan === plan.id;
          return (
            <div key={plan.id} style={{
              borderRadius: 20,
              border: isCurrent ? `2px solid ${plan.color}` : '2px solid transparent',
              background: 'var(--qf-surface)',
              overflow: 'hidden',
              boxShadow: isCurrent ? `0 4px 20px ${plan.color}33` : '0 2px 8px rgba(0,0,0,0.06)',
            }}>
              {/* Plan header */}
              <div style={{
                background: isCurrent ? `${plan.color}18` : 'transparent',
                padding: '16px 18px 12px',
                display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18, fontWeight: 800, color: plan.color }}>{plan.name}</span>
                    {plan.badge && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
                        background: plan.color, color: '#fff',
                        borderRadius: 20, padding: '2px 8px',
                      }}>{plan.badge}</span>
                    )}
                    {isCurrent && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
                        background: 'var(--qf-ink)', color: 'var(--qf-bg)',
                        borderRadius: 20, padding: '2px 8px',
                      }}>Current</span>
                    )}
                  </div>
                  <div style={{ marginTop: 4 }}>
                    {plan.price ? (
                      <span>
                        <span style={{ fontSize: 28, fontWeight: 900, color: 'var(--qf-ink)' }}>${plan.price}</span>
                        <span style={{ fontSize: 13, color: 'var(--qf-ink-soft)' }}>/month</span>
                      </span>
                    ) : (
                      <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--qf-ink)' }}>Free</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Features */}
              <div style={{ padding: '0 18px 14px', display: 'flex', flexDirection: 'column', gap: 7 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CheckIcon color={plan.color} />
                    <span style={{ fontSize: 13, color: 'var(--qf-ink)' }}>{f}</span>
                  </div>
                ))}
                {plan.locked.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: 0.45 }}>
                    <LockIcon />
                    <span style={{ fontSize: 13, color: 'var(--qf-ink)' }}>{f}</span>
                  </div>
                ))}

                {/* CTA */}
                {plan.id !== 'free' && !isCurrent && (
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    style={{
                      marginTop: 8, width: '100%', padding: '13px 0',
                      borderRadius: 14, border: 'none',
                      background: plan.color, color: '#fff',
                      fontSize: 15, fontWeight: 700, cursor: 'pointer',
                      touchAction: 'manipulation',
                    }}
                  >
                    Upgrade to {plan.name} →
                  </button>
                )}
                {plan.id !== 'free' && isCurrent && (
                  <div style={{
                    marginTop: 8, width: '100%', padding: '13px 0',
                    borderRadius: 14, background: `${plan.color}18`,
                    color: plan.color, fontSize: 14, fontWeight: 600,
                    textAlign: 'center',
                  }}>
                    ✓ Active plan
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--qf-ink-soft)', textAlign: 'center' }}>
          Cancel anytime. Billed monthly via Stripe.
        </p>
      </div>
    </div>
  );
}
