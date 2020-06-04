import React, { Component } from 'react';
import Particles from 'react-particles-js';
import logo from './logo.svg';
import './App.css';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import SearchBar from './components/SearchBar/SearchBar';
import Video from './components/Video/Video';

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
  render() {
    return (
      <div className="App">
      {/*
        <Particles className='particles' params={particlesOptions} />
        <img src={logo} className="App-logo" alt="logo" />
        <Button variant="outline-dark">CLICK TO JOIN IPFS NETWORK</Button> 
      */}
      <div className="navigation-bar">
      <Particles className='particles' params={particlesOptions} />
        <Logo />
        <SearchBar />
        <Navigation />
      </div>
      <div class="container">
        <div class="row">
          <div class="col-sm-12">
            <div class="section-title">
              <h1>Videos</h1>
            <div class="divider"></div>
            </div>
          </div>
        </div>
        </div>
        <Video />
        <Video />
        <Video />
        <Video />
        <Video />
        <Video />
      </div>

    );
  }
}

export default App;
