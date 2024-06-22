document.addEventListener("DOMContentLoaded", function() {

    const textarea = document.getElementById('inp-nume');

    const validateTextarea = () => {
        if (textarea.value.trim() === '') {
            textarea.classList.add('is-invalid');
        } else {
            textarea.classList.remove('is-invalid');
        }
    };

    textarea.addEventListener('input', validateTextarea);

    validateTextarea();

    //bonus 7
    function replaceDiacritics(text) {
        const diacriticsMap = {
            'ă': 'a', 'â': 'a', 'î': 'i', 'ș': 's', 'ț': 't',
            'Ă': 'A', 'Â': 'A', 'Î': 'I', 'Ș': 'S', 'Ț': 'T'
        };

        return text.replace(/[ăâîșțĂÂÎȘȚ]/g, match => diacriticsMap[match]);
    }
    //bonus 7

    //bonus 14
    function marcheazaCeleMaiIeftineProduse() {
        const produse = Array.from(document.getElementsByClassName("produs"));

        const categorii = {};

        produse.forEach(produs => {
            const pret = parseFloat(produs.querySelector(".info-produse p:nth-of-type(1) span").innerHTML);
            const categorie = produs.querySelector(".categorie span").innerHTML;

            if (!categorii[categorie] || pret < categorii[categorie].pret) {
                categorii[categorie] = { pret, produs };
            }
        });

        Object.values(categorii).forEach(({ produs }) => {
            const eticheta = document.createElement("div");
            eticheta.className = "eticheta-cel-mai-ieftin";
            eticheta.innerHTML = "Cel mai ieftin";
            produs.appendChild(eticheta);
        });
    }
    //bonus 14

    //bonus 15
    function updateProductCount() {
        const produse = document.getElementsByClassName("produs");
        const count = Array.from(produse).filter(produs => produs.style.display !== "none").length;
        document.getElementById("numar-produse").innerHTML = `Număr total de produse afișate: ${count}`;
    }
    //bonus 15

    //bonus 3
    function filtreazaProduse() {
        const inpNume = replaceDiacritics(document.getElementById("inp-nume").value.toLowerCase().trim());
        const inpDescriere = replaceDiacritics(document.getElementById("inp-descriere").value.toLowerCase().trim());
        const inpPret = parseInt(document.getElementById("inp-pret").value);
        const inpCategorie = document.getElementById("inp-categorie").value.toLowerCase().trim();
        const inpDiagonalaMin = parseInt(document.getElementById("inp-diagonala-min").value);
        const inpDiagonalaMax = parseInt(document.getElementById("inp-diagonala-max").value);
        const inpGarantie = document.getElementById("inp-garantie").checked;
        const inpCalitate = Array.from(document.querySelectorAll('input[name="calitate"]:checked')).map(checkbox => checkbox.value);
        const inpNoutati = document.getElementById("noutati").checked;

        const dateNoutati = new Date('2024-01-01');  // Data aleasă pentru noutăți

        const produse = document.getElementsByClassName("produs");
        let produseVizibile = 0;

        Array.from(produse).forEach(produs => {
            const valNume = replaceDiacritics(produs.querySelector(".nume a").innerHTML.toLowerCase().trim());
            const cond1 = valNume.startsWith(inpNume);  

            const valDescriere = replaceDiacritics(produs.querySelector(".descriere").innerHTML.toLowerCase().trim());
            const condDescriere = valDescriere.includes(inpDescriere);  

            const valPret = parseFloat(produs.querySelector(".info-produse p:nth-of-type(1) span").innerHTML);
            const cond2 = valPret >= inpPret;

            const valCategorie = produs.querySelector(".categorie span").innerHTML.toLowerCase().trim();
            const cond3 = inpCategorie === "toate" || inpCategorie === valCategorie;

            const valDiagonala = parseInt(produs.querySelector(".info-produse p:nth-of-type(2) span").innerHTML);
            const cond4 = valDiagonala >= inpDiagonalaMin && valDiagonala <= inpDiagonalaMax;

            const valGarantie = produs.querySelector(".info-produse p:nth-of-type(5) span").innerHTML === "Da";
            const cond5 = !inpGarantie || valGarantie;

            const valCalitate = produs.querySelector(".info-produse p:nth-of-type(3) span").innerHTML.split(", ").map(item => item.trim());
            const cond6 = inpCalitate.length === 0 || inpCalitate.some(cal => valCalitate.includes(cal));

            const valDataIntroducere = new Date(produs.querySelector(".info-produse time").getAttribute('datetime'));
            const condNoutati = !inpNoutati || valDataIntroducere > dateNoutati;

            if (cond1 && condDescriere && cond2 && cond3 && cond4 && cond5 && cond6 && condNoutati) {
                produs.style.display = "block";
                produseVizibile++;
            } else {
                produs.style.display = "none";
            }
        });

        const mesajFiltrare = document.getElementById("mesaj-filtrare");
        if (produseVizibile === 0) {
            if (!mesajFiltrare) {
                const newMesajFiltrare = document.createElement("p");
                newMesajFiltrare.id = "mesaj-filtrare";
                newMesajFiltrare.innerHTML = "Nu exista produse conform filtrării curente.";
                document.querySelector("#produse .grid-produse").appendChild(newMesajFiltrare);
            }
        } else if (mesajFiltrare) {
            mesajFiltrare.remove();
        }

        updateProductCount();
        marcheazaCeleMaiIeftineProduse();
        saveFilters();
    }
    //bonus 3

    function saveFilters() {
        if (document.getElementById("salveaza-filtrare").checked) {
            const filters = {
                nume: document.getElementById("inp-nume").value,
                descriere: document.getElementById("inp-descriere").value,
                pret: document.getElementById("inp-pret").value,
                categorie: document.getElementById("inp-categorie").value,
                diagonalaMin: document.getElementById("inp-diagonala-min").value,
                diagonalaMax: document.getElementById("inp-diagonala-max").value,
                garantie: document.getElementById("inp-garantie").checked,
                calitate: Array.from(document.querySelectorAll('input[name="calitate"]:checked')).map(cb => cb.value),
                noutati: document.getElementById("noutati").checked,
                salveazaFiltrare: document.getElementById("salveaza-filtrare").checked
            };
            localStorage.setItem("filters", JSON.stringify(filters));
        } else {
            localStorage.removeItem("filters");
        }
    }

    function loadFilters() {
        const savedFilters = JSON.parse(localStorage.getItem("filters"));
        if (savedFilters) {
            document.getElementById("inp-nume").value = savedFilters.nume;
            document.getElementById("inp-descriere").value = savedFilters.descriere;
            document.getElementById("inp-pret").value = savedFilters.pret;
            document.getElementById("infoRange").innerHTML = `(${savedFilters.pret})`;
            document.getElementById("inp-categorie").value = savedFilters.categorie;
            document.getElementById("inp-diagonala-min").value = savedFilters.diagonalaMin;
            document.getElementById("inp-diagonala-max").value = savedFilters.diagonalaMax;
            document.getElementById("inp-garantie").checked = savedFilters.garantie;
            savedFilters.calitate.forEach(value => {
                document.getElementById(`calitate-${value.toLowerCase()}`).checked = true;
            });
            document.getElementById("noutati").checked = savedFilters.noutati;
            document.getElementById("salveaza-filtrare").checked = savedFilters.salveazaFiltrare;
        }
    }

    //bonus 4
    // Adaugă evenimente de filtrare pentru fiecare input relevant
    document.getElementById("inp-nume").oninput = filtreazaProduse;
    document.getElementById("inp-descriere").oninput = filtreazaProduse;
    document.getElementById("inp-pret").onchange = function() {
        document.getElementById("infoRange").innerHTML = `(${this.value})`;
        filtreazaProduse();
    };
    document.getElementById("inp-categorie").onchange = filtreazaProduse;
    document.getElementById("inp-diagonala-min").oninput = filtreazaProduse;
    document.getElementById("inp-diagonala-max").oninput = filtreazaProduse;
    document.getElementById("inp-garantie").onchange = filtreazaProduse;
    document.querySelectorAll('input[name="calitate"]').forEach(cb => cb.onchange = filtreazaProduse);
    document.getElementById("noutati").onchange = filtreazaProduse;
    document.getElementById("salveaza-filtrare").onchange = saveFilters;
    //bonus 4

    document.getElementById("resetare").onclick = function() {
        if (confirm("Sigur doriți să resetați filtrele? Această acțiune va elimina toate filtrele și va afișa toate produsele.")) {
            document.getElementById("inp-nume").value = "";
            document.getElementById("inp-descriere").value = "";
            document.getElementById("inp-pret").value = document.getElementById("inp-pret").min;
            document.getElementById("infoRange").innerHTML = `(${document.getElementById("inp-pret").value})`;
            document.getElementById("inp-categorie").value = "toate";
            document.getElementById("inp-diagonala-min").value = document.getElementById("inp-diagonala-min").min;
            document.getElementById("inp-diagonala-max").value = document.getElementById("inp-diagonala-max").max;
            document.getElementById("inp-garantie").checked = false;
            document.querySelectorAll('input[name="calitate"]').forEach(cb => cb.checked = false);
            document.getElementById("noutati").checked = false;
            document.getElementById("salveaza-filtrare").checked = false;
            localStorage.removeItem("filters");

            const produse = document.getElementsByClassName("produs");
            Array.from(produse).forEach(produs => {
                produs.style.display = "block";
            });

            const mesajFiltrare = document.getElementById("mesaj-filtrare");
            if (mesajFiltrare) {
                mesajFiltrare.remove();
            }

            updateProductCount();
            marcheazaCeleMaiIeftineProduse();
        }
    };

    function sortareProduse(ascendent) {
        const produse = Array.from(document.getElementsByClassName("produs"));
        produse.sort((a, b) => {
            const pretA = parseFloat(a.querySelector(".info-produse p:nth-of-type(1) span").innerHTML);
            const pretB = parseFloat(b.querySelector(".info-produse p:nth-of-type(1) span").innerHTML);
            const numeA = replaceDiacritics(a.querySelector(".nume a").innerHTML.toLowerCase());
            const numeB = replaceDiacritics(b.querySelector(".nume a").innerHTML.toLowerCase());

            if (pretA === pretB) {
                return ascendent ? numeA.localeCompare(numeB) : numeB.localeCompare(numeA);
            }
            return ascendent ? pretA - pretB : pretB - pretA;
        });

        const container = document.querySelector(".grid-produse");
        produse.forEach(produs => container.appendChild(produs));

        container.style.display = "grid";
        container.style.gridTemplateColumns = "repeat(3, 1fr)";
        container.style.gap = "10px";

        updateProductCount();
        marcheazaCeleMaiIeftineProduse();
    }

    document.getElementById("sortCrescNume").onclick = function() {
        sortareProduse(true);
    };

    document.getElementById("sortDescrescNume").onclick = function() {
        sortareProduse(false);
    };

    document.getElementById("calculeaza").onclick = function() {
        let suma = 0;
        let numarElemente = 0;
        const produse = document.getElementsByClassName("produs");
        const preturi = [];

        Array.from(produse).forEach(produs => {
            if (getComputedStyle(produs).display !== "none") {
                const pret = parseFloat(produs.querySelector(".info-produse p:nth-of-type(1) span").innerHTML);
                suma += pret;
                numarElemente++;
                preturi.push(pret);
            }
        });

        const media = suma / numarElemente;
        const minim = Math.min(...preturi);
        const maxim = Math.max(...preturi);

        const rezultatDiv = document.createElement("div");
        rezultatDiv.style.position = "fixed";
        rezultatDiv.style.top = "50%";
        rezultatDiv.style.left = "50%";
        rezultatDiv.style.transform = "translate(-50%, -50%)";
        rezultatDiv.style.padding = "20px";
        rezultatDiv.style.background = "#fff";
        rezultatDiv.style.border = "2px solid #333";
        rezultatDiv.style.zIndex = "9999";
        rezultatDiv.innerHTML = `
            <p>Suma prețurilor: ${suma}</p>
            <p>Media prețurilor: ${media.toFixed(2)}</p>
            <p>Prețul minim: ${minim}</p>
            <p>Prețul maxim: ${maxim}</p>
        `;
        document.body.appendChild(rezultatDiv);

        setTimeout(() => {
            rezultatDiv.remove();
        }, 2000);
    };

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
            const produsElement = event.target.closest('.produs');
            const produs = {
                id: produsElement.id,
                nume: produsElement.querySelector('.nume a').innerText,
                specificatii: {
                    pret: produsElement.querySelector(".info-produse p:nth-of-type(1) span").innerText,
                    diagonala: produsElement.querySelector(".info-produse p:nth-of-type(2) span").innerText,
                    calitate: produsElement.querySelector(".info-produse p:nth-of-type(3) span").innerText,
                    garantie: produsElement.querySelector(".info-produse p:nth-of-type(5) span").innerText,
                    categorie: produsElement.querySelector(".categorie span").innerText
                }
            };
            adaugaLaComparare(produs);
        } else if (event.target.classList.contains('sterge-comparare')) {
            const index = parseInt(event.target.getAttribute('data-index'), 10);
            stergeDinComparare(index);
        } else if (event.target.id === 'afiseaza-comparare') {
            const url = "/comparare"; 
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

    // Adăugarea butoanelor de comparar e în pagină
    document.querySelectorAll('.produs').forEach(produsElement => {
        const butonCompara = document.createElement('button');
        butonCompara.className = 'buton-compara';
        butonCompara.innerText = 'Compară';
        produsElement.appendChild(butonCompara);
    });

    loadFilters();
    filtreazaProduse();
    updateProductCount();
    marcheazaCeleMaiIeftineProduse();
});
