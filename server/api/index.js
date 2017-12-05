'use strict'


var express = require('express'),
	router = express.Router(),
	controller = require('./api.controller');


// routes
router.post('/updateLocation', controller.updateLocation);
router.post('/trackProduct', controller.trackProduct);
router.post('/getProductDetails', controller.getProductDetails);
router.post('/addRawMaterials', controller.addRawMaterials);
module.exports = router;
