pragma solidity ^0.4.12;


contract ProductEngine{
    
    // a smart contract for each Product
    
    string public productType;  // like car shoes
    string public brandName;
    string public model;
    string public rating;
    address public owner;
    
    modifier onlyOwner(){
        require(owner == msg.sender);
        _;
    }
    
   struct rawMaterial{
       address rawMaterialId;
       string rawMaterialType;
   }
   
   rawMaterial[] public rawMaterials;
    
    function ProductEngine (string _productType, string _brandnName, string _model, string _rating) public{
        productType = _productType;
        brandName  = _brandnName;
        model = _model;
        rating = _rating;
        owner = msg.sender;
    }
    
    function addRawMaterial(string rawProductType, address rawProductId) public onlyOwner {
        rawMaterial memory newRawMaterial;
        newRawMaterial.rawMaterialId = rawProductId;
        newRawMaterial.rawMaterialType = rawProductType;
        rawMaterials.push(newRawMaterial);
    }
    
    function getProductDetails() constant public returns(string _productType, string _brandnName, string _model, 
            string _rating){
        return (productType, brandName, model, rating);
        
    }
}
