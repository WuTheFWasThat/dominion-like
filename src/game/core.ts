import Immutable from 'immutable';
import * as random from "random-js";


export type PlayerChoice = any;
export type EffectFn = (state: GameState) => Generator<null, GameState, PlayerChoice>;
export type Effect = {
  name: string,
  priority: number,
  fn: EffectFn,
};

export type Card = {
  name: string,
  fn: EffectFn,
}

export type GameState = Immutable.Record<{
  ended: boolean,
  turn: number,
  draw_per_turn: number,
  actions: number,
  money: number,
  victory: number,
  deck: Immutable.List<Card>,
  discard: Immutable.List<Card>,
  hand: Immutable.List<Card>,
  trash: Immutable.List<Card>,
  situations: Immutable.List<Effect>,
  extra: any,
  random: random.Engine,
}>;

export const Copper: Card = {
  name: 'copper',
  /* eslint-disable require-yield */
  fn: function* (state: GameState) {
    return state.set('money', state.get('money') + 1);
  }
  /* eslint-enable require-yield */
};
export const Estate: Card = {
  name: 'estate',
  /* eslint-disable require-yield */
  fn: function* (state: GameState) {
    return state.set('victory', state.get('victory') + 1);
  }
  /* eslint-enable require-yield */
};

export const InitialState = Immutable.Record({
  ended: false,
  turn: 0,
  actions: 0,
  money: 0,
  victory: 0,
  deck: Immutable.List([Copper, Copper, Copper, Copper, Copper, Copper, Copper, Estate, Estate, Estate]),
  discard: Immutable.List([]),
  hand: Immutable.List([]),
  trash: Immutable.List([]),
  situations: Immutable.List([]),
  draw_per_turn: 5,
  extra: {},
  random: null as any,
});

export function initial_state(seed: number | null): GameState {
  const mt = random.MersenneTwister19937.seed(seed || random.createEntropy()[0]);
  const state: GameState = InitialState();
  return state.set('random', mt);
}

export function draw(state: GameState): GameState {
  if (state.get('deck').size === 0) {
    state = state.set('deck', state.get('discard'));
    state = state.set('discard', Immutable.List());
  }
  const n = state.get('deck').size;
  if (n === 0) {
    // nothing to draw
    return state
  }
  const i = random.integer(0, n-1)(state.get('random'));
  let drawn = state.get('deck').get(i);
  if (drawn === undefined) {
    throw Error(`Unable to draw? ${n} ${i}`)
  }
  state = state.set('deck', state.get('deck').delete(i));
  state = state.set('hand', state.get('hand').push(drawn));
  return state;
}
