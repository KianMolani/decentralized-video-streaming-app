import React, { Fragment, TextField } from "react";
import { MDBBtn } from "mdbreact";
import './Upload.css';
import { ethers } from "ethers";

// NOTES: 
//    - Smart contract address for 'playlist' contract required here!
//    - WARNING -- SECURITY VULNERABILITY: file contains private key information!
//    - Need loading wheel and completion status, and then (potentially) automatic redirect
//    - Manage Infura file size limits (consider using ffmpeg)
//    - Improve arrow bound animation (keyframes not working)
//    - Improve custom warning and error notifications
//    - Add functionality that prevents navigation to home page while user's video is uploading
//    - Notification for duplicate videos and thumbnails not working, but the IPFS network seems to recognize this (indicated by slow returns of hashes). See if this is reflected within application
//    - Some video uploads return error but content still seems to be uploaded to IPFS network. On second try, transaction is processed
//    - Alter opacity of disabled button
//    - State change seems to be occuring on button submit
//    - Provide better notification and error handling in the event of upload failure
//    - Notify user of upload completion only after transaction has been confirmed

/*
The code below connects to Infura IPFS node via 'ipfs-http-client' library
*/

const ipfsClient = require('ipfs-http-client');
const ipfs = new ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

/*
The code below connects to Ropsten Ethereum network via Infura node and creates a contract object for 'playlist' contract.
The code also contains private key information of account responsible for paying for all contract state changes
*/

const Web3 = require('web3');
const Tx = require('ethereumjs-tx').Transaction;

const web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/7b973cc4e4f04c9081ead788d635c300'));

const fromAddress = '0x02B87aE689fa9282820D0936df8bA5e0a4152222';
const privateKey = new Buffer('f6a3b9d820da379739e5cdc0fc8deab210772a21de8ff1c5b9fe832dee1f8c8b', 'hex');

const contractAddress = '0x0447031221801f53dEbf8ba99A11d5e564D4d574';
const abi = [{"inputs":[{"internalType":"string","name":"_title","type":"string"},{"internalType":"string","name":"_thumbnailHash","type":"string"},{"internalType":"string","name":"_videoHash","type":"string"}],"name":"addVideo","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getArrayLength","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_id","type":"uint256"}],"name":"getVideo","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_thumbnailHash","type":"string"},{"internalType":"string","name":"_videoHash","type":"string"}],"name":"isExisting","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"videoArray","outputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"date","type":"uint256"},{"internalType":"string","name":"title","type":"string"},{"internalType":"string","name":"thumbnailHash","type":"string"},{"internalType":"string","name":"videoHash","type":"string"}],"stateMutability":"view","type":"function"}];
const contract = new web3.eth.Contract(abi, contractAddress);

/*
The function 'createRawTransaction' contains transaction-related information for the creation of a raw, unsigned transaction.
The function also encodes the data for a function call to 'playlist' smart contract that adds video title, thumbnail hashes, and video hashes to array 
*/

function createRawTransaction(videoTitle, thumbnailHash, videoHash) {
  const txData = {
    gasLimit: web3.utils.toHex(3000000),
    gasPrice: web3.utils.toHex(10e9),
    to: contractAddress,
    from: fromAddress,
    data: contract.methods.addVideo(videoTitle, thumbnailHash, videoHash).encodeABI()
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
  return web3.eth.sendSignedTransaction('0x' + serializedTx)
})

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
Function below utilizes 'playlist' smart contract function to check to see whether thumbnail or video have already been uploaded.
Returned output is either 'true' or 'false'
*/

async function run(thumbnailHash, videoHash) {
    const result = await rpc(contract.methods.isExisting(thumbnailHash, videoHash));
    return result;
}

class Upload extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      status: 'Submit', // manages text contained within submit button
      videoTitle: '', // contains video title inputed by user
      thumbnailBuffer: '', // holds thumbnail buffer that is then processed and uploaded to IPFS
      videoBuffer: '', // holds video buffer that is then processed and uploaded to IPFS
      thumbnailHash: '', // contains thumbnail hash
      videoHash: '' // contains video hash
    }
  }
  onTitleChange = (event) => {
    this.setState({videoTitle: event.target.value})
  }
  onThumbnailUpload = (event) => {
    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      this.setState({ thumbnailBuffer: Buffer(reader.result) })
      console.log('thumbnailBuffer', this.state.thumbnailBuffer)
    }
  }
  onVideoUpload = (event) => {
    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      this.setState({ videoBuffer: Buffer(reader.result) })
      console.log('videoBuffer', this.state.videoBuffer)
    }
  }
  onSubmit = async (event) => {
    event.preventDefault()
    if (this.state.videoTitle == '' || this.state.thumbnailBuffer == '' || this.state.videoBuffer == '') {
      alert("No video title, attached thumbnail, or attached video!");
    } else if (await run(this.state.thumbnailHash, this.state.videoHash)) {
      alert("Thumbnail and/or video already exists!");
    } else {
      this.setState({status: 'Uploading...'})
      document.getElementById("myBtn").disabled = true; // disable submit button
      for await (const file of ipfs.add(this.state.thumbnailBuffer)) {
        this.setState({ thumbnailHash: file.path })
        console.log('thumbnailHash', this.state.thumbnailHash)
      }
      for await (const file of ipfs.add(this.state.videoBuffer)) {
        this.setState({ videoHash: file.path })
        console.log('videoHash', this.state.videoHash)
        this.setState({status: 'Done!'}) // notify user of completion after both thumbnail and video have been uploaded to IPFS
      }
      createRawTransaction(this.state.videoTitle, this.state.thumbnailHash, this.state.videoHash);
    }
  }
  render() {
    const { onRouteChange } = this.props;
    return (
      <div>
        <Fragment>
          <div className="navigation-bar-2">
            <MDBBtn onClick={() => onRouteChange('home')} color="mdb-color">Home</MDBBtn>
          </div>
        </Fragment>
        <div className="section-title">
          <h1 style={{fontFamily:"Roboto Mono", paddingBottom: "40px"}}>Upload your video below</h1>
          <a className="bounce fa fa-arrow-down fa-2x" style={{paddingBottom:'20px'}}></a>
          <div style={{paddingLeft: '10%', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius:'20px', paddingTop: '60px', paddingBottom: '40px', paddingRight:'80px'}}>
            <form className="form-inline" style={{paddingBottom: '40px'}}>
              <h6 style={{fontFamily:"Roboto Mono"}}>Video Title:</h6>
              <input style={{fontFamily:"Roboto Mono"}} className="form-control form-control-sm ml-3 w-75" type="text" placeholder="" aria-label="Search" onChange={this.onTitleChange}/>
            </form>
            <form className="form-inline" style={{paddingBottom: '20px'}}>
              <h6 style={{fontFamily:"Roboto Mono"}}> Thumbnail: </h6>
              <input style={{fontFamily:"Roboto Mono", paddingLeft:'60px', fontSize: '15px'}} type='file' onChange={this.onThumbnailUpload}/>
            </form>
            <form className="form-inline mt-4 mb-4">
              <h6 style={{fontFamily:"Roboto Mono"}}> Video File: </h6>
              <input style={{fontFamily:"Roboto Mono", paddingLeft:'51px', fontSize: '15px'}} type='file' onChange={this.onVideoUpload}/>
            </form>
            <form style={{paddingTop: '20px'}}>
              <input onClick={this.onSubmit} id='myBtn' style={{fontFamily:"Roboto Mono", fontSize: '15px'}} type='button' value={this.state.status}/>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default Upload;


