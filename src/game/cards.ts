import { make_card, Card, GameState, draw, discard, trash, trash_event, gain, scry } from  './core';
import * as game from  './core';

/* eslint-disable require-yield */

export let KINGDOM_CARDS: {[name: string]: Card} = {};

function register_kingdom_card(card: Card) {
  if (KINGDOM_CARDS[card.get('name')]) {
    throw new Error(`Already registered ${card.get('name')}`);
  }
  if (KINGDOM_EVENTS[card.get('name')]) {
    throw new Error(`Already registered ${card.get('name')}`);
  }
  KINGDOM_CARDS[card.get('name')] = card;
  return card;
}

export let KINGDOM_EVENTS: {[name: string]: Card} = {};

function register_kingdom_event(card: Card) {
  if (KINGDOM_CARDS[card.get('name')]) {
    throw new Error(`Already registered ${card.get('name')}`);
  }
  if (KINGDOM_EVENTS[card.get('name')]) {
    throw new Error(`Already registered ${card.get('name')}`);
  }
  KINGDOM_EVENTS[card.get('name')] = card;
  return card;
}


export const Copper: Card = make_card({
  name: 'Copper',
  energy: 0,
  description: '+$1',
  fn: function* (state: GameState) {
    return state.set('money', state.get('money') + 1);
  }
});

export const Silver: Card = make_card({
  name: 'Silver',
  energy: 0,
  description: '+$2',
  fn: function* (state: GameState) {
    return state.set('money', state.get('money') + 2);
  }
});


export const Gold: Card = make_card({
  name: 'Gold',
  energy: 0,
  description: '+$3',
  fn: function* (state: GameState) {
    return state.set('money', state.get('money') + 3);
  }
});


export const Estate: Card = make_card({
  name: 'Estate',
  energy: 1,
  description: '+1 victory point',
  fn: function* (state: GameState) {
    return state.set('victory', state.get('victory') + 1);
  }
});

export const Duchy: Card = make_card({
  name: 'Duchy',
  energy: 1,
  description: '+2 victory points',
  fn: function* (state: GameState) {
    return state.set('victory', state.get('victory') + 2);
  }
});


export const Province: Card = make_card({
  name: 'Province',
  energy: 1,
  description: '+3 victory points',
  fn: function* (state: GameState) {
    return state.set('victory', state.get('victory') + 3);
  }
});

export const Donkey: Card = make_card({
  name: 'Donkey',
  energy: 1,
  description: '+1 card',
  fn: function* (state: GameState) {
    return draw(state, 1);
  }
});

export const Mule: Card = make_card({
  name: 'Mule',
  energy: 1,
  description: '+2 card',
  fn: function* (state: GameState) {
    return draw(state, 2);
  }
});


export const Gardens: Card = register_kingdom_card(make_card({
  name: 'Gardens',
  energy: 1,
  description: '+N victory points, where N is the number of gardens in your deck',
  fn: function* (state: GameState) {
    let n = game.count_in_deck(state, (card) => card.get('name') === 'Gardens');
    return state.set('victory', state.get('victory') + n);
  }
}));


export const Workshop: Card = register_kingdom_card(make_card({
  name: 'Workshop',
  energy: 2,
  description: 'Gain a card from the card supply pile',
  fn: function* (state: GameState) {
    let choice = (yield ([state, {type: 'picksupply', message: 'Pick card to gain for Workshop'} as game.PickSupplyQuestion])) as game.PickSupplyChoice;
    return gain(state, choice.cardname);
  }
}));

export const Smithy: Card = register_kingdom_card(make_card({
  name: 'Smithy',
  energy: 1,
  description: '+3 cards',
  fn: function* (state: GameState) {
    return draw(state, 3);
  }
}));

export const Peddler: Card = register_kingdom_card(make_card({
  name: 'Peddler',
  energy: 1,
  description: '+1 card, +$1',
  cost_range: [0, 0],
  fn: function* (state: GameState) {
    state = state.set('money', state.get('money') + 1);
    return draw(state, 1);
  }
}));

export const Lab: Card = register_kingdom_card(make_card({
  name: 'Lab',
  energy: 0,
  cost_range: [4, 8],
  description: '+2 cards',
  fn: function* (state: GameState) {
    state = draw(state, 2);
    return state;
  }
}));

export const Horse: Card = register_kingdom_card(make_card({
  name: 'Horse',
  energy: 0,
  cost_range: [1, 2],
  description: '+2 cards, trash this',
  fn: function* (state: GameState) {
    // state = state.set('energy', state.get('energy') + 1);
    state = draw(state, 2);
    return state;
  },
  cleanup: function(state: GameState, card: Card) {
    state = state.set('trash', state.get('trash').push(card));
    return state;
  }
}));

