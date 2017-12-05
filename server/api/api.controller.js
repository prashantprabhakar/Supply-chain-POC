'use strict'

var contract = require('../contracts/contractDetails');
var web3_extended = require('web3_extended');
var options = {
  //host : absolutePath,	
  host: ' http://localhost:8013',
  //host: '/home/psingh/.ethereum/geth.ipc',
  ipc : true,
  personal: true, 
  admin: false,
  debug: false
};

var web3 = web3_extended.create(options);

console.log(web3.isConnected());


var trackingContract = web3.eth.contract(contract.trackingContract.abi).at(contract.trackingContract.address);
var carContract = web3.eth.contract(contract.productCar.abi).at(contract.productCar.address);
// update Locations
exports.updateLocation = function(req, res){
	var productId = req.body.productId;
	var location = req.body.location;
	var from = req.body.from;
	var passphrase = req.body.passphrase;

	// check if location is invalid/null
	if(!location){
		res.json({"success":"false","message":"Inavlid location"});
		return res;
	}

	// check if product id is valid
	if(isAddress(productId) ==  false){
		res.json({"success":"false","message":"Inavlid productId"});
		return res;
	}

	if(!isAddress(from)){
		res.json({"success":"false","message":"Inavlid from address"});
		return res;
	}

	// estimate gas 
	var callData = trackingContract.updateLocation.getData(productId, location);
	var estimatedGas=checkThrow(from,callData,contract.trackingContract.address);
	if(!estimatedGas){
		console.log("Intrinsic gas low");
		res.json({"success":"false","message":"Intrinsic Gas too low"});
		return res;
	}
	var suppliedGas = estimatedGas + contract.additionalGas;
	var gasPrice = web3.eth.gasPrice.toNumber();
	// check balace of user
	var ethBalance=web3.eth.getBalance(from).toNumber();
	if(ethBalance <= (suppliedGas * gasPrice)){
		res.json({"success":"false","message":"Insufficient funds"});
		return res;
	}

	web3.personal.unlockAccount(from, passphrase,function(_err, _resp){
		if(_err){
			res.json({"success":"false","message":"Incorrect password"});
		}
		var tx = web3.eth.sendTransaction({from: from, to: contract.trackingContract.address, data: callData, gas: suppliedGas, gasPrice: gasPrice});				
		res.json({"success":"true", "data":[{"transactionHash":tx}]});
		return res;		
	});
}

// get history of a product
exports.trackProduct = function(req, res){
	var productId = req.body.productId;	
	// check if product id is valid
	if(!isAddress(productId)){
		res.json({"success":"false","message":"Inavlid product Id"});
		return res;
	}	

	/*var totalLocations = trackingContract.getLocationsCount().toNumber();	
	var locations = [];
	for(var i=0; i< totalLocations; i++){
		var tracking = {};
		var currentLocation = trackingContract.getLocation(i);
		// this also works good
		//var x = trackingContract.trackings(i);
		tracking.timeStamp = currentLocation[0].toNumber();
		tracking.location = currentLocation[1];
		locations.push(tracking);		
	}*/

	var count = trackingContract.getLocationsCount(productId).toNumber();
	var locations= [];
	for(var i=0; i< count; i++){
		var currentLocation = trackingContract.getLocation(i, productId);
		locations.push(currentLocation);
	}

	return res.json({"success": true, data: locations});
}

