document.addEventListener('DOMContentLoaded', function() {
    // Function to save the state of the accordion
    function saveAccordionState() {
        let accordionState = {};
        document.querySelectorAll('.accordion-collapse').forEach((element, index) => {
            accordionState[index] = element.classList.contains('show');
        });
        localStorage.setItem('accordionState', JSON.stringify(accordionState));
    }

    // Function to restore the state of the accordion
    function restoreAccordionState() {
        let accordionState = JSON.parse(localStorage.getItem('accordionState'));
        if (accordionState) {
            document.querySelectorAll('.accordion-collapse').forEach((element, index) => {
                if (accordionState[index]) {
                    element.classList.add('show');
                    const buttonElement = element.previousElementSibling.querySelector('.accordion-button');
                    if (buttonElement) {
                        buttonElement.classList.remove('collapsed');
                        buttonElement.setAttribute('aria-expanded', 'true');
                    }
                } else {
                    element.classList.remove('show');
                    const buttonElement = element.previousElementSibling.querySelector('.accordion-button');
                    if (buttonElement) {
                        buttonElement.classList.add('collapsed');
                        buttonElement.setAttribute('aria-expanded', 'false');
                    }
                }
            });
        }
    }

    // Restore accordion state on page load
    restoreAccordionState();

    // Save accordion state on toggle
    document.querySelectorAll('.accordion-collapse').forEach(element => {
        element.addEventListener('shown.bs.collapse', saveAccordionState);
        element.addEventListener('hidden.bs.collapse', saveAccordionState);
    });

    // Funcționalitatea de comparare produse
    let comparareProduse = JSON.parse(localStorage.getItem("comparareProduse")) || [];
    const containerComparare = document.createElement("div");
    containerComparare.id = "container-comparare";
    containerComparare.style.position = "fixed";
    containerComparare.style.bottom = "10px";
    containerComparare.style.right = "10px";
    containerComparare.style.background = "#fff";
    containerComparare.style.border = "1px solid #ccc";
    containerComparare.style.padding = "10px";
    containerComparare.style.zIndex = "1000";

    function updateComparareContainer() {
        containerComparare.innerHTML = comparareProduse.map((produs, index) => `
            <div>
                ${produs.nume}
                <button class="sterge-comparare" data-index="${index}">Șterge</button>
            </div>
        `).join('') + (comparareProduse.length == 2 ? '<button id="afiseaza-comparare">Afișează</button>' : '');

        if (comparareProduse.length > 0) {
            document.body.appendChild(containerComparare);
        } else if (containerComparare.parentNode) {
            containerComparare.parentNode.removeChild(containerComparare);
        }

        localStorage.setItem("comparareProduse", JSON.stringify(comparareProduse));
    }

    function adaugaLaComparare(produs) {
        if (comparareProduse.length < 2) {
            comparareProduse.push(produs);
            updateComparareContainer();
        }

        if (comparareProduse.length == 2) {
            document.querySelectorAll('.buton-compara').forEach(btn => {
                btn.disabled = true;
                btn.title = "ștergeți un produs din lista de comparare";
            });
        }
    }

    function stergeDinComparare(index) {
        comparareProduse.splice(index, 1);
        updateComparareContainer();

        if (comparareProduse.length < 2) {
            document.querySelectorAll('.buton-compara').forEach(btn => {
                btn.disabled = false;
                btn.title = "";
            });
        }
    }

    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('buton-compara')) {
            const produsElement = event.target.closest('.produs') || document.getElementById('art-produs');
            const produs = {
                id: produsElement.id,
                nume: produsElement.querySelector('.nume').innerText,
                specificatii: {
                    pret: produsElement.querySelector(".pret").innerText,
                    diagonala: produsElement.querySelector(".diagonala").innerText,
                    calitate: produsElement.querySelector(".calitate").innerText,
                    garantie: produsElement.querySelector(".garantie").innerText,
                    categorie: produsElement.querySelector(".categorie").innerText
                }
            };
            adaugaLaComparare(produs);
        } else if (event.target.classList.contains('sterge-comparare')) {
            const index = parseInt(event.target.getAttribute('data-index'), 10);
            stergeDinComparare(index);
        } else if (event.target.id === 'afiseaza-comparare') {
            const url = "/comparare"; // Actualizează URL-ul pentru a deschide pagina EJS
            const comparareData = comparareProduse.map(p => p.specificatii);
            const params = new URLSearchParams();
            params.set("data", JSON.stringify(comparareData));
            window.open(`${url}?${params.toString()}`);
        }
    });

    // Persistența containerului
    if (comparareProduse.length > 0) {
        updateComparareContainer();
    }

    // Adăugarea butoanelor de comparare în pagină
    document.querySelectorAll('.produs').forEach(produsElement => {
        const butonCompara = produsElement.querySelector('.buton-compara');
        if (!butonCompara) {
            const butonCompara = document.createElement('button');
            butonCompara.className = 'buton-compara';
            butonCompara.innerText = 'Compară';
            produsElement.appendChild(butonCompara);
        }
    });
});
