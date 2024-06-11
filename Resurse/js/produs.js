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
});
