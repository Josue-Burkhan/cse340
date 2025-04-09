const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const classificationValidation = require("../utilities/classification-validation");
const inventoryValidation = require("../utilities/inventory-validation");
const utilities = require("../utilities/");

/* ================================
   Inventory Views
================================ */

// Inventory update route
router.post(
   "/update/",
   inventoryValidation.inventoryRules,
   inventoryValidation.checkUpdateData,
   invController.updateInventory
)


/* ================================
   Public Routes
================================ */
// Inventory by classification
router.get("/type/:classificationId", invController.buildByClassificationId);

// Inventory detail by vehicle ID
router.get("/detail/:invId", invController.buildByInvId);

// Inventory management view
router.get("/",
   utilities.checkAccountType("Employee", "Admin"),
   invController.buildManagementView);

// Inventory JSON (for dynamic dropdowns)
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON));

// Edit view for a specific vehicle
router.get("/edit/:inv_id", utilities.handleErrors(invController.editInventoryView));


/* ================================
   Classification Routes
================================ */

router.get("/add-classification",
   utilities.checkAccountType("Employee", "Admin"),
   utilities.handleErrors(invController.buildAddClassification)
);
router.post("/add-classification",
   utilities.checkAccountType("Employee", "Admin"),
   utilities.handleErrors(invController.addClassification)
);
router.post("/delete-classification/:classificationId", invController.deleteClassification);


/* ================================
   Add Inventory Routes
================================ */

router.get("/add-inventory", invController.showAddInventory);

router.post(
   "/add-inventory",
   inventoryValidation.inventoryRules,
   inventoryValidation.checkInventoryData,
   invController.addInventory
);


module.exports = router;
