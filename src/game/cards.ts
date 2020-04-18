import { Card, GameState, draw, discard } from  './core';

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


export const Copper: Card = register_kingdom_card({
  name: 'Copper',
  description: '+$1',
  fn: function* (state: GameState) {
    return state.set('money', state.get('money') + 1);
  }
});

export const Silver: Card = register_kingdom_card({
  name: 'Silver',
  description: '+$2',
  fn: function* (state: GameState) {
    return state.set('money', state.get('money') + 2);
  }
});


export const Gold: Card = register_kingdom_card({
  name: 'Gold',
  description: '+$3',
  fn: function* (state: GameState) {
    return state.set('money', state.get('money') + 3);
  }
});


export const Estate: Card = register_kingdom_card({
  name: 'Estate',
  description: '+1 victory point',
  fn: function* (state: GameState) {
    return state.set('victory', state.get('victory') + 1);
  }
});

export const Duchy: Card = register_kingdom_card({
  name: 'Duchy',
  description: '+2 victory points',
  fn: function* (state: GameState) {
    return state.set('victory', state.get('victory') + 1);
  }
});


export const Province: Card = register_kingdom_card({
  name: 'Province',
  description: '+3 victory points',
  fn: function* (state: GameState) {
    return state.set('victory', state.get('victory') + 1);
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
  description: '+1 card, +$2',
  fn: function* (state: GameState) {
    state = state.set('money', state.get('money') + 2);
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

export const Reboot: Card = {
  name: 'Reboot',
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
