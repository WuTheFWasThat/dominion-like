Main state:
- population: start with 2
- money: start with 0
- culture: starts with 0
- tech: start with 0
- buildings: start with 1 farm.  the rest unlock by spending tech/money.  price of unlocks is exponential

default situation:
  - triumph: at end of game, score = culture
  - pay the piper: game ends after 16 turns
    - death of the sun: game ends after 25 turns
    - heat death of the universe: game ends after 36 turns

default actions:
  - build stuff
  - demolish building for $1
  - research ($5): +1 tech
  - art ($5): +1 culture
  - invest ($5): at the start of next generation, +$6

new situations/events are locked by default and require tech/$ to unlock

situations:
  - overpopulation: population shrinks by 20% each turn
  - fertility: population grows by 20% each turn

  - hyperinflation: money decreases by 50%
  - opportunity: invest gives $8

  - round world: border wraps
  - artificial intelligence: set population to 0, for the rest of the game, $ is population
  - internet: homes give +N culture
  - greed: replaces triumph, at the end of game, score = money (+ some downside?)
  - techno-utopia: replaces triumph, at the end of game, score = tech
  - nuclear disaster: destroy buildings adjacent to power plant, becomes nuclear aftermath
  - space travel: remove "pay the piper"
    - lightspeed travel: remove "death of the sun"
  - long winter:

events:
  - pandemic: population shrinks by 50% for 3 turns
  - starvation: population not near farms shrinks by 50%
  - unemployment: once tech reaches N, population shrinks by 50%
  - meteor(x, y): destroy any building here
  - space:
  - conservation ($total population): delay "pay the piper" by one turn

buildings:
  - farm(N): +$N
    - factory_farm(N): +$N, population nearby is obese
  - home(N): population here grows N/10 each turn (rounded down)
  - downtown(N): +N culture
    - church(N): move from adjacent locations. sum N for all churches, +X culture
  - school(N): move from and to adjacent locations
  - lab(N): +N tech

  - lake: can't build on it but can pass through
  - mountain: can't build on it or pass through it

  - airport: distance to other airports is 0
  - road: distance between cells is 0
  - train station: distance between entire row and column is 0 (goes through mountains)
  - university(N): +N tech for population distance 1 away
  - factory(N): +$N
  - home(N): +N population per turn
  - farm(N): +$N +N population
  - power plant: add N power to all 8 surrounding tiles
      - nuclear aftermath: set population in surrounding tiles to 0
