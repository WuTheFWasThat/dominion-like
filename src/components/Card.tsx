import React from 'react';
import ReactTooltip from "react-tooltip";
import * as game from '../game/core';


type Props = {
  state: game.GameState,
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
    let description: string;
    if (typeof this.props.card.description === "string") {
      description = this.props.card.description;
    } else {
      description = this.props.card.description(this.props.state);
    }
    return (
      <div className={classNames.join(" ")} onClick={this.props.onClick}>
        <div data-tip={description}>{this.props.card.name}</div>
        <ReactTooltip />
      </div>

    );
  }
}

export default CardComponent;
