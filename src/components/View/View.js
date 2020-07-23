import React, { Fragment } from "react";
import { MDBBtn } from "mdbreact";

class View extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			videoLink: props.videoLink
		}
	}

  render() {
    const { onRouteChange } = this.props;
    return (
      <div>
        <Fragment>
				  <div style={{paddingBottom: '120px'}} className="navigation-bar-2">
            <MDBBtn onClick={() => onRouteChange('home')} color="mdb-color">Home</MDBBtn>
          </div>
        </Fragment>
      	<video width = '900px' height = '505px' controls>
      		<source src={this.state.videoLink}/>
  				<p>This browser does not support the video element.</p>
  			</video>
      </div>
		);
  }
}

export default View;