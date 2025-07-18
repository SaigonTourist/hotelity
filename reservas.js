// Datos de habitaciones
const tiposHabitacion = [
    { id: 1, nombre: "Individual", descripcion: "1 cama individual - Hasta 1 huésped", precio: 80 },
    { id: 2, nombre: "Doble", descripcion: "1 cama doble - Hasta 2 huéspedes", precio: 120 },
    { id: 3, nombre: "Triple", descripcion: "1 cama doble + 1 individual - Hasta 3 huéspedes", precio: 160 },
    { id: 4, nombre: "Suite Familiar", descripcion: "2 camas dobles - Hasta 4 huéspedes", precio: 200 }
];

// Variables globales
let reservas = [];
let reservaActual = {};
let pasoActual = 1;
let calendario = null;
let fechasReservadas = [];

// Clase para crear objetos Reserva
class Reserva {
    constructor(id, tipoHabitacion, cantidadHuespedes, huespedes, fechaEntrada, fechaSalida, noches) {
        this.id = id;
        this.tipoHabitacion = tipoHabitacion;
        this.cantidadHuespedes = cantidadHuespedes;
        this.huespedes = huespedes;
        this.fechaEntrada = fechaEntrada;
        this.fechaSalida = fechaSalida;
        this.noches = noches;
        this.precioTotal = tipoHabitacion.precio * noches;
        this.fechaCreacion = new Date().toISOString();
    }

    calcularTotal() {
        return this.tipoHabitacion.precio * this.noches;
    }

    obtenerRangoFechas() {
        const fechas = [];
        const inicio = new Date(this.fechaEntrada);
        const fin = new Date(this.fechaSalida);
        
        for (let fecha = new Date(inicio); fecha < fin; fecha.setDate(fecha.getDate() + 1)) {
            fechas.push(fecha.toISOString().split('T')[0]);
        }
        return fechas;
    }
}

// Clase para crear objetos Huesped
class Huesped {
    constructor(nombre, apellido, nacionalidad, documento) {
        this.nombre = nombre;
        this.apellido = apellido;
        this.nacionalidad = nacionalidad;
        this.documento = documento;
    }

    obtenerNombreCompleto() {
        return `${this.nombre} ${this.apellido}`;
    }
}

// Funciones de localStorage
function guardarReservasEnStorage() {
    try {
        localStorage.setItem('hotel_reservas', JSON.stringify(reservas));
        actualizarFechasReservadas();
    } catch (error) {
        console.error('Error al guardar reservas:', error);
    }
}

function cargarReservasDesdeStorage() {
    try {
        const reservasJSON = localStorage.getItem('hotel_reservas');
        reservas = reservasJSON ? JSON.parse(reservasJSON) : [];
        actualizarFechasReservadas();
    } catch (error) {
        console.error('Error al cargar reservas:', error);
        reservas = [];
    }
}

function actualizarFechasReservadas() {
    fechasReservadas = [];
    for (const reserva of reservas) {
        const fechasReserva = new Reserva(
            reserva.id, 
            reserva.tipoHabitacion, 
            reserva.cantidadHuespedes, 
            reserva.huespedes, 
            reserva.fechaEntrada, 
            reserva.fechaSalida, 
            reserva.noches
        ).obtenerRangoFechas();
        fechasReservadas.push(...fechasReserva);
    }
}

// Funciones de navegación
function mostrarSeccion(seccionId) {
    const secciones = [
        'menu-principal', 'seccion-nueva-reserva', 'seccion-ver-reservas', 
        'seccion-ver-habitaciones', 'seccion-estadisticas'
    ];
    
    for (const seccion of secciones) {
        const elemento = document.getElementById(seccion);
        if (seccion === seccionId) {
            elemento.classList.remove('hidden');
        } else {
            elemento.classList.add('hidden');
        }
    }
}

function mostrarMenuPrincipal() {
    mostrarSeccion('menu-principal');
}

function mostrarPaso(numeroPaso) {
    const pasos = ['paso-habitacion', 'paso-huespedes', 'paso-fechas', 'paso-confirmacion'];
    
    for (const [index, paso] of pasos.entries()) {
        const elemento = document.getElementById(paso);
        if (index === numeroPaso - 1) {
            elemento.classList.remove('hidden');
        } else {
            elemento.classList.add('hidden');
        }
    }
}

function actualizarIndicadorPasos() {
    for (let i = 1; i <= 4; i++) {
        const step = document.getElementById(`step-${i}`);
        step.classList.remove('active', 'completed');
        
        if (i < pasoActual) {
            step.classList.add('completed');
        } else if (i === pasoActual) {
            step.classList.add('active');
        }
    }
}

// Funciones de reserva
function iniciarNuevaReserva() {
    reservaActual = {};
    pasoActual = 1;
    mostrarSeccion('seccion-nueva-reserva');
    cargarHabitaciones();
    actualizarIndicadorPasos();
    mostrarPaso(1);
}

function cargarHabitaciones() {
    const container = document.getElementById('habitaciones-container');
    container.innerHTML = '';

    for (const habitacion of tiposHabitacion) {
        const div = document.createElement('div');
        div.className = 'habitacion-card';
        div.dataset.habitacionId = habitacion.id;

        const h3 = document.createElement('h3');
        h3.textContent = habitacion.nombre;

        const p = document.createElement('p');
        p.textContent = habitacion.descripcion;

        const precio = document.createElement('div');
        precio.className = 'precio';
        precio.textContent = `$${habitacion.precio} /noche`;

        const boton = document.createElement('button');
        boton.className = 'btn btn-primary';
        boton.textContent = 'Seleccionar';
        boton.addEventListener('click', () => seleccionarHabitacion(habitacion.id));

        div.appendChild(h3);
        div.appendChild(p);
        div.appendChild(precio);
        div.appendChild(boton);

        container.appendChild(div);
    }
}

