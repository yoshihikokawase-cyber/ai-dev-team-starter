import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@/lib/supabase/server';

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT ?? 'mailto:admin@quickhabit.app',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '',
  process.env.VAPID_PRIVATE_KEY ?? ''
);

export async function POST() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error('[push-send] Auth failed:', authError?.message);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  console.log('[push-send] Authenticated user:', user.id);

  const { data: sub, error: subError } = await supabase
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth, id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  console.log('[push-send] Subscription query — sub:', sub ? 'found' : 'null', 'subError:', subError ? JSON.stringify(subError) : 'none');

  if (subError || !sub) {
    console.error('[push-send] No active subscription. subError code:', subError?.code, 'message:', subError?.message);
    return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
  }

  const payload = JSON.stringify({
    title: 'QuickHabit',
    body: '\u4ECA\u65E5\u306E\u7FD2\u6163\u3092\u8A18\u9332\u3057\u307E\u3057\u3087\u3046\uFF01',
    url: '/',
  });

  console.log('[push-send] Sending to endpoint:', sub.endpoint.slice(0, 60) + '...');
  try {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      payload
    );
    console.log('[push-send] Sent successfully');
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const status = (err as { statusCode?: number }).statusCode;
    console.error('[push-send] webpush.sendNotification failed. statusCode:', status, 'error:', err);
    if (status === 410 || status === 404) {
      await supabase.from('push_subscriptions').update({ is_active: false }).eq('id', sub.id);
      return NextResponse.json({ error: 'Subscription expired. Marked inactive.' }, { status: 410 });
    }
    return NextResponse.json({ error: 'Push send failed' }, { status: 500 });
  }
}
