document.addEventListener('DOMContentLoaded', function() {
    function updateOffers() {
        fetch('/resurse/json/oferte.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log(data); // Adaugă acest log pentru a verifica datele
                if (!data.oferte || data.oferte.length === 0) {
                    throw new Error('No offers found in the JSON file.');
                }

                const now = new Date().getTime();
                const currentOffer = data.oferte[0];

                console.log('Current Offer:', currentOffer); // Debugging info

                const startTime = new Date(currentOffer['data-incepere']).getTime();
                const endTime = new Date(currentOffer['data-finalizare']).getTime();

                console.log('Now:', now, 'Start Time:', startTime, 'End Time:', endTime); // Debugging info

                if (now < startTime || now > endTime) {
                    document.getElementById('oferta-text').innerText = "Nicio ofertă disponibilă în acest moment.";
                    document.getElementById('timer').innerText = "";
                    return;
                }

                const ofertaText = `Reducere de ${currentOffer.reducere}% la produsele din categoria ${currentOffer.categorie} până la ${new Date(currentOffer['data-finalizare']).toLocaleString()}`;
                document.getElementById('oferta-text').innerText = ofertaText;
                
                const timer = document.getElementById('timer');

                function updateTimer() {
                    const now = new Date().getTime();
                    const distance = endTime - now;
                    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                    timer.innerText = `${hours}h ${minutes}m ${seconds}s`;

                    if (distance < 0) {
                        clearInterval(x);
                        timer.innerText = "Oferta a expirat";
                        // Refresh the offer
                        updateOffers();
                    } else if (distance < 10000) {
                        timer.style.color = "red";
                        // Optionally, add sound effect here
                    }
                }

                const x = setInterval(updateTimer, 1000);
                updateTimer();
            })
            .catch(error => console.error('Eroare la încărcarea ofertei:', error));
    }

    updateOffers();
    setInterval(updateOffers, 60000);
});