function seleccionarHabitacion(idHabitacion) {
    const habitacion = tiposHabitacion.find(h => h.id === idHabitacion);
    if (!habitacion) {
        mostrarAlerta('Habitación no encontrada', 'error');
        return;
    }

    reservaActual.tipoHabitacion = habitacion;

    const cards = document.querySelectorAll('.habitacion-card');
    for (const card of cards) {
        card.classList.remove('selected');
    }
    document.querySelector(`[data-habitacion-id="${idHabitacion}"]`).classList.add('selected');

    document.getElementById('btn-siguiente-huespedes').disabled = false;
    mostrarAlerta(`Habitación ${habitacion.nombre} seleccionada`, 'success');
}

function irAPasoHuespedes() {
    if (!reservaActual.tipoHabitacion) {
        mostrarAlerta('Debes seleccionar una habitación primero', 'error');
        return;
    }

    pasoActual = 2;
    mostrarPaso(2);
    configurarSelectorHuespedes();
    actualizarIndicadorPasos();
}

function configurarSelectorHuespedes() {
    const selector = document.getElementById('cantidad-huespedes');
    const maxHuespedes = reservaActual.tipoHabitacion.id;
    
    selector.innerHTML = '';
    
    const optionDefault = document.createElement('option');
    optionDefault.value = '';
    optionDefault.textContent = 'Seleccionar...';
    selector.appendChild(optionDefault);
    
    for (let i = 1; i <= maxHuespedes; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `${i} huésped${i > 1 ? 'es' : ''}`;
        selector.appendChild(option);
    }
}

function generarFormulariosHuespedes() {
    const cantidad = parseInt(document.getElementById('cantidad-huespedes').value);
    if (!cantidad) return;

    reservaActual.cantidadHuespedes = cantidad;
    const container = document.getElementById('huespedes-forms-container');
    container.innerHTML = '';

    for (let i = 1; i <= cantidad; i++) {
        const formHuesped = crearFormularioHuesped(i);
        container.appendChild(formHuesped);
    }

    configurarValidacionHuespedes();
}

function crearFormularioHuesped(numero) {
    const div = document.createElement('div');
    div.className = 'huesped-form';

    const h4 = document.createElement('h4');
    h4.textContent = `👤 Huésped ${numero}`;

    const formGroups = [
        { label: 'Nombre:', class: 'huesped-nombre' },
        { label: 'Apellido:', class: 'huesped-apellido' },
        { label: 'Nacionalidad:', class: 'huesped-nacionalidad' },
        { label: 'DNI/Pasaporte:', class: 'huesped-documento' }
    ];

    div.appendChild(h4);

    for (const group of formGroups) {
        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';

        const label = document.createElement('label');
        label.textContent = group.label;

        const input = document.createElement('input');
        input.type = 'text';
        input.className = group.class;
        input.dataset.huesped = numero;
        input.required = true;

        formGroup.appendChild(label);
        formGroup.appendChild(input);
        div.appendChild(formGroup);
    }

    return div;
}

function configurarValidacionHuespedes() {
    const inputs = document.querySelectorAll('#huespedes-forms-container input');
    for (const input of inputs) {
        input.addEventListener('input', validarDatosHuespedes);
    }
}

function validarDatosHuespedes() {
    const cantidad = reservaActual.cantidadHuespedes;
    let todosCompletos = true;

    for (let i = 1; i <= cantidad; i++) {
        const campos = ['nombre', 'apellido', 'nacionalidad', 'documento'];
        for (const campo of campos) {
            const input = document.querySelector(`.huesped-${campo}[data-huesped="${i}"]`);
            if (!input.value.trim()) {
                todosCompletos = false;
                break;
            }
        }
        if (!todosCompletos) break;
    }

    document.getElementById('btn-siguiente-fechas').disabled = !todosCompletos;
}

function recopilarDatosHuespedes() {
    const cantidad = reservaActual.cantidadHuespedes;
    const huespedes = [];

    for (let i = 1; i <= cantidad; i++) {
        const nombre = document.querySelector(`.huesped-nombre[data-huesped="${i}"]`).value.trim();
        const apellido = document.querySelector(`.huesped-apellido[data-huesped="${i}"]`).value.trim();
        const nacionalidad = document.querySelector(`.huesped-nacionalidad[data-huesped="${i}"]`).value.trim();
        const documento = document.querySelector(`.huesped-documento[data-huesped="${i}"]`).value.trim();

        const huesped = new Huesped(nombre, apellido, nacionalidad, documento);
        huespedes.push(huesped);
    }

    reservaActual.huespedes = huespedes;
    return true;
}

function irAPasoFechas() {
    if (!recopilarDatosHuespedes()) {
        mostrarAlerta('Completa todos los datos de los huéspedes', 'error');
        return;
    }

    pasoActual = 3;
    mostrarPaso(3);
    inicializarCalendarioSimple();
    actualizarIndicadorPasos();
}

function inicializarCalendarioSimple() {
    const container = document.getElementById('calendario-reserva');
    const hoy = new Date().toISOString().split('T')[0];
    
    container.innerHTML = '';

    const calendarioDiv = document.createElement('div');
    calendarioDiv.style.cssText = 'background: white; padding: 20px; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);';

    const titulo = document.createElement('h4');
    titulo.textContent = '📅 Selecciona las fechas';
    titulo.style.cssText = 'margin-bottom: 20px; text-align: center;';

    const gridDiv = document.createElement('div');
    gridDiv.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 20px;';

    const campos = [
        { label: 'Fecha de entrada:', id: 'fecha-entrada-simple' },
        { label: 'Fecha de salida:', id: 'fecha-salida-simple' }
    ];

    for (const campo of campos) {
        const div = document.createElement('div');

        const label = document.createElement('label');
        label.textContent = campo.label;
        label.style.cssText = 'display: block; margin-bottom: 8px; font-weight: bold;';

        const input = document.createElement('input');
        input.type = 'date';
        input.id = campo.id;
        input.min = hoy;
        input.style.cssText = 'width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;';

        div.appendChild(label);
        div.appendChild(input);
        gridDiv.appendChild(div);
    }

    calendarioDiv.appendChild(titulo);
    calendarioDiv.appendChild(gridDiv);
    container.appendChild(calendarioDiv);

    document.getElementById('fecha-entrada-simple').addEventListener('change', procesarFechasSimples);
    document.getElementById('fecha-salida-simple').addEventListener('change', procesarFechasSimples);

    bloquearFechasReservadas();
}

