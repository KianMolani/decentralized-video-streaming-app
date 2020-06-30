import React from 'react';
import Tachyons from 'tachyons';
import './Video.css';

const Video = (props) => {
	return (
		<div className="bg-light-gray dib br3 pa3 ma5 grow bw2 shadow-5">
			<img  altsrc='thumbnail' src={props.imglink} className='container3'/>
			<div>
				<h2 style={{fontFamily:"Roboto Mono", paddingTop: 15, fontSize: "16px"}}>{props.title}</h2>
			</div>
		</div>
	);
}

//Should load all videos better (limit size ... see elite dangerous), together ... problems with local ... consider gifs

export default Video;