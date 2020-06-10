import React, { Fragment } from "react";
import { MDBBtn } from "mdbreact";
import './Upload.css';

const Upload = ({onRouteChange}) => {
  return (
    <div>
      <Fragment>
        <div className="navigation-bar-2">
          <MDBBtn onClick={() => onRouteChange('home')} color="mdb-color">Home</MDBBtn>
        </div>
      </Fragment>
      <div className="row">
        <div className="col-sm-12">
          <div className="section-title">
            <h1>Upload your video below</h1>
            <div className="divider"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Upload;


