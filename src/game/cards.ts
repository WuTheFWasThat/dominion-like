import { make_card, Card, GameState, draw, discard, trash, trash_event, gain, scry } from  './core';
import * as game from  './core';

/* eslint-disable require-yield */

export let KINGDOM_CARDS: {[name: string]: Card} = {};
export let KINGDOM_EVENTS: {[name: string]: Card} = {};
export let KINGDOM_SITUATIONS: {[name: string]: Card} = {};


function register_kingdom_card(card: Card) {
  if (KINGDOM_CARDS[card.get('name')]) {
    throw new Error(`Already registered ${card.get('name')}`);
  }
  if (KINGDOM_EVENTS[card.get('name')]) {
    throw new Error(`Already registered ${card.get('name')}`);
  }
  if (KINGDOM_SITUATIONS[card.get('name')]) {
    throw new Error(`Already registered ${card.get('name')}`);
  }
  KINGDOM_CARDS[card.get('name')] = card;
  return card;
}

function register_kingdom_event(card: Card) {
  if (KINGDOM_CARDS[card.get('name')]) {
    throw new Error(`Already registered ${card.get('name')}`);
  }
  if (KINGDOM_EVENTS[card.get('name')]) {
    throw new Error(`Already registered ${card.get('name')}`);
  }
  if (KINGDOM_SITUATIONS[card.get('name')]) {
    throw new Error(`Already registered ${card.get('name')}`);
  }
  KINGDOM_EVENTS[card.get('name')] = card;
  return card;
}


function register_kingdom_situation(card: Card) {
  if (KINGDOM_CARDS[card.get('name')]) {
    throw new Error(`Already registered ${card.get('name')}`);
  }
  if (KINGDOM_EVENTS[card.get('name')]) {
    throw new Error(`Already registered ${card.get('name')}`);
  }
  if (KINGDOM_SITUATIONS[card.get('name')]) {
    throw new Error(`Already registered ${card.get('name')}`);
  }
  KINGDOM_SITUATIONS[card.get('name')] = card;
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
  description: 'Gain a card from the card supply pile costing up to 5',
  fn: function* (state: GameState) {
    let choice = (yield ([state, {type: 'picksupply', message: 'Pick card to gain for Workshop'} as game.PickSupplyQuestion])) as game.PickSupplyChoice;
    let supplyCard = game.getSupplyCard(state, choice.cardname, 'supply').supplyCard;
    if (supplyCard === null) {
      state = state.set('error', `${choice.cardname} not found`);
      return state;
    }
    if (supplyCard.get('cost') > 5) {
      state = state.set('error', `${choice.cardname} too expensive for Workshop`);
      return state;
    }
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
  energy: 1,
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
  energy: 3,
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
  cost_range: [3, 6],
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
  energy: 0,
  cost_range: [2, 4],
  description: 'Choose a card from your hand, pay its energy cost to play it twice',
  fn: function* (state: GameState) {
    let choice = (yield [state, {type: 'pickhand', max: 1, message: 'Pick card to play for Throne Room'}]) as game.PickHandChoice;
    if (choice.indices.length === 0) {
      return state;
    } else if (choice.indices.length > 1) {
      throw Error('Something went wrong');
    }
    let index: number = choice.indices[0];
    let card = state.get('hand').get(index) as Card;
    state = state.set('energy', state.get('energy') + card.get('energy'));
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
  description: 'Put all cards in your draw costing 0 energy in your hand',
  fn: function* (state: GameState) {
    let indices = [];
    for (let i = 0; i < state.get('draw').size; i++) {
      let card = state.get('draw').get(i);
      if (card === undefined) {
        throw Error(`Unexpected card out of bounds ${i}`);
      }
      if (card.get('energy') === 0) {
        indices.push(i);
      }
    }
    indices = indices.sort((a,b) => b-a);
    for (let i = 0; i < indices.length; i++) {
      let index = indices[i];
      let card = state.get('draw').get(index);
      if (card === undefined) {
        throw Error(`Unexpected card out of bounds ${index} indices ${indices}`);
      }
      state = state.set('draw', state.get('draw').remove(index));
      state = state.set('hand', state.get('hand').push(card));
    }
    return state;
  }
}));

