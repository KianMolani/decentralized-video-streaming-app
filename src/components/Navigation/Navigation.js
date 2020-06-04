import React, { Fragment } from "react";
import { MDBBtn } from "mdbreact";

const Navigation = () => {
	return (
	    <Fragment>
	    <div style={{ paddingRight: '20px', paddingTop: '10px'}}>
	      <MDBBtn color="red">Upload</MDBBtn>
	      <MDBBtn color="mdb-color">Sign-Out</MDBBtn>
	    </div>
	    </Fragment>
	);
}

export default Navigation;