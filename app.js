const formulario = document.getElementById('formulario-rutina');
const listaRutinas = document.getElementById('lista-rutinas');
const filtroDia = document.getElementById('filtro-dia');

// Elementos de estadísticas actualizados para los 3 segmentos
const statTotal = document.getElementById('stat-total');
const barraTorso = document.getElementById('barra-torso');
const barraPierna = document.getElementById('barra-pierna');
const barraBrazos = document.getElementById('barra-brazos');
const txtTorso = document.getElementById('txt-torso');
const txtPierna = document.getElementById('txt-pierna');
const txtBrazos = document.getElementById('txt-brazos');

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

    actualizarEstadisticas();
}

function actualizarEstadisticas() {
    const total = rutinas.length;
    statTotal.textContent = total;

    if (total === 0) {
        barraTorso.style.width = '0%';
        barraPierna.style.width = '0%';
        barraBrazos.style.width = '0%';
        txtTorso.textContent = 'T: 0%';
        txtPierna.textContent = 'P: 0%';
        txtBrazos.textContent = 'B: 0%';
        listaRecords.innerHTML = '<li>No hay registros suficientes</li>';
        return;
    }

    // 1. Filtrar y contar cada categoría
    const totalTorso = rutinas.filter(r => r.tipo === 'Torso').length;
    const totalPierna = rutinas.filter(r => r.tipo === 'Pierna').length;
    const totalBrazos = rutinas.filter(r => r.tipo === 'Brazos').length;

    // Calcular porcentajes individuales matemáticos
    const porcentajeTorso = Math.round((totalTorso / total) * 100);
    const porcentajePierna = Math.round((totalPierna / total) * 100);
    const porcentajeBrazos = Math.round((totalBrazos / total) * 100);

    // Asignar los anchos de forma independiente a cada segmento de la barra flex
    barraTorso.style.width = `${porcentajeTorso}%`;
    barraPierna.style.width = `${porcentajePierna}%`;
    barraBrazos.style.width = `${porcentajeBrazos}%`;

    // Actualizar leyendas de texto
    txtTorso.textContent = `Torso: ${porcentajeTorso}%`;
    txtPierna.textContent = `Pierna: ${porcentajePierna}%`;
    txtBrazos.textContent = `Brazos: ${porcentajeBrazos}%`;

    // 2. Calcular Récords Personales
    const records = {};
    rutinas.forEach(rutina => {
        const nombreEj = rutina.ejercicio.trim().toLowerCase();
        const pesoNum = parseFloat(rutina.peso);

        if (!records[nombreEj] || pesoNum > records[nombreEj]) {
            records[nombreEj] = pesoNum;
        }
    });

    listaRecords.innerHTML = '';
    for (const ejercicio in records) {
        const liRecord = document.createElement('li');
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

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registro => console.log('Service Worker registrado:', registro))
            .catch(error => console.log('Error en Service Worker:', error));
    });
}

mostrarRutinas();
