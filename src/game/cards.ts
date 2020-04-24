import Immutable from 'immutable';

import {
  RawCard, RawSituation, RawEvent,
  make_card, make_situation, Card, Situation, make_event, Event,
  getSupplyCard,
  GameState, Effect,
  draw, discard_from_hand, discard, trash_from_deck, trash, gain, gain_supply, scry, play
} from  './core';
import * as game from  './core';

/* eslint-disable require-yield */

export let KINGDOM_CARDS: {[name: string]: Card} = {};
export let KINGDOM_EVENTS: {[name: string]: Event} = {};
export let KINGDOM_SITUATIONS: {[name: string]: Situation} = {};
export let KINGDOM_SITUATIONS_TO_BUY: {[name: string]: Situation} = {};


function register_kingdom_card(card: RawCard) {
  if (KINGDOM_CARDS[card.name]) {
    throw new Error(`Already registered ${card.name}`);
  }
  if (KINGDOM_EVENTS[card.name]) {
    throw new Error(`Already registered ${card.name}`);
  }
  if (KINGDOM_SITUATIONS[card.name]) {
    throw new Error(`Already registered ${card.name}`);
  }
  if (KINGDOM_SITUATIONS_TO_BUY[card.name]) {
    throw new Error(`Already registered ${card.name}`);
  }
  let made = make_card(card);
  KINGDOM_CARDS[card.name] = made;
  return made;
}

function register_kingdom_event(event: RawEvent) {
  if (KINGDOM_CARDS[event.name]) {
    throw new Error(`Already registered ${event.name}`);
  }
  if (KINGDOM_EVENTS[event.name]) {
    throw new Error(`Already registered ${event.name}`);
  }
  if (KINGDOM_SITUATIONS[event.name]) {
    throw new Error(`Already registered ${event.name}`);
  }
  if (KINGDOM_SITUATIONS_TO_BUY[event.name]) {
    throw new Error(`Already registered ${event.name}`);
  }
  let made = make_event(event);
  KINGDOM_EVENTS[event.name] = made;
  return made;
}


function register_kingdom_situation(situation: RawSituation) {
  if (KINGDOM_CARDS[situation.name]) {
    throw new Error(`Already registered ${situation.name}`);
  }
  if (KINGDOM_EVENTS[situation.name]) {
    throw new Error(`Already registered ${situation.name}`);
  }
  if (KINGDOM_SITUATIONS[situation.name]) {
    throw new Error(`Already registered ${situation.name}`);
  }
  if (KINGDOM_SITUATIONS_TO_BUY[situation.name]) {
    throw new Error(`Already registered ${situation.name}`);
  }
  let made = make_situation(situation);
  KINGDOM_SITUATIONS[situation.name] = made;
  return made;
}

function register_kingdom_situation_to_buy(situation: RawSituation) {
  if (KINGDOM_CARDS[situation.name]) {
    throw new Error(`Already registered ${situation.name}`);
  }
  if (KINGDOM_EVENTS[situation.name]) {
    throw new Error(`Already registered ${situation.name}`);
  }
  if (KINGDOM_SITUATIONS[situation.name]) {
    throw new Error(`Already registered ${situation.name}`);
  }
  if (KINGDOM_SITUATIONS_TO_BUY[situation.name]) {
    throw new Error(`Already registered ${situation.name}`);
  }
  let made = make_situation(situation);
  KINGDOM_SITUATIONS_TO_BUY[situation.name] = made;
  return made;
}


export const Copper: Card = make_card({
  name: 'Copper',
  energy: 1,
  extra: Immutable.Map({ value: 1 }), // used for coppersmith
  description: '+$1',
  fn: function* (state: GameState, me: Card) {
    let extra = me.get('extra');
    if (extra === undefined) {
      throw new Error('Copper should have extra');
    }
    state = state.set('money', state.get('money') + extra.get('value'))
    return [state, me] as [GameState, Card];
  }
});

export const Silver: Card = make_card({
  name: 'Silver',
  energy: 1,
  description: '+$2',
  fn: function* (state: GameState, me: Card) {
    state = state.set('money', state.get('money') + 2)
    return [state, me] as [GameState, Card];
  }
});


export const Gold: Card = make_card({
  name: 'Gold',
  energy: 1,
  description: '+$3',
  fn: function* (state: GameState, me: Card) {
    state = state.set('money', state.get('money') + 3)
    return [state, me] as [GameState, Card];
  }
});

export const Diamond: Card = make_card({
  name: 'Diamond',
  energy: 1,
  cost_range: [10, 10],
  description: '+$4',
  fn: function* (state: GameState, me: Card) {
    state = state.set('money', state.get('money') + 4);
    return [state, me] as [GameState, Card];
  }
});


export const Platinum: Card = make_card({
  name: 'Platinum',
  energy: 1,
  cost_range: [15, 15],
  description: '+$5',
  fn: function* (state: GameState, me: Card) {
    state = state.set('money', state.get('money') + 5);
    return [state, me] as [GameState, Card];
  }
});


export const Estate: Card = make_card({
  name: 'Estate',
  energy: 1,
  description: '+1 victory point',
  fn: function* (state: GameState, me: Card) {
    state = state.set('victory', state.get('victory') + 1);
    return [state, me] as [GameState, Card];
  }
});

