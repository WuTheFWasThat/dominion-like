import { Card, GameState, draw, discard, trash, trash_event, gain, scry } from  './core';
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


export const Workshop: Card = register_kingdom_card({
  name: 'Workshop',
  description: 'Gain a card from the card supply pile',
  fn: function* (state: GameState) {
    let choice = (yield [state, {type: 'picksupply', message: 'Pick card to gain for Workshop'}]) as game.PickSupplyChoice;
    return gain(state, choice.cardname);
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
  description: '+2 card, play a card from your hand',
  fn: function* (state: GameState) {
    // state = state.set('energy', state.get('energy') + 1);
    state = draw(state, 2);
    let choice = (yield [state, {type: 'pickhand', message: 'Pick card to play for lab'}]) as game.PickHandChoice;
    if (choice.indices.length === 0) {
      return state;
    } else if (choice.indices.length > 1) {
      throw Error('Something went wrong');
    }
    let index: number = choice.indices[0];
    let card = state.get('hand').get(index);
    if (card === undefined) {
      throw Error(`Tried to play ${index} which does not exist`);
    }
    state = state.set('hand', state.get('hand').remove(index));
    state = yield* card.fn(state);
    state = state.set('discard', state.get('discard').push(card));
    return state;
  }
});

export const Chapel: Card = register_kingdom_card({
  name: 'Chapel',
  description: 'Trash any number of cards from your hand',
  fn: function* (state: GameState) {
    let choice = (yield [state, {type: 'pickhand', message: 'Pick cards to trash for Chapel'}]) as game.PickHandChoice;
    state = trash(state, choice.indices, 'hand');
    return state;
  }
});

export const Library: Card = register_kingdom_card({
  name: 'Library',
  description: 'Draw until you have seven cards',
  fn: function* (state: GameState) {
    while (state.get('hand').size < 7) {
      state = draw(state, 1);
    }
    return state;
  }
});

export const Coppersmith: Card = register_kingdom_card({
  name: 'Coppersmith',
  description: 'All coppers give an additional $1',
  setup: function(state: GameState) {
    state = state.set('extra', state.get('extra').set('coppersmith_plays', 0));
    return state;
  },
  fn: function* (state: GameState) {
    let extra = state.get('extra');
    state = state.set('extra', extra.set('coppersmith_plays', extra.get('coppersmith_plays') + 1));
    return state;
  }
});

export const ThroneRoom: Card = register_kingdom_card({
  name: 'Throne Room',
  description: 'Play a card from your hand twice',
  fn: function* (state: GameState) {
    let choice = (yield [state, {type: 'pickhand', message: 'Pick card to play for Throne Room'}]) as game.PickHandChoice;
    if (choice.indices.length === 0) {
      return state;
    } else if (choice.indices.length > 1) {
      throw Error('Something went wrong');
    }
    let index: number = choice.indices[0];
    let card = state.get('hand').get(index);
    if (card === undefined) {
      throw Error(`Tried to play ${index} which does not exist`);
    }
    state = state.set('hand', state.get('hand').remove(index));
    state = yield* card.fn(state);
    state = yield* card.fn(state);
    state = state.set('discard', state.get('discard').push(card));
    return state;
  }
});

export const Vassal: Card = register_kingdom_card({
  name: 'Vassal',
  description: '+$2, play the top card of your draw',
  fn: function* (state: GameState) {
    state = state.set('money', state.get('money') + 2);
    let card;
    [state, card] = scry(state);
    if (card === null) {
      return state;
    }
    state = yield* card.fn(state);
    state = state.set('discard', state.get('discard').push(card));
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
    state = draw(state, 5);
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
  cost_range: [16, 32],
  description: 'Once per game, +16 energy',
  fn: function* (state: GameState) {
    state = trash_event(state, 'Solar Power');
    state = state.set('energy', state.get('energy') + 10);
    return state;
  }
});

export const Efficiency: Card = register_kingdom_event({
  name: 'Efficiency',
  cost_range: [32, 64],
  description: 'Once per game, double energy',
  fn: function* (state: GameState) {
    state = trash_event(state, 'Efficiency');
    state = state.set('energy', state.get('energy') * 2);
    return state;
  }
});

export const Overtime: Card = register_kingdom_event({
  name: 'Overtime',
  cost_range: [10, 25],
  description: 'Once per game, gain energy equal to the number of cards in your hand',
  fn: function* (state: GameState) {
    state = trash_event(state, 'Overtime');
    state = state.set('energy', state.get('energy') + state.get('hand').size);
    return state;
  }
});

export const Greed: Card = register_kingdom_event({
  name: 'Greed',
  cost_range: [10, 25],
  description: 'At the end of the game, gain one victory point per $ you have.',
  fn: function* (state: GameState) {
    state = trash_event(state, 'Greed');
    function* end_hook(state: GameState) {
      return state.set('victory', state.get('victory') + state.get('money'));
    }
    state = state.set('end_hooks', state.get('end_hooks').push(end_hook));
    return state;
  },
});