export const Madness: Card = register_kingdom_card(make_card({
  name: 'Madness',
  energy: 1,
  cost_range: [8, 16],
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

export const Bridge: Card = register_kingdom_event(make_card({
  name: 'Bridge',
  energy: 2,
  cost_range: [8, 16],
  description: 'Choose a card from supply,  Decrease its $ cost by 1 (cannot go negative).',
  fn: function* (state: GameState) {
    let choice = (yield ([state, {type: 'picksupply', message: 'Pick card to decrease the cost of'} as game.PickSupplyQuestion])) as game.PickSupplyChoice;
    let { index, supplyCard } = game.getSupplyCard(state, choice.cardname, 'supply');
    if (supplyCard === null) {
      state = state.set('error', `Card chosen not in supply!`);
      return state;
    }
    if (supplyCard.get('cost') === 0) {
      return state;
    }
    state = state.set('supply', state.get('supply').set(index, supplyCard.set('cost', supplyCard.get('cost') - 1)));
    return state;
  }
}));

export const Favor: Card = register_kingdom_event(make_card({
  name: 'Favor',
  energy: 1,
  cost_range: [1, 3],
  description: 'Play a card from supply costing up to 7',
  fn: function* (state: GameState) {
    let choice = (yield ([state, {type: 'picksupply', message: 'Pick card to gain for Favor'} as game.PickSupplyQuestion])) as game.PickSupplyChoice;
    let supplyCard = game.getSupplyCard(state, choice.cardname, 'supply').supplyCard;
    if (supplyCard === null) {
      state = state.set('error', `${choice.cardname} not found`);
      return state;
    }
    if (supplyCard.get('cost') > 7) {
      state = state.set('error', `${choice.cardname} too expensive for Favor`);
      return state;
    }
    state = yield* supplyCard.get('card').get('fn')(state);
    return state;
  }
}));

/*
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
*/

export const Greed: Card = register_kingdom_event(make_card({
  name: 'Greed',
  energy: 0,
  cost_range: [0, 25],
  description: 'Convert all your $ to victory points.',
  fn: function* (state: GameState) {
    state.set('victory', state.get('victory') + state.get('money'));
    return state.set('money', 0);
  },
}));


export const Expedite: Card = register_kingdom_event(make_card({
  name: 'Expedite',
  energy: 1,
  cost_range: [0, 0],
  description: 'Choose a card from supply.  Pay its cost and gain it in hand',
  fn: function* (state: GameState) {
    let choice = (yield ([state, {type: 'picksupply', message: 'Pick card to gain for Expedite'} as game.PickSupplyQuestion])) as game.PickSupplyChoice;
    let supply_card = game.getSupplyCard(state, choice.cardname, 'supply').supplyCard;
    if (supply_card === null) {
      state = state.set('error', `Card chosen not in supply!`);
      return state;
    }
    if (state.get('money') < supply_card.get('cost')) {
      state = state.set('error', `Insufficient money`);
      return state;
    }
    state = state.set('money', state.get('money') - supply_card.get('cost'));
    state = state.set('hand', state.get('hand').push(supply_card.get('card')));
    return state;
  }
}));


export const Triumph: Card = make_card({
  name: 'Triumph',
  energy: 0,
  description: 'Once you reach 100 points, the game ends',
  fn: function* (state: GameState) {
    function* hook(state: GameState) {
      if (state.get('victory') >= 100) {
        state = state.set('ended', true);
      }
      return state;
    }
    state = state.set('turn_hooks', state.get('turn_hooks').push(hook))
    return state;
  }
});

export const Riches: Card = register_kingdom_situation(make_card({
  name: 'Riches',
  energy: 0,
  description: 'If you have $1000, the game ends',
  fn: function* (state: GameState) {
    function* hook(state: GameState) {
      if (state.get('money') >= 1000) {
        state = state.set('ended', true);
      }
      return state;
    }
    state = state.set('turn_hooks', state.get('turn_hooks').push(hook))
    return state;
  }
}));