export const Duchy: Card = make_card({
  name: 'Duchy',
  energy: 1,
  description: '+2 victory points',
  fn: function* (state: GameState, me: Card) {
    state = state.set('victory', state.get('victory') + 2);
    return [state, me] as [GameState, Card];
  }
});

export const Province: Card = make_card({
  name: 'Province',
  energy: 1,
  description: '+3 victory points',
  fn: function* (state: GameState, me: Card) {
    state = state.set('victory', state.get('victory') + 3);
    return [state, me] as [GameState, Card];
  }
});

export const Territory: Card = make_card({
  name: 'Territory',
  energy: 1,
  cost_range: [10, 10],
  description: '+4 victory points',
  fn: function* (state: GameState, me: Card) {
    state = state.set('victory', state.get('victory') + 4);
    return [state, me] as [GameState, Card];
  }
});

export const Colony: Card = make_card({
  name: 'Colony',
  energy: 1,
  cost_range: [15, 15],
  description: '+5 victory points',
  fn: function* (state: GameState, me: Card) {
    state = state.set('victory', state.get('victory') + 5);
    return [state, me] as [GameState, Card];
  }
});


export const Donkey: Card = make_card({
  name: 'Donkey',
  energy: 1,
  description: '+1 card',
  fn: function* (state: GameState, me: Card) {
    state = (yield* draw(state, 1)).state;
    return [state, me] as [GameState, Card];
  }
});

export const Mule: Card = make_card({
  name: 'Mule',
  energy: 1,
  description: '+2 card',
  fn: function* (state: GameState, me: Card) {
    state = (yield* draw(state, 2)).state;
    return [state, me] as [GameState, Card];
  }
});


export const Gardens: Card = register_kingdom_card({
  name: 'Gardens',
  energy: 1,
  description: '+1 victory point for every 10 cards in your deck',
  fn: function* (state: GameState, me: Card) {
    let n = game.count_in_deck(state, (card) => true);
    state = state.set('victory', state.get('victory') + Math.floor(n / 10));
    return [state, me] as [GameState, Card];
  }
});

export const SilkRoad: Card = register_kingdom_card({
  name: 'Silk Road',
  energy: 2,
  description: '+1 victory point for every Silk Road in your deck',
  fn: function* (state: GameState, me: Card) {
    let n = game.count_in_deck(state, (card) => card.get('name') === SilkRoad.get('name'));
    state = state.set('victory', state.get('victory') + n);
    return [state, me] as [GameState, Card];
  }
});


export const Park: Card = register_kingdom_card({
  name: 'Park',
  energy: 1,
  cost_range: [8, 16],
  description: '+1 victory point for every card in your hand',
  fn: function* (state: GameState, me: Card) {
    let n = game.count_in_deck(state, (card) => true, ['hand']);
    state = state.set('victory', state.get('victory') + n);
    return [state, me] as [GameState, Card];
  }
});

export const OilWell: Card = register_kingdom_card({
  name: 'Oil Well',
  energy: 0,
  cost_range: [8, 16],
  description: '+3 cards, +$3, +3 victory points, increase energy cost by 1',
  fn: function* (state: GameState, me: Card) {
    state = (yield* draw(state, 3)).state;
    state = state.set('money', state.get('money') + 3);
    state = state.set('victory', state.get('victory') + 3);
    me = me.set('energy', me.get('energy') + 1);
    return [state, me] as [GameState, Card];
  },
});


export const Duke: Card = register_kingdom_card({
  name: 'Duke',
  energy: 1,
  description: '+N victory points, where N is the number of duchies in your deck',
  fn: function* (state: GameState, me: Card) {
    let n = game.count_in_deck(state, (card) => card.get('name') === Duchy.get('name'));
    state = state.set('victory', state.get('victory') + n);
    return [state, me] as [GameState, Card];
  }
});

export const FoolsYard: Card = register_kingdom_card({
  name: 'Fool\'s Yard',
  energy: 1,
  cost_range: [3, 5],
  description: '+0 VP, increase VP gain this card gives by 1',
  extra: Immutable.Map({ value: 0 }),
  fn: function* (state: GameState, me: Card) {
    let extra = me.get('extra');
    if (extra === undefined) { throw new Error('Fools yard should have value field'); }
    let val = extra.get('value');
    state = state.set('victory', state.get('victory') + val);
    val = val + 1;
    me = me.set('description', '+' + val + ' VP, increase VP this card gives by 1');
    me = me.set('name', FoolsYard.get('name') + ' +' + val);
    me = me.set('extra', extra.set('value', val));
    return [state, me] as [GameState, Card];
  },
});


export const Workshop: Card = register_kingdom_card({
  name: 'Workshop',
  energy: 2,
  description: 'Gain a card from supply costing up to 5',
  fn: function* (state: GameState, me: Card) {
    let choice = (yield ([state, {type: 'picksupply', message: 'Pick card to gain for Workshop'} as game.PickSupplyQuestion])) as game.PickSupplyChoice;
    let supplyCard = game.getSupplyCard(state, choice.cardname).supplyCard;
    if (supplyCard === null) {
      state = state.set('error', `${choice.cardname} not found`);
      return [state, me] as [GameState, Card];
    }
    if (supplyCard.get('cost') > 5) {
      state = state.set('error', `${choice.cardname} too expensive for Workshop`);
      return [state, me] as [GameState, Card];
    }
    state = yield* gain(state, [supplyCard.get('card')]);
    return [state, me] as [GameState, Card];
  }
});

