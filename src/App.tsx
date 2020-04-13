import React from 'react';
import './App.css';
import CardComponent from './components/Card';
// import { debounce } from 'lodash';
import * as game from './game/core';


type AppProps = {
  state: game.GameState,
  question: game.PlayerQuestion | null,
  choice_cb: (choice: game.PlayerChoice) => void;
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
        Turn: {this.props.state.get('turn')}
        <br/>
        Actions: {this.props.state.get('actions')}
        <br/>
        Money: {this.props.state.get('money')}
        <br/>
        Points: {this.props.state.get('victory')}
        <br/>
        <br/>
        Deck
        <div>
          {this.props.state.get('deck').toJS().map((card, i) => {
            return (
              <CardComponent key={i} card={card}/>
            );
          })}
        </div>
        Hand
        <div>
          {this.props.state.get('hand').toJS().map((card, i) => {
            let onClick;
            if (this.props.question && this.props.question.type === 'play') {
              onClick = () => {
                this.props.choice_cb({
                  type: 'play',
                  index: i,
                } as game.PlayChoice);
              }
            }
            return (
              <CardComponent card={card} key={i} onClick={onClick}/>
            );
          })}
        </div>
        Discard
        <div>
          {this.props.state.get('discard').toJS().map((card, i) => {
            return (
              <CardComponent key={i} card={card}/>
            );
          })}
        </div>
      </div>
    );
  }
}

export default App;
