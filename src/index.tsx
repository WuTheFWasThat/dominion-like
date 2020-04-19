import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as game from './game/core';
import { parse_query_string } from './Utils';

async function render() {
  const query_dict = parse_query_string();

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

  function fetch_and_rerender(state: game.GameState, question: game.PlayerQuestion | null): Promise<game.PlayerChoice> {
    // const data = await fetch_data(pattern_infos);
    return new Promise((resolve, reject) => {
      let choice_cb = function(choice: game.PlayerChoice) {
        resolve(choice);
      }
      ReactDOM.render(
        React.createElement(App, {
          state: state,
          question: question,
          choice_cb: choice_cb,
        }),
        document.getElementById('main')
      );
    });
  }

  const makeUIPlayer: () => game.Player = async function*() {
    let [state, question] = yield (null as unknown as game.PlayerChoice); // first "choice" is unused
    while (true) {
      let choice: game.PlayerChoice = await fetch_and_rerender(state, question);
      [state, question] = yield choice;
    }
  }

  let state = game.initial_state(query_dict.seed === undefined ? null : parseInt(query_dict.seed));
  const UIPlayer = makeUIPlayer();
  game.run(state, UIPlayer);
}

render();