export const Factory: Card = register_kingdom_card({
  name: 'Factory',
  energy: 4,
  description: 'Gain a card from supply',
  fn: function* (state: GameState, me: Card) {
    let choice = (yield ([state, {type: 'picksupply', message: 'Pick card to gain for Factory'} as game.PickSupplyQuestion])) as game.PickSupplyChoice;
    state = yield* gain_supply(state, choice.cardname);
    return [state, me] as [GameState, Card];
  }
});


export const Smithy: Card = register_kingdom_card({
  name: 'Smithy',
  energy: 1,
  cost_range: [3, 6],
  description: '+3 cards',
  fn: function* (state: GameState, me: Card) {
    state = (yield* draw(state, 3)).state;
    return [state, me] as [GameState, Card];
  }
});

export const Storyteller: Card = register_kingdom_card({
  name: 'Storyteller',
  energy: 1,
  cost_range: [5, 10],
  description: 'Pay all your $, draw one card per $.',
  fn: function* (state: GameState, me: Card) {
    let n = state.get('money');
    state = state.set('money', 0);
    state = (yield* draw(state, n)).state;
    return [state, me] as [GameState, Card];
  }
});


export const Blacksmith: Card = register_kingdom_card({
  name: 'Blacksmith',
  energy: 1,
  cost_range: [3, 5],
  description: '+0 cards, increase card draw of this card by 1',
  extra: Immutable.Map({ value: 0 }),
  fn: function* (state: GameState, me: Card) {
    let extra = me.get('extra');
    if (extra === undefined) { throw new Error('Blacksmith should have value field'); }
    let val = extra.get('value');
    state = (yield* draw(state, val)).state;
    val = val + 1;
    me = me.set('description', '+' + val + ' cards, increase card draw of this card by 1');
    me = me.set('name', Blacksmith.get('name') + ' +' + val);
    me = me.set('extra', extra.set('value', val));
    return [state, me] as [GameState, Card];
  },
});


export const Peddler: Card = register_kingdom_card({
  name: 'Peddler',
  energy: 1,
  description: '+1 card, +$1',
  cost_range: [0, 0],
  fn: function* (state: GameState, me: Card) {
    state = state.set('money', state.get('money') + 1);
    state = (yield* draw(state, 1)).state;
    return [state, me] as [GameState, Card];
  }
});

export const Lab: Card = register_kingdom_card({
  name: 'Lab',
  energy: 0,
  cost_range: [5, 10],
  description: '+2 cards',
  fn: function* (state: GameState, me: Card) {
    state = (yield* draw(state, 2)).state;
    return [state, me] as [GameState, Card];
  }
});

export const Horse: Card = register_kingdom_card({
  name: 'Horse',
  energy: 0,
  cost_range: [2, 4],
  description: '+2 cards, trash this',
  fn: function* (state: GameState, me: Card) {
    state = (yield* draw(state, 2)).state;
    state = yield* trash(state, me);
    return [state, null] as [GameState, null];
  },
});

export const Hound: Card = register_kingdom_card({
  name: 'Hound',
  energy: 0,
  cost_range: [1, 4],
  description: '+1 card.  When discarded, +1 card',
  fn: function* (state: GameState, me: Card) {
    state = (yield* draw(state, 1)).state;
    return [state, me] as [GameState, Card];
  },
  discard_hook: function*(state: GameState, card: Card) {
    state = (yield* draw(state, 1)).state;
    return [state, card] as [GameState, Card];
  }
});


export const Chapel: Card = register_kingdom_card({
  name: 'Chapel',
  energy: 3,
  description: 'Trash any number of cards from your hand',
  fn: function* (state: GameState, me: Card) {
    let choice = (yield [state, {type: 'pickhand', message: 'Pick cards to trash for Chapel'}]) as game.PickHandChoice;
    state = yield* trash_from_deck(state, choice.indices, 'hand');
    return [state, me] as [GameState, Card];
  }
});

export const Lurker: Card = register_kingdom_card({
  name: 'Lurker',
  energy: 1,
  description: 'Either: trash any card from supply or gain a card from trash',
  fn: function* (state: GameState, me: Card) {
    let choice = (yield [state, {type: 'pick', message: 'Pick for lurker:', options: ['Trash from supply', 'Gain from trash']}]) as game.PickChoice;
    if (choice.choice === 0) {
      let supplychoice = (yield ([state, {type: 'picksupply', message: 'Pick card to trash'} as game.PickSupplyQuestion])) as game.PickSupplyChoice;
      let supplyCard = game.getSupplyCard(state, supplychoice.cardname).supplyCard;
      if (supplyCard === null) {
        state = state.set('error', `Unexpected Lurker supply choice ${supplychoice.cardname}`);
        return [state, me] as [GameState, Card];
      }
      state = yield* trash(state, supplyCard.get('card'));
      state = state.set('log', state.get('log').push(`Trashed a ${supplyCard.get('card').get('name')} from supply`));
      return [state, me] as [GameState, Card];
    } else if (choice.choice === 1) {
      let trashchoice = (yield ([state, {type: 'picktrash', message: 'Pick card to retrieve from trash'} as game.PickTrashQuestion])) as game.PickTrashChoice;
      let card = state.get('trash').get(trashchoice.index);
      if (card === undefined) {
        state = state.set('error', `Unexpected Lurker trash choice ${trashchoice.index}`);
        return [state, me] as [GameState, Card];
      }
      state = state.set('trash', state.get('trash').remove(trashchoice.index));
      state = yield* gain(state, [card], ' from trash');
      return [state, me] as [GameState, Card];
    } else {
      state = state.set('error', `Unexpected Lurker choice ${choice.choice}`);
      return [state, me] as [GameState, Card];
    }
  }
});


