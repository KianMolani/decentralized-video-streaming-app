import React from 'react';
import Tachyons from 'tachyons';
import './Thumbnail.css';

// NOTES: 
//		- Should load thumbnails more optimally and together. Consider limiting size -- see Elite Dangerous thumbnail
//		- Consider uploading gifs

class Thumbnail extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			imglink: props.imglink,
			title: props.title,
            videoLink: props.videoLink
		}
	}

    /*
    Contained within render function below is functionality that sends video link of video that user clicked on to App.js.
    This information is later passed to 'View' component
    */

    render() {
    	const { onRouteChange, onVideoView } = this.props;
    	return (
    		<div onClick={() => { onRouteChange('view'); onVideoView(this.state.videoLink)}} className="bg-light-gray dib br3 pa3 ma5 grow bw2 shadow-5 container4">
    			<img altsrc='thumbnail' src={this.state.imglink} className='container3'/>
    			<div>
    				<h2 style={{fontFamily:"Roboto Mono", paddingTop: 15, fontSize: "16px"}}>{this.state.title}</h2>
    			</div>
    		</div>
		);
    }
 }

export default Thumbnail;