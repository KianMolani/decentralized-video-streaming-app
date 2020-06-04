import React from 'react';
import Tachyons from 'tachyons';
import './Video.css';

const Video = () => {
	return (
		<div class="bg-light-gray dib br3 pa3 ma5 grow bw2 shadow-5">
			<img altsrc='thumbnail' src='https://mk0spaceflightnoa02a.kinstacdn.com/wp-content/uploads/2020/03/32652060737_a3056b6f30_k.jpg' width="400px" height="auto" />
			<div>
				<h2 style={{fontFamily:"Roboto Mono", fontSize: "26px"}}>SpaceX Launch</h2>
				<p style={{fontFamily:"Roboto Mono", fontSize: "16px"}}>Channel: SpaceX</p>
			</div>
		</div>
	);
}

export default Video;