export const Steward: Card = register_kingdom_card({
  name: 'Steward',
  energy: 1,
  description: 'Choose one: +2 cards, +$2, or trash up to 2 cards from your hand',
  fn: function* (state: GameState, me: Card) {
    let choice = (yield [state, {type: 'pick', message: 'Pick for steward:', options: ['+2 cards', '+$2', 'Trash 2 cards from your hand']}]) as game.PickChoice;
    if (choice.choice === 0) {
      state = (yield* draw(state, 2)).state;
      return [state, me] as [GameState, Card];
    } else if (choice.choice === 1) {
      state = state.set('money', state.get('money') + 2);
      return [state, me] as [GameState, Card];
    } else if (choice.choice === 2) {
      let trashchoice = (yield ([state, {type: 'pickhand', message: 'Pick cards to trash for steward', max: 2} as game.PickHandQuestion])) as game.PickHandChoice;
      if (trashchoice.indices.length > 2) {
        state = state.set('error', 'Cannot trash more than 2 cards with Steward');
        return [state, me] as [GameState, Card];
      }
      state = yield* trash_from_deck(state, trashchoice.indices, 'hand');
      return [state, me] as [GameState, Card];
    } else {
      state = state.set('error', `Unexpected Steward choice ${choice.choice}`);
      return [state, me] as [GameState, Card];
    }
  }
});


export const Sacrifice: Card = register_kingdom_card({
  name: 'Sacrifice',
  energy: 0,
  description: 'Choose a card from your hand, play it, and trash it.',
  fn: function* (state: GameState, me: Card) {
    let choice = (yield [state, {type: 'pickhand', message: 'Pick card to play and trash for Sacrifice', limit: 1}]) as game.PickHandChoice;
    if (choice.indices.length === 0) {
      return [state, me] as [GameState, Card];
    } else if (choice.indices.length > 1) {
      throw Error('Something went wrong');
    }
    let index = choice.indices[0];
    let card = state.get('hand').get(index) as Card;
    state = state.set('hand', state.get('hand').remove(index));
    // TODO: do this more elegantly?
    // state = yield* play(state, card);
    let maybe_card;
    [state, maybe_card] = yield* card.get('fn')(state, card);
    if (maybe_card === null) {
      state = state.set('log', state.get('log').push(`Sacrifice lost track of ${card.get('name')}`));
    } else {
      state = yield* trash(state, maybe_card);
    }
    return [state, me] as [GameState, Card];
  }
});


export const DualWield: Card = register_kingdom_card({
  name: 'Dual Wield',
  energy: 1,
  description: 'Choose a card from your hand, add another copy into your hand.',
  fn: function* (state: GameState, me: Card) {
    let choice = (yield [state, {type: 'pickhand', message: 'Pick card to copy for Dual Wield', limit: 1}]) as game.PickHandChoice;
    if (choice.indices.length === 0) {
      return [state, me] as [GameState, Card];
    } else if (choice.indices.length > 1) {
      throw Error('Something went wrong');
    }
    let index = choice.indices[0];
    let card = state.get('hand').get(index) as Card;
    state = state.set('hand', state.get('hand').push(card));
    return [state, me] as [GameState, Card];
  }
});


export const Beggar: Card = register_kingdom_card({
  name: 'Beggar',
  energy: 1,
  description: 'Gain 3 coppers to your hand',
  fn: function* (state: GameState, me: Card) {
    state = yield* gain(state, [Copper, Copper, Copper], ' for Beggar', 'hand');
    return [state, me] as [GameState, Card];
  }
});

export const Mouse: Card = register_kingdom_card({
  name: 'Mouse',
  energy: 0,
  description: 'Trash a card from your hand. If you do, +1 card',
  fn: function* (state: GameState, me: Card) {
    let choice = (yield [state, {type: 'pickhand', message: 'Pick card to trash for ' + Mouse.get('name'), limit: 1}]) as game.PickHandChoice;
    if (choice.indices.length === 0) {
      return [state, me] as [GameState, Card];
    } else if (choice.indices.length > 1) {
      throw Error('Something went wrong');
    }
    state = yield* trash_from_deck(state, choice.indices, 'hand');
    state = (yield* draw(state, 1)).state;
    return [state, me] as [GameState, Card];
  }
});

export const Moneylender: Card = register_kingdom_card({
  name: 'Moneylender',
  energy: 0,
  description: 'Trash a card from your hand. If you do, +$3',
  fn: function* (state: GameState, me: Card) {
    let choice = (yield [state, {type: 'pickhand', message: 'Pick card to trash for ' + Moneylender.get('name'), limit: 1}]) as game.PickHandChoice;
    if (choice.indices.length === 0) {
      return [state, me] as [GameState, Card];
    } else if (choice.indices.length > 1) {
      throw Error('Something went wrong');
    }
    state = yield* trash_from_deck(state, choice.indices, 'hand');
    state = state.set('money', state.get('money') + 3);
    return [state, me] as [GameState, Card];
  }
});


