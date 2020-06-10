import React, { Fragment } from "react";
import { MDBBtn } from "mdbreact";

const Navigation = ({onRouteChange}) => {
	return (
	    <Fragment>
	    <div style={{ paddingRight: '20px', paddingTop: '10px'}}>
	      <MDBBtn style={{fontFamily:"Roboto Mono"}} onClick={() => onRouteChange('upload')} color="red">Upload</MDBBtn>
	      <MDBBtn style={{fontFamily:"Roboto Mono"}} onClick={() => onRouteChange('signin')} color="mdb-color">Sign-Out</MDBBtn>
	    </div>
	    </Fragment>
	);
}

export default Navigation;