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

export type Effect = (state: GameState) => Generator<[GameState, PlayerQuestion | null], GameState, PlayerChoice>;

export type Card = {
  name: string,
  description: string | ((state: GameState) => string),
  cost_range?: [number, number],
  setup?: (state: GameState) => GameState,
  fn: Effect,
}
export type SupplyCard = Immutable.Record<{
  card: Card, cost: number,
}>;

type BuyType = 'supply' | 'events';
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
  events: Immutable.List<SupplyCard>,
  situations: Immutable.List<Card>,
  extra: Immutable.Map<string, any>,
  random: random.MersenneTwister19937,
  seed: number,
  error: null | string,
  previous: null | GameState,
}>;

export const InitialState = Immutable.Record({
  ended: false,
  energy: 0,
  money: 0,
  victory: 0,
  supply: Immutable.List([
    Immutable.Record({
      card: cards.Copper,
      cost: 0,
    })(),
    Immutable.Record({
      card: cards.Silver,
      cost: 1,
    })(),
    Immutable.Record({
      card: cards.Gold,
      cost: 2,
    })(),
    Immutable.Record({
      card: cards.Estate,
      cost: 1,
    })(),
    Immutable.Record({
      card: cards.Duchy,
      cost: 2,
    })(),
    Immutable.Record({
      card: cards.Province,
      cost: 6,
    })(),
  ]),
  events: Immutable.List([
    Immutable.Record({
      card: cards.Reboot,
      cost: 0,
    })(),
  ]),
  draw: Immutable.List([cards.Copper, cards.Copper, cards.Copper, cards.Copper, cards.Copper, cards.Copper, cards.Copper, cards.Estate, cards.Estate, cards.Estate]),
  discard: Immutable.List([]),
  hand: Immutable.List([]),
  trash: Immutable.List([]),
  situations: Immutable.List([]),
  extra: Immutable.Map<string, any>([]),
  random: null as any,
  seed: 0,
  error: null,
  previous: null,
});