function bloquearFechasReservadas() {
    const fechaEntrada = document.getElementById('fecha-entrada-simple');
    const fechaSalida = document.getElementById('fecha-salida-simple');

    fechaEntrada.addEventListener('change', function() {
        const fechaSeleccionada = this.value;
        if (fechasReservadas.includes(fechaSeleccionada)) {
            mostrarAlerta('Esta fecha ya está reservada. Selecciona otra fecha.', 'error');
            this.value = '';
            return;
        }
        
        const siguienteDia = new Date(fechaSeleccionada);
        siguienteDia.setDate(siguienteDia.getDate() + 1);
        fechaSalida.min = siguienteDia.toISOString().split('T')[0];
    });

    fechaSalida.addEventListener('change', function() {
        const fechaSeleccionada = this.value;
        const fechaInicioValue = fechaEntrada.value;
        
        if (!fechaInicioValue) {
            mostrarAlerta('Primero selecciona la fecha de entrada', 'error');
            this.value = '';
            return;
        }

        const fechaInicio = new Date(fechaInicioValue);
        const fechaFin = new Date(fechaSeleccionada);
        
        for (let fecha = new Date(fechaInicio); fecha < fechaFin; fecha.setDate(fecha.getDate() + 1)) {
            const fechaString = fecha.toISOString().split('T')[0];
            if (fechasReservadas.includes(fechaString)) {
                mostrarAlerta('Hay fechas reservadas en este rango. Selecciona otras fechas.', 'error');
                this.value = '';
                return;
            }
        }
    });
}

function procesarFechasSimples() {
    const fechaEntrada = document.getElementById('fecha-entrada-simple').value;
    const fechaSalida = document.getElementById('fecha-salida-simple').value;
    
    if (fechaEntrada && fechaSalida) {
        const entrada = new Date(fechaEntrada);
        const salida = new Date(fechaSalida);
        
        if (salida <= entrada) {
            mostrarAlerta('La fecha de salida debe ser posterior a la entrada', 'error');
            document.getElementById('fecha-salida-simple').value = '';
            return;
        }
        
        const diferencia = salida - entrada;
        const noches = Math.ceil(diferencia / (1000 * 60 * 60 * 24));
        
        document.getElementById('fecha-entrada').value = formatearFechaInput(entrada);
        document.getElementById('fecha-salida').value = formatearFechaInput(salida);
        document.getElementById('noches').value = noches;
        
        reservaActual.fechaEntrada = fechaEntrada;
        reservaActual.fechaSalida = fechaSalida;
        reservaActual.noches = noches;
        
        document.getElementById('btn-siguiente-confirmacion').disabled = false;
        mostrarAlerta(`✅ ${noches} noche${noches > 1 ? 's' : ''} seleccionada${noches > 1 ? 's' : ''}`, 'success');
    }
}

function irAPasoConfirmacion() {
    if (!reservaActual.fechaEntrada || !reservaActual.fechaSalida) {
        mostrarAlerta('Completa las fechas de estadía', 'error');
        return;
    }

    pasoActual = 4;
    mostrarPaso(4);
    mostrarResumenReserva();
    actualizarIndicadorPasos();
}

