import React from 'react';
import ReactTooltip from "react-tooltip";
import * as game from '../game/core';


type Props = {
  card: game.Card,
  onClick?: () => void,
};
type State = {
};

class CardComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <div className="card" onClick={this.props.onClick}>
        <div data-tip={this.props.card.description}>{this.props.card.name}</div>
        <ReactTooltip />
      </div>

    );
  }
}

export default CardComponent;
