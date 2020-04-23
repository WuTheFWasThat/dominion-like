import Immutable from 'immutable';
import * as random from "random-js";

import * as cards from "./cards";


export type PlayerQuestion = {
  type: string
};
export type PlayerChoice = {
  type: string
};
export type Player = AsyncGenerator<PlayerChoice, PlayerChoice, [GameState, PlayerQuestion | null]>;

export type Effect<T=GameState> = Generator<[GameState, PlayerQuestion | null], T, PlayerChoice>;
export type EffectFn<T=GameState> = (state: GameState) => Effect<T>;

export type RawSituation = {
  name: string,
  description: string | ((state: GameState) => string),
  fn: EffectFn,
  setup?: (state: GameState) => GameState,
  extra?: Immutable.Map<string, any>,
  energy_range?: [number, number],
  cost_range?: [number, number],
};
export type Situation = Immutable.Record<RawSituation>;
export function make_situation(raw: RawSituation): Situation {
  return Immutable.Record<RawSituation>(raw)();
}
export type SupplySituation = Immutable.Record<{
  energy: number, cost: number, situation: Situation
}>;

export type RawCard = {
  name: string,
  description: string | ((state: GameState) => string),
  cost_range?: [number, number],
  setup?: (state: GameState) => GameState,

  // these two should just be combined...
  fn: (state: GameState, me: Card) => Effect<[GameState, Card | null]>,

  extra?: Immutable.Map<string, any>,
  discard_hook?: (state: GameState, card: Card) => Effect<[GameState, Card | null]>,
  energy: number,
};
export type Card = Immutable.Record<RawCard>;
export function make_card(raw: RawCard): Card {
  return Immutable.Record<RawCard>(raw)();
}
export type SupplyCard = Immutable.Record<{
  card: Card, cost: number,
}>;

export type RawEvent = {
  name: string,
  description: string | ((state: GameState) => string),
  cost_range?: [number, number],
  energy_range?: [number, number],
  setup?: (state: GameState) => GameState,
  fn: (state: GameState, me: Event) => Effect<[GameState, Event]>,
  extra?: Immutable.Map<string, any>,
  cleanup?: (state: GameState, card: Card) => Effect,
  discard?: (state: GameState, card: Card) => Effect,
};
export type Event = Immutable.Record<RawEvent>;
export function make_event(raw: RawEvent): Event {
  return Immutable.Record<RawEvent>(raw)();
}
export type SupplyEvent = Immutable.Record<{
  event: Event, cost: number,
  energy: number,
}>;

type DeckType = 'draw' | 'hand' | 'discard';

export type GameState = Immutable.Record<{
  ended: boolean,
  energy: number,
  money: number,
  victory: number,
  draw: Immutable.List<Card>,
  discard: Immutable.List<Card>,
  hand: Immutable.List<Card>,
  trash: Immutable.List<Card>,
  supply: Immutable.List<SupplyCard>,
  events: Immutable.List<SupplyEvent>,
  situation_supply: Immutable.List<SupplySituation>,
  situations: Immutable.List<Situation>,
  turn_hooks: Immutable.List<EffectFn>,
  trash_hooks: Immutable.List<(state: GameState, card: Card) => Effect>,
  draw_hooks: Immutable.List<(state: GameState, card: Card) => Effect>,
  reshuffle_hooks: Immutable.List<(state: GameState) => Effect>,
  log: Immutable.List<string>,
  extra: Immutable.Map<string, any>,
  random: random.MersenneTwister19937,
  seed: number,
  error: null | string,
  previous: null | GameState,
}>;

export const InitialState: GameState = Immutable.Record({
  ended: false,
  energy: 0,
  money: 0,
  victory: 0,
  supply: Immutable.List<SupplyCard>([]),
  events: Immutable.List<SupplyEvent>([]),
  situation_supply: Immutable.List<SupplySituation>([
  ]),
  draw: Immutable.List([cards.Copper, cards.Copper, cards.Copper, cards.Copper, cards.Estate, cards.Estate, cards.Donkey, cards.Donkey]),
  discard: Immutable.List([]),
  hand: Immutable.List([]),
  trash: Immutable.List([]),
  situations: Immutable.List([
    cards.Triumph,
    cards.Reshuffle,
  ]),
  turn_hooks: Immutable.List([]),
  trash_hooks: Immutable.List([]),
  draw_hooks: Immutable.List([]),
  reshuffle_hooks: Immutable.List([]),
  log: Immutable.List([]),
  extra: Immutable.Map<string, any>([]),
  random: null as any,
  seed: 0,
  error: null,
  previous: null,
})();

