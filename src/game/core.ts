import Immutable from 'immutable';
import * as random from "random-js";


export type PlayerQuestion = {
  type: string
};
export type PlayerChoice = {
  type: string
};
export type Player = AsyncGenerator<PlayerChoice, PlayerChoice, [GameState, PlayerQuestion | null]>;

export type EffectFn = (state: GameState) => Generator<[GameState, PlayerQuestion | null], GameState, PlayerChoice>;
export type Effect = {
  name: string,
  priority: number,
  fn: EffectFn,
};

export type Card = {
  name: string,
  description: string,
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
  description: '+$1',
  /* eslint-disable require-yield */
  fn: function* (state: GameState) {
    return state.set('money', state.get('money') + 1);
  }
  /* eslint-enable require-yield */
};
export const Estate: Card = {
  name: 'estate',
  description: '+1 victory point',
  /* eslint-disable require-yield */
  fn: function* (state: GameState) {
    return state.set('victory', state.get('victory') + 1);
  }
  /* eslint-enable require-yield */
};

export const InitialState = Immutable.Record({
  ended: false,
  turn: 0,
  actions: 1,
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

/* TODO
export type MetaChoice = {
  type: 'undo'
};
*/
const PlayQuestion: PlayerQuestion = {
  type: 'play'
};
export interface PlayChoice extends PlayerChoice {
  type: 'play';
  index: number;
};
function isPlay(choice: PlayerChoice): choice is PlayChoice {
    return choice.type === 'play';
}
export interface EndTurn extends PlayerChoice {
  type: 'endturn';
}
function isEndTurn(choice: PlayerChoice): choice is EndTurn {
    return choice.type === 'endturn';
}

export async function applyEffect(state: GameState, effectfn: EffectFn, player: Player) {
  let gen = effectfn(state);
  let result = await gen.next(null as any);  // hmm
  while (!result.done) {
    state = result.value[0];
    let question = result.value[1];
    let choice = (await player.next([state, question])).value;
    result = await gen.next(choice);
  }
  return result.value;
}

export async function run(state: GameState, player: Player): Promise<Array<GameState>> {
  let history = [state];

  await player.next(null as any);  // TODO: hmm
  while (!state.get('ended')) {
    for (let i = 0; i < state.get('draw_per_turn'); i++) {
      state = draw(state);
    }
    while (state.get('actions') > 0) {
      let question = PlayQuestion;
      const choice: PlayerChoice = (await player.next([state, question])).value;
      if (isEndTurn(choice)) {
        break;
      } else if (isPlay(choice)) {
        let play: PlayChoice = (choice as PlayChoice);
        let card = state.get('hand').get(play.index);
        if (card === undefined) {
          throw Error('Bad card')
        }
        state = await applyEffect(state, card.fn, player);
        state = state.set('hand', state.get('hand').delete(play.index));
        state = state.set('discard', state.get('discard').push(card));
      }
      state = state.set('actions', state.get('actions') - 1);
    }
    state = state.set('turn', state.get('turn') + 1);
    state = state.set('actions', 1);
  }
  state = state.set('ended', true);
  await player.next([state, null]); // to let them render final state
  return history;
}
