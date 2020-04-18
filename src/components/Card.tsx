import React from 'react';
import ReactTooltip from "react-tooltip";
import * as game from '../game/core';


type Props = {
  card: game.Card,
  onClick?: () => void,
  classNames?: Array<string>
};
type State = {
};

class CardComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {};
  }

  render() {
    let classNames = (this.props.classNames || []).slice();
    classNames.push("card");
    return (
      <div className={classNames.join(" ")} onClick={this.props.onClick}>
        <div data-tip={this.props.card.description}>{this.props.card.name}</div>
        <ReactTooltip />
      </div>

    );
  }
}

export default CardComponent;