function mostrarResumenReserva() {
    const container = document.getElementById('resumen-reserva');
    const precioTotal = reservaActual.tipoHabitacion.precio * reservaActual.noches;
    
    container.innerHTML = '';

    const titulo = document.createElement('h3');
    titulo.textContent = '📋 Resumen de tu reserva';

    const gridDiv = document.createElement('div');
    gridDiv.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;';

    const habitacionDiv = document.createElement('div');
    const h4Habitacion = document.createElement('h4');
    h4Habitacion.textContent = '🛏️ Habitación';
    
    const pNombre = document.createElement('p');
    const strongNombre = document.createElement('strong');
    strongNombre.textContent = reservaActual.tipoHabitacion.nombre;
    pNombre.appendChild(strongNombre);
    
    const pDescripcion = document.createElement('p');
    pDescripcion.textContent = reservaActual.tipoHabitacion.descripcion;
    
    const pPrecio = document.createElement('p');
    const strongPrecio = document.createElement('strong');
    strongPrecio.textContent = 'Precio por noche: ';
    pPrecio.appendChild(strongPrecio);
    pPrecio.appendChild(document.createTextNode(`$${reservaActual.tipoHabitacion.precio}`));

    habitacionDiv.appendChild(h4Habitacion);
    habitacionDiv.appendChild(pNombre);
    habitacionDiv.appendChild(pDescripcion);
    habitacionDiv.appendChild(pPrecio);

    const fechasDiv = document.createElement('div');
    const h4Fechas = document.createElement('h4');
    h4Fechas.textContent = '📅 Fechas';
    
    const pEntrada = document.createElement('p');
    const strongEntrada = document.createElement('strong');
    strongEntrada.textContent = 'Entrada: ';
    pEntrada.appendChild(strongEntrada);
    pEntrada.appendChild(document.createTextNode(formatearFecha(reservaActual.fechaEntrada)));
    
    const pSalida = document.createElement('p');
    const strongSalida = document.createElement('strong');
    strongSalida.textContent = 'Salida: ';
    pSalida.appendChild(strongSalida);
    pSalida.appendChild(document.createTextNode(formatearFecha(reservaActual.fechaSalida)));
    
    const pNoches = document.createElement('p');
    const strongNoches = document.createElement('strong');
    strongNoches.textContent = 'Noches: ';
    pNoches.appendChild(strongNoches);
    pNoches.appendChild(document.createTextNode(reservaActual.noches));

    fechasDiv.appendChild(h4Fechas);
    fechasDiv.appendChild(pEntrada);
    fechasDiv.appendChild(pSalida);
    fechasDiv.appendChild(pNoches);

    gridDiv.appendChild(habitacionDiv);
    gridDiv.appendChild(fechasDiv);

    const huespedesTotalDiv = document.createElement('div');
    const h4Huespedes = document.createElement('h4');
    h4Huespedes.textContent = `👥 Huéspedes (${reservaActual.cantidadHuespedes})`;
    
    const huespedesList = document.createElement('div');
    huespedesList.style.cssText = 'background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 10px;';

    for (const [index, huesped] of reservaActual.huespedes.entries()) {
        const huespedDiv = document.createElement('div');
        huespedDiv.style.cssText = 'padding: 8px 0; border-bottom: 1px solid #eee;';
        
        const strongHuesped = document.createElement('strong');
        strongHuesped.textContent = `${index + 1}. ${huesped.obtenerNombreCompleto()}`;
        
        const br = document.createElement('br');
        
        const smallInfo = document.createElement('small');
        smallInfo.textContent = `Nacionalidad: ${huesped.nacionalidad} | Documento: ${huesped.documento}`;
        
        huespedDiv.appendChild(strongHuesped);
        huespedDiv.appendChild(br);
        huespedDiv.appendChild(smallInfo);
        huespedesList.appendChild(huespedDiv);
    }

    huespedesTotalDiv.appendChild(h4Huespedes);
    huespedesTotalDiv.appendChild(huespedesList);

    const totalDiv = document.createElement('div');
    totalDiv.style.cssText = 'background: #e8f5e8; padding: 20px; border-radius: 10px; margin-top: 20px; text-align: center;';
    
    const h3Total = document.createElement('h3');
    h3Total.style.cssText = 'color: #27ae60; margin: 0;';
    h3Total.textContent = `💰 Total a Pagar: $${precioTotal}`;
    
    const pDetalle = document.createElement('p');
    pDetalle.style.cssText = 'margin: 5px 0 0 0; color: #666;';
    pDetalle.textContent = `${reservaActual.noches} noche${reservaActual.noches > 1 ? 's' : ''} × $${reservaActual.tipoHabitacion.precio}`;

    totalDiv.appendChild(h3Total);
    totalDiv.appendChild(pDetalle);

    container.appendChild(titulo);
    container.appendChild(gridDiv);
    container.appendChild(huespedesTotalDiv);
    container.appendChild(totalDiv);
}

function realizarReserva() {
    const nuevaReserva = new Reserva(
        reservas.length + 1,
        reservaActual.tipoHabitacion,
        reservaActual.cantidadHuespedes,
        reservaActual.huespedes,
        reservaActual.fechaEntrada,
        reservaActual.fechaSalida,
        reservaActual.noches
    );

    reservas.push(nuevaReserva);
    guardarReservasEnStorage();
    actualizarEstadisticas();

    mostrarAlerta(`✅ ¡Reserva #${nuevaReserva.id} confirmada exitosamente! Total: $${nuevaReserva.precioTotal}`, 'success');

    setTimeout(mostrarMenuPrincipal, 3000);
}

function mostrarReservas() {
    mostrarSeccion('seccion-ver-reservas');
    const container = document.getElementById('reservas-container');
    container.innerHTML = '';

    if (reservas.length === 0) {
        const divVacio = document.createElement('div');
        divVacio.style.cssText = 'text-align: center; padding: 40px; color: #666;';
        
        const h3 = document.createElement('h3');
        h3.textContent = '📋 No hay reservas registradas aún';
        
        const p = document.createElement('p');
        p.textContent = 'Las reservas que realices aparecerán aquí.';
        
        const botonVolver = document.createElement('button');
        botonVolver.className = 'btn btn-primary';
        botonVolver.textContent = '🏠 Volver al Inicio';
        botonVolver.addEventListener('click', mostrarMenuPrincipal);
        
        const botonNuevaReserva = document.createElement('button');
        botonNuevaReserva.className = 'btn btn-success';
        botonNuevaReserva.textContent = '✨ Hacer Primera Reserva';
        botonNuevaReserva.style.marginLeft = '10px';
        botonNuevaReserva.addEventListener('click', iniciarNuevaReserva);

        divVacio.appendChild(h3);
        divVacio.appendChild(p);
        divVacio.appendChild(botonVolver);
        divVacio.appendChild(botonNuevaReserva);
        container.appendChild(divVacio);
        return;
    }

    const botonVolverInicio = document.createElement('button');
    botonVolverInicio.className = 'btn btn-secondary';
    botonVolverInicio.textContent = '🏠 Volver al Inicio';
    botonVolverInicio.style.cssText = 'margin-bottom: 20px;';
    botonVolverInicio.addEventListener('click', mostrarMenuPrincipal);

    const botonVaciarTodo = document.createElement('button');
    botonVaciarTodo.className = 'btn btn-danger';
    botonVaciarTodo.textContent = '🗑️ Vaciar Todas las Reservas';
    botonVaciarTodo.style.cssText = 'margin-bottom: 20px; margin-left: 10px;';
    botonVaciarTodo.addEventListener('click', vaciarTodasLasReservas);

    container.appendChild(botonVolverInicio);
    container.appendChild(botonVaciarTodo);

    for (const reserva of reservas) {
        const reservaCard = crearTarjetaReserva(reserva);
        container.appendChild(reservaCard);
    }
}

