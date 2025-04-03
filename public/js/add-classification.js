function validateForm() {
    const input = document.getElementById("classification_name");
    const value = input.value;
    const regex = /^[A-Za-z]+$/;

    if (!regex.test(value)) {
        alert("Classification name must contain only letters.");
        return false;
    }

    return true;
}