import { useState } from 'react';

// Set your RevenueCat iOS API key from app.revenuecat.com
const RC_API_KEY = 'appl_REPLACE_WITH_YOUR_REVENUECAT_KEY';
// Must match the product ID in App Store Connect
const PRODUCT_ID = 'com.geralyn.questforge.pro_monthly';

// Stored at module level — Capacitor plugin proxies are thenables,
// returning them from async functions causes a runtime crash on iOS.
let _P = null;

async function loadPlugin() {
  if (_P) return;
  try {
    const { Capacitor } = await import('@capacitor/core');
    if (!Capacitor.isNativePlatform()) return;
    const rc = await import('@revenuecat/purchases-capacitor');
    _P = rc.Purchases;
  } catch {}
}

export async function initRevenueCat() {
  await loadPlugin();
  if (!_P) return;
  try { await _P.configure({ apiKey: RC_API_KEY }); } catch {}
}

export async function checkProEntitlement() {
  if (!_P) return false;
  try {
    const { customerInfo } = await _P.getCustomerInfo();
    return !!customerInfo.entitlements.active['pro'];
  } catch { return false; }
}

export default function ProScreen({ onBack, onUnlocked }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async () => {
    if (!_P) { setError('Subscriptions are only available in the iOS app.'); return; }
    setLoading(true);
    setError('');
    try {
      const { offerings } = await _P.getOfferings();
      const pkg = offerings.current?.availablePackages?.find(
        p => p.product.productIdentifier === PRODUCT_ID
      ) || offerings.current?.availablePackages?.[0];
      if (!pkg) { setError('Product not found. Please try again later.'); setLoading(false); return; }
      await _P.purchasePackage({ aPackage: pkg });
      onUnlocked?.();
    } catch (e) {
      if (!e.userCancelled) setError('Purchase failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!_P) { setError('Restore is only available in the iOS app.'); return; }
    setLoading(true);
    setError('');
    try {
      const { customerInfo } = await _P.restorePurchases();
      if (customerInfo.entitlements.active['pro']) {
        onUnlocked?.();
      } else {
        setError('No active subscription found.');
      }
    } catch {
      setError('Could not restore purchases.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--qf-bg)', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ padding: '16px 20px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onPointerUp={(e) => { e.currentTarget.releasePointerCapture(e.pointerId); onBack?.(); }}
          style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: 'var(--qf-surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', touchAction: 'manipulation', flexShrink: 0 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 19l-7-7 7-7" stroke="var(--qf-ink)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: 'var(--qf-primary)', textTransform: 'uppercase' }}>QuestForge</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--qf-ink)', lineHeight: 1.2 }}>Go Pro</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 36px' }}>

        {/* Hero card */}
        <div style={{
          borderRadius: 24, padding: '28px 24px 24px', marginBottom: 20, textAlign: 'center',
          background: 'linear-gradient(145deg, var(--qf-primary), var(--qf-secondary))',
          boxShadow: '0 12px 40px -12px var(--qf-primary)',
        }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>🏆</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', lineHeight: 1.1, fontFamily: 'var(--qf-display)' }}>QuestForge Pro</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.82)', marginTop: 6, lineHeight: 1.45 }}>
            Build and publish unlimited quests for your team, event, or community
          </div>
          <div style={{ marginTop: 20, display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 3 }}>
            <span style={{ fontSize: 42, fontWeight: 900, color: '#fff', lineHeight: 1 }}>$5.99</span>
            <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', alignSelf: 'flex-end', paddingBottom: 4 }}>/month</span>
          </div>
          <div style={{
            display: 'inline-block', marginTop: 10,
            background: 'rgba(255,255,255,0.22)', borderRadius: 20,
            padding: '5px 14px', fontSize: 13, fontWeight: 700, color: '#fff',
          }}>
            7-day free trial
          </div>
        </div>

        {/* Feature list */}
        <div style={{ background: 'var(--qf-surface)', borderRadius: 20, padding: '18px 20px', marginBottom: 20, border: '1px solid var(--qf-line)' }}>
          {[
            ['🗺️', 'Build unlimited quests'],
            ['📍', 'Drop stops anywhere on the map'],
            ['🧩', 'Add quizzes, riddles & photo challenges'],
            ['👥', 'Invite unlimited teams'],
            ['🏅', 'Live scoring & leaderboards'],
            ['📣', 'Broadcast messages to all players'],
          ].map(([icon, text]) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderBottom: '1px solid var(--qf-line)' }}>
              <span style={{ fontSize: 20, width: 28, textAlign: 'center', flexShrink: 0 }}>{icon}</span>
              <span style={{ fontSize: 15, color: 'var(--qf-ink)', fontWeight: 500 }}>{text}</span>
            </div>
          )).reduce((acc, el, i, arr) => {
            const clone = i === arr.length - 1
              ? { ...el, props: { ...el.props, style: { ...el.props.style, borderBottom: 'none' } } }
              : el;
            return [...acc, clone];
          }, [])}
        </div>

        {/* Subscribe button */}
        <button
          onPointerUp={(e) => { e.currentTarget.releasePointerCapture(e.pointerId); if (!loading) handleSubscribe(); }}
          disabled={loading}
          style={{
            width: '100%', padding: '18px 0', borderRadius: 18, border: 'none',
            background: loading ? 'var(--qf-muted)' : 'var(--qf-primary)',
            color: 'var(--qf-primary-ink)', fontSize: 17, fontWeight: 800,
            cursor: loading ? 'not-allowed' : 'pointer', touchAction: 'manipulation',
            boxShadow: loading ? 'none' : '0 8px 24px -8px var(--qf-primary)',
            fontFamily: 'var(--qf-display)',
          }}
        >
          {loading ? 'Processing…' : 'Start free trial'}
        </button>

        {error ? (
          <div style={{ marginTop: 12, textAlign: 'center', fontSize: 13, color: '#E03E3E' }}>{error}</div>
        ) : null}

        {/* Restore */}
        <button
          onPointerUp={(e) => { e.currentTarget.releasePointerCapture(e.pointerId); if (!loading) handleRestore(); }}
          disabled={loading}
          style={{
            width: '100%', marginTop: 10, padding: '12px 0', borderRadius: 14,
            border: 'none', background: 'transparent',
            color: 'var(--qf-muted)', fontSize: 14, cursor: 'pointer', touchAction: 'manipulation',
          }}
        >
          Restore previous purchase
        </button>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--qf-muted)', marginTop: 6, lineHeight: 1.6 }}>
          7-day free trial, then $5.99/month. Renews automatically unless cancelled at least 24 hours before the end of the trial period. Manage or cancel in iPhone Settings → Apple ID → Subscriptions.
        </p>
      </div>
    </div>
  );
}