function crearTarjetaReserva(reserva) {
    const div = document.createElement('div');
    div.className = 'reserva-card';

    const headerDiv = document.createElement('div');
    headerDiv.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;';

    const idDiv = document.createElement('div');
    idDiv.style.cssText = 'background: #3498db; color: white; padding: 5px 15px; border-radius: 20px; font-weight: bold;';
    idDiv.textContent = `Reserva #${reserva.id}`;

    const totalDiv = document.createElement('div');
    totalDiv.style.cssText = 'font-size: 1.3em; font-weight: bold; color: #27ae60;';
    totalDiv.textContent = `$${reserva.precioTotal}`;

    headerDiv.appendChild(idDiv);
    headerDiv.appendChild(totalDiv);

    const infoGrid = document.createElement('div');
    infoGrid.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin: 15px 0;';

    const habitacionInfo = document.createElement('div');
    const h4Habitacion = document.createElement('h4');
    h4Habitacion.textContent = '🛏️ Habitación';
    const pHabitacion = document.createElement('p');
    const strongHabitacion = document.createElement('strong');
    strongHabitacion.textContent = reserva.tipoHabitacion.nombre;
    pHabitacion.appendChild(strongHabitacion);
    const pDescHabitacion = document.createElement('p');
    pDescHabitacion.style.cssText = 'font-size: 0.9em; color: #666;';
    pDescHabitacion.textContent = reserva.tipoHabitacion.descripcion;

    habitacionInfo.appendChild(h4Habitacion);
    habitacionInfo.appendChild(pHabitacion);
    habitacionInfo.appendChild(pDescHabitacion);

    const fechasInfo = document.createElement('div');
    const h4Fechas = document.createElement('h4');
    h4Fechas.textContent = '📅 Fechas';
    const pEntrada = document.createElement('p');
    const strongEntrada = document.createElement('strong');
    strongEntrada.textContent = 'Entrada: ';
    pEntrada.appendChild(strongEntrada);
    pEntrada.appendChild(document.createTextNode(formatearFecha(reserva.fechaEntrada)));
    const pSalida = document.createElement('p');
    const strongSalida = document.createElement('strong');
    strongSalida.textContent = 'Salida: ';
    pSalida.appendChild(strongSalida);
    pSalida.appendChild(document.createTextNode(formatearFecha(reserva.fechaSalida)));
   const pNoches = document.createElement('p');
   const strongNoches = document.createElement('strong');
   strongNoches.textContent = 'Noches: ';
   pNoches.appendChild(strongNoches);
   pNoches.appendChild(document.createTextNode(reserva.noches));

   fechasInfo.appendChild(h4Fechas);
   fechasInfo.appendChild(pEntrada);
   fechasInfo.appendChild(pSalida);
   fechasInfo.appendChild(pNoches);

   const huespedInfo = document.createElement('div');
   const h4Huesped = document.createElement('h4');
   h4Huesped.textContent = '👥 Huéspedes';
   const pCantidad = document.createElement('p');
   const strongCantidad = document.createElement('strong');
   strongCantidad.textContent = 'Cantidad: ';
   pCantidad.appendChild(strongCantidad);
   pCantidad.appendChild(document.createTextNode(reserva.cantidadHuespedes));
   const pPrecio = document.createElement('p');
   const strongPrecio = document.createElement('strong');
   strongPrecio.textContent = 'Precio/noche: ';
   pPrecio.appendChild(strongPrecio);
   pPrecio.appendChild(document.createTextNode(`$${reserva.tipoHabitacion.precio}`));

   huespedInfo.appendChild(h4Huesped);
   huespedInfo.appendChild(pCantidad);
   huespedInfo.appendChild(pPrecio);

   infoGrid.appendChild(habitacionInfo);
   infoGrid.appendChild(fechasInfo);
   infoGrid.appendChild(huespedInfo);

   const huespedDataDiv = document.createElement('div');
   const h4HuespedData = document.createElement('h4');
   h4HuespedData.textContent = '📝 Datos de Huéspedes';
   
   const huespedesList = document.createElement('div');
   huespedesList.style.cssText = 'background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 10px;';

   for (const [index, huesped] of reserva.huespedes.entries()) {
       const huespedDiv = document.createElement('div');
       huespedDiv.style.cssText = 'padding: 8px 0; border-bottom: 1px solid #eee;';
       
       const strongNombre = document.createElement('strong');
       strongNombre.textContent = `${index + 1}. ${huesped.nombre} ${huesped.apellido}`;
       
       const br = document.createElement('br');
       
       const smallData = document.createElement('small');
       smallData.textContent = `${huesped.nacionalidad} - ${huesped.documento}`;
       
       huespedDiv.appendChild(strongNombre);
       huespedDiv.appendChild(br);
       huespedDiv.appendChild(smallData);
       huespedesList.appendChild(huespedDiv);
   }

   huespedDataDiv.appendChild(h4HuespedData);
   huespedDataDiv.appendChild(huespedesList);

   const botonesDiv = document.createElement('div');
   botonesDiv.style.cssText = 'margin-top: 15px; display: flex; gap: 10px; flex-wrap: wrap;';

   const botonEditar = document.createElement('button');
   botonEditar.className = 'btn btn-info';
   botonEditar.textContent = '✏️ Editar';
   botonEditar.addEventListener('click', () => editarReserva(reserva.id));

   const botonEliminar = document.createElement('button');
   botonEliminar.className = 'btn btn-danger';
   botonEliminar.textContent = '❌ Eliminar';
   botonEliminar.addEventListener('click', () => eliminarReserva(reserva.id));

   botonesDiv.appendChild(botonEditar);
   botonesDiv.appendChild(botonEliminar);

   const fechaCreacionDiv = document.createElement('div');
   fechaCreacionDiv.style.cssText = 'margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee; font-size: 0.9em; color: #666;';
   const strongFecha = document.createElement('strong');
   strongFecha.textContent = 'Fecha de reserva: ';
   fechaCreacionDiv.appendChild(strongFecha);
   fechaCreacionDiv.appendChild(document.createTextNode(formatearFechaCompleta(reserva.fechaCreacion)));

   div.appendChild(headerDiv);
   div.appendChild(infoGrid);
   div.appendChild(huespedDataDiv);
   div.appendChild(botonesDiv);
   div.appendChild(fechaCreacionDiv);

   return div;
}