export function initial_state(seed: number | null): GameState {
  let actual_seed = seed === null ? random.createEntropy()[0] : seed;
  const mt = random.MersenneTwister19937.seed(actual_seed);
  let state: GameState = InitialState;
  // TODO: sometimes include territory/diamond, colony/platinum
  state = state.set('supply', state.get('supply').push(
    Immutable.Record({
      card: cards.Copper,
      cost: 1,
    })(),
    Immutable.Record({
      card: cards.Silver,
      cost: 3,
    })(),
    Immutable.Record({
      card: cards.Gold,
      cost: 6,
    })(),
    Immutable.Record({
      card: cards.Estate,
      cost: 1,
    })(),
    Immutable.Record({
      card: cards.Duchy,
      cost: 3,
    })(),
    Immutable.Record({
      card: cards.Province,
      cost: 6,
    })(),
    Immutable.Record({
      card: cards.Donkey,
      cost: 1,
    })(),
    Immutable.Record({
      card: cards.Mule,
      cost: 2,
    })(),
  ));
  const kingdom = random.sample(mt, Object.keys(cards.KINGDOM_CARDS), 8).map((k) => cards.KINGDOM_CARDS[k]);
  kingdom.forEach((card) => {
    let cost_range = card.get('cost_range') || [1, 5];
    let setup = card.get('setup');
    if (setup) {
      // console.log('setting up', state.get('extra').toJS());;
      state = setup(state);
      // console.log(state.get('extra').toJS());
    }
    state = state.set('supply', state.get('supply').push(
      Immutable.Record({
        card: card, cost: random.integer(cost_range[0], cost_range[1])(mt),
      })()
    ));
  });

  state = state.set('events', state.get('events').push(
    Immutable.Record({
      event: cards.Reboot,
      cost: 0,
      energy: random.integer(0, 3)(mt),
    })(),
  ));
  const kingdom_events = random.sample(mt, Object.keys(cards.KINGDOM_EVENTS), 4).map((k) => cards.KINGDOM_EVENTS[k]);
  kingdom_events.forEach((event) => {
    let cost_range = event.get('cost_range') || [0, 5];
    let energy_range = event.get('energy_range') || [1, 2];
    state = state.set('events', state.get('events').push(
      Immutable.Record({
        event: event,
        cost: random.integer(cost_range[0], cost_range[1])(mt),
        energy: random.integer(energy_range[0], energy_range[1])(mt),
      })()
    ));
  });
  for (let event of state.get('events')) {
    let setup = event.get('event').get('setup');;
    if (setup) {
      // console.log('setting up', state.get('extra').toJS());;
      state = setup(state);
      // console.log(state.get('extra').toJS());
    }
  }
  const kingdom_situations = random.sample(mt, Object.keys(cards.KINGDOM_SITUATIONS), 1).map((k) => cards.KINGDOM_SITUATIONS[k]);
  kingdom_situations.forEach((situation) => {
    state = state.set('situations', state.get('situations').push(situation));
  });

  const kingdom_situations_to_buy = random.sample(mt, Object.keys(cards.KINGDOM_SITUATIONS_TO_BUY), 1).map((k) => cards.KINGDOM_SITUATIONS_TO_BUY[k]);
  kingdom_situations_to_buy.forEach((situation) => {
    let cost_range = situation.get('cost_range') || [0, 0];
    let energy_range = situation.get('energy_range') || [5, 15];
    let setup = situation.get('setup');
    if (setup) {
      // console.log('setting up', state.get('extra').toJS());;
      state = setup(state);
      // console.log(state.get('extra').toJS());
    }
    state = state.set('situation_supply', state.get('situation_supply').push(
      Immutable.Record({
        situation: situation,
        cost: random.integer(cost_range[0], cost_range[1])(mt),
        energy: random.integer(energy_range[0], energy_range[1])(mt),
      })()
    ));
  });

  // useful for testing
  // state = state.set('hand', state.get('hand').push(
  //   cards.Chapel
  // ));
  // state = state.set('money', 100);

  state = state.set('seed', actual_seed);
  return state.set('random', mt);
}

