/*  <!-- ================= JAVASCRIPT ================= --> */
    
        // Seleccionamos todos los elementos que tengan la clase reveal
        const elements = document.querySelectorAll('.reveal');

        // Creamos un observer (detecta cuando algo entra en pantalla)
        const observer = new IntersectionObserver(function(entries) {

            // Recorremos cada elemento observado
            entries.forEach(function(entry) {

                // Si el elemento es visible en pantalla
                if (entry.isIntersecting) {

                    // Le agregamos la clase show para activar la animacion
                    entry.target.classList.add('show');
                }

            });

        }, {
            threshold: 0.15 // porcentaje visible para activar animacion
        });

        // Aplicamos el observer a todos los elementos
        elements.forEach(function(el) {
            observer.observe(el);
        });

