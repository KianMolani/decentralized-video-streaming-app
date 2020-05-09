pragma solidity ^0.4.0;

contract Y3 {

    struct video {
        uint id;
        address publisher;
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

    function addVideo(bytes32 _hash, string _title, string _category) public returns(uint){
        uint _id = playlist.length;
        playlist.push(video({
            id: _id,
            publisher: msg.sender,
            hash: _hash,
            title: _title,
            category: _category
        }));

        return _id;
    }

    function updateHash(uint id, bytes32 _hash) public onlyPublisher(id) {
        playlist[id].hash = _hash;
    }

    function updateTitle(uint id, string _title) public onlyPublisher(id) {
        playlist[id].title = _title;
    }

    function updateCategory(uint id, string _category) public onlyPublisher(id) {
        playlist[id].category = _category;
    }

    function playlistLength() public constant returns(uint) {
        return playlist.length;
    }

}