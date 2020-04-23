import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as game from './game/core';
import * as cards from './game/cards';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <App
      state={ game.InitialState }
      question={ {type: 'action'} as game.ActionQuestion }
      choice_cb={ (choice: game.PlayerChoice) => {} }
    />,
  div);
  ReactDOM.unmountComponentAtNode(div);
});

it('can throne room fools gold', async () => {
  let state = game.InitialState;
  state = state.set('hand', state.get('hand').push(cards.ThroneRoom));
  state = state.set('hand', state.get('hand').push(cards.FoolsGold));
  let choice = {type: 'play', index: 0} as game.PlayChoice;
  async function* player() {
    yield ({ type: 'pickhand', indices: [0] } as game.PickHandChoice) as game.PlayerChoice;
  }
  state = await game.playTurn(state, choice, player() as unknown as game.Player);
  expect(state.get('money')).toEqual(1);
  expect(state.get('discard').get(0).get('name')).toEqual(cards.FoolsGold.get('name') + ' +2');
});
