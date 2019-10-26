import React from 'react';
import './App.css';
// import { debounce } from 'lodash';
import * as game from './game/core';


type AppProps = {
  state: game.GameState,
};
type AppState = {
};

class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);

    this.state = {};
  }

  // updateQueryParams() {
  //   const d: any = {
  //   }
  //   const newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?' + encode_query_params(d);
  //   window.history.pushState({ path: newurl }, '', newurl);
  // }

  showError(err: any) {
    // TODO: better
    console.error(err);
    alert(err);
  }

  render() {
    console.log('rerender', this.props.state.toJS());

    return (
      <div>
        Actions: {this.props.state.get('actions')}
        <br/>
        Money: {this.props.state.get('money')}
        <br/>
        VP: {this.props.state.get('victory')}
        <br/>
        <br/>
        Deck
        <div>
          {this.props.state.get('deck').toJS().map((card, i) => {
            return (
              <div className="card" key={i}>{card.name}</div>
            );
          })}
        </div>
        Hand
        <div>
          {this.props.state.get('hand').toJS().map((card, i) => {
            return (
              <div className="card" key={i}>{card.name}</div>
            );
          })}
        </div>
        Discard
        <div>
          {this.props.state.get('discard').toJS().map((card, i) => {
            return (
              <div className="card" key={i}>{card.name}</div>
            );
          })}
        </div>
      </div>
    );
  }
}

export default App;
