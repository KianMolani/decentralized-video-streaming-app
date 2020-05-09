pragma solidity ^0.4.0;

contract Y3 {

    struct video {
        uint id;
        address publisher;
        bytes2 identifier;
        bytes32 hash;
        string title;
        string category;
    }

    video[] public playlist;

    modifier onlyPublisher(uint id) {
        require(
            msg.sender == playlist[id].publisher
        );
        _;
    }

    function addVideo(bytes2 _identifier, bytes32 _hash, string _title, string _category) public returns(uint){
        uint _id = playlist.length;
        playlist.push(video({
            id: _id,
            publisher: msg.sender,
            identifier: _identifier,
            hash: _hash,
            title: _title,
            category: _category
        }));
    }

    function playlistLength() public constant returns(uint) {
        return playlist.length;
    }

}