export const Library: Card = register_kingdom_card({
  name: 'Library',
  energy: 1,
  description: 'Draw until you have seven cards',
  fn: function* (state: GameState, me: Card) {
    if (state.get('hand').size < 7) {
      state = (yield* draw(state, 7 - state.get('hand').size)).state;
    }
    return [state, me] as [GameState, Card];
  }
});

export const FoolsGold: Card = register_kingdom_card({
  name: 'Fool\'s Gold',
  energy: 1,
  cost_range: [1, 2],
  description: '+$0, increase $ this card gives by 1',
  extra: Immutable.Map({ value: 0 }),
  fn: function* (state: GameState, me: Card) {
    let extra = me.get('extra');
    if (extra === undefined) { throw new Error('Fools gold should have value field'); }
    let val = extra.get('value');
    state = state.set('money', state.get('money') + val);
    val = val + 1;
    me = me.set('description', '+$' + val + ', increase $ this card gives by 1');
    me = me.set('name', FoolsGold.get('name') + ' +' + val);
    me = me.set('extra', extra.set('value', val));
    return [state, me] as [GameState, Card];
  },
});

export const Seek: Card = register_kingdom_card({
  name: 'Seek',
  energy: 0,
  cost_range: [2, 6],
  description: 'Choose a card from your draw pile, put it in hand',
  fn: function* (state: GameState, me: Card) {
    let choice = (yield [state, {type: 'pickdraw', max: 1, message: 'Pick card for Seek'}]) as game.PickDrawChoice;
    if (choice.indices.length === 0) {
      return [state, me] as [GameState, Card];
    } else if (choice.indices.length > 1) {
      throw Error('Something went wrong');
    }
    let index = choice.indices[0] as number;
    let card = state.get('draw').get(index);
    if (card === undefined) {
      return [state, me] as [GameState, Card];
    }
    state = state.set('draw', state.get('draw').remove(index));
    state = state.set('hand', state.get('hand').push(card));
    return [state, me] as [GameState, Card];
  },
});


/*
export const FoolsGold: Card = register_kingdom_card({
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
  fn: function* (state: GameState, me: Card) {
    let extra = state.get('extra');
    let n = extra.get('fools_gold');
    state = state.set('extra', extra.set('fools_gold', n + 1));
    state = state.set('money', state.get('money') + n);
    return [state, me] as [GameState, Card];
  }
});
*/


export const Coppersmith: Card = register_kingdom_card({
  name: 'Coppersmith',
  energy: 2,
  description: 'All coppers in hand give an additional $1',
  fn: function* (state: GameState, me: Card) {
    for (let i = 0; i < state.get('hand').size; i++) {
      let card = state.get('hand').get(i) as Card;
      if (card.get('name').split('+')[0] !== Copper.get('name')) {
        continue;
      }
      let extra = card.get('extra');
      if (extra === undefined) {
        throw new Error('Copper should have extra');
      }
      let val = extra.get('value') + 1;
      card = card.set('description', '+$' + val);
      card = card.set('name', Copper.get('name') + ' +' + (val-1));
      card = card.set('extra', extra.set('value', val));
      state = state.set('hand', state.get('hand').set(i, card));
    }
    return [state, me] as [GameState, Card];
  }
});

export const ThroneRoom: Card = register_kingdom_card({
  name: 'Throne Room',
  energy: 0,
  cost_range: [2, 4],
  description: 'Choose a card from your hand, pay its energy cost to play it twice',
  fn: function* (state: GameState, me: Card) {
    let choice = (yield [state, {type: 'pickhand', max: 1, message: 'Pick card to play for Throne Room'}]) as game.PickHandChoice;
    if (choice.indices.length === 0) {
      return [state, me] as [GameState, Card];
    } else if (choice.indices.length > 1) {
      throw Error('Something went wrong');
    }
    let index: number = choice.indices[0];
    let card = state.get('hand').get(index) as Card;
    state = state.set('energy', state.get('energy') + card.get('energy'));
    state = state.set('log', state.get('log').push(`Played throne room on ${card.get('name')}`));
    // TODO: use helper function for this
    state = state.set('hand', state.get('hand').remove(index));
    let maybe_card;
    [state, maybe_card] = yield* card.get('fn')(state, card);
    if (maybe_card === null) {
      state = state.set('log', state.get('log').push(`Throne room lost track of ${card.get('name')}`));
      return [state, me] as [GameState, Card];
    }
    card = maybe_card;
    [state, maybe_card] = yield* card.get('fn')(state, card);
    if (maybe_card === null) {
      state = state.set('log', state.get('log').push(`Throne room lost track of ${card.get('name')}`));
      return [state, me] as [GameState, Card];
    }
    card = maybe_card;
    state = (yield* discard(state, card))[0];
    return [state, me] as [GameState, Card];
  }
});

export const Vassal: Card = register_kingdom_card({
  name: 'Vassal',
  energy: 1,
  description: '+$2, play the top card of your draw',
  fn: function* (state: GameState, me: Card) {
    state = state.set('money', state.get('money') + 2);
    let card;
    [state, card] = yield* scry(state);
    if (card === null) {
      return [state, me] as [GameState, Card];
    }
    state = state.set('log', state.get('log').push(`Vassal plays a ${card.get('name')}`));
    state = (yield* play(state, card))[0];
    return [state, me] as [GameState, Card];
  }
});


