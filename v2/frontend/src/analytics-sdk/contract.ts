import Ajv2020 from 'ajv/dist/2020.js';
import schema from '../../../contracts/event.schema.json' with { type: 'json' };
export type EventType = 'SESSION_STARTED'|'MISSION_CONFIRMED'|'CATEGORY_SELECTED'|'MENU_SELECTED'|'OPTION_SELECTED'|'QUANTITY_CHANGED'|'CART_ADDED'|'CART_EDITED'|'CART_REMOVED'|'BACK'|'HELP'|'PAYMENT_ATTEMPTED'|'ORDER_COMPLETED'|'SESSION_CANCELLED'|'STATE_TRANSITION';
export type Payload = Record<string,string|number|boolean|null>;
export interface TrainingEvent {
  eventId:string; sessionId:string; sequence:number; eventType:EventType;
  scenarioId:string; scenarioVersion:number; clientTimestamp:string; uiVariant:'standard'; payload:Payload;
}
export type EventSession = Pick<TrainingEvent,'sessionId'|'scenarioId'|'scenarioVersion'|'uiVariant'>;
const validate = new Ajv2020({strict:true,allErrors:true}).compile<TrainingEvent>(schema);
export function validEvent(value:unknown):value is TrainingEvent { return validate(value); }
