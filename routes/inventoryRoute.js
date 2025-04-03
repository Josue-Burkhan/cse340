const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const classificationValidation = require("../utilities/classification-validation");
const inventoryValidation = require("../utilities/inventory-validation");
const utilities = require("../utilities/");

router.get("/type/:classificationId", invController.buildByClassificationId);
router.get("/detail/:invId", invController.buildByInvId);

///inv/
router.get("/", (req, res) => {
    res.render("inventory/management", {
        message: req.flash("message"),
        title: "Inventory Management",
    });
});

// Add classification
router.get("/add-classification", invController.showAddClassification);
router.post("/add-classification", classificationValidation, invController.addClassification);
router.post("/delete-classification/:classificationId", invController.deleteClassification);


// Add inventory
router.get("/add-inventory", async (req, res) => {
    const classificationList = await utilities.buildClassificationList();
    res.render("inventory/add-inventory", {
        message: req.flash("message"),
        title: "Add New Vehicle",
        classificationList,
        vehicle_make: '',
        vehicle_model: '',
        vehicle_year: '',
        vehicle_price: '',
        classification_id: ''
    });
});

router.post("/add-inventory", inventoryValidation, invController.addInventory);

module.exports = router;