exports.addRawMaterials = function(req, res){
	var rawProductType = req.body.rawProductType;
	var rawProductId = req.body.rawProductId;
	var from = req.body.from;
	var passphrase = req.body.passphrase;
	var parentProductType = req.body.parentProductType;
	var parentProductId = req.body.parentProductId;

	// check for valid addresses
	if(!isAddress(from)){
		return res.json({"success":"false","message":"Invalid sender's address"});
	}

	if(!isAddress(rawProductId) || !isAddress(parentProductId)){
		return res.json({"success":"false","message":"Inavlid product id"});
	}

	var selectedContract = selectContract(parentProductType, parentProductId);
	if(!selectedContract){
		return res.json({"success":"false","message":"Invalid product type"});
	}

	var testcontract = web3.eth.contract(contract[selectedContract].abi).at(parentProductId);

	// estimate gas 
	var callData = testcontract.addRawMaterial.getData(rawProductType, rawProductId);
	var estimatedGas=checkThrow(from,callData,parentProductId);
	if(!estimatedGas){
		console.log("Intrinsic gas low");
		res.json({"success":"false","message":"Intrinsic Gas too low"});
		return res;
	}
	var suppliedGas = estimatedGas + contract.additionalGas;
	var gasPrice = web3.eth.gasPrice.toNumber();
	// check balace of user
	var ethBalance=web3.eth.getBalance(from).toNumber();
	if(ethBalance <= (suppliedGas * gasPrice)){
		res.json({"success":"false","message":"Insufficient funds"});
		return res;
	}

	web3.personal.unlockAccount(from, passphrase,function(_err, _resp){
		if(_err){
			res.json({"success":"false","message":"Incorrect password"});
		}
		var tx = web3.eth.sendTransaction({from: from, to: parentProductId, data: callData, gas: suppliedGas, gasPrice: gasPrice});				
		res.json({"success":"true", "data":[{"transactionHash":tx}]});
		return res;		
	});
}


exports.getProductDetails = function(req, res){
	var productId = req.body.productId;	
	var productType = req.body.productType;
	if(!productId || !productType){
		return res.json({'success': false, 'message': 'Missing params'});
	}
	productType = productType.toLowerCase();
	var testcontract;
	switch(productType){
		case "car":
			testcontract = web3.eth.contract(contract.productCar.abi).at(productId);
			var properties = contract.productCar.properties;
			break;
		case "wheel":
			testcontract = web3.eth.contract(contract.productWheel.abi).at(productId);
			var properties = contract.productWheel.properties;
			break;
		case "engine":
			testcontract = web3.eth.contract(contract.productEngine.abi).at(productId);
			var properties = contract.productEngine.properties;
			break;
		default:
			return res.json({'success': false, 'message': 'Incorrect product type'});
	}

	var result = testcontract.getProductDetails();
	var obj ={};
	for (var i=0; i< result.length; i++){
		var prop = properties[i];
		obj[prop] = result[i];
	}

	// get Raw Materils
	var count = testcontract.getRawMaterialCount().toNumber();	
	//var rawMaterialCount = testcontract.rawMaterials().length;
	var rawMaterials = [];
	for(var i=0; i< count; i++){
		var rawMaterial = {};
		var rm = testcontract.rawMaterials(i);		
		rawMaterial.type = rm[1];
		rawMaterial.id = rm[0];
		rawMaterials.push(rawMaterial);
	}

	obj['rawMaterial'] = rawMaterials;
	return res.json({"success": true, data:obj});
}


var isAddress = function (address) {
	// function isAddress(address) {
		if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
        // check if it has the basic requirements of an address
        return false;
    } else if (/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)) {
        // If it's all small caps or all all caps, return "true
        return true;
    } else {
        // Otherwise check each case
        return isChecksumAddress(address);
    }
}

var isChecksumAddress = function (address) {
    // Check each case
    address = address.replace('0x','');
    var addressHash = web3.sha3(address.toLowerCase());
    for (var i = 0; i < 40; i++ ) {
        // the nth letter should be uppercase if the nth digit of casemap is 1
        if ((parseInt(addressHash[i], 16) > 7 && address[i].toUpperCase() !== address[i]) || (parseInt(addressHash[i], 16) <= 7 && address[i].toLowerCase() !== address[i])) {
        	return false;
        }
    }
    return true;
}

// function checks if contract function executes properly or throws
function checkThrow(frm,callData, contractAddress){
	var estimatedGas=web3.eth.estimateGas({from:frm,to:contractAddress,data:callData});
	console.log(estimatedGas);
	if(estimatedGas>=50000000){
		//alert("intrinsic gas too low");
		return false;
	}

	else return estimatedGas;
}


// select smart contract depending on type of product
function selectContract(productType, productId){
	switch(productType){
		case "car":
			return 'productCar';			
			break;
		case "wheel":
			return 'productWheel';			
			break;
		case "engine":
			return 'productEngine';			
			break;
		default:
			return null;
	}
}

