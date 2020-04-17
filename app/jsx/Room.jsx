import React, { Component } from 'react'
import { Link, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import reducers from './reducers.jsx'
import Navigation from './Navigation.jsx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import RoomLayout from './RoomLayout.jsx'

class Room extends Component { 
    constructor(props) {
        super(props)
        this.state = {
            room: this.props.currentRoom,
            hasLoaded: false
        }
    }

    componentDidMount() {
        this.enterRoom(this.state.room)
    }

    componentWillUnmount() {
        if (this.api) {
            this.api.dispose()
        }
    }

    connectToRoom(room, roomData) {
        // TODO need to disable the ability to hang up I think
        // TODO persist video/sound on/off
        try {
            const domain = 'jitsi.gbre.org'
            const options = {
                roomName: room,
                height: roomData.videoHeight || 600,
                parentNode: document.getElementById('jitsi-container'),
                interfaceConfigOverwrite: {
                    filmStripOnly: false,
                    SHOW_JITSI_WATERMARK: false
                },
                configOverwrite: {
                    disableSimulcast: false
                }
            }
            this.api = new window.JitsiMeetExternalAPI(domain, options)
            this.setState({ hasLoaded: true })
            this.api.addEventListener('videoConferenceJoined', () => {
                this.api.executeCommand('displayName', this.props.displayName)
                // this.api.executeCommand('avatarUrl', this.props.avatar)
            })
        } catch (err) {
            console.log('failed:', err)
        }
    }

    enterRoom(room) {
        if (this.api) {
            this.api.dispose()
        }
        if (room === 'The Great Outdoors') {
            this.setState({ redirect: '/bye' })
        } else {
            const roomData = RoomLayout[room]
            if (roomData.isJitsi) {
                this.connectToRoom(room, roomData)
            }
        }
    }

    onSwitchRoom(room) {
        this.setState({ room })
        this.props.updateCurrentRoom(room)
        this.enterRoom(room)
    }

    getLoadingSpinner() {
        if (!this.state.hasLoaded) {
            return <FontAwesomeIcon icon={faSpinner}/>
        }
    }

    getRoomDescription() {
        if (RoomLayout[this.state.room].description) {
            return <p className="room-content">{RoomLayout[this.state.room].description}</p>
        }
    }

    getRoomArt() {
        if (RoomLayout[this.state.room].art) {
            const { src, title, artist } = RoomLayout[this.state.room].art
            return (
                <div className="art-section">
                    <img src={src}/>
                    <p><i>{title}</i> by {artist}</p>
                </div>
            )
        }
    }

    render() {
        if (this.state.redirect) {
            return <Redirect to={this.state.redirect}/>
        }
        return (
            <div className="room">
                <h2 className="room-name">{this.state.room}</h2>
                {this.getLoadingSpinner()}
                {this.getRoomDescription()}
                {this.getRoomArt()}
                <div id="jitsi-container"></div>
                <Navigation directions={RoomLayout[this.state.room].directions} onClick={this.onSwitchRoom.bind(this)}></Navigation>
                <Link to="/map" activeclassname="active">Map</Link>
            </div>
        )
    }
}

export default connect(
    state => state, 
    {
        updateCurrentRoom: reducers.updateCurrentRoomActionCreator
     })(Room)