export const Cellar: Card = register_kingdom_card({
  name: 'Cellar',
  energy: 0,
  cost_range: [1, 3],
  description: 'Discard any number of cards from your hand, draw that many',
  fn: function* (state: GameState, me: Card) {
    let choice = (yield [state, {type: 'pickhand', message: 'Pick cards to discard for Cellar'}]) as game.PickHandChoice;
    state = yield* discard_from_hand(state, choice.indices);
    state = (yield* draw(state, choice.indices.length)).state;
    return [state, me] as [GameState, Card];
  }
});


export const AllForOne: Card = register_kingdom_card({
  name: 'All For One',
  energy: 2,
  description: 'Put all cards in your draw costing 0 energy in your hand',
  fn: function* (state: GameState, me: Card) {
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
    return [state, me] as [GameState, Card];
  }
});

export const Madness: Card = register_kingdom_card({
  name: 'Madness',
  energy: 1,
  cost_range: [8, 16],
  description: 'Choose a card in hand.  Decrease its energy cost by 1 (cannot go negative). Trash this card',
  fn: function* (state: GameState, me: Card) {
    let choice = (yield [state, {type: 'pickhand', max: 1, message: 'Pick card to for Madness'}]) as game.PickHandChoice;
    if (choice.indices.length === 0) {
      return [state, null] as [GameState, null];
    } else if (choice.indices.length > 1) {
      throw Error('Something went wrong');
    }
    let index: number = choice.indices[0];
    let card = state.get('hand').get(index) as Card;
    card = card.set('energy', Math.max(0, card.get('energy') - 1));
    state = state.set('log', state.get('log').push(`Madness decreases cost of a ${card.get('name')} to ${card.get('energy')}`));
    state = state.set('hand', state.get('hand').set(index, card));
    state = yield* trash(state, me);
    return [state, null] as [GameState, null];
  },
});

export const Madman: Card = register_kingdom_card({
  name: 'Madman',
  energy: 0,
  cost_range: [5, 10],
  description: '+1 card per card in your hand. Trash this card',
  fn: function* (state: GameState, me: Card) {
    let n = state.get('hand').size;
    state = (yield* draw(state, n)).state;
    state = yield* trash(state, me);
    return [state, null] as [GameState, null];
  },
});


export const Gambit: Card = register_kingdom_card({
  name: 'Gambit',
  energy: 0,
  description: 'Draw 2 cards. If either is an estate, gain 3 vp. Otherwise, gain 1 energy',
  fn: function* (state: GameState, me: Card) {
    let drawn_state = yield* draw(state, 2);
    state = drawn_state.state;
    if (drawn_state.cards.some((card: Card) => card.get('name') === Estate.get('name'))) {
      state = state.set('victory', state.get('victory') + 3);
    } else {
      state = state.set('energy', state.get('energy') + 1);
    }
    return [state, me] as [GameState, Card];
  },
});

function used_up_event(name: string): Event {
  return make_event({
    name: `${name} (used up)`,
    energy_range: [1, 1],
    description: 'This event has been used up',
    fn: function* (state: GameState, me: Event) {
      return [state, me] as [GameState, Event];
    }
  });
}


export const Reboot: Event = make_event({
  name: 'Reboot',
  energy_range: [1, 2],
  setup: function (state: GameState) {
    state = state.set('extra', state.get('extra').set('reboot_cards', 5));
    state = state.set('extra', state.get('extra').set('reboot_discard', true));
    return state;
  },
  description: (state: GameState) => {
    let cards = state.get('extra').get('reboot_cards');
    return `Set your money to $0, discard your hand, and draw ${cards} cards`;
  },
  fn: function* (state: GameState, me: Event) {
    state = state.set('money', 0);
    if (state.get('extra').get('reboot_discard')) {
      let n = state.get('hand').size;
      let indices = [];
      for (let i = 0; i < n; i++) {
        indices.push(i);
      }
      state = yield* discard_from_hand(state, indices);
    }
    state = (yield* draw(state, state.get('extra').get('reboot_cards'))).state;
    return [state, me] as [GameState, Event];
  }
});

export const Gamble: Event = register_kingdom_event({
  name: 'Calculated gamble',
  energy_range: [1, 1],
  description: 'Discard your hand, draw that many cards',
  fn: function* (state: GameState, me: Event) {
    let n = state.get('hand').size;
    let indices = [];
    for (let i = 0; i < n; i++) {
      indices.push(i);
    }
    state = yield* discard_from_hand(state, indices);
    state = (yield* draw(state, n)).state;
    return [state, me] as [GameState, Event];
  }
});

export const Recruit: Event = register_kingdom_event({
  name: 'Recruit',
  energy_range: [1, 1],
  description: 'Draw two cards',
  fn: function* (state: GameState, me: Event) {
    state = (yield* draw(state, 2)).state;
    return [state, me] as [GameState, Event];
  }
});

export const Bridge: Event = register_kingdom_event({
  name: 'Bridge',
  energy_range: [2, 3],
  cost_range: [8, 16],
  description: 'Choose a card from supply,  Decrease its $ cost by 1 (cannot go negative).',
  fn: function* (state: GameState, me: Event) {
    let choice = (yield ([state, {type: 'picksupply', message: 'Pick card to decrease the cost of'} as game.PickSupplyQuestion])) as game.PickSupplyChoice;
    let { index, supplyCard } = game.getSupplyCard(state, choice.cardname);
    if (supplyCard === null) {
      state = state.set('error', `Card chosen not in supply!`);
      return [state, me] as [GameState, Event];
    }
    if (supplyCard.get('cost') === 0) {
      return [state, me] as [GameState, Event];
    }
    state = state.set('supply', state.get('supply').set(index, supplyCard.set('cost', supplyCard.get('cost') - 1)));
    return [state, me] as [GameState, Event];
  }
});

