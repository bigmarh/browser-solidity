contract checkOwner {
	address owner;
    function checkOwner(uint a) {
    	owner = msg.sender;
    }

    function getOwner() return (address o){
    	return owner;
    }
};
