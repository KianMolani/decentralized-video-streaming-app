import React, { Component, Button } from 'react';
import Particles from 'react-particles-js';
import logo from '../../logo.svg';
import { MDBBtn } from 'mdbreact';
import Tachyons from 'tachyons';

import './SignIn.css';

const SignIn = ({onRouteChange}) => {
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
        <input className="pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100" type="email" name="email-address"  id="email-address"/>
      </div>
      <div className="mv3">
        <label style={{fontFamily:"Roboto Mono"}} className="db fw6 lh-copy f6" for="password">Password</label>
        <input className="b pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100" type="password" name="password"  id="password"/>
      </div>
    </fieldset>
    <div style={{paddingTop: 20}}>
<MDBBtn onClick={() => onRouteChange('home')} style={{fontFamily:"Roboto Mono", width: 300}} color="mdb-color">CLICK TO JOIN IPFS NETWORK</MDBBtn>
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

export default SignIn;