export const Favor: Event = register_kingdom_event({
  name: 'Favor',
  energy_range: [1, 1],
  cost_range: [1, 3],
  description: 'Play a card from supply costing up to 7',
  fn: function* (state: GameState, me: Event) {
    let choice = (yield ([state, {type: 'picksupply', message: 'Pick card to play for Favor'} as game.PickSupplyQuestion])) as game.PickSupplyChoice;
    let supplyCard = game.getSupplyCard(state, choice.cardname).supplyCard;
    if (supplyCard === null) {
      state = state.set('error', `${choice.cardname} not found`);
      return [state, me] as [GameState, Event];
    }
    if (supplyCard.get('cost') > 7) {
      state = state.set('error', `${choice.cardname} too expensive for Favor`);
      return [state, me] as [GameState, Event];
    }
    let card = supplyCard.get('card');
    state = (yield* card.get('fn')(state, card))[0];
    return [state, me] as [GameState, Event];
  }
});

export const Inflation: Event = register_kingdom_event({
  name: 'Inflation',
  energy_range: [0, 4],
  cost_range: [0, 0],
  description: 'Once per game, gain $20.  All cards cost $1 extra',
  // Crazy version:  'Gain $20.  All cards and events cost $1 extra', increases cost of itself and reboot..
  fn: function* (state: GameState, me: Event) {
    state = state.set('money', state.get('money') + 20);
    let n = state.get('supply').size;
    for (let i = 0; i < n; i++) {
      const supplyCard = state.get('supply').get(i) as game.SupplyCard;
      state = state.set('supply', state.get('supply').set(i, supplyCard.set('cost', supplyCard.get('cost') + 1)));
    }
    // state = trash_event(state, Inflation.get('name'));
    me = used_up_event(me.get('name'));
    return [state, me] as [GameState, Event];
  }
});

/*
export const Efficiency: Event = register_kingdom_event({
  name: 'Efficiency',
  energy: 0,
  cost_range: [32, 64],
  description: 'Once per game, double energy',
  fn: function* (state: GameState, me: Event) {
    // state = trash_event(state, Efficiency.get('name'));
    me = used_up_event(me.get('name'));
    state = state.set('energy', state.get('energy') * 2);
    return [state, me] as [GameState, Event];
  }
});

export const Adrenaline: Event = register_kingdom_event({
  name: 'Adrenaline',
  energy: 0,
  cost_range: [10, 25],
  description: 'Once per game, gain energy equal to the number of cards in your hand',
  fn: function* (state: GameState, me: Card) {
    // state = trash_event(state, Adrenaline.get('name'));
    me = used_up_event(me.get('name'));
    state = state.set('energy', state.get('energy') + state.get('hand').size);
    return [state, me] as [GameState, Card];
  }
});
*/

export const Philanthropy: Event = register_kingdom_event({
  name: 'Philanthropy',
  energy_range: [1, 5],
  cost_range: [10, 30],
  description: 'Convert all your $ to victory points.',
  fn: function* (state: GameState, me: Event) {
    // state = trash_event(state, Philanthropy.get('name'));
    me = used_up_event(me.get('name'));
    state = state.set('victory', state.get('victory') + state.get('money'));
    state = state.set('money', 0);
    return [state, me] as [GameState, Event];
  },
});


export const Greed: Event = register_kingdom_event({
  name: 'Greed',
  energy_range: [0, 0],
  cost_range: [0, 0],
  description: 'Convert all your victory points to $.',
  fn: function* (state: GameState, me: Event) {
    // state = trash_event(state, Greed.get('name'));
    me = used_up_event(me.get('name'));
    state = state.set('money', state.get('money') + state.get('victory'));
    state = state.set('victory', 0);
    return [state, me] as [GameState, Event];
  },
});


export const Expedite: Event = register_kingdom_event({
  name: 'Expedite',
  energy_range: [1, 1],
  cost_range: [0, 0],
  description: 'Choose a card from supply.  Pay its cost and gain it in hand',
  fn: function* (state: GameState, me: Event) {
    let choice = (yield ([state, {type: 'picksupply', message: 'Pick card to gain for Expedite'} as game.PickSupplyQuestion])) as game.PickSupplyChoice;
    let supply_card = game.getSupplyCard(state, choice.cardname).supplyCard;
    if (supply_card === null) {
      state = state.set('error', `Card chosen not in supply!`);
      return [state, me] as [GameState, Event];
    }
    if (state.get('money') < supply_card.get('cost')) {
      state = state.set('error', `Insufficient money`);
      return [state, me] as [GameState, Event];
    }
    state = state.set('money', state.get('money') - supply_card.get('cost'));
    state = yield* gain(state, [supply_card.get('card')], ' for Expedite', 'hand');
    return [state, me] as [GameState, Event];
  }
});

