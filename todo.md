- add initial state setup?
  - implement card that gives N VP after playing N times
  - implement card that gives N VP if N cards in hand
  - implement card that gives N VP if N copies in hand

energy costs per card
  - display energy costs?

give +$1 per discard

implement situations

rats

simple +1 card starter

event that gives a bunch of money, but makes all cards cost 1

card that draws +1 card each time it's played

event ideas:
  buy a card, it goes in hand

export const Lurker: Card = register_kingdom_card(make_card({
  name: 'Lurker',
  energy: 1,
  description: 'Either, choose a card in supply and trash a copy, or gain a card from trash',
  fn: function* (state: GameState) {
  },
}));

make it so you can export/load the whole log

put git commit hash somewhere (in error msgs?)

figure out all-for-one bug?
  - make it draw from deck instead of discard?
