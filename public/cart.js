const payBtn = document.querySelector('.btn-buy');

payBtn.addEventListener('click', () => {
    console.log("Button clicked, starting fetch...");

    // Show loading indicator
    payBtn.innerText = "Processing...";
    payBtn.disabled = true;

    fetch("/stripe-checkout", {
        method: 'POST',
        headers: new Headers({'Content-Type': 'application/json'}),
        body: JSON.stringify({
            items: JSON.parse(localStorage.getItem('cartItems')),
        }),
    })
    .then((res) => {
        if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
    })
    .then((data) => {
        console.log("Redirecting to:", data.url);
        location.href = data.url;    
    })
    .catch((err) => {
        console.error("Fetch error:", err);
        alert("There was an error processing your payment. Please try again.");
    })
    .finally(() => {
        // Reset button state
        payBtn.innerText = "Pay Now";
        payBtn.disabled = false;
    });
});