export const Boost: Event = register_kingdom_event({
  name: 'Boost',
  description: 'Reboot gives 2 extra cards',
  cost_range: [0, 5],
  energy_range: [4, 8],
  fn: function* (state: GameState, me: Event) {
    let extra = state.get('extra');
    state = state.set('extra', extra.set('reboot_cards', extra.get('reboot_cards') + 2));
    return [state, me] as [GameState, Event];
  }
});

export const WindFall: Event = register_kingdom_event({
  name: 'WindFall',
  description: 'If your draw and discard pile are empty, gain 4 golds',
  cost_range: [0, 2],
  energy_range: [0, 2],
  fn: function* (state: GameState, me: Event) {
    if (state.get('draw').size === 0 && state.get('discard').size === 0) {
      state = yield* gain(state, [Gold, Gold, Gold, Gold]);
    }
    return [state, me] as [GameState, Event];
  }
});


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

export const Reshuffle: Situation = make_situation({
  name: 'Reshuffle',
  description: 'Every time you reshuffle your deck, +1 energy',
  fn: function* (state: GameState) {
    function* hook(state: GameState) {
      state = state.set('energy', state.get('energy') + 1);
      return state;
    }
    state = state.set('reshuffle_hooks', state.get('reshuffle_hooks').push(hook))
    return state;
  }
});

export const MarketHours: Situation = register_kingdom_situation({
  name: 'Market Hours',
  description: 'You may only buy cards when energy spent is a multiple of 3',
  fn: function* (state: GameState) {
    state = state.set('extra', state.get('extra').set('market_hours', true))
    return state;
  }
});

export const Trader: Situation = register_kingdom_situation({
  name: 'Trader',
  description: 'Whenever you trash a card, gain a silver',
  fn: function* (state: GameState) {
    function* hook(state: GameState, _card: Card) {
      state = state.set('discard', state.get('discard').push(Silver));
      return state;
    }
    state = state.set('trash_hooks', state.get('trash_hooks').push(hook))
    return state;
  }
});

export const TimeEater: Situation = register_kingdom_situation({
  name: 'Time Eater',
  description: (state: GameState) => {
    let x = state.get('extra').get('time_eater');
    return `Every 12 plays/buys, pay one energy (${x}/12)`;
  },
  fn: function* (state: GameState) {
    state = state.set('extra', state.get('extra').set('time_eater', 0));
    function* hook(state: GameState): Effect {
      let x = (state.get('extra').get('time_eater') + 1) % 12;
      state = state.set('extra', state.get('extra').set('time_eater', x));
      if (x === 0) {
        state = state.set('energy', state.get('energy') + 1);
        state = state.set('log', state.get('log').push('Paid 1 energy to time eater'));
      }
      return state;
    }
    state = state.set('turn_hooks', state.get('turn_hooks').push(hook))
    return state;
  }
});

/*
export const StrayHound: Situation = register_kingdom_situation({
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
});
*/

/*
export const Riches: Situation = register_kingdom_situation_to_buy({
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
});
*/


export const Compost: Situation = register_kingdom_situation_to_buy({
  name: 'Compost',
  energy_range: [2, 7],
  description: 'Whenever you trash a card, +1 VP',
  fn: function* (state: GameState) {
    function* hook(state: GameState, _card: Card) {
      state = state.set('victory', state.get('victory') + 1);
      return state;
    }
    state = state.set('trash_hooks', state.get('trash_hooks').push(hook))
    return state;
  }
});

export const JunkYard: Situation = register_kingdom_situation_to_buy({
  name: 'Junk Yard',
  energy_range: [2, 5],
  description: 'Whenever you trash a card, +$1',
  fn: function* (state: GameState) {
    function* hook(state: GameState, _card: Card) {
      state = state.set('victory', state.get('victory') + 1);
      return state;
    }
    state = state.set('trash_hooks', state.get('trash_hooks').push(hook))
    return state;
  }
});

export const PerpetualMotion: Situation = register_kingdom_situation_to_buy({
  name: 'Perpetual Motion',
  energy_range: [4, 5],
  description: 'If your hand is empty, draw 1 card',
  fn: function* (state: GameState) {
    function* hook(state: GameState) {
      if (state.get('hand').size === 0) {
        state = (yield* draw(state, 1)).state;
      }
      return state;
    }
    state = state.set('turn_hooks', state.get('turn_hooks').push(hook))
    return state;
  }
});


export const RunicPyramid: Situation = register_kingdom_situation_to_buy({
  name: 'Runic Pyramid',
  description: 'Reboot doesn\'t discard your hand',
  cost_range: [0, 5],
  energy_range: [6, 12],
  fn: function* (state: GameState) {
    let extra = state.get('extra');
    state = state.set('extra', extra.set('reboot_discard', false));
    return state;
  }
});

export const SilverMine: Situation = register_kingdom_situation_to_buy({
  name: 'Silver Mine',
  description: 'New silvers take 0 energy to play',
  cost_range: [0, 10],
  energy_range: [5, 20],
  fn: function* (state: GameState) {
    let result = getSupplyCard(state, Silver.get('name'));
    let supply_card = result.supplyCard;
    if (supply_card === null) {
      state = state.set('log', state.get('log').push('Silver not in supply!'));
      return state;
    }
    supply_card = supply_card.set('card', supply_card.get('card').set('energy', 0));
    state = state.set('supply', state.get('supply').set(result.index, supply_card));
    return state;
  }
});

console.log(KINGDOM_CARDS);
console.log(KINGDOM_EVENTS);
console.log(KINGDOM_SITUATIONS);
