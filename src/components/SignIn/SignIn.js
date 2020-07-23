import React, { Component, Button } from 'react';
import Particles from 'react-particles-js';
import logo from '../../logo.svg';
import { MDBBtn } from 'mdbreact';
import Tachyons from 'tachyons';
import './SignIn.css';

// NOTES: 
//    - Smart contract address for 'users' contract required here!
//    - WARNING -- SECURITY VULNERABILITY: as notified by browser, password is improperly exposed
//    - Improve custom warning and error notifications

/*
The code below connects to Ropsten Ethereum network via Infura node and creates a contract object for 'users' contract
*/

const Web3 = require('web3');

const web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/7b973cc4e4f04c9081ead788d635c300'));

const fromAddress = '0x02B87aE689fa9282820D0936df8bA5e0a4152222';

const contractAddress = '0xd4B33a85e8c872F82C9B7785210F2B2C4dBef945';
const abi = [{"inputs":[{"internalType":"string","name":"_channelName","type":"string"},{"internalType":"string","name":"_email","type":"string"},{"internalType":"string","name":"_password","type":"string"}],"name":"addUser","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_id","type":"uint256"}],"name":"deleteUser","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getArrayLength","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_id","type":"uint256"}],"name":"getUser","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_channelName","type":"string"},{"internalType":"string","name":"_email","type":"string"}],"name":"isExisting","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"userArray","outputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"string","name":"channelName","type":"string"},{"internalType":"string","name":"email","type":"string"},{"internalType":"string","name":"password","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_email","type":"string"},{"internalType":"string","name":"_password","type":"string"}],"name":"verifyUser","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"}];
const contract = new web3.eth.Contract(abi, contractAddress); // to see contract contents, navigate to '\contracts\users.txt'

/*
Function below handles asynchronous function calls to, in this case, 'users' contract
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
Function below utilizes 'users' smart contract function to verify that user is registered.
Returned output is either 'true' or 'false'
*/

async function run(registerEmail, registerPassword) {
    const result = await rpc(contract.methods.verifyUser(registerEmail, registerPassword));
    return result;
}

/*
Test function console logs number of registered users
*/

async function testFunction() {
    const result = await rpc(contract.methods.getArrayLength());
    console.log(result);
}

testFunction();

class SignIn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      registerEmail: '', // contains email address inputted by user
      registerPassword: '' // contains password inputted by user
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
      this.props.onRouteChange('home'); // navigate to home page
    }
  }

  render() { 
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