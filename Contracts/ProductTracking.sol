pragma solidity ^0.4.12;

contract ProductTracking{
    
    struct tracking{
        uint timeStamp;
        string location;
    }
    
    tracking[] public trackings;
   
    mapping (address => tracking[]) public locationHistory;
    
    
    function updateLocation(address _productId, string _location){
        tracking memory newLocation;
        newLocation.location = _location;
        newLocation.timeStamp = now;
        locationHistory[_productId].push(newLocation);
    }
    
    function getLocationsCount(address productId) public constant returns(uint) {
        return locationHistory[productId].length;
    }
    
    function getLocation(uint index, address productId) public constant returns(uint, string) {
        tracking[] memory trackingss = locationHistory[productId];
        return (trackingss[index].timeStamp, trackingss[index].location);
    }
    
}
