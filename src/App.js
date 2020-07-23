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
import Thumbnail from './components/Thumbnail/Thumbnail';
import Upload from './components/Upload/Upload';
import View from './components/View/View';

// NOTES: 
//    - Smart contract address for 'playlist' contract required here!
//    - Search bar does not actually work (also decide whether it should redirect to new page or filter)
//    - Render uploaded videos left to right
//    - Intelligently render new, uploaded videos without having to reload the page

/*
The code below connects to Ropsten Ethereum network via Infura node and creates a contract object for 'playlist' contract
*/

const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/7b973cc4e4f04c9081ead788d635c300'));
const contractAddress = '0x0447031221801f53dEbf8ba99A11d5e564D4d574';
const abi = [{"inputs":[{"internalType":"string","name":"_title","type":"string"},{"internalType":"string","name":"_thumbnailHash","type":"string"},{"internalType":"string","name":"_videoHash","type":"string"}],"name":"addVideo","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getArrayLength","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_id","type":"uint256"}],"name":"getVideo","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_thumbnailHash","type":"string"},{"internalType":"string","name":"_videoHash","type":"string"}],"name":"isExisting","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"videoArray","outputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"date","type":"uint256"},{"internalType":"string","name":"title","type":"string"},{"internalType":"string","name":"thumbnailHash","type":"string"},{"internalType":"string","name":"videoHash","type":"string"}],"stateMutability":"view","type":"function"}];
const contract = new web3.eth.Contract(abi, contractAddress); // to see contract contents, navigate to '\contracts\playlist.txt'

/*
'particleOptions' defines user settings for 'react-particles-js'
*/

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

/*
Function below handles asynchronous function calls to, in this case, 'playlist' contract
*/

async function rpc(func) {
    while (true) {
        try {
            return await func.call();
        }
        catch (error) {
            if (!error.message.startsWith("Invalid JSON RPC response"))
                throw error;
        }
    }
}

/*
Test function console logs all playlist information to user, including playlist length, video titles, thumbnail hashes, and video hashes
*/

async function testFunction() {
    var result = await rpc(contract.methods.getArrayLength());
    console.log(result);
    var length = result;
    var i;
    for (i = 0; i < length; i++) {
      result = await rpc(contract.methods.getVideo(i));
      console.log(result);
    }
}

testFunction();

class App extends Component {
  constructor() {
    super();
    this.state = {
      route: 'signin', // handles and captures routing state. Begin at sign in form
      videoLink: '' // used to pass IPFS video link to 'View' component
    }
  }
  onRouteChange = (route) => {
    this.setState({route: route});
  }
  onVideoView = (videoLink) => {
    this.setState({videoLink: videoLink});
  }
  componentDidMount() {
    this.createVideos(); // retrieve video thumbnails and titles after DOM has rendered
  }

  /*
  Function below retrieves thumbnail, video, and video title information from 'playlist' contract and constructs an array of 'Thumbnail' components.
  Functionality was created in such a way so that render never has to return a promise
  */

  createVideos = async () => {
    let videos = [];
    var videoTitle;
    var thumbnailHash; var thumbnailLink;
    var videoHash; var videoLink;
    var result;
    var stringex;
    var length = await rpc(contract.methods.getArrayLength()); // get number of videos uploaded to website
    for (var i = 0; i < length; i++) {
      result = await rpc(contract.methods.getVideo(i)); // contract function returns a string containing video title, thumbnail hash, and video hash
      result = result.split("/");
      videoTitle = result[0];
      thumbnailHash = result[1];
      videoHash = result[2];
      stringex = "https://ipfs.io/ipfs/"
      thumbnailLink = stringex.concat(thumbnailHash); // construct link to thumbnail that users can navigate to
      videoLink = stringex.concat(videoHash); // construct link to video that users can navigate to
      videos.push(<Thumbnail onRouteChange={this.onRouteChange} onVideoView={this.onVideoView} imglink={thumbnailLink} title={videoTitle} videoLink={videoLink}/> );
    }
    this.setState({
      Videos: videos
    })
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
                {this.state.Videos}
              </div>
            : ( this.state.route === 'view'
              ? <View onRouteChange={this.onRouteChange} videoLink={this.state.videoLink}/>
              : <Upload onRouteChange={this.onRouteChange} /> ))
          : ( this.state.route === 'signin'
            ? <SignIn onRouteChange={this.onRouteChange}/>
            : <Register onRouteChange={this.onRouteChange}/> )
        }
      </div>
    );
  }
}

export default App;