function editarReserva(idReserva) {
   const reserva = reservas.find(r => r.id === idReserva);
   if (!reserva) {
       mostrarAlerta('Reserva no encontrada', 'error');
       return;
   }

   if (confirm(`¿Estás seguro de que quieres editar la reserva #${idReserva}?`)) {
       reservaActual = {
           id: reserva.id,
           tipoHabitacion: reserva.tipoHabitacion,
           cantidadHuespedes: reserva.cantidadHuespedes,
           huespedes: reserva.huespedes,
           fechaEntrada: reserva.fechaEntrada,
           fechaSalida: reserva.fechaSalida,
           noches: reserva.noches,
           editando: true
       };

       eliminarReserva(idReserva, false);
       pasoActual = 1;
       mostrarSeccion('seccion-nueva-reserva');
       cargarHabitaciones();
       actualizarIndicadorPasos();
       mostrarPaso(1);
       
       setTimeout(() => {
           seleccionarHabitacion(reserva.tipoHabitacion.id);
       }, 100);

       mostrarAlerta('Modo edición activado. Modifica los datos necesarios.', 'info');
   }
}

function eliminarReserva(idReserva, mostrarConfirmacion = true) {
   if (mostrarConfirmacion && !confirm(`¿Estás seguro de que quieres eliminar la reserva #${idReserva}?`)) {
       return;
   }

   const index = reservas.findIndex(r => r.id === idReserva);
   if (index !== -1) {
       reservas.splice(index, 1);
       guardarReservasEnStorage();
       actualizarEstadisticas();
       mostrarReservas();
       if (mostrarConfirmacion) {
           mostrarAlerta(`Reserva #${idReserva} eliminada correctamente`, 'success');
       }
   }
}

function vaciarTodasLasReservas() {
   if (reservas.length === 0) {
       mostrarAlerta('No hay reservas para eliminar', 'error');
       return;
   }

   if (confirm(`¿Estás seguro de que quieres eliminar TODAS las ${reservas.length} reservas? Esta acción no se puede deshacer.`)) {
       reservas = [];
       fechasReservadas = [];
       guardarReservasEnStorage();
       actualizarEstadisticas();
       mostrarReservas();
       mostrarAlerta('Todas las reservas han sido eliminadas', 'success');
   }
}

function mostrarInfo() {
   mostrarSeccion('seccion-ver-habitaciones');
   const container = document.getElementById('info-habitaciones-container');
   container.innerHTML = '';

   const botonVolver = document.createElement('button');
   botonVolver.className = 'btn btn-secondary';
   botonVolver.textContent = '🏠 Volver al Inicio';
   botonVolver.style.cssText = 'margin-bottom: 20px;';
   botonVolver.addEventListener('click', mostrarMenuPrincipal);
   container.appendChild(botonVolver);

   for (const habitacion of tiposHabitacion) {
       const infoCard = crearTarjetaInfoHabitacion(habitacion);
       container.appendChild(infoCard);
   }
}

function crearTarjetaInfoHabitacion(habitacion) {
   const div = document.createElement('div');
   div.className = 'habitacion-card';

   const reservasDeEsteTipo = reservas.filter(r => r.tipoHabitacion.id === habitacion.id);
   const totalReservado = reservasDeEsteTipo.length;
   const ingresosTotales = reservasDeEsteTipo.reduce((total, r) => total + r.precioTotal, 0);

   const h3 = document.createElement('h3');
   h3.textContent = habitacion.nombre;

   const p = document.createElement('p');
   p.textContent = habitacion.descripcion;

   const precio = document.createElement('div');
   precio.className = 'precio';
   precio.textContent = `$${habitacion.precio} /noche`;

   const statsDiv = document.createElement('div');
   statsDiv.style.cssText = 'margin-top: 15px; padding: 15px; background: #f8f9fa; border-radius: 8px;';

   const h4Stats = document.createElement('h4');
   h4Stats.textContent = '📊 Estadísticas';

   const pReservado = document.createElement('p');
   const strongReservado = document.createElement('strong');
   strongReservado.textContent = 'Veces reservada: ';
   pReservado.appendChild(strongReservado);
   pReservado.appendChild(document.createTextNode(totalReservado));

   const pMaxHuespedes = document.createElement('p');
   const strongMax = document.createElement('strong');
   strongMax.textContent = 'Máximo huéspedes: ';
   pMaxHuespedes.appendChild(strongMax);
   pMaxHuespedes.appendChild(document.createTextNode(habitacion.id));

   const pIngresos = document.createElement('p');
   const strongIngresos = document.createElement('strong');
   strongIngresos.textContent = 'Ingresos generados: ';
   pIngresos.appendChild(strongIngresos);
   pIngresos.appendChild(document.createTextNode(`$${ingresosTotales}`));

   statsDiv.appendChild(h4Stats);
   statsDiv.appendChild(pReservado);
   statsDiv.appendChild(pMaxHuespedes);
   statsDiv.appendChild(pIngresos);

   const boton = document.createElement('button');
   boton.className = 'btn btn-primary';
   boton.textContent = '🎯 Reservar Esta Habitación';
   boton.style.cssText = 'margin-top: 15px; width: 100%;';
   boton.addEventListener('click', iniciarNuevaReserva);

   div.appendChild(h3);
   div.appendChild(p);
   div.appendChild(precio);
   div.appendChild(statsDiv);
   div.appendChild(boton);

   return div;
}

