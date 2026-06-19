import { useState, useEffect } from 'react';

// Replace with your RevenueCat API key from app.revenuecat.com
const RC_API_KEY = 'appl_REPLACE_WITH_YOUR_REVENUECAT_KEY';
// Must match the product ID you create in App Store Connect
const PRODUCT_ID = 'com.geralyn.questforge.builder_monthly';

// Stored at module level — never returned from async functions to avoid
// Capacitor plugin proxies being mistaken as thenables by the JS runtime.
let _P = null;

async function loadPlugin() {
  if (_P) return;
  try {
    const { Capacitor } = await import('@capacitor/core');
    if (!Capacitor.isNativePlatform()) return;
    const rc = await import('@revenuecat/purchases-capacitor');
    _P = rc.Purchases; // assign synchronously, never returned from async fn
  } catch {}
}

export async function initRevenueCat() {
  await loadPlugin();
  if (!_P) return;
  try { await _P.configure({ apiKey: RC_API_KEY }); } catch {}
}

export async function checkEntitlement() {
  if (!_P) return false;
  try {
    const { customerInfo } = await _P.getCustomerInfo();
    return !!customerInfo.entitlements.active['builder'];
  } catch { return false; }
}

function FeatureRow({ text, included }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0' }}>
      {included ? (
        <div style={{
          width: 22, height: 22, borderRadius: '50%',
          background: '#F97316', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      ) : (
        <div style={{
          width: 22, height: 22, borderRadius: '50%',
          border: '1.5px solid #D0CDD8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M3 5h4" stroke="#C0BCC8" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      )}
      <span style={{ fontSize: 15, color: included ? 'var(--qf-ink)' : '#A0A0B0' }}>{text}</span>
    </div>
  );
}

export default function PricingScreen({ onBack, onUnlocked }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async () => {
    if (!_P) { setError('Subscriptions are only available in the iOS app.'); return; }
    setLoading(true);
    setError('');
    try {
      const { offerings } = await _P.getOfferings();
      const pkg = offerings.current?.availablePackages?.find(p => p.product.productIdentifier === PRODUCT_ID)
        || offerings.current?.availablePackages?.[0];
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
    if (!_P) return;
    setLoading(true);
    setError('');
    try {
      const { customerInfo } = await _P.restorePurchases();
      if (customerInfo.entitlements.active['builder']) {
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
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: '#F97316', textTransform: 'uppercase' }}>Builder</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--qf-ink)', lineHeight: 1.2 }}>Unlock Quest Builder</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 32px' }}>
        {/* Hero */}
        <div style={{
          borderRadius: 24, background: 'linear-gradient(135deg, #FF8642, #E8401C)',
          padding: '28px 24px', marginBottom: 20, textAlign: 'center',
          boxShadow: '0 8px 32px #F9731640',
        }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🗺️</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', lineHeight: 1.1 }}>Quest Builder</div>
          <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', marginTop: 6 }}>
            Create unlimited quests for your corporate teams, event, family or friends
          </div>
          <div style={{ marginTop: 20, display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4 }}>
            <span style={{ fontSize: 48, fontWeight: 900, color: '#fff' }}>$5.99</span>
            <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.75)' }}>/month</span>
          </div>
        </div>

        {/* Features */}
        <div style={{ background: 'var(--qf-surface)', borderRadius: 20, padding: '18px 20px', marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.5, color: 'var(--qf-ink-soft)', marginBottom: 12, textTransform: 'uppercase' }}>
            What's included
          </div>
          <FeatureRow text="Build unlimited quests" included />
          <FeatureRow text="Add stops on the map" included />
          <FeatureRow text="GPS check-ins at each stop" included />
          <FeatureRow text="Quizzes, riddles & photo challenges" included />
          <FeatureRow text="Points & penalty scoring" included />
          <FeatureRow text="Play quests for free" included />
        </div>

        {/* Subscribe button */}
        <button
          onClick={handleSubscribe}
          disabled={loading}
          style={{
            width: '100%', padding: '18px 0', borderRadius: 18, border: 'none',
            background: loading ? '#CCC' : '#F97316',
            color: '#fff', fontSize: 17, fontWeight: 800,
            cursor: loading ? 'not-allowed' : 'pointer',
            touchAction: 'manipulation',
            boxShadow: loading ? 'none' : '0 6px 20px #F9731650',
          }}
        >
          {loading ? 'Processing…' : 'Subscribe · $5.99/month'}
        </button>

        {error ? (
          <div style={{ marginTop: 12, textAlign: 'center', fontSize: 13, color: '#E03E3E' }}>{error}</div>
        ) : null}

        {/* Restore */}
        <button
          onClick={handleRestore}
          disabled={loading}
          style={{
            width: '100%', marginTop: 12, padding: '12px 0', borderRadius: 14,
            border: 'none', background: 'transparent',
            color: 'var(--qf-ink-soft)', fontSize: 14, cursor: 'pointer',
            touchAction: 'manipulation',
          }}
        >
          Restore previous purchase
        </button>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--qf-ink-soft)', marginTop: 8, lineHeight: 1.5 }}>
          Subscription auto-renews monthly. Cancel anytime in iPhone Settings → Apple ID → Subscriptions.
          Payment charged to your Apple ID.
        </p>
      </div>
    </div>
  );
}
