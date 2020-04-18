import { Card, GameState, draw, discard } from  './core';

/* eslint-disable require-yield */

export const Copper: Card = {
  name: 'copper',
  description: '+$1',
  fn: function* (state: GameState) {
    return state.set('money', state.get('money') + 1);
  }
};

export const Estate: Card = {
  name: 'estate',
  description: '+1 victory point',
  fn: function* (state: GameState) {
    return state.set('victory', state.get('victory') + 1);
  }
};

export let KINGDOM_CARDS: Array<Card> = [];

function register_kingdom_card(card: Card) {
  KINGDOM_CARDS.push(card);
  return card;
}

export const Village: Card = register_kingdom_card({
  name: 'village',
  description: '+2 actions +1 card',
  fn: function* (state: GameState) {
    state = state.set('actions', state.get('actions') + 2);
    return draw(state);
  }
});

export const Smithy: Card = register_kingdom_card({
  name: 'smithy',
  description: '+3 cards',
  fn: function* (state: GameState) {
    return draw(state, 3);
  }
});

export const Peddler: Card = register_kingdom_card({
  name: 'peddler',
  description: '+1 card, +1 action, +$1',
  fn: function* (state: GameState) {
    state = state.set('actions', state.get('actions') + 2);
    state = state.set('money', state.get('money') + 2);
    return draw(state, 1);
  }
});

export const Lab: Card = register_kingdom_card({
  name: 'lab',
  description: '+2 card, +1 action',
  fn: function* (state: GameState) {
    state = state.set('actions', state.get('actions') + 1);
    return draw(state, 2);
  }
});

export const Reboot: Card = {
  name: 'reboot',
  description: 'Discard your hand, draw 5 cards',
  fn: function* (state: GameState) {
    for (let i = 0; i < state.get('hand').size; i++) {
      state = discard(state, 0);
    }
    for (let i = 0; i < 5; i++) {
      state = draw(state);
    }
    return state;
  }
};
