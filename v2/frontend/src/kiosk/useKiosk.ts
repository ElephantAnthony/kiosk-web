import { useEffect, useRef, useState } from 'react';
import { createActor, type ActorRefFrom, type EventFrom } from 'xstate';
import { kioskMachine } from './machine';

export function useKiosk() {
  const ref = useRef<ActorRefFrom<typeof kioskMachine> | null>(null);
  const [snapshot, setSnapshot] = useState(() => createActor(kioskMachine).getSnapshot());
  useEffect(() => {
    const actor = createActor(kioskMachine);
    ref.current = actor;
    const subscription = actor.subscribe(setSnapshot);
    actor.start();
    return () => { subscription.unsubscribe(); actor.stop(); ref.current = null; };
  }, []);
  const send = (event: EventFrom<typeof kioskMachine>) => ref.current?.send(event);
  useEffect(() => {
    const active = ['MISSION','MENU','OPTION','CART','PAYMENT'].includes(String(snapshot.value));
    if (!active) return;
    let previous = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      if (document.visibilityState === 'visible') ref.current?.send({ type: 'TICK', ms: Math.min(now - previous, 1000) });
      previous = now;
    }, 250);
    const reset = () => { previous = performance.now(); };
    document.addEventListener('visibilitychange', reset);
    return () => { window.clearInterval(id); document.removeEventListener('visibilitychange', reset); };
  }, [snapshot.value]);
  return { snapshot, send };
}
