import React from 'react';
import './App.css';
import CardComponent from './components/Card';
import SituationComponent from './components/Situation';
// import { debounce } from 'lodash';
import * as game from './game/core';


type AppProps = {
  state: game.GameState,
  question: game.PlayerQuestion | null,
  choice_cb: (choice: game.PlayerChoice) => void;
};
type AppState = {
  handIndices: Array<number>,
  error: string | null,
};

class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);

    this.state = App.initialState();
  }

  static initialState() {
    return {
      handIndices: [],
      error: null,
    };
  }

  componentDidUpdate(oldProps: AppProps) {
    if (oldProps !== this.props) {
      this.setState(App.initialState())
    }
  }

  // updateQueryParams() {
  //   const d: any = {
  //   }
  //   const newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?' + encode_query_params(d);
  //   window.history.pushState({ path: newurl }, '', newurl);
  // }

  render() {
    console.log('rerender', this.props.state.toJS());

    let instruction_text: string = '';
    if (this.props.state.get('ended')) {
        instruction_text = 'Game over!';
    } else if (this.props.question !== null) {
      if (game.isActionQuestion(this.props.question)) {
        instruction_text = 'Play or buy a card!';
      } else if (game.isPickHandQuestion(this.props.question)) {
        instruction_text = this.props.question.message;
      } else if (game.isPickSupplyQuestion(this.props.question)) {
        instruction_text = this.props.question.message;
      } else if (game.isPickTrashQuestion(this.props.question)) {
        instruction_text = this.props.question.message;
      } else if (game.isPickQuestion(this.props.question)) {
        instruction_text = this.props.question.message;
      } else {
        console.log(this.props.question);
        throw new Error('Unhandled question');
      }
    }

    return (
      <div style={{width: '100%'}}>
        <div style={{color: 'red'}}>
            {this.props.state.get('error') || this.state.error || ''}
        </div>
        Energy spent: {this.props.state.get('energy')}
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
          if (this.props.question) {
            if (game.isPickHandQuestion(this.props.question)) {
              let n = this.state.handIndices.length;
              if (this.props.question.min !== undefined) {
                if (n < this.props.question.min) {
                  return null;
                }
              }
              if (this.props.question.max !== undefined) {
                if (n > this.props.question.max) {
                  return null;
                }
              }
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
          }
        })()}
        {(() => {
          if (this.props.question) {
            if (game.isPickQuestion(this.props.question)) {
              return (<div>
                  {
                    this.props.question.options.map((option, i) => {
                      let onClick = () => {
                        this.props.choice_cb({
                          type: 'pick',
                          choice: i,
                        } as game.PickChoice);
                      };
                      return (
                        <div key={i} onClick={onClick}>
                            {option}
                        </div>
                      );
                    })
                  }
              </div>)
            }
          }
        })()}
        <br/>
        <br/>

        <h2>
            Situations
        </h2>
        <div style={{display: "flex", flexDirection: "row", width: '100%'}}>
          <div style={{flexBasis: '100%', flexGrow: 0, padding: '10px'}}>
            <div>
              {this.props.state.get('situations').map((situation, i) => {
                return (
                  <SituationComponent key={i} state={this.props.state} card={situation}/>
                );
              })}
            </div>
          </div>
        </div>
        <br/>

        <h2>
            Supply
        </h2>
        <div style={{display: "flex", flexDirection: "row", width: '100%'}}>
          <div style={{flexBasis: '50%', flexGrow: 0, padding: '10px'}}>
            <h3>
            Cards
            </h3>
            <br/>
            <div>
              {this.props.state.get('supply').map((supply_card, i) => {
                let onClick;
                if (this.props.question) {
                  if (game.isActionQuestion(this.props.question)) {
                    onClick = () => {
                      this.props.choice_cb({
                        type: 'buy',
                        cardname: supply_card.get('card').get('name'),
                      } as game.BuyChoice);
                    }
                  } else if (game.isPickSupplyQuestion(this.props.question)) {
                    onClick = () => {
                      this.props.choice_cb({
                        type: 'picksupply',
                        cardname: supply_card.get('card').get('name'),
                      } as game.PickSupplyChoice);
                    }
                  }
                }
                return (
                  <span key={i}>
                    ${supply_card.get('cost')} <CardComponent key={i} state={this.props.state} card={supply_card.get('card')} onClick={onClick}/>
                  </span>
                );
              })}
            </div>
          </div>

          <div style={{flexBasis: '50%', flexGrow: 0, padding: '10px'}}>
            <h3>
                Events
            </h3>
            <br/>
            <div>
              {this.props.state.get('events').map((event_card, i) => {
                let onClick;
                if (this.props.question && game.isActionQuestion(this.props.question)) {
                  onClick = () => {
                    this.props.choice_cb({
                      type: 'event',
                      cardname: event_card.get('card').get('name'),
                    } as game.EventChoice);
                  }
                }
                return (
                  <span key={i}>
                    ${event_card.get('cost')} <CardComponent key={i} state={this.props.state} card={event_card.get('card')} onClick={onClick}/>
                  </span>
                );
              })}
            </div>
          </div>
        </div>
        <br/>

        <h2>
            Deck
        </h2>
        <div style={{display: "flex", flexDirection: "row", width: '100%'}}>
          <div style={{flexBasis: '33%', flexGrow: 0, padding: '10px'}}>
            <h3>
                Draw
            </h3>
            <div>
              {this.props.state.get('draw').map((card, i) => {
                return (
                  <CardComponent key={i} state={this.props.state} card={card}/>
                );
              })}
            </div>
          </div>
          <div style={{flexBasis: '33%', flexGrow: 0, padding: '10px'}}>
            <h3>
                Hand
            </h3>
            <div>
              {this.props.state.get('hand').map((card, i) => {
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
          <div style={{flexBasis: '33%', flexGrow: 0, padding: '10px'}}>
            <h3>
                Discard
            </h3>
            <div>
              {this.props.state.get('discard').map((card, i) => {
                return (
                  <CardComponent key={i} state={this.props.state} card={card}/>
                );
              })}
            </div>
          </div>
        </div>

        <br/>

        <div>
          <h2>
            Trash
          </h2>
          <div>
            {this.props.state.get('trash').map((card, i) => {
              let onClick;
              if (this.props.question) {
                if (game.isPickTrashQuestion(this.props.question)) {
                  onClick = () => {
                    this.props.choice_cb({
                      type: 'picktrash',
                      index: i,
                    } as game.PickTrashChoice);
                  };
                }
              }
              return (
                <CardComponent key={i} state={this.props.state} card={card} onClick={onClick}/>
              );
            })}
          </div>
        </div>


        <div>
          <h2>
            History (reversed)
          </h2>
          <div>
            {this.props.state.get('log').toJS().reverse().map((msg, i) => {
              return (
                <div key={i}>
                    {msg}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