function cloneRandom(state: GameState) {
  return random.MersenneTwister19937.seed(state.get('seed')).discard(
    state.get('random').getUseCount()
  )
}

function consumeRandom<T>(state: GameState, fn: (r: random.MersenneTwister19937) => T): [GameState, T] {
  let new_random = cloneRandom(state);
  let result: T = fn(new_random);
  state = state.set('random', new_random);
  return [state, result];
}


export function* scry(state: GameState): Effect<[GameState, Card | null]> {
  // get a card from the deck, but just return it (with new deck state)
  // caller should then do something with the card
  if (state.get('draw').size === 0) {
    // nothing to draw
    if (state.get('discard').size === 0) {
      return [state, null] as [GameState, null];
    }
    let hooks = state.get('reshuffle_hooks');
    for (let hook of hooks) {
      state = yield* hook(state);
    }
    state = state.set('log', state.get('log').push('Reshuffled'));
    state = state.set('draw', state.get('discard'));
    state = state.set('discard', Immutable.List());
  }
  const n = state.get('draw').size;
  let i;
  [state, i] = consumeRandom(state, random.integer(0, n-1));
  let drawn = state.get('draw').get(i);
  if (drawn === undefined) {
    throw Error(`Unable to draw? ${n} ${i}`)
  }
  state = state.set('draw', state.get('draw').delete(i));
  return [state, drawn] as [GameState, Card];
}

export function* draw(state: GameState, ndraw?: number): Effect<{state: GameState, cards: Array<Card>}> {
  if (ndraw === undefined) {
    ndraw = 1;
  }
  const drawn_cards = [];
  let hooks = state.get('draw_hooks');
  for (let i = 0; i < ndraw; i++) {
    let card;
    [state, card] = yield* scry(state);
    if (card === null) {
      continue;
    }
    state = state.set('hand', state.get('hand').push(card));
    for (let hook of hooks) {
      state = yield* hook(state, card);
    }
    drawn_cards.push(card);
  }
  if (drawn_cards.length) {
    let names = (drawn_cards).map((card) => card.get('name')).join(', ');
    state = state.set('log', state.get('log').push(`Drew ${names}`));
  }
  return { state, cards: drawn_cards };
}


export function* discard_from_hand(state: GameState, indices: Array<number>): Effect {
  indices = indices.slice().sort((a,b) => b-a);
  let cards: Array<Card> = [];
  for (let index of indices) {
    const card = state.get('hand').get(index);
    if (card === undefined) {
      throw Error(`Unable to discard? ${state.get('hand').size} ${index}`)
    }
    state = state.set('hand', state.get('hand').delete(index));
    cards.push(card);
  }
  for (let card of cards) {
    state = (yield* discard(state, card))[0];
  }
  if (cards.length) {
    let names = (cards).map((card) => card.get('name')).join(', ');
    state = state.set('log', state.get('log').push(`Discarded ${names}`));
  }
  return state;
}

export function* discard(state: GameState, card: Card): Effect<[GameState, Card | null]> {
  let fn = card.get('discard_hook');
  let maybe_card: Card | null = card;
  if (fn) {
    [state, maybe_card] = yield* fn(state, card);
  }
  if (maybe_card !== null) {
    state = state.set('discard', state.get('discard').push(maybe_card));
  }
  return [state, maybe_card] as [GameState, Card | null];
}

export function* trash(state: GameState, card: Card): Effect {
  let hooks = state.get('trash_hooks');
  for (let hook of hooks) {
    state = yield* hook(state, card);
  }
  state = state.set('trash', state.get('trash').push(card));
  return state;
}

export function* trash_from_deck(state: GameState, indices: Array<number>, type: DeckType): Effect {
  indices = indices.slice().sort((a,b) => b-a);
  let trashed_cards = [];
  for (let index of indices) {
    let card = state.get(type).get(index);
    if (card === undefined) {
      throw Error(`${type} card out of bounds ${index}`);
    }
    state = state.set(type, state.get(type).remove(index));
    trashed_cards.push(card);
    state = yield* trash(state, card);
  }
  let names = (trashed_cards).map((card) => card.get('name')).join(', ');
  state = state.set('log', state.get('log').push(`Trashed ${names}`));
  return state;
}

