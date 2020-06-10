import React from "react";
import logo from '../../logo.svg'
import './Logo.css'

const Logo = () => {
	return (
		<div style={{ paddingLeft: '20px'}}> 
			<img className="logo" style={{height: 100, width: 100 }} alt='logo' src={logo}/>
		</div>
	);
}

export default Logo;