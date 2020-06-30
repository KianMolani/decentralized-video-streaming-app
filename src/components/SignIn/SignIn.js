import React, { Component, Button } from 'react';
import Particles from 'react-particles-js';
import logo from '../../logo.svg';
import { MDBBtn } from 'mdbreact';
import Tachyons from 'tachyons';
import './SignIn.css';

const Web3 = require('web3');

const web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/7b973cc4e4f04c9081ead788d635c300'));

const fromAddress = '0x02B87aE689fa9282820D0936df8bA5e0a4152222';

const contractAddress = '0xE63DBa427f3918FCB5e5D75E0f94B3b92DFF904a';
const abi = [{"inputs":[{"internalType":"string","name":"_channelName","type":"string"},{"internalType":"string","name":"_email","type":"string"},{"internalType":"string","name":"_password","type":"string"}],"name":"addUser","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_id","type":"uint256"}],"name":"deleteUser","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getArrayLength","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_id","type":"uint256"}],"name":"getUser","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_channelName","type":"string"},{"internalType":"string","name":"_email","type":"string"}],"name":"isExisting","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"userArray","outputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"string","name":"channelName","type":"string"},{"internalType":"string","name":"email","type":"string"},{"internalType":"string","name":"password","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_email","type":"string"},{"internalType":"string","name":"_password","type":"string"}],"name":"verifyUser","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"}];
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

async function run(registerEmail, registerPassword) {
    const result = await rpc(contract.methods.verifyUser(registerEmail, registerPassword));
    return result;
}

async function testrun() {
    const result = await rpc(contract.methods.getArrayLength());
    console.log(result);
}

testrun();

class SignIn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      registerEmail: '',
      registerPassword: ''
    }
  }
  onEmailChange = (event) => {
    this.setState({registerEmail: event.target.value})
  }
  onPasswordChange = (event) => {
    this.setState({registerPassword: event.target.value})
  }
  onSubmitSignIn = async () => {
    if (this.state.registerEmail == '' || this.state.registerPassword == '') {
      alert("Empty input fields!");
    } else if (!await run(this.state.registerEmail,this.state.registerPassword)) {
      alert("Incorrect email or password!");
    } else {
      this.props.onRouteChange('home');
    }
  }

  render() { // deleted: hover-white
    const { onRouteChange } = this.props;
    return (
    <div className="container">
    <img src={logo} className="" style={{paddingBottom: 30, height: 300, width: 300}} alt="logo" />
    <article className="br3 ba dark-gray b--black-10 mv4 w-100 w-50-m w-25-l mw6 shadow-5 center">        
    <main className="pa4 black-80">
    <form className="measure">
    <fieldset id="sign_up" className="ba b--transparent ph0 mh0">
    <legend style={{fontFamily:"Roboto Mono"}} className="f4 fw6 ph0 mh0">Sign In</legend>
      <div className="mt3">
        <label style={{fontFamily:"Roboto Mono"}} className="db fw6 lh-copy f6" for="email-address">Email</label>
        <input autocomplete="off" className="pa2 input-reset ba bg-transparent hover-bg-black w-100" type="email" name="email-address"  id="email-address" onChange={this.onEmailChange}/> 
      </div>
      <div className="mv3">
        <label style={{fontFamily:"Roboto Mono"}} className="db fw6 lh-copy f6" for="password">Password</label>
        <input autocomplete="off" className="b pa2 input-reset ba bg-transparent hover-bg-black w-100" type="password" name="password"  id="password" onChange={this.onPasswordChange}/>
      </div>
    </fieldset>
    <div style={{paddingTop: 20}}>
      <MDBBtn onClick={this.onSubmitSignIn} style={{fontFamily:"Roboto Mono", width: 300}} color="mdb-color">CLICK TO JOIN IPFS NETWORK</MDBBtn>
    </div>
    <div style={{paddingTop: 10}}>
      <MDBBtn onClick={() => onRouteChange('register')} style={{fontFamily:"Roboto Mono", width: 300}} color="red">REGISTER</MDBBtn>
    </div>
    </form>
    </main>
    </article>
    </div>
  );
  }
}

export default SignIn;