export const Hound: Card = register_kingdom_card(make_card({
  name: 'Hound',
  energy: 0,
  cost_range: [1, 2],
  description: '+1 card.  When discarded, +1 card',
  fn: function* (state: GameState) {
    state = draw(state, 1);
    return state;
  },
  discard: function(state: GameState, card: Card) {
    state = draw(state, 1);
    state = state.set('discard', state.get('discard').push(card));
    return state;
  }
}));


export const Chapel: Card = register_kingdom_card(make_card({
  name: 'Chapel',
  energy: 1,
  description: 'Trash any number of cards from your hand',
  fn: function* (state: GameState) {
    let choice = (yield [state, {type: 'pickhand', message: 'Pick cards to trash for Chapel'}]) as game.PickHandChoice;
    state = trash(state, choice.indices, 'hand');
    return state;
  }
}));

export const Library: Card = register_kingdom_card(make_card({
  name: 'Library',
  energy: 1,
  description: 'Draw until you have seven cards',
  fn: function* (state: GameState) {
    while (state.get('hand').size < 7) {
      state = draw(state, 1);
    }
    return state;
  }
}));

export const FoolsGold: Card = register_kingdom_card(make_card({
  name: 'Fool\'s Gold',
  energy: 0,
  cost_range: [2, 6],
  description: (state: GameState) => {
    let amt = state.get('extra').get('fools_gold');
    return '+$' + amt + ', all Fool\'s Golds give an additional $1';
  },
  setup: function(state: GameState) {
    state = state.set('extra', state.get('extra').set('fools_gold', 0));
    return state;
  },
  fn: function* (state: GameState) {
    let extra = state.get('extra');
    let n = extra.get('fools_gold');
    state = state.set('extra', extra.set('fools_gold', n + 1));
    state = state.set('money', state.get('money') + n);
    return state;
  }
}));

export const Coppersmith: Card = register_kingdom_card(make_card({
  name: 'Coppersmith',
  energy: 2,
  description: 'All coppers in hand give an additional $1',
  fn: function* (state: GameState) {
    for (let i = 0; i < state.get('hand').size; i++) {
      let card = state.get('hand').get(i) as Card;
      if (card.get('name').split('+')[0] !== 'Copper') {
        continue;
      }
      let val = (parseInt((card.get('description') as string).split('$')[1])) + 1;
      card = card.set('fn', function* (state: GameState) {
        return state.set('money', state.get('money') + val);
      });
      card = card.set('description', '+$' + val);
      card = card.set('name', 'Copper+' + (val-1));
      state = state.set('hand', state.get('hand').set(i, card));
    }
    return state;
  }
}));

export const ThroneRoom: Card = register_kingdom_card(make_card({
  name: 'Throne Room',
  energy: 1,
  description: 'Play a card from your hand twice',
  fn: function* (state: GameState) {
    let choice = (yield [state, {type: 'pickhand', max: 1, message: 'Pick card to play for Throne Room'}]) as game.PickHandChoice;
    if (choice.indices.length === 0) {
      return state;
    } else if (choice.indices.length > 1) {
      throw Error('Something went wrong');
    }
    let index: number = choice.indices[0];
    let card = state.get('hand').get(index) as Card;
    state = state.set('log', state.get('log').push(`Played throne room on ${card.get('name')}`));
    // TODO: use helper function for this
    state = state.set('hand', state.get('hand').remove(index));
    state = yield* card.get('fn')(state);
    state = yield* card.get('fn')(state);
    state = state.set('discard', state.get('discard').push(card));
    return state;
  }
}));

export const Vassal: Card = register_kingdom_card(make_card({
  name: 'Vassal',
  energy: 1,
  description: '+$2, play the top card of your draw',
  fn: function* (state: GameState) {
    state = state.set('money', state.get('money') + 2);
    let card;
    [state, card] = scry(state);
    if (card === null) {
      return state;
    }
    state = state.set('log', state.get('log').push(`Vassal plays a ${card.get('name')}`));
    // TODO: use helper function for this
    state = yield* card.get('fn')(state);
    state = state.set('discard', state.get('discard').push(card));
    return state;
  }
}));


export const Cellar: Card = register_kingdom_card(make_card({
  name: 'Cellar',
  energy: 0,
  cost_range: [1, 3],
  description: 'Discard any number of cards, draw that many',
  fn: function* (state: GameState) {
    let choice = (yield [state, {type: 'pickhand', message: 'Pick cards to discard for Cellar'}]) as game.PickHandChoice;
    state = discard(state, choice.indices);
    state = draw(state, choice.indices.length);
    return state;
  }
}));


