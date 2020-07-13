import React, { Fragment, TextField } from "react";
import { MDBBtn } from "mdbreact";
import './Upload.css';
import { ethers } from "ethers";

// need wheel then redirect

const ipfsClient = require('ipfs-http-client');
const ipfs = new ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

const Web3 = require('web3');
const Tx = require('ethereumjs-tx').Transaction;

const web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/7b973cc4e4f04c9081ead788d635c300'));

const fromAddress = '0x02B87aE689fa9282820D0936df8bA5e0a4152222';
const privateKey = new Buffer('f6a3b9d820da379739e5cdc0fc8deab210772a21de8ff1c5b9fe832dee1f8c8b', 'hex');

const contractAddress = '0xD4400dbFb74B49E734e6Fd63FFDE30B36bAdEF08';
const abi = [{"inputs":[{"internalType":"string","name":"_title","type":"string"},{"internalType":"string","name":"_thumbnailHash","type":"string"}],"name":"addVideo","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getArrayLength","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_id","type":"uint256"}],"name":"getVideo","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_thumbnailHash","type":"string"}],"name":"isExisting","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"videoArray","outputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"date","type":"uint256"},{"internalType":"string","name":"title","type":"string"},{"internalType":"string","name":"thumbnailHash","type":"string"}],"stateMutability":"view","type":"function"}];
const contract = new web3.eth.Contract(abi, contractAddress);

function createRawTransaction(videoTitle, thumbnailHash) {
  const txData = {
    gasLimit: web3.utils.toHex(250000),
    gasPrice: web3.utils.toHex(10e9),
    to: contractAddress,
    from: fromAddress,
    data: contract.methods.addVideo(videoTitle, thumbnailHash).encodeABI()
  }
  sendRawTransaction(txData);
}

const sendRawTransaction = txData => web3.eth.getTransactionCount(fromAddress).then(txCount => {
  const newNonce = web3.utils.toHex(txCount);
  const transaction = new Tx({ ...txData, nonce: newNonce }, { chain: 'ropsten' });
  transaction.sign(privateKey);
  const serializedTx = transaction.serialize().toString('hex');
  return web3.eth.sendSignedTransaction('0x' + serializedTx);
})

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

async function run(thumbnailHash) {
    const result = await rpc(contract.methods.isExisting(thumbnailHash));
    return result;
}

async function run2() {
    const result = await rpc(contract.methods.getVideo(0));
    console.log(result);
}

//run2();


class Upload extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      videoTitle: '',
      buffer: '',
      thumbnailHash: ''
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
      this.setState({ buffer: Buffer(reader.result) })
      console.log('buffer', this.state.buffer)
    }
  }
  onVideoUpload = (event) => {

  }
  onSubmit = async (event) => {
    event.preventDefault()
    for await (const file of ipfs.add(this.state.buffer)) {
      this.setState({ thumbnailHash: file.path })
      console.log('thumbnailHash', this.state.thumbnailHash)
    }
    if (this.state.videoTitle == '' || this.state.buffer == '') {
      alert("No video title or attached thumbnail!");
    } else if (await run(this.state.thumbnailHash)) {
      alert("Thumbnail already exists!");
    } else {
      createRawTransaction(this.state.videoTitle, this.state.thumbnailHash);
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
        <input style={{fontFamily:"Roboto Mono", paddingLeft:'51px', fontSize: '15px'}} type='file'/>
      </form>
      <form style={{paddingTop: '20px'}} onSubmit={this.onSubmit}>
        <input style={{fontFamily:"Roboto Mono", fontSize: '15px'}} type='submit' />
      </form>
      </div>
      </div>
    </div>
    );
  }
}

export default Upload;


