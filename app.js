const formulario = document.getElementById('formulario-rutina');
const listaRutinas = document.getElementById('lista-rutinas');
const filtroDia = document.getElementById('filtro-dia');

// Elementos de estadísticas
const statTotal = document.getElementById('stat-total');
const barraTorsoPierna = document.getElementById('barra-torso-pierna');
const txtTorso = document.getElementById('txt-torso');
const txtPierna = document.getElementById('txt-pierna');
const listaRecords = document.getElementById('lista-records');

let rutinas = JSON.parse(localStorage.getItem('misRutinas')) || [];
const ordenDias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

function mostrarRutinas() {
    listaRutinas.innerHTML = '';
    const diaSeleccionado = filtroDia.value;

    let rutinasFiltradas = rutinas;
    if (diaSeleccionado !== 'Todos') {
        rutinasFiltradas = rutinas.filter(rutina => rutina.dia === diaSeleccionado);
    }

    rutinasFiltradas.sort((a, b) => ordenDias.indexOf(a.dia) - ordenDias.indexOf(b.dia));

    rutinasFiltradas.forEach(function(rutina) {
        const nuevoRegistro = document.createElement('li');
        
        const textoNode = document.createElement('span');
        textoNode.textContent = `[${rutina.dia} - ${rutina.tipo}] ${rutina.ejercicio} - ${rutina.peso}kg`;
        
        const botonEliminar = document.createElement('button');
        botonEliminar.textContent = '✕';
        botonEliminar.classList.add('btn-eliminar');
        
        botonEliminar.addEventListener('click', function() {
            eliminarRutina(rutina.id);
        });

        nuevoRegistro.appendChild(textoNode);
        nuevoRegistro.appendChild(botonEliminar);
        listaRutinas.appendChild(nuevoRegistro);
    });

    // CADA VEZ QUE SE MUESTRAN LAS RUTINAS, RECALCULAMOS LAS ESTADÍSTICAS
    actualizarEstadisticas();
}

function actualizarEstadisticas() {
    const total = rutinas.length;
    statTotal.textContent = total;

    if (total === 0) {
        barraTorsoPierna.style.width = '50%';
        txtTorso.textContent = 'T: 0%';
        txtPierna.textContent = 'P: 0%';
        listaRecords.innerHTML = '<li>No hay registros suficientes</li>';
        return;
    }

    // 1. Calcular distribución Torso / Pierna
    const totalTorso = rutinas.filter(r => r.tipo === 'Torso').length;
    const porcentajeTorso = Math.round((totalTorso / total) * 100);
    const porcentajePierna = 100 - porcentajeTorso;

    // Modificamos el CSS dinámicamente desde JS
    barraTorsoPierna.style.width = `${porcentajeTorso}%`;
    txtTorso.textContent = `Torso: ${porcentajeTorso}%`;
    txtPierna.textContent = `Pierna: ${porcentajePierna}%`;

    // 2. Calcular Récords Personales (Peso Máximo por Ejercicio)
    const records = {};
    
    rutinas.forEach(rutina => {
        // Convertimos el nombre a minúsculas para evitar duplicados por errores de dedo (ej: "Prensa" vs "prensa")
        const nombreEj = rutina.ejercicio.trim().toLowerCase();
        const pesoNum = parseFloat(rutina.peso);

        if (!records[nombreEj] || pesoNum > records[nombreEj]) {
            records[nombreEj] = pesoNum;
        }
    });

    // Limpiar lista de récords e imprimirlos
    listaRecords.innerHTML = '';
    for (const ejercicio in records) {
        const liRecord = document.createElement('li');
        // Capitalizamos la primera letra para que se vea estético
        const nombreFormateado = ejercicio.charAt(0).toUpperCase() + ejercicio.slice(1);
        liRecord.textContent = `${nombreFormateado}: ${records[ejercicio]} kg`;
        listaRecords.appendChild(liRecord);
    }
}

function eliminarRutina(idAImborrar) {
    rutinas = rutinas.filter(rutina => rutina.id !== idAImborrar);
    localStorage.setItem('misRutinas', JSON.stringify(rutinas));
    mostrarRutinas();
}

formulario.addEventListener('submit', function(evento) {
    evento.preventDefault();

    const dia = document.getElementById('dia-semana').value;
    const tipo = document.getElementById('tipo-rutina').value;
    const ejercicio = document.getElementById('ejercicio').value;
    const peso = document.getElementById('peso').value;

    const nuevaRutina = {
        id: Date.now(),
        dia: dia,
        tipo: tipo,
        ejercicio: ejercicio,
        peso: peso
    };

    rutinas.push(nuevaRutina);
    localStorage.setItem('misRutinas', JSON.stringify(rutinas));
    
    filtroDia.value = dia;
    mostrarRutinas();
    formulario.reset();
});

filtroDia.addEventListener('change', mostrarRutinas);
mostrarRutinas();
// 6. Registrar el Service Worker para convertirla en PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registro => {
                console.log('Service Worker registrado con éxito:', registro);
            })
            .catch(error => {
                console.log('Error al registrar el Service Worker:', error);
            });
    });
}
