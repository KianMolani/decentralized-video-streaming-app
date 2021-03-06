import React, { Component, Button } from 'react';
import Particles from 'react-particles-js';
import logo from '../../logo.svg';
import { MDBBtn } from 'mdbreact';
import Tachyons from 'tachyons';
import './Register.css';

// NOTES: 
//    - Smart contract address for 'users' contract required here!
//    - WARNING -- SECURITY VULNERABILITY: file contains private key information!
//    - Improve custom warning and error notifications

/*
The code below connects to Ropsten Ethereum network via Infura node and creates a contract object for 'users' contract.
The code also contains private key information of account responsible for paying for all contract state changes
*/

const Web3 = require('web3');
const Tx = require('ethereumjs-tx').Transaction; // facilitates signing and processing of raw and signed transactions

const web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/7b973cc4e4f04c9081ead788d635c300'));

const fromAddress = '0x02B87aE689fa9282820D0936df8bA5e0a4152222';
const privateKey = new Buffer('f6a3b9d820da379739e5cdc0fc8deab210772a21de8ff1c5b9fe832dee1f8c8b', 'hex');

const contractAddress = '0xd4B33a85e8c872F82C9B7785210F2B2C4dBef945';
const abi = [{"inputs":[{"internalType":"string","name":"_channelName","type":"string"},{"internalType":"string","name":"_email","type":"string"},{"internalType":"string","name":"_password","type":"string"}],"name":"addUser","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_id","type":"uint256"}],"name":"deleteUser","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getArrayLength","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_id","type":"uint256"}],"name":"getUser","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_channelName","type":"string"},{"internalType":"string","name":"_email","type":"string"}],"name":"isExisting","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"userArray","outputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"string","name":"channelName","type":"string"},{"internalType":"string","name":"email","type":"string"},{"internalType":"string","name":"password","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_email","type":"string"},{"internalType":"string","name":"_password","type":"string"}],"name":"verifyUser","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"}];
const contract = new web3.eth.Contract(abi, contractAddress);

/*
The function 'createRawTransaction' contains transaction-related information for the creation of a raw, unsigned transaction.
The function also encodes the data for a function call to 'users' smart contract that adds user channel, email, and password information to array 
*/

function createRawTransaction(registerChannel, registerEmail, registerPassword) {
  const txData = {
    gasLimit: web3.utils.toHex(3000000),
    gasPrice: web3.utils.toHex(10e9),
    to: contractAddress,
    from: fromAddress,
    data: contract.methods.addUser(registerChannel, registerEmail, registerPassword).encodeABI()
  }
  sendRawTransaction(txData);
}

/*
The function 'sendRawTransaction' signs raw transaction with inputted private key so that new contract state can finally be processed and confirmed to blockchain
*/

const sendRawTransaction = txData => web3.eth.getTransactionCount(fromAddress).then(txCount => {
  const newNonce = web3.utils.toHex(txCount);
  const transaction = new Tx({ ...txData, nonce: newNonce }, { chain: 'ropsten' });
  transaction.sign(privateKey);
  const serializedTx = transaction.serialize().toString('hex');
  return web3.eth.sendSignedTransaction('0x' + serializedTx);
})

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
Function below utilizes 'users' smart contract function to check to see whether user is already registered.
Returned output is either 'true' or 'false'
*/

async function run(registerChannel, registerEmail) {
    const result = await rpc(contract.methods.isExisting(registerChannel, registerEmail));
    return result;
}

class Register extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      registerChannel: '', // contains channel name inputed by user
      registerEmail: '', // contains email address inputted by user
      registerPassword: '' // contains password inputted by user
    }
  }
  onChannelChange = (event) => {
    this.setState({registerChannel: event.target.value})
  }
  onEmailChange = (event) => {
    this.setState({registerEmail: event.target.value})
  }
  onPasswordChange = (event) => {
    this.setState({registerPassword: event.target.value})
  }
  onSubmitRegister = async () => {
    if (this.state.registerChannel == '' || this.state.registerEmail == '' || this.state.registerPassword == '') {
      alert("Empty input fields!");
    } else if (await run(this.state.registerChannel,this.state.registerEmail)) {
      alert("Channel name or email address already registered!");
    } else {
      createRawTransaction(this.state.registerChannel, this.state.registerEmail, this.state.registerPassword);
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
                <legend style={{fontFamily:"Roboto Mono"}} className="f4 fw6 ph0 mh0">Register</legend>
                <div className="mt3">
                  <label style={{fontFamily:"Roboto Mono"}} className="db fw6 lh-copy f6" for="email-address">Channel</label>
                  <input autocomplete="off" className="pa2 input-reset ba bg-transparent hover-bg-black w-100" type="email" name="email-address"  id="email-address" onChange={this.onChannelChange}/>
                </div>
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
                <MDBBtn onClick={this.onSubmitRegister} style={{fontFamily:"Roboto Mono", width: 300}} color="mdb-color">CLICK TO REGISTER</MDBBtn>
              </div>
              <div style={{paddingTop: 10}}>
                <MDBBtn onClick={() => onRouteChange('signin')} style={{fontFamily:"Roboto Mono", width: 300, paddingRight: 63}} color="red"><i className="arrow left"></i><h style={{paddingLeft: 20}}>SIGN-IN</h></MDBBtn>
              </div>
            </form>
          </main>
        </article>
      </div>
    );
  }
}

export default Register;