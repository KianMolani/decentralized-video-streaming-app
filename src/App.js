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
import View from './components/View/View';
import luthor from './thumbnails/Luthoriac.png'; // DELETE THIS!

// const ipfsClient = require('ipfs-http-client');
// const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: '5001', protocol: 'https' });

// var data = luthor;

// (async function() {
//   for await (const file of ipfs.add(data)) {
//     const str = "https://ipfs.infura.io/ipfs/";
//     console.log(str.concat(file.path))
//   }
// })();

const Web3 = require('web3');

const web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/7b973cc4e4f04c9081ead788d635c300'));

const contractAddress = '0xD4400dbFb74B49E734e6Fd63FFDE30B36bAdEF08';
const abi = [{"inputs":[{"internalType":"string","name":"_title","type":"string"},{"internalType":"string","name":"_thumbnailHash","type":"string"}],"name":"addVideo","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getArrayLength","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_id","type":"uint256"}],"name":"getVideo","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_thumbnailHash","type":"string"}],"name":"isExisting","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"videoArray","outputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"date","type":"uint256"},{"internalType":"string","name":"title","type":"string"},{"internalType":"string","name":"thumbnailHash","type":"string"}],"stateMutability":"view","type":"function"}];
const contract = new web3.eth.Contract(abi, contractAddress);

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

async function run() {
    var result = await rpc(contract.methods.getArrayLength());
    var length = result;
    var i;
    for (i = 0; i < length; i++) {
      result = await rpc(contract.methods.getVideo(i));
      result = result.split("/");
      console.log(result[1]);
    }
}

run();

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
      route: 'home'
    }
  }

  onRouteChange = (route) => {
    this.setState({route: route});
  }
componentDidMount() {
  this.createVideos();
}

createVideos = async () => {
    let videos = []
    var videoTitles;
    var thumbnailHash;
    var length = await rpc(contract.methods.getArrayLength());
    var result;
    var stringex;
    for (var i = 0; i < length; i++) {
      result = await rpc(contract.methods.getVideo(i));
      result = result.split("/");
      videoTitles = result[0];
      thumbnailHash = result[1];
      stringex = "https://ipfs.io/ipfs/"
      stringex = stringex.concat(thumbnailHash);
      videos.push(<Video onRouteChange={this.onRouteChange} imglink={stringex} title={videoTitles}/> );
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
              ? <View onRouteChange={this.onRouteChange}/>
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
