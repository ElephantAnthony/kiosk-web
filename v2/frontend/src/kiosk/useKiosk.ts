import { useEffect, useRef, useState } from 'react';
import { createActor, type ActorRefFrom, type EventFrom } from 'xstate';
import { kioskMachine } from './machine';
import { eventSdk,type DeliveryStatus } from '../analytics-sdk/sdk';
import { observeAction,observeTransition } from './telemetry';

export function useKiosk() {
  const ref = useRef<ActorRefFrom<typeof kioskMachine> | null>(null);
  const [snapshot, setSnapshot] = useState(() => createActor(kioskMachine).getSnapshot());
  const [delivery,setDelivery]=useState<DeliveryStatus>('ready');
  useEffect(() => {
    const unsubscribe=eventSdk.subscribe(setDelivery);
    eventSdk.start();
    const actor = createActor(kioskMachine);
    ref.current = actor;
    let previous=actor.getSnapshot();
    const subscription = actor.subscribe(next=>{observeTransition(eventSdk,previous,next);previous=next;setSnapshot(next);});
    actor.start();
    return () => { subscription.unsubscribe(); actor.stop(); ref.current = null; unsubscribe(); eventSdk.stop(); };
  }, []);
  const send = (event: EventFrom<typeof kioskMachine>) => {
    const actor=ref.current;if(!actor)return;
    const before=actor.getSnapshot();actor.send(event);observeAction(eventSdk,before,actor.getSnapshot(),event);
  };
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
  return { snapshot, send, delivery };
}
