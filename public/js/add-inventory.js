document.getElementById('inventoryForm').addEventListener('submit', function (event) {
    const make = document.getElementById('inv_make').value.trim();
    const model = document.getElementById('inv_model').value.trim();
    const description = document.getElementById('inv_description').value.trim();
    const price = document.getElementById('inv_price').value;
    const miles = document.getElementById('inv_miles').value;

    if (!make || !model || !description || price <= 0 || miles < 0) {
        alert("Please fill out all fields correctly.");
        event.preventDefault();
    }
});