export function* gain_supply(state: GameState, cardName: string, n: number = 1, msg: string=''): Effect {
  let supply_card = getSupplyCard(state, cardName).supplyCard;
  if (supply_card === null) {
    throw Error(`Tried to gain ${cardName} which does not exist`);
  }
  let card = supply_card.get('card');
  return yield* gain(state, Array(n).fill(card), msg);
}

export function* gain(state: GameState, cards: Array<Card>, msg: string='', type: DeckType = 'discard'): Effect {
  for (let card of cards) {
    state = state.set(type, state.get(type).push(card));
  }
  let names = (cards).map((card) => card.get('name')).join(', ');
  state = state.set('log', state.get('log').push(`Gained ${names}${msg}`));
  // TODO: gain hooks
  return state;
}

export function* play_from_hand(state: GameState, index: number): Effect<[GameState, Card | null]> {
  let card = state.get('hand').get(index);
  state = state.set('hand', state.get('hand').remove(index));
  if (card === undefined) {
    throw Error(`Tried to play ${index} which does not exist`);
  }
  return yield* play(state, card);
}

export function* play(state: GameState, card: Card): Effect<[GameState, Card | null]> {
  let maybe_card;
  [state, maybe_card] = yield* card.get('fn')(state, card);
  if (maybe_card === null) {
    return [state, null] as [GameState, null];
  }
  card = maybe_card;
  [state, maybe_card] = yield* discard(state, card);
  if (maybe_card === null) {
    return [state, null] as [GameState, null];
  }
  card = maybe_card;
  return [state, card] as [GameState, Card];
}

export interface NoChoice extends PlayerChoice {
  type: 'no'
};

export interface UndoChoice extends PlayerChoice {
  type: 'undo'
};
function isUndo(choice: PlayerChoice): choice is UndoChoice {
    return choice.type === 'undo';
}

export interface ActionQuestion extends PlayerQuestion {
  type: 'action'
};
export function isActionQuestion(q: PlayerQuestion): q is ActionQuestion {
    return q.type === 'action';
}

export interface PlayChoice extends PlayerChoice {
  type: 'play';
  index: number;
};
function isPlay(choice: PlayerChoice): choice is PlayChoice {
    return choice.type === 'play';
}

export interface BuyChoice extends PlayerChoice {
  type: 'buy';
  cardname: string;
};
function isBuy(choice: PlayerChoice): choice is BuyChoice {
    return choice.type === 'buy';
}

export interface EventChoice extends PlayerChoice {
  type: 'event';
  cardname: string;
};
function isEvent(choice: PlayerChoice): choice is EventChoice {
    return choice.type === 'event';
}

export interface BuySituationChoice extends PlayerChoice {
  type: 'buy_situation';
  name: string;
};
function isBuySituation(choice: PlayerChoice): choice is BuySituationChoice {
    return choice.type === 'buy_situation';
}


export interface PickHandQuestion extends PlayerQuestion {
  type: 'pickhand',
  message: string,
  min?: number,
  max?: number,
};
export function isPickHandQuestion(q: PlayerQuestion): q is PickHandQuestion {
    return q.type === 'pickhand';
}
export interface PickHandChoice extends PlayerChoice {
  type: 'pickhand',
  indices: Array<number>,
};

export interface PickSupplyQuestion extends PlayerQuestion {
  type: 'picksupply',
  message: string,
};
export function isPickSupplyQuestion(q: PlayerQuestion): q is PickSupplyQuestion {
    return q.type === 'picksupply';
}
export interface PickSupplyChoice extends PlayerChoice {
  type: 'picksupply',
  cardname: string,
};

export interface PickTrashQuestion extends PlayerQuestion {
  type: 'picktrash',
  message: string,
};
export function isPickTrashQuestion(q: PlayerQuestion): q is PickTrashQuestion {
    return q.type === 'picktrash';
}
export interface PickTrashChoice extends PlayerChoice {
  type: 'picktrash',
  index: number,
};

export interface PickDrawQuestion extends PlayerQuestion {
  type: 'pickdraw',
  message: string,
  min?: number,
  max?: number,
};
export function isPickDrawQuestion(q: PlayerQuestion): q is PickDrawQuestion {
    return q.type === 'pickdraw';
}
export interface PickDrawChoice extends PlayerChoice {
  type: 'pickdraw',
  indices: Array<number>,
};