function mostrarEstadisticas() {
   mostrarSeccion('seccion-estadisticas');
   const container = document.getElementById('estadisticas-container');
   container.innerHTML = '';

   const botonVolver = document.createElement('button');
   botonVolver.className = 'btn btn-secondary';
   botonVolver.textContent = '🏠 Volver al Inicio';
   botonVolver.style.cssText = 'margin-bottom: 20px;';
   botonVolver.addEventListener('click', mostrarMenuPrincipal);
   container.appendChild(botonVolver);

   const stats = calcularEstadisticasCompletas();

   const statsCard = document.createElement('div');
   statsCard.className = 'stats-card';

   const h3Stats = document.createElement('h3');
   h3Stats.textContent = '📈 Estadísticas Generales';

   const statsGrid = document.createElement('div');
   statsGrid.className = 'stats-grid';

   const estadisticas = [
       { numero: stats.totalReservas, texto: 'Total Reservas' },
       { numero: `$${stats.ingresosTotales}`, texto: 'Ingresos Totales' },
       { numero: stats.totalHuespedes, texto: 'Total Huéspedes' },
       { numero: stats.promedioNoches, texto: 'Promedio Noches' }
   ];

   for (const stat of estadisticas) {
       const statItem = document.createElement('div');
       statItem.className = 'stat-item';
       
       const statNumber = document.createElement('span');
       statNumber.className = 'stat-number';
       statNumber.textContent = stat.numero;
       
       const statText = document.createElement('span');
       statText.textContent = stat.texto;
       
       statItem.appendChild(statNumber);
       statItem.appendChild(statText);
       statsGrid.appendChild(statItem);
   }

   statsCard.appendChild(h3Stats);
   statsCard.appendChild(statsGrid);
   container.appendChild(statsCard);

   if (stats.totalReservas > 0) {
       const detailsGrid = document.createElement('div');
       detailsGrid.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;';

       const habitacionesCard = crearCardHabitacionesPopulares(stats.habitacionesPopulares);
       const nacionalidadesCard = crearCardNacionalidades(stats.nacionalidades);

       detailsGrid.appendChild(habitacionesCard);
       detailsGrid.appendChild(nacionalidadesCard);
       container.appendChild(detailsGrid);

       const ingresosCard = crearCardIngresosPorHabitacion(stats.ingresosTotales);
       container.appendChild(ingresosCard);
   }
}

function crearCardHabitacionesPopulares(habitacionesPopulares) {
   const card = document.createElement('div');
   card.style.cssText = 'background: white; padding: 25px; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);';

   const h4 = document.createElement('h4');
   h4.textContent = '🛏️ Habitaciones Más Reservadas';
   card.appendChild(h4);

   if (habitacionesPopulares.length === 0) {
       const p = document.createElement('p');
       p.textContent = 'No hay datos disponibles';
       card.appendChild(p);
   } else {
       for (const habitacion of habitacionesPopulares) {
           const div = document.createElement('div');
           div.style.cssText = 'display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;';
           
           const span1 = document.createElement('span');
           span1.textContent = habitacion.nombre;
           
           const strong = document.createElement('strong');
           strong.textContent = `${habitacion.reservas} reservas`;
           
           div.appendChild(span1);
           div.appendChild(strong);
           card.appendChild(div);
       }
   }

   return card;
}

function crearCardNacionalidades(nacionalidades) {
   const card = document.createElement('div');
   card.style.cssText = 'background: white; padding: 25px; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);';

   const h4 = document.createElement('h4');
   h4.textContent = '🌍 Nacionalidades de Huéspedes';
   card.appendChild(h4);

   if (nacionalidades.length === 0) {
       const p = document.createElement('p');
       p.textContent = 'No hay datos disponibles';
       card.appendChild(p);
   } else {
       const nacionalidadesLimitadas = nacionalidades.slice(0, 5);
       for (const nacionalidad of nacionalidadesLimitadas) {
           const div = document.createElement('div');
           div.style.cssText = 'display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;';
           
           const span1 = document.createElement('span');
           span1.textContent = nacionalidad.pais;
           
           const strong = document.createElement('strong');
           strong.textContent = `${nacionalidad.cantidad} huéspedes`;
           
           div.appendChild(span1);
           div.appendChild(strong);
           card.appendChild(div);
       }
   }

   return card;
}

function crearCardIngresosPorHabitacion(ingresosTotales) {
   const card = document.createElement('div');
   card.style.cssText = 'background: white; padding: 25px; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); margin-top: 20px;';

   const h4 = document.createElement('h4');
   h4.textContent = '📊 Ingresos por Tipo de Habitación';
   card.appendChild(h4);

   for (const habitacion of tiposHabitacion) {
       const ingresos = calcularIngresosPorHabitacion(habitacion.id);
       const porcentaje = ingresosTotales > 0 ? ((ingresos / ingresosTotales) * 100).toFixed(1) : 0;
       
       const containerDiv = document.createElement('div');
       containerDiv.style.cssText = 'margin: 15px 0;';
       
       const headerDiv = document.createElement('div');
       headerDiv.style.cssText = 'display: flex; justify-content: space-between; margin-bottom: 5px;';
       
       const spanNombre = document.createElement('span');
       spanNombre.textContent = habitacion.nombre;
       
       const strongIngresos = document.createElement('strong');
       strongIngresos.textContent = `$${ingresos} (${porcentaje}%)`;
       
       headerDiv.appendChild(spanNombre);
       headerDiv.appendChild(strongIngresos);
       
       const barraFondo = document.createElement('div');
       barraFondo.style.cssText = 'background: #ecf0f1; height: 8px; border-radius: 4px;';
       
       const barraRelleno = document.createElement('div');
       barraRelleno.style.cssText = `background: linear-gradient(45deg, #3498db, #2980b9); height: 100%; width: ${porcentaje}%; border-radius: 4px; transition: width 0.3s;`;
       
       barraFondo.appendChild(barraRelleno);
       containerDiv.appendChild(headerDiv);
       containerDiv.appendChild(barraFondo);
       card.appendChild(containerDiv);
   }

   return card;
}

