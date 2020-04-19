import { Card, GameState, draw, discard, trash, trash_event } from  './core';
import * as game from  './core';

/* eslint-disable require-yield */

export let KINGDOM_CARDS: Array<Card> = [];

function register_kingdom_card(card: Card) {
  KINGDOM_CARDS.push(card);
  return card;
}

export let KINGDOM_EVENTS: Array<Card> = [];

function register_kingdom_event(card: Card) {
  KINGDOM_EVENTS.push(card);
  return card;
}


export const Copper: Card = {
  name: 'Copper',
  description: (state: GameState) => {
    let amt = 1 + (state.get('extra').get('coppersmith_plays') || 0);
    return '+$' + amt;
  },
  fn: function* (state: GameState) {
    console.log(state.get('extra').toJS());
    let amt = 1 + (state.get('extra').get('coppersmith_plays') || 0);
    return state.set('money', state.get('money') + amt);
  }
};

export const Silver: Card = {
  name: 'Silver',
  description: '+$2',
  fn: function* (state: GameState) {
    return state.set('money', state.get('money') + 2);
  }
};


export const Gold: Card = {
  name: 'Gold',
  description: '+$3',
  fn: function* (state: GameState) {
    return state.set('money', state.get('money') + 3);
  }
};


export const Estate: Card = {
  name: 'Estate',
  description: '+1 victory point',
  fn: function* (state: GameState) {
    return state.set('victory', state.get('victory') + 1);
  }
};

export const Duchy: Card = {
  name: 'Duchy',
  description: '+2 victory points',
  fn: function* (state: GameState) {
    return state.set('victory', state.get('victory') + 2);
  }
};


export const Province: Card = {
  name: 'Province',
  description: '+3 victory points',
  fn: function* (state: GameState) {
    return state.set('victory', state.get('victory') + 3);
  }
};


export const Gardens: Card = register_kingdom_card({
  name: 'Gardens',
  description: '+N victory points, where N is the number of gardens in your deck',
  fn: function* (state: GameState) {
    let n = game.count_in_deck(state, (card) => card.name === 'Gardens');
    return state.set('victory', state.get('victory') + n);
  }
});


export const Smithy: Card = register_kingdom_card({
  name: 'Smithy',
  description: '+3 cards',
  fn: function* (state: GameState) {
    return draw(state, 3);
  }
});

export const Peddler: Card = register_kingdom_card({
  name: 'Peddler',
  description: '+1 card, +$1',
  cost_range: [0, 0],
  fn: function* (state: GameState) {
    state = state.set('money', state.get('money') + 1);
    return draw(state, 1);
  }
});

export const Lab: Card = register_kingdom_card({
  name: 'Lab',
  description: '+2 card, +1 energy',
  fn: function* (state: GameState) {
    state = state.set('energy', state.get('energy') + 1);
    return draw(state, 2);
  }
});

export const Chapel: Card = register_kingdom_card({
  name: 'Chapel',
  description: 'Trash a card from your hand',
  fn: function* (state: GameState) {
    let choice = (yield [state, {type: 'pickhand', message: 'Pick cards to trash for Chapel'}]) as game.PickHandChoice;
    state = trash(state, choice.indices, 'hand');
    return state;
  }
});

export const Coppersmith: Card = register_kingdom_card({
  name: 'Coppersmith',
  description: 'All coppers give an additional $1',
  setup: function(state: GameState) {
    state = state.set('extra', state.get('extra').set('coppersmith_plays', 0));
      console.log('set state', state);
      console.log('set state', state.get('extra').toJS());
    return state;
  },
  fn: function* (state: GameState) {
    let extra = state.get('extra');
    state = state.set('extra', extra.set('coppersmith_plays', extra.get('coppersmith_plays') + 1));
    return state;
  }
});


export const Reboot: Card = {
  name: 'Reboot',
  description: 'Discard your hand, draw 5 cards',
  fn: function* (state: GameState) {
    let n = state.get('hand').size;
    for (let i = 0; i < n; i++) {
      state = discard(state, 0);
    }
    for (let i = 0; i < 5; i++) {
      state = draw(state);
    }
    return state;
  }
};

export const Cellar: Card = register_kingdom_event({
  name: 'Calculated gamble',
  description: 'Discard your hand, draw that many cards',
  fn: function* (state: GameState) {
    let n = state.get('hand').size;
    for (let i = 0; i < n; i++) {
      state = discard(state, 0);
    }
    for (let i = 0; i < n; i++) {
      state = draw(state);
    }
    return state;
  }
});

export const Recruit: Card = register_kingdom_event({
  name: 'Recruit',
  description: 'Draw two cards',
  fn: function* (state: GameState) {
    return draw(state, 2);
  }
});

export const SolarPower: Card = register_kingdom_event({
  name: 'Solar Power',
  cost_range: [10, 25],
  description: 'Once per game, +10 energy',
  fn: function* (state: GameState) {
    state = trash_event(state, 'Solar Power');
    state = state.set('energy', state.get('energy') + 10);
    return state;
  }
});
