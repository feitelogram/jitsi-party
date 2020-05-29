import React, {Component} from 'react';
import {connect} from 'react-redux';
import Config from './Config.jsx';

class Exit extends Component {
  render() {
    // Support either a single "goodbye" avatar or a map of color -> image
    const goodbyeImgUrl =
            (Config.specialAvatars && Config.specialAvatars.goodbye) ?
                (Config.specialAvatars.goodbye[this.props.user.avatar.color] || Config.specialAvatars.goodbye) :
                null;

    const goodbyeImg = goodbyeImgUrl ?
            <img src={goodbyeImgUrl}/> :
            null;
    return (
      <div className="exit">
        <h1>Goodbye!</h1>
        {goodbyeImg}
      </div>
    );
  }
}

export default connect((state) => state, {})(Exit);