export interface PickQuestion extends PlayerQuestion {
  type: 'pick',
  message: string,
  options: Array<string>,
};
export function isPickQuestion(q: PlayerQuestion): q is PickQuestion {
    return q.type === 'pick';
}
export interface PickChoice extends PlayerChoice {
  type: 'pick',
  choice: number,
};


export async function applyEffect<T>(state: GameState, effect: EffectFn<T>, player: Player): Promise<T> {
  let init_state = state;
  let gen = effect(state)
  let result = await gen.next(null as any);  // hmm
  while (!result.done) {
    let question;
    [state, question] = result.value;
    let choice = (await player.next([state, question])).value;
    if (isUndo(choice)) {
      return await applyEffect<T>(init_state, effect, player);
    }
    result = await gen.next(choice);
  }
  return result.value;
}

/*
function trashSupplyCard(state: GameState, cardName: string): GameState {
  for (let i = 0; i < state.get('supply').size; i++) {
    const supplyCard = state.get('supply').get(i);
    if (supplyCard === undefined) {
      throw Error(`Supply card out of bounds ${i}`);
    }
    if (supplyCard.get('card').get('name') === cardName) {
      return state.set('supply', state.get('supply').remove(i));
    }
  }
  throw Error(`No such supply card found ${cardName}`);
}
*/

/*
export function trash_event(state: GameState, cardName: string): GameState {
  for (let i = 0; i < state.get('events').size; i++) {
    const supplyCard = state.get('events').get(i);
    if (supplyCard === undefined) {
      throw Error(`Supply card out of bounds ${i}`);
    }
    if (supplyCard.get('event').get('name') === cardName) {
      return state.set('events', state.get('events').remove(i));
    }
  }
  throw Error(`No such supply card found ${cardName}`);
}
*/


export function getSupplyCard(state: GameState, cardName: string): { index: number, supplyCard: SupplyCard | null} {
  for (let i = 0; i < state.get('supply').size; i++) {
    const supplyCard = state.get('supply').get(i);
    if (supplyCard === undefined) {
      throw Error(`Supply card out of bounds ${i}`);
    }
    if (supplyCard.get('card').get('name') === cardName) {
      return { index: i, supplyCard: supplyCard };
    }
  }
  return { index: -1, supplyCard: null };
}

export function getSupplyEvent(state: GameState, cardName: string): { index: number, supplyEvent: SupplyEvent | null} {
  for (let i = 0; i < state.get('events').size; i++) {
    const supplyEvent = state.get('events').get(i);
    if (supplyEvent === undefined) {
      throw Error(`Supply card out of bounds ${i}`);
    }
    if (supplyEvent.get('event').get('name') === cardName) {
      return { index: i, supplyEvent: supplyEvent };
    }
  }
  return { index: -1, supplyEvent: null };
}

export function getSupplySituation(state: GameState, name: string): { index: number, supplySituation: SupplySituation | null} {
  for (let i = 0; i < state.get('situation_supply').size; i++) {
    const supplySituation = state.get('situation_supply').get(i);
    if (supplySituation === undefined) {
      throw Error(`Supply card out of bounds ${i}`);
    }
    if (supplySituation.get('situation').get('name') === name) {
      return { index: i, supplySituation: supplySituation };
    }
  }
  return { index: -1, supplySituation: null };
}


/*
function setSupplyCardCost(state: GameState, cardName: string, cost: number): GameState {
  for (let i = 0; i < state.get('supply').size; i++) {
    const supplyCard = state.get('supply').get(i);
    if (supplyCard === undefined) {
      throw Error(`Supply card out of bounds ${i}`);
    }
    if (supplyCard.get('card').get('name') === cardName) {
      return state.set('supply', state.get('supply').set(i, supplyCard.set('cost', cost)));
    }
  }
  throw Error('No such supply card');
}
*/

export function count_in_deck(state: GameState, fn: (card: Card) => boolean, types?: Array<DeckType>): number {
  if (types === undefined) {
    types = ['draw', 'discard', 'hand'];
  }
  let count = 0;
  for (let type of types) {
    for (let card of state.get(type)) {
      if (fn(card)) {
        count = count + 1;
      }
    }
  }
  return count;
}

