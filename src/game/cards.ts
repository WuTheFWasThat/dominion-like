import Immutable from 'immutable';

import {
  make_card, make_situation, Card, Situation,
  GameState, Effect,
  draw, discard, trash_from_deck, trash, trash_event, gain, scry, play
} from  './core';
import * as game from  './core';

/* eslint-disable require-yield */

export let KINGDOM_CARDS: {[name: string]: Card} = {};
export let KINGDOM_EVENTS: {[name: string]: Card} = {};
export let KINGDOM_SITUATIONS: {[name: string]: Situation} = {};
export let KINGDOM_SITUATIONS_TO_BUY: {[name: string]: Situation} = {};


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
  if (KINGDOM_SITUATIONS_TO_BUY[card.get('name')]) {
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
  if (KINGDOM_SITUATIONS_TO_BUY[card.get('name')]) {
    throw new Error(`Already registered ${card.get('name')}`);
  }
  KINGDOM_EVENTS[card.get('name')] = card;
  return card;
}


function register_kingdom_situation(card: Situation) {
  if (KINGDOM_CARDS[card.get('name')]) {
    throw new Error(`Already registered ${card.get('name')}`);
  }
  if (KINGDOM_EVENTS[card.get('name')]) {
    throw new Error(`Already registered ${card.get('name')}`);
  }
  if (KINGDOM_SITUATIONS[card.get('name')]) {
    throw new Error(`Already registered ${card.get('name')}`);
  }
  if (KINGDOM_SITUATIONS_TO_BUY[card.get('name')]) {
    throw new Error(`Already registered ${card.get('name')}`);
  }
  KINGDOM_SITUATIONS[card.get('name')] = card;
  return card;
}

function register_kingdom_situation_to_buy(card: Situation) {
  if (KINGDOM_CARDS[card.get('name')]) {
    throw new Error(`Already registered ${card.get('name')}`);
  }
  if (KINGDOM_EVENTS[card.get('name')]) {
    throw new Error(`Already registered ${card.get('name')}`);
  }
  if (KINGDOM_SITUATIONS[card.get('name')]) {
    throw new Error(`Already registered ${card.get('name')}`);
  }
  if (KINGDOM_SITUATIONS_TO_BUY[card.get('name')]) {
    throw new Error(`Already registered ${card.get('name')}`);
  }
  KINGDOM_SITUATIONS_TO_BUY[card.get('name')] = card;
  return card;
}


