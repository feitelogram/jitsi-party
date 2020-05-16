import _ from 'lodash'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import reducers from './reducers.jsx'
import { Redirect } from 'react-router-dom'
import PuckSelect from './PuckSelect.jsx'
import { HttpApi } from './WebAPI.jsx'
import LocalStorage from './LocalStorage.jsx'

class Welcome extends Component {
  constructor (props) {
    super(props)

    this.httpApi = new HttpApi()

    const user = LocalStorage.get('USER')
    if (user) {
      this.state = {
        username: user.username,
        avatar: user.avatar,
        redirect: '/party'
      }
      this.handleUserSelected(user)
    } else {
      this.state = {
        username: null,
        avatar: null,
        redirect: null
      }
    }
  }

  async fetchRooms () {
    const { success, rooms } = await this.httpApi.getRooms()
    if (success) {
      this.props.addRooms(rooms)
      this.loadAssets(rooms)
    }
  }

  loadAssets (rooms) {
    _.forEach(rooms, room => {
      if (room.backgroundImage) {
        const img = new Image()
        img.src = room.backgroundImage
      }
      if (room.art && room.art.src) {
        const img = new Image()
        img.src = room.art.src
      }
    })
  }

  componentDidMount () {
    this.fetchRooms()
  }

  handleUsernameChange (event) {
    this.setState({ username: event.target.value })
  }

  handleAvatarSelect (selection) {
    this.setState({ avatar: selection })
  }

  async handleReady () {
    const response = await this.httpApi.join(this.state.username, this.state.avatar)
    if (response.success) {
      const { username, avatar } = this.state
      const user = {
        username,
        avatar,
        userId: response.userId
      }
      this.props.updateUser(user)
      this.handleUserSelected(user)
      this.setState({ redirect: '/party' })
    }
  }

  handleUserSelected (user) {
    LocalStorage.set ('USER', user)
    this.props.updateUser(user)
    this.props.updateCurrentRoom({
      room: 'vestibule',
      entered: false
    })
  }

  render () {
    if (this.state.redirect) { return <Redirect to={this.state.redirect} /> }
    const nameOpacity = (this.state.username === null) ? 'form' : 'form-fade'
    const avatarOpacity = (this.state.username) ? 'form' : 'form-fade'
    const partyOpacity = (this.state.username && this.state.avatar) ? 'form-party' : 'form-fade-party'

    return (
      <div className='vestibule'>
        <br />
        <div className='serif'>You've met with a terrible fate, haven't you?</div>
        <h1>Cabin Weekend is Dead. Long Live Cabin Fever.</h1>
        <img className='splash' src='./js/images/cabinfeverhighres.png' />
        <input autoComplete='off' className={`text-entry ${nameOpacity}`} type='text' placeholder='Name' name='name' minLength='1' onChange={this.handleUsernameChange.bind(this)} /><br />
        <PuckSelect opacity={avatarOpacity} handleSelect={this.handleAvatarSelect.bind(this)} />
        <input id='button' className={partyOpacity} type='button' onClick={this.handleReady.bind(this)} value='Party' disabled={!this.state.username || !this.state.avatar} />
      </div>
    )
  }
}

export default connect(
  state => state,
  {
    addRooms: reducers.addRoomsActionCreator,
    updateUser: reducers.updateUserActionCreator,
    updateCurrentRoom: reducers.updateCurrentRoomActionCreator
  })(Welcome)