// Funciones de navegación entre pasos
function irAPasoHabitacion() {
   pasoActual = 1;
   mostrarPaso(1);
   actualizarIndicadorPasos();
}

// Funciones auxiliares
function actualizarEstadisticas() {
   const totalReservas = reservas.length;
   const ingresosTotales = reservas.reduce((total, reserva) => total + reserva.precioTotal, 0);

   const elementoTotalReservas = document.getElementById('total-reservas');
   const elementoIngresosTotales = document.getElementById('ingresos-totales');
   
   if (elementoTotalReservas) elementoTotalReservas.textContent = totalReservas;
   if (elementoIngresosTotales) elementoIngresosTotales.textContent = `$${ingresosTotales}`;
}

function calcularEstadisticasCompletas() {
   const totalReservas = reservas.length;
   const ingresosTotales = reservas.reduce((total, reserva) => total + reserva.precioTotal, 0);
   const totalHuespedes = reservas.reduce((total, reserva) => total + reserva.cantidadHuespedes, 0);
   const promedioNoches = totalReservas > 0 ? 
       Math.round(reservas.reduce((total, reserva) => total + reserva.noches, 0) / totalReservas * 10) / 10 : 0;

   const habitacionesCount = {};
   for (const reserva of reservas) {
       const nombre = reserva.tipoHabitacion.nombre;
       habitacionesCount[nombre] = (habitacionesCount[nombre] || 0) + 1;
   }

   const habitacionesPopulares = Object.entries(habitacionesCount)
       .map(([nombre, reservas]) => ({ nombre, reservas }))
       .sort((a, b) => b.reservas - a.reservas);

   const nacionalidadesCount = {};
   for (const reserva of reservas) {
       for (const huesped of reserva.huespedes) {
           const pais = huesped.nacionalidad;
           nacionalidadesCount[pais] = (nacionalidadesCount[pais] || 0) + 1;
       }
   }

   const nacionalidades = Object.entries(nacionalidadesCount)
       .map(([pais, cantidad]) => ({ pais, cantidad }))
       .sort((a, b) => b.cantidad - a.cantidad);

   return {
       totalReservas,
       ingresosTotales,
       totalHuespedes,
       promedioNoches,
       habitacionesPopulares,
       nacionalidades
   };
}

function calcularIngresosPorHabitacion(idHabitacion) {
   return reservas
       .filter(reserva => reserva.tipoHabitacion.id === idHabitacion)
       .reduce((total, reserva) => total + reserva.precioTotal, 0);
}

function formatearFecha(fechaString) {
   const fecha = new Date(fechaString + 'T00:00:00');
   return fecha.toLocaleDateString('es-ES', {
       weekday: 'long',
       year: 'numeric',
       month: 'long',
       day: 'numeric'
   });
}

function formatearFechaInput(fecha) {
   return fecha.toLocaleDateString('es-ES', {
       weekday: 'long',
       year: 'numeric',
       month: 'long',
       day: 'numeric'
   });
}

function formatearFechaCompleta(fechaISO) {
   const fecha = new Date(fechaISO);
   return fecha.toLocaleDateString('es-ES', {
       weekday: 'long',
       year: 'numeric',
       month: 'long',
       day: 'numeric',
       hour: '2-digit',
       minute: '2-digit'
   });
}

function mostrarAlerta(mensaje, tipo) {
   const container = document.getElementById('alertas-container');
   const alerta = document.createElement('div');
   alerta.className = `alert alert-${tipo}`;
   alerta.textContent = mensaje;

   container.appendChild(alerta);

   setTimeout(() => {
       if (alerta.parentNode) {
           alerta.parentNode.removeChild(alerta);
       }
   }, 4000);

   alerta.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Inicialización del sistema
function inicializarSistema() {
   cargarReservasDesdeStorage();
   actualizarEstadisticas();
   mostrarMenuPrincipal();

   // Eventos del menú principal
   document.getElementById('btn-nueva-reserva').addEventListener('click', iniciarNuevaReserva);
   document.getElementById('btn-ver-reservas').addEventListener('click', mostrarReservas);
   document.getElementById('btn-ver-habitaciones').addEventListener('click', mostrarInfo);
   document.getElementById('btn-estadisticas').addEventListener('click', mostrarEstadisticas);

   // Eventos de navegación entre pasos
   document.getElementById('btn-siguiente-huespedes').addEventListener('click', irAPasoHuespedes);
   document.getElementById('btn-volver-habitacion').addEventListener('click', irAPasoHabitacion);
   document.getElementById('btn-siguiente-fechas').addEventListener('click', irAPasoFechas);
   document.getElementById('btn-volver-huespedes').addEventListener('click', irAPasoHuespedes);
   document.getElementById('btn-siguiente-confirmacion').addEventListener('click', irAPasoConfirmacion);
   document.getElementById('btn-volver-fechas').addEventListener('click', irAPasoFechas);
   document.getElementById('btn-confirmar-reserva').addEventListener('click', realizarReserva);

   // Eventos de formularios
   document.getElementById('cantidad-huespedes').addEventListener('change', generarFormulariosHuespedes);
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', inicializarSistema);