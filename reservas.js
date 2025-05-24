// Tipos de habitaciones disponibles
const tiposHabitacion = [
    { id: 1, nombre: "Individual", descripcion: "1 cama individual - Hasta 1 huésped", precio: 80 },
    { id: 2, nombre: "Doble", descripcion: "1 cama doble - Hasta 2 huéspedes", precio: 120 },
    { id: 3, nombre: "Triple", descripcion: "1 cama doble + 1 individual - Hasta 3 huéspedes", precio: 160 },
    { id: 4, nombre: "Suite Familiar", descripcion: "2 camas dobles - Hasta 4 huéspedes", precio: 200 }
];

// Almacensdo de reservas
let reservas = [];

function mostrarInfo() {
    let info = "🏨 TIPOS DE HABITACINES DISPONIBLES:\n\n";
    tiposHabitacion.forEach(habitacion => {
        info += `${habitacion.id}. ${habitacion.nombre}\n`;
        info += `   ${habitacion.descripcion}\n`;
        info += `   Precio: ${habitacion.precio} por noche\n\n`;
    });
    alert(info);
}

function iniciarSistema() {
    let continuar = true;
    
    while (continuar) {
        let opcion = mostrarMenuPrincipal();
        
        switch (opcion) {
            case 1:
                realizarReserva();
                break;
            case 2:
                mostrarReservas();
                break;
            case 3:
                mostrarInfo();
                break;
            case 4:
                alert("¡Gracias por usar nuestro sistema de reservas!");
                continuar = false;
                break;
            default:
                alert("Opción no válida. Por favor, selecciona una opción del 1 al 4.");
        }
    }
}

function mostrarMenuPrincipal() {
    let menu = "🏨 SISTEMA DE RESERVAS DE HOTEL\n\n";
    menu += "Selecciona una opción:\n\n";
    menu += "1. Realizar nueva reserva\n";
    menu += "2. Ver reservas realizadas\n";
    menu += "3. Ver tipos de habitaciones\n";
    menu += "4. Salir\n\n";
    menu += "Ingresa el número de tu opción:";
    
    let opcion = prompt(menu);
    return parseInt(opcion);
}

function realizarReserva() {
    alert("🎉 ¡Iniciemos tu reserva!");
    
    // Seleccionar tipo de habitación
    let tipoHabitacion = seleccionarHabitacion();
    if (!tipoHabitacion) return;
    
    // Ingresar cantidad de huéspedes
    let cantidadHuespedes = ingresarCantidadHuespedes(tipoHabitacion);
    if (!cantidadHuespedes) return;
    
    // Recopilar datos de huéspedes
    let huespedes = recopilarDatosHuespedes(cantidadHuespedes);
    if (!huespedes) return;
    
    // Fechas de estadía
    let fechas = ingresarFechas();
    if (!fechas) return;
    
    // Crear reserva
    let reserva = {
        id: reservas.length + 1,
        tipoHabitacion: tipoHabitacion,
        cantidadHuespedes: cantidadHuespedes,
        huespedes: huespedes,
        fechaEntrada: fechas.entrada,
        fechaSalida: fechas.salida,
        noches: fechas.noches,
        precioTotal: tipoHabitacion.precio * fechas.noches
    };
    
    reservas.push(reserva);
    mostrarResumenReserva(reserva);
}

function seleccionarHabitacion() {
    let menu = "🛏️ SELECCIONAR TIPO DE HABITACIÓN\n\n";
    tiposHabitacion.forEach(habitacion => {
        menu += `${habitacion.id}. ${habitacion.nombre}\n`;
        menu += `   ${habitacion.descripcion}\n`;
        menu += `   ${habitacion.precio} por noche\n\n`;
    });
    menu += "Selecciona el número de habitación (1-4):";
    
    let opcion = prompt(menu);
    let seleccion = parseInt(opcion);
    
    if (seleccion >= 1 && seleccion <= 4) {
        return tiposHabitacion[seleccion - 1];
    } else {
        alert("Selección no válida.");
        return null;
    }
}