export const Copper: Card = make_card({
  name: 'Copper',
  energy: 0,
  extra: Immutable.Map({ value: 1 }), // used for coppersmith
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

export const Diamond: Card = make_card({
  name: 'Diamond',
  energy: 0,
  cost_range: [10, 10],
  description: '+$4',
  fn: function* (state: GameState) {
    return state.set('money', state.get('money') + 4);
  }
});


export const Platinum: Card = make_card({
  name: 'Platinum',
  energy: 0,
  cost_range: [15, 15],
  description: '+$5',
  fn: function* (state: GameState) {
    return state.set('money', state.get('money') + 5);
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

export const Territory: Card = make_card({
  name: 'Territory',
  energy: 1,
  cost_range: [10, 10],
  description: '+4 victory points',
  fn: function* (state: GameState) {
    return state.set('victory', state.get('victory') + 4);
  }
});

export const Colony: Card = make_card({
  name: 'Colony',
  energy: 1,
  cost_range: [15, 15],
  description: '+5 victory points',
  fn: function* (state: GameState) {
    return state.set('victory', state.get('victory') + 5);
  }
});


export const Donkey: Card = make_card({
  name: 'Donkey',
  energy: 1,
  description: '+1 card',
  fn: function* (state: GameState) {
    return yield* draw(state, 1);
  }
});

export const Mule: Card = make_card({
  name: 'Mule',
  energy: 1,
  description: '+2 card',
  fn: function* (state: GameState) {
    return yield* draw(state, 2);
  }
});


export const Gardens: Card = register_kingdom_card(make_card({
  name: 'Gardens',
  energy: 1,
  description: '+1 victory point for every 10 cards in your deck',
  fn: function* (state: GameState) {
    let n = game.count_in_deck(state, (card) => true);
    return state.set('victory', state.get('victory') + Math.floor(n / 10));
  }
}));

export const SilkRoad: Card = register_kingdom_card(make_card({
  name: 'Silk Road',
  energy: 2,
  description: '+1 victory point for every Silk Road in your deck',
  fn: function* (state: GameState) {
    let n = game.count_in_deck(state, (card) => card.get('name') === 'Silk Road');
    return state.set('victory', state.get('victory') + n);
  }
}));


export const Park: Card = register_kingdom_card(make_card({
  name: 'Park',
  energy: 1,
  cost_range: [8, 16],
  description: '+1 victory point for every card in your hand',
  fn: function* (state: GameState) {
    let n = game.count_in_deck(state, (card) => card.get('name') === 'Silk Road');
    return state.set('victory', state.get('victory') + n);
  }
}));

export const OilWell: Card = register_kingdom_card(make_card({
  name: 'Oil Well',
  energy: 0,
  cost_range: [8, 16],
  description: '+3 cards, +$3, +3 victory points, increase energy cost by 1',
  fn: function* (state: GameState) {
    state = yield* draw(state, 3);
    state = state.set('money', state.get('money') + 3);
    return state.set('victory', state.get('victory') + 3);
  },
  cleanup: function*(state: GameState, card: Card) {
    card = card.set('energy', card.get('energy') + 1);
    state = state.set('discard', state.get('discard').push(card));
    return state;
  }
}));


export const Duke: Card = register_kingdom_card(make_card({
  name: 'Duke',
  energy: 1,
  description: '+N victory points, where N is the number of duchies in your deck',
  fn: function* (state: GameState) {
    let n = game.count_in_deck(state, (card) => card.get('name') === 'Duchy');
    return state.set('victory', state.get('victory') + n);
  }
}));

export const FoolsYard: Card = register_kingdom_card(make_card({
  name: 'Fool\'s Yard',
  energy: 1,
  cost_range: [3, 5],
  description: '+0 VP, increase VP gain this card gives by 1',
  extra: Immutable.Map({ value: 0 }), // used for coppersmith
  fn: function* (state: GameState) {
    return state;
  },
  cleanup: function*(state: GameState, card: Card) {
    let extra = card.get('extra');
    if (extra === undefined) { throw new Error('Fools yard should have value field'); }
    let val = extra.get('value') + 1;
    card = card.set('fn', function* (state: GameState) {
      return state.set('victory', state.get('victory') + val);
    });
    card = card.set('description', '+' + val + ' VP, increase VP this card gives by 1');
    card = card.set('name', 'Fool\'s Yard +' + val);
    card = card.set('extra', extra.set('value', val));
    state = state.set('discard', state.get('discard').push(card));
    return state;
  }
}));


export const Workshop: Card = register_kingdom_card(make_card({
  name: 'Workshop',
  energy: 2,
  description: 'Gain a card from supply costing up to 5',
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

export const Factory: Card = register_kingdom_card(make_card({
  name: 'Factory',
  energy: 4,
  description: 'Gain a card from supply',
  fn: function* (state: GameState) {
    let choice = (yield ([state, {type: 'picksupply', message: 'Pick card to gain for Factory'} as game.PickSupplyQuestion])) as game.PickSupplyChoice;
    return gain(state, choice.cardname);
  }
}));


export const Smithy: Card = register_kingdom_card(make_card({
  name: 'Smithy',
  energy: 1,
  description: '+3 cards',
  fn: function* (state: GameState) {
    return yield* draw(state, 3);
  }
}));

export const Blacksmith: Card = register_kingdom_card(make_card({
  name: 'Blacksmith',
  energy: 1,
  cost_range: [3, 5],
  description: '+0 cards, increase card draw of this card by 1',
  extra: Immutable.Map({ value: 0 }), // used for coppersmith
  fn: function* (state: GameState) {
    return state;
  },
  cleanup: function*(state: GameState, card: Card) {
    let extra = card.get('extra');
    if (extra === undefined) { throw new Error('Blacksmith should have value field'); }
    let val = extra.get('value') + 1;
    card = card.set('fn', function* (state: GameState) {
      return yield* draw(state, val);
    });
    card = card.set('description', '+' + val + ' cards, increase card draw of this card by 1');
    card = card.set('name', 'Blacksmith +' + val);
    card = card.set('extra', extra.set('value', val));
    state = state.set('discard', state.get('discard').push(card));
    return state;
  }
}));


export const Peddler: Card = register_kingdom_card(make_card({
  name: 'Peddler',
  energy: 1,
  description: '+1 card, +$1',
  cost_range: [0, 0],
  fn: function* (state: GameState) {
    state = state.set('money', state.get('money') + 1);
    return yield* draw(state, 1);
  }
}));

export const Lab: Card = register_kingdom_card(make_card({
  name: 'Lab',
  energy: 0,
  cost_range: [4, 8],
  description: '+2 cards',
  fn: function* (state: GameState) {
    state = yield* draw(state, 2);
    return state;
  }
}));

export const Horse: Card = register_kingdom_card(make_card({
  name: 'Horse',
  energy: 0,
  cost_range: [1, 2],
  description: '+2 cards, trash this',
  fn: function* (state: GameState) {
    state = yield* draw(state, 2);
    return state;
  },
  cleanup: function*(state: GameState, card: Card) {
    state = yield* trash(state, card);
    return state;
  }
}));

export const Hound: Card = register_kingdom_card(make_card({
  name: 'Hound',
  energy: 1,
  cost_range: [1, 2],
  description: '+1 card.  When discarded, +1 card',
  fn: function* (state: GameState) {
    state = yield* draw(state, 1);
    return state;
  },
  discard: function*(state: GameState, card: Card) {
    state = yield* draw(state, 1);
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
    state = yield* trash_from_deck(state, choice.indices, 'hand');
    return state;
  }
}));

export const Lurker: Card = register_kingdom_card(make_card({
  name: 'Lurker',
  energy: 1,
  description: 'Either: trash any card from supply or gain a card from trash',
  fn: function* (state: GameState) {
    let choice = (yield [state, {type: 'pick', message: 'Pick for lurker:', options: ['Trash from supply', 'Gain from trash']}]) as game.PickChoice;
    if (choice.choice === 0) {
      let supplychoice = (yield ([state, {type: 'picksupply', message: 'Pick card to trash'} as game.PickSupplyQuestion])) as game.PickSupplyChoice;
      let supplyCard = game.getSupplyCard(state, supplychoice.cardname, 'supply').supplyCard;
      if (supplyCard === null) {
        state = state.set('error', `Unexpected Lurker supply choice ${supplychoice.cardname}`);
        return state;
      }
      state = yield* trash(state, supplyCard.get('card'));
      state = state.set('log', state.get('log').push(`Trashed a ${supplyCard.get('card').get('name')} from supply`));
      return state;
    } else if (choice.choice === 1) {
      let trashchoice = (yield ([state, {type: 'picktrash', message: 'Pick card to retrieve from trash'} as game.PickTrashQuestion])) as game.PickTrashChoice;
      let card = state.get('trash').get(trashchoice.index);
      if (card === undefined) {
        state = state.set('error', `Unexpected Lurker trash choice ${trashchoice.index}`);
        return state;
      }
      state = state.set('trash', state.get('trash').remove(trashchoice.index));
      state = state.set('discard', state.get('trash').push(card));
      state = state.set('log', state.get('log').push(`Gained a ${card.get('name')} from trash`));
      return state;
    } else {
      state = state.set('error', `Unexpected Lurker choice ${choice.choice}`);
      return state;
    }
  }
}));


export const Steward: Card = register_kingdom_card(make_card({
  name: 'Steward',
  energy: 1,
  description: 'Choose one: +2 cards, +$2, or trash up to 2 cards from your hand',
  fn: function* (state: GameState) {
    let choice = (yield [state, {type: 'pick', message: 'Pick for steward:', options: ['+2 cards', '+$2', 'Trash 2 cards from your hand']}]) as game.PickChoice;
    if (choice.choice === 0) {
      state = yield* draw(state, 2);
      return state;
    } else if (choice.choice === 1) {
      state = state.set('money', state.get('money') + 2);
      return state;
    } else if (choice.choice === 2) {
      let trashchoice = (yield ([state, {type: 'pickhand', message: 'Pick cards to trash for steward', max: 2} as game.PickHandQuestion])) as game.PickHandChoice;
      if (trashchoice.indices.length > 2) {
        state = state.set('error', 'Cannot trash more than 2 cards with Steward');
        return state;
      }
      state = yield* trash_from_deck(state, trashchoice.indices, 'hand');
      return state;
    } else {
      state = state.set('error', `Unexpected Steward choice ${choice.choice}`);
      return state;
    }
  }
}));


export const Sacrifice: Card = register_kingdom_card(make_card({
  name: 'Sacrifice',
  energy: 0,
  description: 'Choose a card from your hand, play it, and trash it.',
  fn: function* (state: GameState) {
    let choice = (yield [state, {type: 'pickhand', message: 'Pick card to play and trash for Sacrifice', limit: 1}]) as game.PickHandChoice;
    if (choice.indices.length === 0) {
      return state;
    } else if (choice.indices.length > 1) {
      throw Error('Something went wrong');
    }
    let index = choice.indices[0];
    let card = state.get('hand').get(index) as Card;
    state = state.set('hand', state.get('hand').remove(index));
    state = yield* play(state, card);
    state = yield* trash(state, card);
    return state;
  }
}));


export const DualWield: Card = register_kingdom_card(make_card({
  name: 'Dual Wield',
  energy: 1,
  description: 'Choose a card from your hand, add another copy into your hand.',
  fn: function* (state: GameState) {
    let choice = (yield [state, {type: 'pickhand', message: 'Pick card to copy for Dual Wield', limit: 1}]) as game.PickHandChoice;
    if (choice.indices.length === 0) {
      return state;
    } else if (choice.indices.length > 1) {
      throw Error('Something went wrong');
    }
    let index = choice.indices[0];
    let card = state.get('hand').get(index) as Card;
    state = state.set('hand', state.get('hand').push(card));
    return state;
  }
}));


export const Beggar: Card = register_kingdom_card(make_card({
  name: 'Beggar',
  energy: 1,
  description: 'Gain 3 coppers to your hand',
  fn: function* (state: GameState) {
    state = state.set('hand', state.get('hand').push(Copper));
    state = state.set('hand', state.get('hand').push(Copper));
    state = state.set('hand', state.get('hand').push(Copper));
    return state;
  }
}));

export const Mouse: Card = register_kingdom_card(make_card({
  name: 'Mouse',
  energy: 0,
  description: 'Trash a card from your hand. If you do, +1 card',
  fn: function* (state: GameState) {
    let choice = (yield [state, {type: 'pickhand', message: 'Pick card to trash for Mouse', limit: 1}]) as game.PickHandChoice;
    if (choice.indices.length === 0) {
      return state;
    } else if (choice.indices.length > 1) {
      throw Error('Something went wrong');
    }
    state = yield* trash_from_deck(state, choice.indices, 'hand');
    state = yield* draw(state, 1);
    return state;
  }
}));

export const Library: Card = register_kingdom_card(make_card({
  name: 'Library',
  energy: 1,
  description: 'Draw until you have seven cards',
  fn: function* (state: GameState) {
    if (state.get('hand').size < 7) {
      state = yield* draw(state, 7 - state.get('hand').size);
    }
    return state;
  }
}));

export const FoolsGold: Card = register_kingdom_card(make_card({
  name: 'Fool\'s Gold',
  energy: 0,
  cost_range: [1, 2],
  description: '+$0, increase $ this card gives by 1',
  extra: Immutable.Map({ value: 0 }), // used for coppersmith
  fn: function* (state: GameState) {
    return state;
  },
  cleanup: function*(state: GameState, card: Card) {
    let extra = card.get('extra');
    if (extra === undefined) { throw new Error('Fools gold should have value field'); }
    let val = extra.get('value') + 1;
    card = card.set('fn', function* (state: GameState) {
      return state.set('money', state.get('money') + val);
    });
    card = card.set('description', '+$' + val + ', increase $ this card gives by 1');
    card = card.set('name', 'Fool\'s Gold +' + val);
    card = card.set('extra', extra.set('value', val));
    state = state.set('discard', state.get('discard').push(card));
    return state;
  }
}));

/*
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
*/


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
      let extra = card.get('extra');
      if (extra === undefined) {
        throw new Error('Copper should have extra');
      }
      let val = extra.get('value') + 1;
      card = card.set('fn', function* (state: GameState) {
        return state.set('money', state.get('money') + val);
      });
      card = card.set('description', '+$' + val);
      card = card.set('name', 'Copper +' + (val-1));
      card = card.set('extra', extra.set('value', val));
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
    state = yield* play(state, card);
    state = yield* play(state, card);
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
    state = yield* play(state, card);
    state = state.set('discard', state.get('discard').push(card));
    return state;
  }
}));


export const Cellar: Card = register_kingdom_card(make_card({
  name: 'Cellar',
  energy: 0,
  cost_range: [1, 3],
  description: 'Discard any number of cards from your hand, draw that many',
  fn: function* (state: GameState) {
    let choice = (yield [state, {type: 'pickhand', message: 'Pick cards to discard for Cellar'}]) as game.PickHandChoice;
    state = yield* discard(state, choice.indices);
    state = yield* draw(state, choice.indices.length);
    return state;
  }
}));


export const AllForOne: Card = register_kingdom_card(make_card({
  name: 'All For One',
  energy: 2,
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
    for (let index of indices) {
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
  cleanup: function*(state: GameState, card: Card) {
    state = yield* trash(state, card);
    return state;
  },
}));

export const Madman: Card = register_kingdom_card(make_card({
  name: 'Madman',
  energy: 0,
  cost_range: [5, 10],
  description: '+1 card per card in your hand. Trash this card',
  fn: function* (state: GameState) {
    let n = state.get('hand').size;
    state = yield* draw(state, n);
    return state;
  },
  cleanup: function*(state: GameState, card: Card) {
    state = yield* trash(state, card);
    return state;
  },
}));


export const Reboot: Card = make_card({
  name: 'Reboot',
  energy: 1,
  setup: function (state: GameState) {
    state = state.set('extra', state.get('extra').set('reboot_cards', 5));
    return state;
  },
  description: (state: GameState) => {
    let cards = state.get('extra').get('reboot_cards');
    return `Set your money to $0, discard your hand, and draw ${cards} cards`;
  },
  fn: function* (state: GameState) {
    state = state.set('money', 0);
    let n = state.get('hand').size;
    let indices = [];
    for (let i = 0; i < n; i++) {
      indices.push(i);
    }
    state = yield* discard(state, indices);
    state = yield* draw(state, state.get('extra').get('reboot_cards'));
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
    state = yield* discard(state, indices);
    state = yield* draw(state, n);
    return state;
  }
}));

export const Recruit: Card = register_kingdom_event(make_card({
  name: 'Recruit',
  energy: 1,
  description: 'Draw two cards',
  fn: function* (state: GameState) {
    return yield* draw(state, 2);
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
    let choice = (yield ([state, {type: 'picksupply', message: 'Pick card to play for Favor'} as game.PickSupplyQuestion])) as game.PickSupplyChoice;
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

export const Inflation: Card = register_kingdom_event(make_card({
  name: 'Inflation',
  energy: 0,
  cost_range: [0, 0],
  description: 'Once per game, gain $20.  All cards cost $1 extra',
  // Crazy version:  'Gain $20.  All cards and events cost $1 extra', increases cost of itself and reboot..
  fn: function* (state: GameState) {
    state = state.set('money', state.get('money') + 20);
    let n = state.get('supply').size;
    for (let i = 0; i < n; i++) {
      const supplyCard = state.get('supply').get(i) as game.SupplyCard;
      state = state.set('supply', state.get('supply').set(i, supplyCard.set('cost', supplyCard.get('cost') + 1)));
    }
    state = trash_event(state, 'Inflation');
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
  cost_range: [1, 25],
  description: 'Convert all your $ to victory points.  Trash this.',
  fn: function* (state: GameState) {
    state = trash_event(state, 'Greed');
    state = state.set('victory', state.get('victory') + state.get('money'));
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


export const Triumph: Situation = make_situation({
  name: 'Triumph',
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

export const Riches: Situation = register_kingdom_situation(make_situation({
  name: 'Riches',
  description: 'If you have $200, the game ends',
  fn: function* (state: GameState) {
    function* hook(state: GameState) {
      if (state.get('money') >= 200) {
        state = state.set('ended', true);
      }
      return state;
    }
    state = state.set('turn_hooks', state.get('turn_hooks').push(hook))
    return state;
  }
}));

export const MarketHours: Situation = register_kingdom_situation(make_situation({
  name: 'Market Hours',
  description: 'You may only buy cards when energy spent is a multiple of 3',
  fn: function* (state: GameState) {
    state = state.set('extra', state.get('extra').set('market_hours', true))
    return state;
  }
}));

export const JunkYard: Situation = register_kingdom_situation(make_situation({
  name: 'Junk Yard',
  description: 'Whenever you trash a card, gain a silver',
  fn: function* (state: GameState) {
    function* hook(state: GameState, _card: Card) {
      state = state.set('discard', state.get('discard').push(Silver));
      return state;
    }
    state = state.set('trash_hooks', state.get('trash_hooks').push(hook))
    return state;
  }
}));

export const Compost: Situation = register_kingdom_situation(make_situation({
  name: 'Compost',
  description: 'Whenever you trash a card, +1 VP',
  fn: function* (state: GameState) {
    function* hook(state: GameState, _card: Card) {
      state = state.set('victory', state.get('victory') + 1);
      return state;
    }
    state = state.set('trash_hooks', state.get('trash_hooks').push(hook))
    return state;
  }
}));


export const StrayHound: Situation = register_kingdom_situation(make_situation({
  name: 'Stray Hound',
  description: (state: GameState) => {
    let x = state.get('extra').get('stray_hound');
    return `Every ten cards you draw, discard one card (${x}/10)`;
  },
  fn: function* (state: GameState) {
    state = state.set('extra', state.get('extra').set('stray_hound', 0));
    function* hook(state: GameState): Effect {
      let x = (state.get('extra').get('stray_hound') + 1) % 10;
      state = state.set('extra', state.get('extra').set('stray_hound', x));
      if (x === 0 && state.get('hand').size > 0) {
        while (true) {
          let choice = (yield [state, {type: 'pickhand', message: 'Pick card to discard for Stray Hound', max: 1} as game.PickHandQuestion]) as game.PickHandChoice;
          if (choice.indices.length === 0) {
            continue;
          } else if (choice.indices.length > 1) {
            throw Error('Something went wrong');
          }
          state = yield* discard(state, choice.indices);
          break;
        }
      }
      return state;
    }
    state = state.set('draw_hooks', state.get('draw_hooks').push(hook))
    return state;
  }
}));

export const Boost: Situation = register_kingdom_situation_to_buy(make_situation({
  name: 'Boost',
  description: 'Reboot gives 2 extra cards',
  energy_range: [5, 15],
  fn: function* (state: GameState) {
    let extra = state.get('extra');
    return state.set('extra', extra.set('reboot_cards', extra.get('reboot_cards') + 2));
  }
}));


console.log(KINGDOM_CARDS);
console.log(KINGDOM_EVENTS);
console.log(KINGDOM_SITUATIONS);
