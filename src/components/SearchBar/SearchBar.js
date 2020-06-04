import React from "react";
import { MDBCol, MDBIcon } from "mdbreact";
import './SearchBar.css';

const SearchBar = () => {
	return (
    <MDBCol className="enlarge" md="6" style={{paddingTop: '3px', paddingLeft: '70px'}}>
      <form className="form-inline mt-4 mb-4">
        <MDBIcon icon="search" />
        <input className="form-control form-control-sm ml-3 w-75" type="text" placeholder="Search" aria-label="Search" />
      </form>
    </MDBCol>
	);
}

export default SearchBar;