import type { SnapshotFrom,EventFrom } from 'xstate';
import { kioskMachine } from './machine';
import type { EventSdk } from '../analytics-sdk/sdk';
import type { EventSession } from '../analytics-sdk/contract';

type Snapshot=SnapshotFrom<typeof kioskMachine>;
type Event=EventFrom<typeof kioskMachine>;
function identity(snapshot:Snapshot):EventSession|null{
  const session=snapshot.context.session;
  return session?{sessionId:session.id,scenarioId:session.scenarioId,scenarioVersion:session.scenarioVersion,uiVariant:session.uiVariant}:null;
}
export function observeTransition(sdk:EventSdk,before:Snapshot,after:Snapshot){
  const session=identity(after);
  if(!session)return;
  const from=String(before.value),to=String(after.value);
  if(before.context.session?.id!==after.context.session?.id)void sdk.track(session,'SESSION_STARTED');
  if(from!==to){
    // Only the enumerated practice states; the initial catalog loading has no session.
    void sdk.track(session,'STATE_TRANSITION',{from,to});
    if(to==='COMPLETE')void sdk.track(session,'ORDER_COMPLETED');
    if(to==='CANCELLED')void sdk.track(session,'SESSION_CANCELLED');
  }
}
export function observeAction(sdk:EventSdk,before:Snapshot,after:Snapshot,event:Event){
  const session=identity(after);
  if(!session)return;
  const a=before.context,b=after.context,changed=before.value!==after.value;
  switch(event.type){
    case 'START_ORDER':
    case 'CONTINUE':if(changed)void sdk.track(session,'MISSION_CONFIRMED');break;
    case 'CATEGORY':if(b.category!==a.category)void sdk.track(session,'CATEGORY_SELECTED',{categoryId:b.category});break;
    case 'SWITCH_PRODUCT':if(b.draft&&a.draft?.menuId!==b.draft.menuId)void sdk.track(session,'MENU_SELECTED',{menuId:b.draft.menuId});break;
    case 'SELECT_MENU':if(changed&&b.draft)void sdk.track(session,'MENU_SELECTED',{menuId:b.draft.menuId});break;
    case 'OPTION':
      if(a.draft&&b.draft&&a.draft!==b.draft&&JSON.stringify(a.draft.optionIds)!==JSON.stringify(b.draft.optionIds))
        void sdk.track(session,'OPTION_SELECTED',{menuId:b.draft.menuId,groupId:event.groupId,optionId:event.optionId});
      break;
    case 'QUANTITY':if(b.draft&&a.draft?.quantity!==b.draft.quantity)void sdk.track(session,'QUANTITY_CHANGED',{quantity:b.draft.quantity});break;
    case 'ADD':if(changed&&a.draft)void sdk.track(session,a.draft.editIndex===null?'CART_ADDED':'CART_EDITED',{menuId:a.draft.menuId});break;
    case 'CART_QUANTITY':if(a.cart[event.index]&&b.cart[event.index]&&a.cart[event.index].quantity!==b.cart[event.index].quantity)void sdk.track(session,'CART_EDITED',{menuId:b.cart[event.index].menuId});break;
    case 'REMOVE':if(a.cart.length!==b.cart.length&&a.cart[event.index])void sdk.track(session,'CART_REMOVED',{menuId:a.cart[event.index].menuId});break;
    case 'BACK':if(changed)void sdk.track(session,'BACK');break;
    case 'HELP':if(a.help!==b.help)void sdk.track(session,'HELP',{open:b.help});break;
    case 'SUBMIT':if(changed&&after.matches('SUBMITTING')&&!a.frozen)void sdk.track(session,'PAYMENT_ATTEMPTED');break;
  }
}
