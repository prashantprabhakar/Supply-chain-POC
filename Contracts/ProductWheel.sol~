pragma solidity ^0.4.12;


contract ProductWheel{
    
    // a smart contract for each Product
    
    string public productType;  // like car shoes
    string public brandName;
    string public model;
    string public material;
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
    
    function ProductWheel (string _productType, string _brandnName, string _model, string _material) public{
        productType = _productType;
        brandName  = _brandnName;
        model = _model;
        material = _material;
        owner = msg.sender;
    }
    
    function addRawMaterial(string rawProductType, address rawProductId) public onlyOwner {
        rawMaterial memory newRawMaterial;
        newRawMaterial.rawMaterialId = rawProductId;
        newRawMaterial.rawMaterialType = rawProductType;
        rawMaterials.push(newRawMaterial);
    }
    
    function getProductDetails() constant public returns(string _productType, string _brandnName, string _model, 
            string _material){
        return (productType, brandName, model, material);
    }
    
    function getRawMaterialCount() constant public returns(uint count){
        return rawMaterials.length;
    }
}
