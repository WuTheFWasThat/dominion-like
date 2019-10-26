import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as game from './game/core';
import { parse_query_string } from './Utils';

async function render() {
  const query_dict = parse_query_string();
  let state = game.initial_state(parseInt(query_dict.seed || '0'));

  // if (process.env.NODE_ENV === 'development') {
  // const response = await fetch('/call', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     // 'Content-Type': 'application/x-www-form-urlencoded',
  //   },
  //   body: JSON.stringify({
  //   }),
  // });

  // if (process.env.NODE_ENV === 'development') {

  async function fetch_and_rerender(state: game.GameState) {
    // const data = await fetch_data(pattern_infos);
    ReactDOM.render(
      React.createElement(App, {
        state: state,
      }),
      document.getElementById('main')
    );
  }

  let history = [state];
  while (!state.get('ended')) {
    for (let i = 0; i < state.get('draw_per_turn'); i++) {
      state = game.draw(state);
    }
    await fetch_and_rerender(state);
    break
  }
}

render();