export const AllForOne: Card = register_kingdom_card(make_card({
  name: 'All For One',
  energy: 1,
  description: 'Put all cards in your discard costing 0 energy in your hand',
  fn: function* (state: GameState) {
    let indices = [];
    for (let i = 0; i < state.get('discard').size; i++) {
      let card = state.get('discard').get(i);
      if (card === undefined) {
        throw Error(`Unexpected card out of bounds ${i}`);
      }
      if (card.get('energy') === 0) {
        indices.push(i);
      }
    }
    indices = indices.slice().sort().reverse();
    for (let i = 0; i < indices.length; i++) {
      let index = indices[i];
      let card = state.get('discard').get(index);
      if (card === undefined) {
        throw Error(`Unexpected card out of bounds ${index}`);
      }
      state = state.set('discard', state.get('discard').remove(index));
      state = state.set('hand', state.get('hand').push(card));
    }
    return state;
  }
}));

export const Madness: Card = register_kingdom_card(make_card({
  name: 'Madness',
  energy: 1,
  description: 'Choose a card in hand.  Decrease its energy cost by 1 (cannot go negative). Trash this card',
  fn: function* (state: GameState) {
    let choice = (yield [state, {type: 'pickhand', max: 1, message: 'Pick card to for Madness'}]) as game.PickHandChoice;
    if (choice.indices.length === 0) {
      return state;
    } else if (choice.indices.length > 1) {
      throw Error('Something went wrong');
    }
    let index: number = choice.indices[0];
    let card = state.get('hand').get(index) as Card;
    card = card.set('energy', Math.max(0, card.get('energy') - 1));
    state = state.set('log', state.get('log').push(`Madness decreases cost of a ${card.get('name')} to ${card.get('energy')}`));
    state = state.set('hand', state.get('hand').set(index, card));
    return state;
  },
  cleanup: function(state: GameState, card: Card) {
    state = state.set('trash', state.get('trash').push(card));
    return state;
  },
}));


export const Reboot: Card = make_card({
  name: 'Reboot',
  energy: 1,
  description: 'Set your money to $0, discard your hand, and draw 5 cards',
  fn: function* (state: GameState) {
    state = state.set('money', 0);
    let n = state.get('hand').size;
    let indices = [];
    for (let i = 0; i < n; i++) {
      indices.push(i);
    }
    state = discard(state, indices);
    state = draw(state, 5);
    return state;
  }
});

export const Gamble: Card = register_kingdom_event(make_card({
  name: 'Calculated gamble',
  energy: 1,
  description: 'Discard your hand, draw that many cards',
  fn: function* (state: GameState) {
    let n = state.get('hand').size;
    let indices = [];
    for (let i = 0; i < n; i++) {
      indices.push(i);
    }
    state = discard(state, indices);
    for (let i = 0; i < n; i++) {
      state = draw(state);
    }
    return state;
  }
}));

export const Recruit: Card = register_kingdom_event(make_card({
  name: 'Recruit',
  energy: 1,
  description: 'Draw two cards',
  fn: function* (state: GameState) {
    return draw(state, 2);
  }
}));

export const SolarPower: Card = register_kingdom_event(make_card({
  name: 'Solar Power',
  energy: 0,
  cost_range: [16, 32],
  description: 'Once per game, +16 energy',
  fn: function* (state: GameState) {
    state = trash_event(state, 'Solar Power');
    state = state.set('energy', state.get('energy') + 10);
    return state;
  }
}));

export const Efficiency: Card = register_kingdom_event(make_card({
  name: 'Efficiency',
  energy: 0,
  cost_range: [32, 64],
  description: 'Once per game, double energy',
  fn: function* (state: GameState) {
    state = trash_event(state, 'Efficiency');
    state = state.set('energy', state.get('energy') * 2);
    return state;
  }
}));

export const Adrenaline: Card = register_kingdom_event(make_card({
  name: 'Adrenaline',
  energy: 0,
  cost_range: [10, 25],
  description: 'Once per game, gain energy equal to the number of cards in your hand',
  fn: function* (state: GameState) {
    state = trash_event(state, 'Adrenaline');
    state = state.set('energy', state.get('energy') + state.get('hand').size);
    return state;
  }
}));

export const Greed: Card = register_kingdom_event(make_card({
  name: 'Greed',
  energy: 0,
  cost_range: [10, 25],
  description: 'At the end of the game, set victory point equal to $ you have.',
  fn: function* (state: GameState) {
    state = trash_event(state, 'Greed');
    function* end_hook(state: GameState) {
      // return state.set('victory', state.get('victory') + state.get('money'));
      return state.set('victory', state.get('money'));
    }
    state = state.set('end_hooks', state.get('end_hooks').push(end_hook));
    return state;
  },
}));
