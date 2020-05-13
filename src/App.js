// import React from 'react';
import React, { Component } from 'react';
import Particles from 'react-particles-js';
import logo from './logo.svg';
import './App.css';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';
import { MDBContainer, MDBRow, MDBCol, MDBBtn, MDBInput } from 'mdbreact';

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
        <Particles className='particles' params={particlesOptions} />
        <img src={logo} className="App-logo" alt="logo" />
        // 
        <Button variant="outline-dark">CLICK TO JOIN IPFS NETWORK</Button>
<MDBContainer>
  <MDBRow>
    <MDBCol md="6">
      <form>
        <p className="h5 text-center mb-4">Sign up</p>
        <div className="grey-text">
          <MDBInput label="Your name" icon="user" group type="text" validate error="wrong"
            success="right" />
          <MDBInput label="Your email" icon="envelope" group type="email" validate error="wrong"
            success="right" />
          <MDBInput label="Confirm your email" icon="exclamation-triangle" group type="text" validate
            error="wrong" success="right" />
          <MDBInput label="Your password" icon="lock" group type="password" validate />
        </div>
        <div className="text-center">
          <MDBBtn color="primary">Register</MDBBtn>
        </div>
      </form>
    </MDBCol>
  </MDBRow>
</MDBContainer>
      </div>
    );
  }
}

// function App() {
//   return (
//     <div className="App">
//     <Particles className='particles'
//               params={particlesOptions}
//             />
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <Button variant="outline-dark">JOIN IPFS NETWORK</Button>
//       </header>
//     </div>
//   );
// }

export default App;