export function initial_state(seed: number | null): GameState {
  let actual_seed = seed === null ? random.createEntropy()[0] : seed;
  const mt = random.MersenneTwister19937.seed(actual_seed);
  let state: GameState = InitialState();
  const kingdom = random.sample(mt, cards.KINGDOM_CARDS, 10);
  kingdom.forEach((card) => {
    let cost_range = card.cost_range || [0, 5];
    if (card.setup) {
      // console.log('setting up', state.get('extra').toJS());
      state = card.setup(state);
      // console.log(state.get('extra').toJS());
    }
    state = state.set('supply', state.get('supply').push(
      Immutable.Record({
        card: card, cost: random.integer(cost_range[0], cost_range[1])(mt),
      })()
    ));
  });
  const kingdom_events = random.sample(mt, cards.KINGDOM_EVENTS, 2); // TODO: change to ten?
  kingdom_events.forEach((card) => {
    let cost_range = card.cost_range || [0, 5];
    state = state.set('events', state.get('events').push(
      Immutable.Record({
        card: card, cost: random.integer(cost_range[0], cost_range[1])(mt),
      })()
    ));
  });

  // useful for testing
  // state = state.set('hand', state.get('hand').push(
  //   cards.Chapel
  // ));
  // state = state.set('money', 100);

  state = state.set('energy', 32);
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


export function scry(state: GameState): [GameState, Card | null] {
  // get a card from the deck, but just return it (with new deck state)
  // caller should then do something with the card
  if (state.get('draw').size === 0) {
    state = state.set('draw', state.get('discard'));
    state = state.set('discard', Immutable.List());
  }
  const n = state.get('draw').size;
  if (n === 0) {
    // nothing to draw
    return [state, null]
  }
  let i;
  [state, i] = consumeRandom(state, random.integer(0, n-1));
  let drawn = state.get('draw').get(i);
  if (drawn === undefined) {
    throw Error(`Unable to draw? ${n} ${i}`)
  }
  state = state.set('draw', state.get('draw').delete(i));
  return [state, drawn]
}

export function draw(state: GameState, ndraw?: number): GameState {
  if (ndraw === undefined) {
    ndraw = 1;
  }
  if (ndraw === 0) {
    return state;
  }
  let card;
  [state, card] = scry(state);
  if (card === null) {
    return state;
  }
  state = state.set('hand', state.get('hand').push(card));
  return draw(state, ndraw - 1);
}

export function discard(state: GameState, index: number): GameState {
  const card = state.get('hand').get(index);
  if (card === undefined) {
    throw Error(`Unable to discard? ${state.get('hand').size} ${index}`)
  }
  state = state.set('hand', state.get('hand').delete(index));
  state = state.set('discard', state.get('discard').push(card));
  return state;
}

export function trash(state: GameState, indices: Array<number>, type: DeckType): GameState {
  indices = indices.slice().sort();
  for (let i = indices.length -1; i >= 0; i--) {
    let index = indices[i];
    let card = state.get(type).get(index);
    if (card === undefined) {
      throw Error(`${type} card out of bounds ${index}`);
    }
    state = state.set(type, state.get(type).remove(index));
    state = state.set('trash', state.get('trash').push(card));
  }
  return state;
}

export function gain(state: GameState, cardName: string): GameState {
  let supply_card = getSupplyCard(state, cardName, 'supply');
  if (supply_card === null) {
    throw Error(`Tried to gain ${cardName} which does not exist`);
  }
  state = state.set('discard', state.get('discard').push(supply_card.get('card')));
  return state;
}

export function play(index: number): Effect {
  return function*(state: GameState) {
    let card = state.get('hand').get(index);
    state = state.set('hand', state.get('hand').remove(index));
    if (card === undefined) {
      throw Error(`Tried to play ${index} which does not exist`);
    }
    state = yield* card.fn(state);
    state = state.set('discard', state.get('discard').push(card));
    return state;
  }
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

export interface PickHandQuestion extends PlayerQuestion {
  type: 'pickhand',
  message: string,
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



export async function applyEffect(state: GameState, effect: Effect, player: Player): Promise<GameState> {
  console.log('ebeginning effect');
  let init_state = state;
  let gen = effect(state)
  let result = await gen.next(null as any);  // hmm
  while (!result.done) {
    let question;
    [state, question] = result.value;
    console.log('getting choice');
    let choice = (await player.next([state, question])).value;
    if (isUndo(choice)) {
      console.log('undoing', choice);
      return await applyEffect(init_state, effect, player);
    }
    console.log('calling gen', choice);
    result = await gen.next(choice);
  }
  return result.value;
}

function trashSupplyCard(state: GameState, cardName: string, type: BuyType): GameState {
  for (let i = 0; i < state.get(type).size; i++) {
    const supplyCard = state.get(type).get(i);
    if (supplyCard === undefined) {
      throw Error(`Supply card out of bounds ${i}`);
    }
    if (supplyCard.get('card').name === cardName) {
      return state.set(type, state.get(type).remove(i));
    }
  }
  throw Error(`No such supply card found ${cardName}`);
}

export function trash_event(state: GameState, cardName: string): GameState {
  return trashSupplyCard(state, cardName, 'events');
}


function getSupplyCard(state: GameState, cardName: string, type: BuyType): SupplyCard | null {
  for (let i = 0; i < state.get(type).size; i++) {
    const supplyCard = state.get(type).get(i);
    if (supplyCard === undefined) {
      throw Error(`Supply card out of bounds ${i}`);
    }
    if (supplyCard.get('card').name === cardName) {
      return supplyCard;
    }
  }
  return null;
}

function setSupplyCardCost(state: GameState, cardName: string, cost: number, type: BuyType): GameState {
  for (let i = 0; i < state.get(type).size; i++) {
    const supplyCard = state.get(type).get(i);
    if (supplyCard === undefined) {
      throw Error(`Supply card out of bounds ${i}`);
    }
    if (supplyCard.get('card').name === cardName) {
      return state.set(type, state.get(type).set(i, supplyCard.set('cost', cost)));
    }
  }
  throw Error('No such supply card');
}

export function count_in_deck(state: GameState, fn: (card: Card) => boolean): number {
  let count = 0;
  state.get('draw').forEach((card) => {
    if (fn(card)) {
      count = count + 1;
    }
  })
  state.get('discard').forEach((card) => {
    if (fn(card)) {
      count = count + 1;
    }
  })
  state.get('hand').forEach((card) => {
    if (fn(card)) {
      count = count + 1;
    }
  })
  return count;
}

async function playTurn(state: GameState, choice: PlayerChoice, player: Player) {
  if (isBuy(choice)) {
    const supply_card = getSupplyCard(state, choice.cardname, 'supply');
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
    state = setSupplyCardCost(state, choice.cardname, supply_card.get('cost') + 1, 'supply');
    state = state.set('discard', state.get('discard').push(supply_card.get('card')));
    // buys cost energy too
    state = state.set('energy', state.get('energy') - 1);
  } else if (isEvent(choice)) {
    const supply_card = getSupplyCard(state, choice.cardname, 'events');
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
    state = await applyEffect(state, supply_card.get('card').fn, player);
    // buys cost energy too
    state = state.set('energy', state.get('energy') - 1);
  } else if (isPlay(choice)) {
    let play_choice: PlayChoice = (choice as PlayChoice);
    let card = state.get('hand').get(play_choice.index);
    if (card === undefined) {
      state = state.set('error', 'Bad card');
      return state
    }
    state = state.set('error', null);
    state = await applyEffect(state, play(play_choice.index), player);
    state = state.set('energy', state.get('energy') - 1);
  } else {
    state = state.set('error', 'Unexpected choice ' + JSON.stringify(choice));
  }
  return state
}

export async function run(state: GameState, player: Player): Promise<Array<GameState>> {
  let history = [state];

  await player.next(null as any);  // TODO: hmm
  while (state.get('energy') > 0) {
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
  }
  state = state.set('ended', true);
  await player.next([state, null]); // to let them render final state
  return history;
}