async function playTurn(state: GameState, choice: PlayerChoice, player: Player) {
  if (isBuy(choice)) {
    if (state.get('extra').get('market_hours')) {
      if (state.get('energy') % 3 !== 0) {
        state = state.set('error', 'Situation: you may only buy during Market Hours');
        return state;
      }
    }
    const supply_card = getSupplyCard(state, choice.cardname).supplyCard;
    if (supply_card === null) {
      state = state.set('error', 'Card not in supply?');
      return state;
    }
    if (state.get('money') < supply_card.get('cost')) {
      state = state.set('error', 'Not enough money');
      return state;
    }
    state = state.set('error', null);
    state = state.set('money', state.get('money') - supply_card.get('cost'));
    // buys increase card costs
    // state = setSupplyCardCost(state, choice.cardname, supply_card.get('cost') + 1);
    state = state.set('discard', state.get('discard').push(supply_card.get('card')));
    state = state.set('log', state.get('log').push(`Bought a ${choice.cardname}`));
    // buys cost energy too?
    // state = state.set('energy', state.get('energy') + 1);
  } else if (isEvent(choice)) {
    const result = getSupplyEvent(state, choice.cardname);
    let event_supply = result.supplyEvent;
    let index = result.index;
    if (event_supply === null) {
      state = state.set('error', 'Card not in supply?');
      return state;
    }
    let event: Event = event_supply.get('event');
    if (state.get('money') < event_supply.get('cost')) {
      state = state.set('error', 'Not enough money');
      return state;
    }
    state = state.set('error', null);
    state = state.set('money', state.get('money') - event_supply.get('cost'));
    state = state.set('energy', state.get('energy') + event_supply.get('energy'));
    state = state.set('log', state.get('log').push(`Bought event ${choice.cardname}`));
    [state, event] = await applyEffect(state, (state) => event.get('fn')(state, event), player);
    state = state.set('events', state.get('events').set(index, event_supply.set('event', event)));
  } else if (isPlay(choice)) {
    let card = state.get('hand').get(choice.index);
    if (card === undefined) {
      state = state.set('error', 'Bad card');
      return state
    }
    /*
    if (state.get('energy') < card.get('energy')) {
      state = state.set('error', 'Not enough energy');
      return state;
    }
    */
    state = state.set('error', null);
    state = state.set('log', state.get('log').push(`Played a ${card.get('name')}`));
    state = (await applyEffect(state, (state) => play_from_hand(state, choice.index), player))[0];
    state = state.set('energy', state.get('energy') + card.get('energy'));
  } else if (isBuySituation(choice)) {
    let result = getSupplySituation(state, choice.name);
    const supply_situation = result.supplySituation;
    if (supply_situation === null) {
      state = state.set('error', 'Situation not in supply?');
      return state;
    }
    if (state.get('money') < supply_situation.get('cost')) {
      state = state.set('error', 'Not enough money');
      return state;
    }
    state = state.set('error', null);
    state = state.set('money', state.get('money') - supply_situation.get('cost'));
    state = state.set('energy', state.get('energy') + supply_situation.get('energy'));
    state = state.set('log', state.get('log').push(`Bought a ${choice.name}`));
    state = await applyEffect(state, supply_situation.get('situation').get('fn'), player);
    state = state.set('situation_supply', state.get('situation_supply').remove(result.index));
  } else {
    state = state.set('error', 'Unexpected choice ' + JSON.stringify(choice));
  }
  return state
}

export async function run(state: GameState, player: Player): Promise<Array<GameState>> {
  let history = [state];

  await player.next(null as any);  // TODO: hmm
  for (let situation of state.get('situations')) {
    state = await applyEffect(state, situation.get('fn'), player);
  }
  while (!state.get('ended')) {
    let prevstate = state;

    let question: ActionQuestion = { type: 'action' };
    let choice: PlayerChoice = (await player.next([state, question])).value;

    if (isUndo(choice)) {
      let undostate = state.get('previous');
      if (undostate === null) {
        state = state.set('error', 'Cannot undo');
        continue
      } else {
        state = undostate;
        state = state.set('error', null);
        continue;
      }
    }
    state = await playTurn(state, choice, player);
    state = state.set('previous', prevstate);
    let hooks = state.get('turn_hooks');
    for (let i = 0; i < hooks.size; i++) {
      let hook = hooks.get(i);
      if (hook === undefined) {
        throw Error(`Unexpected undefined hook ${i}`);
      }
      state = await applyEffect(state, hook, player);
    }
  }
  await player.next([state, null]); // to let them render final state
  return history;
}