function ingresarCantidadHuespedes(tipoHabitacion) {
    let maxHuespedes = tipoHabitacion.id; // Cada tipo permite tantos huéspedes como su ID
    let mensaje = `👥 CANTIDAD DE HUÉSPEDES\n\n`;
    mensaje += `Habitación seleccionada: ${tipoHabitacion.nombre}\n`;
    mensaje += `Máximo permitido: ${maxHuespedes} huésped(es)\n\n`;
    mensaje += `¿Cuántos huéspedes se hospedarán? (1-${maxHuespedes}):`;
    
    let cantidad = prompt(mensaje);
    let num = parseInt(cantidad);
    
    if (num >= 1 && num <= maxHuespedes) {
        return num;
    } else {
        alert(`Por favor, ingresa un número entre 1 y ${maxHuespedes}.`);
        return null;
    }
}

function recopilarDatosHuespedes(cantidad) {
    let huespedes = [];
    
    for (let i = 1; i <= cantidad; i++) {
        alert(`📝 Ingresando datos del huésped ${i} de ${cantidad}`);
        
        let nombre = prompt(`Nombre del huésped ${i}:`);
        if (!nombre) {
            alert("El nombre es obligatorio.");
            return null;
        }
        
        let apellido = prompt(`Apellido del huésped ${i}:`);
        if (!apellido) {
            alert("El apellido es obligatorio.");
            return null;
        }
        
        let nacionalidad = prompt(`Nacionalidad del huésped ${i}:`);
        if (!nacionalidad) {
            alert("La nacionalidad es obligatoria.");
            return null;
        }
        
        let documento = prompt(`DNI/Pasaporte del huésped ${i}:`);
        if (!documento) {
            alert("El documento es obligatorio.");
            return null;
        }
        
        huespedes.push({
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            nacionalidad: nacionalidad.trim(),
            documento: documento.trim()
        });
    }
    
    return huespedes;
}

function ingresarFechas() {
    let fechaEntrada = prompt("📅 Fecha de entrada (DD/MM/AAAA):");
    if (!fechaEntrada) {
        alert("La fecha de entrada es obligatoria.");
        return null;
    }
    
    let fechaSalida = prompt("📅 Fecha de salida (DD/MM/AAAA):");
    if (!fechaSalida) {
        alert("La fecha de salida es obligatoria.");
        return null;
    }
    
    // Calcular noches (simplificado)
    let noches = prompt("🌙 ¿Cuántas noches se hospedará?");
    let numNoches = parseInt(noches);
    
    if (!numNoches || numNoches < 1) {
        alert("Por favor, ingresa un número válido de noches.");
        return null;
    }
    
    return {
        entrada: fechaEntrada,
        salida: fechaSalida,
        noches: numNoches
    };
}

function mostrarResumenReserva(reserva) {
    let resumen = "✅ RESERVA REALIZADA EXITOSAMENTE\n\n";
    resumen += `Número de reserva: #${reserva.id}\n\n`;
    resumen += `🛏️ Habitación: ${reserva.tipoHabitacion.nombre}\n`;
    resumen += `👥 Huéspedes: ${reserva.cantidadHuespedes}\n\n`;
    
    resumen += "📝 DATOS DE HUÉSPEDES:\n";
    reserva.huespedes.forEach((huesped, index) => {
        resumen += `\n${index + 1}. ${huesped.nombre} ${huesped.apellido}\n`;
        resumen += `   Nacionalidad: ${huesped.nacionalidad}\n`;
        resumen += `   Documento: ${huesped.documento}\n`;
    });
    
    resumen += `\n📅 Entrada: ${reserva.fechaEntrada}\n`;
    resumen += `📅 Salida: ${reserva.fechaSalida}\n`;
    resumen += `🌙 Noches: ${reserva.noches}\n\n`;
    resumen += `💰 TOTAL A PAGAR: ${reserva.precioTotal}\n\n`;
    resumen += "¡Gracias por elegir nuestro hotel!";
    
    alert(resumen);
}

function mostrarReservas() {
    if (reservas.length === 0) {
        alert("📋 No hay reservas registradas aún.");
        return;
    }
    
    let lista = "📋 RESERVAS REALIZADAS\n\n";
    reservas.forEach(reserva => {
        lista += `Reserva #${reserva.id}\n`;
        lista += `Habitación: ${reserva.tipoHabitacion.nombre}\n`;
        lista += `Huéspedes: ${reserva.cantidadHuespedes}\n`;
        lista += `Entrada: ${reserva.fechaEntrada}\n`;
        lista += `Total: ${reserva.precioTotal}\n`;
        lista += "------------------------\n";
    });
    
    alert(lista);
}