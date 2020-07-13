import React from 'react';
import Tachyons from 'tachyons';
import './Video.css';

class Video extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			imglink: props.imglink,
			title: props.title
		}
	}
    render() {
    	const { onRouteChange } = this.props;
    	return (
    	<div onClick={() => onRouteChange('view')} className="bg-light-gray dib br3 pa3 ma5 grow bw2 shadow-5 container4">
    		<img altsrc='thumbnail' src={this.state.imglink} className='container3'/>
    		<div>
    			<h2 style={{fontFamily:"Roboto Mono", paddingTop: 15, fontSize: "16px"}}>{this.state.title}</h2>
			</div>
		</div>
		);
    }
  }

//Should load all videos better (limit size ... see elite dangerous), together ... problems with local ... consider gifs

export default Video;