'use strict';

angular.module('myApp.dashboard', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/dashboard', {
    templateUrl: 'dashboard/dashboard.html',
    controller: 'dashboardCtrl'
  });
}])

.controller('dashboardCtrl',function($scope, $http, $timeout,$uibModal, $uibModalStack) {
	
    $scope.showLocations = false;
    // track a product
    $scope.trackProduct = function(productId){  
        var data = JSON.stringify({productId:productId});
        var config = {
            headers: {               
                'Content-Type': 'application/json'
            }
        };
        $http.post('http://localhost:7000/eth/trackProduct', data,config)
            .then(function successCallback(resp){
                    console.log(resp.data);
                    if(resp.data.success){
                        // we'll get array of timeStamp and location
                        var resp = resp.data.data;
                        var length = resp.length;
                        console.log(length);
                        $scope.locations =resp;
                        $scope.showLocations = true;
                        $timeout(function(){
                            $scope.showLocations = false;
                        }, 10000);
                        }
                    }, 
                function failureCallback(){
                    console.log('failure');
                });           
    }

   
	// updating product Location 
    $scope.updateProductLocation = function(updateLocation){   
        var data = JSON.stringify({
            productId: updateLocation.productId,
            location: updateLocation.location,
            from: updateLocation.from,
            passphrase: updateLocation.passphrase
        });
        var config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };
        $http.post('http://localhost:7000/eth/updateLocation', data, config)
            .then(function successCallback(resp){
                console.log(resp);
                if(resp.data.success){
                    $scope.transactionHash = resp.data.data[0].transactionHash;
                    alert('Transaction send successfully. Tx hash = '+$scope.transactionHash);
                    $scope.closeAllPopup();                    
                }                
                else{
                    alert('Error: '+resp.data.data[0].message);
                }             
            }, function errorCallback(resp){
                console.log('error');
            });         
    }

	// adding Raw material to a product
    $scope.addRawMaterial = function(addRawMaterial){
        var data = JSON.stringify({
            rawProductType: addRawMaterial.rpType,           
            rawProductId : addRawMaterial.rpId,
            from : addRawMaterial.from,
            passphrase : addRawMaterial.passphrase,
            parentProductType : addRawMaterial.ppType,
            parentProductId : addRawMaterial.ppid
        });
        var config = {
            headers:{
                'Content-Type' : 'application/json'
            }
        };
        $http.post('http://localhost:7000/eth/addRawMaterials',data, config)
            .then(function successCallback(resp){
                console.log(resp);
                if(resp.data.success){
                    $scope.transactionHash = resp.data.data[0].transactionHash;            
                    alert('Transaction send successfully. Tx hash = '+$scope.transactionHash); 
                }                
                else{
                    alert('Error: '+resp.data.data[0].message);
                }                   
            },
            function errorCallback(err){
                console.log("Error in getting data from server :"+JSON.stringify(err));
            });
    }

	//get product details
    $scope.getProductDetails = function(productDetails){
        $scope.currentPoductDetails = '';
        var data= JSON.stringify({
            productId : productDetails.productId,
            productType:  productDetails.type
        }); 
        var config = {
            headers:{
                'Content-Type' : 'application/json'
            }
        };
        $http.post('http://localhost:7000/eth/getProductDetails',data, config)
            .then(function successCallback(resp){
                console.log(resp);
                if(resp.data.success){
                    resp = resp.data.data;
                    $scope.currentPoductDetails = resp;
                    console.log(resp);
                }                
                else{
                    alert('Error: '+resp.data.message);
                }                    
            },
            function errorCallback(err){
                console.log("Error in getting data from server :"+JSON.stringify(err));
            }); 
    }

});