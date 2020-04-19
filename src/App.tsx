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
  handIndices: Array<number>,
};

class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);

    this.state = this.initialState();
  }

  initialState() {
    return {
      handIndices: [],
    };
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

    let instruction_text: string = '';
    if (this.props.question !== null) {
      if (game.isActionQuestion(this.props.question)) {
        instruction_text = 'Play or buy a card!';
      } else if (game.isPickHandQuestion(this.props.question)) {
        instruction_text = this.props.question.message;
      } else {
        console.log(this.props.question);
        throw new Error('Unhandled question');
      }
    }

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

        <b>
        {instruction_text}
        </b>
        {(() => {
          if (this.props.question && game.isPickHandQuestion(this.props.question)) {
            let onClick = () => {
              this.props.choice_cb({
                type: 'pickhand',
                indices: this.state.handIndices,
              } as game.PickHandChoice);
              this.setState({
                handIndices: [],
              });
            };
            return (
              <div onClick={onClick}>
                  Done choosing
              </div>
            );
          }
        })()}
        <br/>
        <br/>

        Card:
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
                ${supply_card.cost} <CardComponent key={i} state={this.props.state} card={supply_card.card} onClick={onClick}/>
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
                ${event_card.cost} <CardComponent key={i} state={this.props.state} card={event_card.card} onClick={onClick}/>
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
                  <CardComponent key={i} state={this.props.state} card={card}/>
                );
              })}
            </div>
          </div>
          <div style={{flexBasis: '33%', flexGrow: 0}}>
            Hand
            <div>
              {this.props.state.get('hand').toJS().map((card, i) => {
                let onClick;
                let classNames = [];
                if (this.props.question) {
                  if (game.isActionQuestion(this.props.question)) {
                    onClick = () => {
                      this.props.choice_cb({
                        type: 'play',
                        index: i,
                      } as game.PlayChoice);
                    }
                  } else if (game.isPickHandQuestion(this.props.question)) {
                    let selected = this.state.handIndices.findIndex((el) => el === i) !== -1;
                    if (selected) {
                      classNames.push('selected');
                    }
                    onClick = () => {
                      if (selected) {
                        this.setState({
                          handIndices: this.state.handIndices.filter((el) => el !== i),
                        });
                      } else {
                        this.setState({
                          handIndices: this.state.handIndices.concat([i]),
                        });
                      }
                    }
                  }
                }
                return (
                  <CardComponent classNames={classNames} state={this.props.state} card={card} key={i} onClick={onClick}/>
                );
              })}
            </div>
          </div>
          <div style={{flexBasis: '33%', flexGrow: 0}}>
            Discard
            <div>
              {this.props.state.get('discard').toJS().map((card, i) => {
                return (
                  <CardComponent key={i} state={this.props.state} card={card}/>
                );
              })}
            </div>
          </div>
        </div>

        <br/>

        <div>
          Trash
          <div>
            {this.props.state.get('trash').toJS().map((card, i) => {
              return (
                <CardComponent key={i} state={this.props.state} card={card}/>
              );
            })}
          </div>
        </div>

      </div>
    );
  }
}

export default App;
