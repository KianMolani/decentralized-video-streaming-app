import React, { Component } from 'react';
import Particles from 'react-particles-js';
import logo from './logo.svg';
import './App.css';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import SearchBar from './components/SearchBar/SearchBar';
import Divider from './components/Divider/Divider';
import Video from './components/Video/Video';
import Upload from './components/Upload/Upload';
import luthor from './thumbnails/Luthoriac.png'; // DELETE THIS!

const particlesOptions = {
  particles: {
    number: {
      value: 80,
      density: {
        enable: true,
        value_area: 800
      }
    },
    color: {
      value: "#000000"
    },
    size: {
      value: 3,
      random: true
    },
    line_linked: {
      enable_auto: true,
      distance: 150,
      color: "#000000",
      opacity: 0.0,
      width: 1
    }
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      route: 'signin'
    }
  }

  onRouteChange = (route) => {
    this.setState({route: route});
  }

  render() {
    return (
      <div className="App">
        <Particles className='particles' params={particlesOptions} />
          { this.state.route !== 'signin' & this.state.route !== 'register'
          ? ( this.state.route === 'home'
            ? <div>
                <div className="navigation-bar">
                  <Logo />
                  <SearchBar />
                  <Navigation onRouteChange={this.onRouteChange} />
                </div>
                <Divider />
                <Video imglink='https://mk0spaceflightnoa02a.kinstacdn.com/wp-content/uploads/2020/03/32652060737_a3056b6f30_k.jpg' title='SpaceX Falcon Heavy Test Flight'/> 
                <Video imglink='https://i.ytimg.com/vi/UGAVxSriToM/hq720.jpg?sqp=-oaymwEZCNAFEJQDSFXyq4qpAwsIARUAAIhCGAFwAQ==&rs=AOn4CLBpOi1DLJwUP5qIgY7NCUGWr8rAmQ' title='Space Echo ¦ XXVI ¦ Synthwave Mix' /> 
                <Video imglink='https://i.ytimg.com/vi/PM7ArMxUFR0/maxresdefault.jpg' title="No Man's Sky NEXT Gameplay"/>
                <Video imglink={luthor} title='Lex Luthor and Brainiac Join Together'/> 
                <Video imglink='https://i.ytimg.com/vi/P99qJGrPNLs/maxresdefault.jpg' title='Cyberpunk 2077 Trailer'/> 
                <Video imglink='https://cms.elitedangerous.com/frontier_image_styles/style?url=/sites/default/files/2018-11/horizons-key-art_0.jpg&width=1920&height=1080&type=binary' title='Elite Dangerous | Announcement Trailer'/> 
              </div>
            : <Upload onRouteChange={this.onRouteChange} /> )
          : ( this.state.route === 'signin'
            ? <SignIn onRouteChange={this.onRouteChange}/>
            : <Register onRouteChange={this.onRouteChange}/> )
        }
      </div>
    );
  }
}

export default App;
