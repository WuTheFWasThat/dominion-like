import React from 'react';
import ReactTooltip from "react-tooltip";
import * as game from '../game/core';


type Props = {
  state: game.GameState,
  situation: game.Situation,
  onClick?: () => void,
  classNames?: Array<string>
};
type State = {
};

class SituationComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {};
  }

  render() {
    let classNames = (this.props.classNames || []).slice();
    classNames.push("card");
    let card_desc = this.props.situation.get('description');
    let description: string = (typeof card_desc === "string") ?  card_desc : card_desc(this.props.state);
    return (
      <div className={classNames.join(" ")} onClick={this.props.onClick} data-tip={description}>
        <div className="center" style={{cursor: 'default'}}>{this.props.situation.get('name')}</div>
        <ReactTooltip />
      </div>

    );
  }
}

export default SituationComponent;
