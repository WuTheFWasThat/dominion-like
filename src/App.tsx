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
      <div style={{width: '100%'}}>
        <div style={{color: 'red'}}>
            {this.props.state.get('error') || ''}
        </div>
        Energy: {this.props.state.get('energy')}
        <br/>
        Money: {this.props.state.get('money')}
        <br/>
        Points: {this.props.state.get('victory')}
        <br/>
        <br/>

        <div onClick={() => {
          this.props.choice_cb({
            type: 'undo',
          } as game.UndoChoice);
        }} style={{border: '1px solid red', display: 'inline-block'}}>
          Undo
        </div>
        <br/>
        <br/>

        Supply:
        <br/>
        <div>
          {this.props.state.get('supply').toJS().map((supply_card, i) => {
            let onClick;
            if (this.props.question && game.isActionQuestion(this.props.question)) {
              onClick = () => {
                this.props.choice_cb({
                  type: 'buy',
                  cardname: supply_card.card.name,
                } as game.BuyChoice);
              }
            }
            return (
              <span key={i}>
                ${supply_card.cost} <CardComponent key={i} card={supply_card.card} onClick={onClick}/>
              </span>
            );
          })}
        </div>
        <br/>

        Events:
        <br/>
        <div>
          {this.props.state.get('events').toJS().map((event_card, i) => {
            let onClick;
            if (this.props.question && game.isActionQuestion(this.props.question)) {
              onClick = () => {
                this.props.choice_cb({
                  type: 'event',
                  cardname: event_card.card.name,
                } as game.EventChoice);
              }
            }
            return (
              <span key={i}>
                ${event_card.cost} <CardComponent key={i} card={event_card.card} onClick={onClick}/>
              </span>
            );
          })}
        </div>
        <br/>

        <div style={{display: "flex", flexDirection: "row", width: '100%'}}>
          <div style={{flexBasis: '33%', flexGrow: 0}}>
            Draw
            <div>
              {this.props.state.get('draw').toJS().map((card, i) => {
                return (
                  <CardComponent key={i} card={card}/>
                );
              })}
            </div>
          </div>
          <div style={{flexBasis: '33%', flexGrow: 0}}>
            Hand
            <div>
              {this.props.state.get('hand').toJS().map((card, i) => {
                let onClick;
                if (this.props.question && game.isActionQuestion(this.props.question)) {
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
          </div>
          <div style={{flexBasis: '33%', flexGrow: 0}}>
            Discard
            <div>
              {this.props.state.get('discard').toJS().map((card, i) => {
                return (
                  <CardComponent key={i} card={card}/>
                );
              })}
            </div>
          </div>
        </div>

        <br/>

      </div>
    );
  }
}

export default App;
