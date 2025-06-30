const tiposHabitacion = [
    { id: 1, nombre: "Individual", descripcion: "1 cama individual - Hasta 1 huésped", precio: 80 },
    { id: 2, nombre: "Doble", descripcion: "1 cama doble - Hasta 2 huéspedes", precio: 120 },
    { id: 3, nombre: "Triple", descripcion: "1 cama doble + 1 individual - Hasta 3 huéspedes", precio: 160 },
    { id: 4, nombre: "Suite Familiar", descripcion: "2 camas dobles - Hasta 4 huéspedes", precio: 200 }
 ];
 
 class SistemaReservasHotel {
    constructor() {
        this.reservas = this.cargarReservasDesdeStorage();
        this.reservaActual = this.inicializarReservaVacia();
        this.pasoActual = 1;
        this.calendario = null;
        
        this.inicializarEventos();
        this.mostrarMenuPrincipal();
        this.actualizarEstadisticas();
    }
 
    guardarReservasEnStorage() {
        try {
            const reservasJSON = JSON.stringify(this.reservas);
            localStorage.setItem('hotel_reservas', reservasJSON);
        } catch (error) {
            console.error('Error al guardar reservas:', error);
        }
    }
 
    cargarReservasDesdeStorage() {
        try {
            const reservasJSON = localStorage.getItem('hotel_reservas');
            return reservasJSON ? JSON.parse(reservasJSON) : [];
        } catch (error) {
            console.error('Error al cargar reservas:', error);
            return [];
        }
    }
 
    inicializarReservaVacia() {
        return {
            tipoHabitacion: null,
            cantidadHuespedes: null,
            huespedes: [],
            fechaEntrada: null,
            fechaSalida: null,
            noches: null
        };
    }
 
    inicializarEventos() {
        document.getElementById('btn-nueva-reserva').addEventListener('click', () => this.iniciarNuevaReserva());
        document.getElementById('btn-ver-reservas').addEventListener('click', () => this.mostrarReservas());
        document.getElementById('btn-ver-habitaciones').addEventListener('click', () => this.mostrarInfo());
        document.getElementById('btn-estadisticas').addEventListener('click', () => this.mostrarEstadisticas());
 
        document.getElementById('btn-siguiente-huespedes').addEventListener('click', () => this.irAPasoHuespedes());
        document.getElementById('btn-volver-habitacion').addEventListener('click', () => this.irAPasoHabitacion());
        document.getElementById('btn-siguiente-fechas').addEventListener('click', () => this.irAPasoFechas());
        document.getElementById('btn-volver-huespedes').addEventListener('click', () => this.irAPasoHuespedes());
        document.getElementById('btn-siguiente-confirmacion').addEventListener('click', () => this.irAPasoConfirmacion());
        document.getElementById('btn-volver-fechas').addEventListener('click', () => this.irAPasoFechas());
        document.getElementById('btn-confirmar-reserva').addEventListener('click', () => this.realizarReserva());
 
        document.getElementById('cantidad-huespedes').addEventListener('change', () => this.generarFormulariosHuespedes());
        document.getElementById('fecha-entrada').addEventListener('change', () => this.calcularNoches());
        document.getElementById('fecha-salida').addEventListener('change', () => this.calcularNoches());
    }
 
    mostrarMenuPrincipal() {
        this.ocultarTodasLasSecciones();
        document.getElementById('menu-principal').classList.remove('hidden');
    }
 
    iniciarNuevaReserva() {
        this.reservaActual = this.inicializarReservaVacia();
        this.pasoActual = 1;
        this.mostrarSeccionNuevaReserva();
        this.cargarHabitaciones();
        this.actualizarIndicadorPasos();
    }
 
    mostrarSeccionNuevaReserva() {
        this.ocultarTodasLasSecciones();
        document.getElementById('seccion-nueva-reserva').classList.remove('hidden');
        this.mostrarPaso(1);
    }
 
    cargarHabitaciones() {
        const container = document.getElementById('habitaciones-container');
        container.innerHTML = '';
 
        tiposHabitacion.forEach(habitacion => {
            const habitacionCard = this.crearTarjetaHabitacion(habitacion);
            container.appendChild(habitacionCard);
        });
    }
 
    crearTarjetaHabitacion(habitacion) {
        const div = document.createElement('div');
        div.className = 'habitacion-card';
        div.setAttribute('data-habitacion-id', habitacion.id);
 
        div.innerHTML = `
            <h3>${habitacion.nombre}</h3>
            <p>${habitacion.descripcion}</p>
            <div class="precio">$${habitacion.precio} /noche</div>
            <button class="btn btn-primary" onclick="sistema.seleccionarHabitacion(${habitacion.id})">
                Seleccionar
            </button>
        `;
 
        return div;
    }
 
    seleccionarHabitacion(idHabitacion) {
        const habitacion = tiposHabitacion.find(h => h.id === idHabitacion);
        if (!habitacion) {
            this.mostrarAlerta('Habitación no encontrada', 'error');
            return;
        }
 
        this.reservaActual.tipoHabitacion = habitacion;
 
        const cards = document.querySelectorAll('.habitacion-card');
        cards.forEach(card => card.classList.remove('selected'));
        document.querySelector(`[data-habitacion-id="${idHabitacion}"]`).classList.add('selected');
 
        document.getElementById('btn-siguiente-huespedes').disabled = false;
        this.mostrarAlerta(`Habitación ${habitacion.nombre} seleccionada`, 'success');
    }
 
    irAPasoHuespedes() {
        if (!this.reservaActual.tipoHabitacion) {
            this.mostrarAlerta('Debes seleccionar una habitación primero', 'error');
            return;
        }
 
        this.pasoActual = 2;
        this.mostrarPaso(2);
        this.configurarSelectorHuespedes();
        this.actualizarIndicadorPasos();
    }
 
    configurarSelectorHuespedes() {
        const selector = document.getElementById('cantidad-huespedes');
        const maxHuespedes = this.reservaActual.tipoHabitacion.id;
        
        selector.innerHTML = '<option value="">Seleccionar...</option>';
        
        for (let i = 1; i <= maxHuespedes; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `${i} huésped${i > 1 ? 'es' : ''}`;
            selector.appendChild(option);
        }
    }
 
    generarFormulariosHuespedes() {
        const cantidad = parseInt(document.getElementById('cantidad-huespedes').value);
        if (!cantidad) return;
 
        this.reservaActual.cantidadHuespedes = cantidad;
        const container = document.getElementById('huespedes-forms-container');
        container.innerHTML = '';
 
        for (let i = 1; i <= cantidad; i++) {
            const formHuesped = this.crearFormularioHuesped(i);
            container.appendChild(formHuesped);
        }
 
        this.configurarValidacionHuespedes();
    }
 
    crearFormularioHuesped(numero) {
        const div = document.createElement('div');
        div.className = 'huesped-form';
 
        div.innerHTML = `
            <h4>👤 Huésped ${numero}</h4>
            <div class="form-group">
                <label>Nombre:</label>
                <input type="text" class="huesped-nombre" data-huesped="${numero}" required>
            </div>
            <div class="form-group">
                <label>Apellido:</label>
                <input type="text" class="huesped-apellido" data-huesped="${numero}" required>
            </div>
            <div class="form-group">
                <label>Nacionalidad:</label>
                <input type="text" class="huesped-nacionalidad" data-huesped="${numero}" required>
            </div>
            <div class="form-group">
                <label>DNI/Pasaporte:</label>
                <input type="text" class="huesped-documento" data-huesped="${numero}" required>
            </div>
        `;
 
        return div;
    }
 
    configurarValidacionHuespedes() {
        const inputs = document.querySelectorAll('#huespedes-forms-container input');
        inputs.forEach(input => {
            input.addEventListener('input', () => this.validarDatosHuespedes());
        });
    }
 
    validarDatosHuespedes() {
        const cantidad = this.reservaActual.cantidadHuespedes;
        let todosCompletos = true;
 
        for (let i = 1; i <= cantidad; i++) {
            const nombre = document.querySelector(`.huesped-nombre[data-huesped="${i}"]`).value.trim();
            const apellido = document.querySelector(`.huesped-apellido[data-huesped="${i}"]`).value.trim();
            const nacionalidad = document.querySelector(`.huesped-nacionalidad[data-huesped="${i}"]`).value.trim();
            const documento = document.querySelector(`.huesped-documento[data-huesped="${i}"]`).value.trim();
 
            if (!nombre || !apellido || !nacionalidad || !documento) {
                todosCompletos = false;
                break;
            }
        }
 
        document.getElementById('btn-siguiente-fechas').disabled = !todosCompletos;
    }
 
    recopilarDatosHuespedes() {
        const cantidad = this.reservaActual.cantidadHuespedes;
        const huespedes = [];
 
        for (let i = 1; i <= cantidad; i++) {
            const nombre = document.querySelector(`.huesped-nombre[data-huesped="${i}"]`).value.trim();
            const apellido = document.querySelector(`.huesped-apellido[data-huesped="${i}"]`).value.trim();
            const nacionalidad = document.querySelector(`.huesped-nacionalidad[data-huesped="${i}"]`).value.trim();
            const documento = document.querySelector(`.huesped-documento[data-huesped="${i}"]`).value.trim();
 
            huespedes.push({
                nombre: nombre,
                apellido: apellido,
                nacionalidad: nacionalidad,
                documento: documento
            });
        }
 
        this.reservaActual.huespedes = huespedes;
        return true;
    }


    // Calendario Vanilla Calendar
 
    irAPasoFechas() {
        if (!this.recopilarDatosHuespedes()) {
            this.mostrarAlerta('Completa todos los datos de los huéspedes', 'error');
            return;
        }
 
        this.pasoActual = 3;
        this.mostrarPaso(3);
        this.inicializarCalendario();
        this.actualizarIndicadorPasos();
    }





    // 
    inicializarCalendario() {
        const calendarElement = document.getElementById('calendario-reserva');
        
        if (this.calendario) {
            calendarElement.innerHTML = '';
        }
    
        const hoy = new Date();
        
        // Resetear campos
        document.getElementById('fecha-entrada').value = '';
        document.getElementById('fecha-salida').value = '';
        document.getElementById('noches').value = '';
        document.getElementById('btn-siguiente-confirmacion').disabled = true;
    
        try {
            this.calendario = new VanillaCalendar(calendarElement, {
                type: 'multiple',
                settings: {
                    lang: 'es',
                    iso8601: false,
                    range: {
                        min: `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`,
                        max: `${hoy.getFullYear() + 1}-12-31`,
                    },
                    selection: {
                        day: 'multiple-ranged',
                    }
                },
                actions: {
                    clickDay: (event, self) => {
                        console.log('Fechas seleccionadas:', self.selectedDates);
                        this.manejarSeleccionFechas(self.selectedDates);
                    }
                }
            });
    
            this.calendario.init();
            console.log('Calendario inicializado correctamente');
        } catch (error) {
            console.error('Error al inicializar calendario:', error);
            // Fallback a inputs de fecha normales
            this.mostrarInputsFechaFallback();
        }
    }
 
    // manejarSeleccionFechas(fechasSeleccionadas) {
    //     console.log('Fechas seleccionadas:', fechasSeleccionadas);
        
    //     if (fechasSeleccionadas.length >= 2) {
    //         const fechasOrdenadas = fechasSeleccionadas.sort((a, b) => new Date(a) - new Date(b));
    //         const fechaEntrada = fechasOrdenadas[0];
    //         const fechaSalida = fechasOrdenadas[fechasOrdenadas.length - 1];
            
    //         const entrada = new Date(fechaEntrada);
    //         const salida = new Date(fechaSalida);
            
    //         const diferencia = salida - entrada;
    //         const noches = Math.ceil(diferencia / (1000 * 60 * 60 * 24));
            
    //         if (noches > 0) {
    //             document.getElementById('fecha-entrada').value = this.formatearFechaInput(entrada);
    //             document.getElementById('fecha-salida').value = this.formatearFechaInput(salida);
    //             document.getElementById('noches').value = noches;
                
    //             this.reservaActual.fechaEntrada = fechaEntrada;
    //             this.reservaActual.fechaSalida = fechaSalida;
    //             this.reservaActual.noches = noches;
                
    //             document.getElementById('btn-siguiente-confirmacion').disabled = false;
                
    //             this.mostrarAlerta(`Estadía seleccionada: ${noches} noche${noches > 1 ? 's' : ''}`, 'success');
    //         }
    //     } else if (fechasSeleccionadas.length === 1) {
    //         document.getElementById('fecha-entrada').value = this.formatearFechaInput(new Date(fechasSeleccionadas[0]));
    //         document.getElementById('fecha-salida').value = '';
    //         document.getElementById('noches').value = '';
    //         document.getElementById('btn-siguiente-confirmacion').disabled = true;
            
    //         this.mostrarAlerta('Selecciona la fecha de salida', 'info');
    //     } else {
    //         document.getElementById('fecha-entrada').value = '';
    //         document.getElementById('fecha-salida').value = '';
    //         document.getElementById('noches').value = '';
    //         document.getElementById('btn-siguiente-confirmacion').disabled = true;
    //     }
    // }
    manejarSeleccionFechas(fechasSeleccionadas) {
        console.log('Procesando fechas:', fechasSeleccionadas);
        
        if (!fechasSeleccionadas || fechasSeleccionadas.length === 0) {
            this.limpiarCamposFecha();
            return;
        }
        
        if (fechasSeleccionadas.length === 1) {
            // Solo fecha de entrada seleccionada
            const fechaEntrada = new Date(fechasSeleccionadas[0]);
            document.getElementById('fecha-entrada').value = this.formatearFechaInput(fechaEntrada);
            document.getElementById('fecha-salida').value = '';
            document.getElementById('noches').value = '';
            document.getElementById('btn-siguiente-confirmacion').disabled = true;
            this.mostrarAlerta('Ahora selecciona la fecha de salida', 'info');
            
        } else if (fechasSeleccionadas.length >= 2) {
            // Rango de fechas seleccionado
            const fechasOrdenadas = fechasSeleccionadas.sort((a, b) => new Date(a) - new Date(b));
            const fechaEntrada = fechasOrdenadas[0];
            const fechaSalida = fechasOrdenadas[fechasOrdenadas.length - 1];
            
            const entrada = new Date(fechaEntrada);
            const salida = new Date(fechaSalida);
            
            // Calcular diferencia en días
            const diferenciaTiempo = salida.getTime() - entrada.getTime();
            const noches = Math.ceil(diferenciaTiempo / (1000 * 3600 * 24));
            
            if (noches > 0) {
                // Actualizar campos de texto
                document.getElementById('fecha-entrada').value = this.formatearFechaInput(entrada);
                document.getElementById('fecha-salida').value = this.formatearFechaInput(salida);
                document.getElementById('noches').value = noches;
                
                // Guardar en reservaActual
                this.reservaActual.fechaEntrada = fechaEntrada;
                this.reservaActual.fechaSalida = fechaSalida;
                this.reservaActual.noches = noches;
                
                // Habilitar botón siguiente
                document.getElementById('btn-siguiente-confirmacion').disabled = false;
                
                this.mostrarAlerta(`✅ Perfecto! ${noches} noche${noches > 1 ? 's' : ''} seleccionada${noches > 1 ? 's' : ''}`, 'success');
            } else {
                this.mostrarAlerta('Error: La fecha de salida debe ser posterior a la entrada', 'error');
                this.limpiarCamposFecha();
            }
        }
    }
 
    formatearFechaInput(fecha) {
        return fecha.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    irAPasoConfirmacion() {
        if (!this.reservaActual.fechaEntrada || !this.reservaActual.fechaSalida) {
            this.mostrarAlerta('Completa las fechas de estadía', 'error');
            return;
        }
 
        this.pasoActual = 4;
        this.mostrarPaso(4);
        this.mostrarResumenReserva();
        this.actualizarIndicadorPasos();
    }
 
    mostrarResumenReserva() {
        const container = document.getElementById('resumen-reserva');
        const precioTotal = this.reservaActual.tipoHabitacion.precio * this.reservaActual.noches;
 
        let huespedesToHTML = '';
        this.reservaActual.huespedes.forEach((huesped, index) => {
            huespedesToHTML += `
                <div style="padding: 8px 0; border-bottom: 1px solid #eee;">
                    <strong>${index + 1}. ${huesped.nombre} ${huesped.apellido}</strong><br>
                    <small>Nacionalidad: ${huesped.nacionalidad} | Documento: ${huesped.documento}</small>
                </div>
            `;
        });
 
        container.innerHTML = `
            <h3>📋 Resumen de tu reserva</h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
                <div>
                    <h4>🛏️ Habitación</h4>
                    <p><strong>${this.reservaActual.tipoHabitacion.nombre}</strong></p>
                    <p>${this.reservaActual.tipoHabitacion.descripcion}</p>
                    <p><strong>Precio por noche:</strong> $${this.reservaActual.tipoHabitacion.precio}</p>
                </div>
                
                <div>
                    <h4>📅 Fechas</h4>
                    <p><strong>Entrada:</strong> ${this.formatearFecha(this.reservaActual.fechaEntrada)}</p>
                    <p><strong>Salida:</strong> ${this.formatearFecha(this.reservaActual.fechaSalida)}</p>
                    <p><strong>Noches:</strong> ${this.reservaActual.noches}</p>
                </div>
            </div>
 
            <div>
                <h4>👥 Huéspedes (${this.reservaActual.cantidadHuespedes})</h4>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 10px;">
                    ${huespedesToHTML}
                </div>
            </div>
 
            <div style="background: #e8f5e8; padding: 20px; border-radius: 10px; margin-top: 20px; text-align: center;">
                <h3 style="color: #27ae60; margin: 0;">💰 Total a Pagar: $${precioTotal}</h3>
                <p style="margin: 5px 0 0 0; color: #666;">
                    ${this.reservaActual.noches} noche${this.reservaActual.noches > 1 ? 's' : ''} × $${this.reservaActual.tipoHabitacion.precio}
                </p>
            </div>
        `;
    }





    realizarReserva() {
        const reserva = {
            id: this.reservas.length + 1,
            tipoHabitacion: this.reservaActual.tipoHabitacion,
            cantidadHuespedes: this.reservaActual.cantidadHuespedes,
            huespedes: this.reservaActual.huespedes,
            fechaEntrada: this.reservaActual.fechaEntrada,
            fechaSalida: this.reservaActual.fechaSalida,
            noches: this.reservaActual.noches,
            precioTotal: this.reservaActual.tipoHabitacion.precio * this.reservaActual.noches,
            fechaCreacion: new Date().toISOString()
        };
 
        this.reservas.push(reserva);
        this.guardarReservasEnStorage();
        this.actualizarEstadisticas();
 
        this.mostrarAlerta(`✅ ¡Reserva #${reserva.id} confirmada exitosamente! Total: $${reserva.precioTotal}`, 'success');
 
        setTimeout(() => {
            this.mostrarMenuPrincipal();
        }, 3000);
    }
 
    mostrarReservas() {
        this.ocultarTodasLasSecciones();
        document.getElementById('seccion-ver-reservas').classList.remove('hidden');
 
        const container = document.getElementById('reservas-container');
 
        if (this.reservas.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <h3>📋 No hay reservas registradas aún</h3>
                    <p>Las reservas que realices aparecerán aquí.</p>
                    <button class="btn btn-primary" onclick="sistema.iniciarNuevaReserva()">
                        ✨ Hacer Primera Reserva
                    </button>
                </div>
            `;
            return;
        }
 
        container.innerHTML = '';
        this.reservas.forEach(reserva => {
            const reservaCard = this.crearTarjetaReserva(reserva);
            container.appendChild(reservaCard);
        });
    }
 
    crearTarjetaReserva(reserva) {
        const div = document.createElement('div');
        div.className = 'reserva-card';
 
        let huespedesToHTML = '';
        reserva.huespedes.forEach((huesped, index) => {
            huespedesToHTML += `
                <div style="padding: 8px 0; border-bottom: 1px solid #eee;">
                    <strong>${index + 1}. ${huesped.nombre} ${huesped.apellido}</strong><br>
                    <small>${huesped.nacionalidad} - ${huesped.documento}</small>
                </div>
            `;
        });
 
        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <div style="background: #3498db; color: white; padding: 5px 15px; border-radius: 20px; font-weight: bold;">
                    Reserva #${reserva.id}
                </div>
                <div style="font-size: 1.3em; font-weight: bold; color: #27ae60;">
                    $${reserva.precioTotal}
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin: 15px 0;">
                <div>
                    <h4>🛏️ Habitación</h4>
                    <p><strong>${reserva.tipoHabitacion.nombre}</strong></p>
                    <p style="font-size: 0.9em; color: #666;">${reserva.tipoHabitacion.descripcion}</p>
                </div>
                
                <div>
                    <h4>📅 Fechas</h4>
                    <p><strong>Entrada:</strong> ${this.formatearFecha(reserva.fechaEntrada)}</p>
                    <p><strong>Salida:</strong> ${this.formatearFecha(reserva.fechaSalida)}</p>
                    <p><strong>Noches:</strong> ${reserva.noches}</p>
                </div>
                
                <div>
                    <h4>👥 Huéspedes</h4>
                    <p><strong>Cantidad:</strong> ${reserva.cantidadHuespedes}</p>
                    <p><strong>Precio/noche:</strong> $${reserva.tipoHabitacion.precio}</p>
                </div>
            </div>
 
            <div>
                <h4>📝 Datos de Huéspedes</h4>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 10px;">
                    ${huespedesToHTML}
                </div>
            </div>
 
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee; font-size: 0.9em; color: #666;">
                <strong>Fecha de reserva:</strong> ${this.formatearFechaCompleta(reserva.fechaCreacion)}
            </div>
        `;
 
        return div;
    }
 
    mostrarInfo() {
        this.ocultarTodasLasSecciones();
        document.getElementById('seccion-ver-habitaciones').classList.remove('hidden');
 
        const container = document.getElementById('info-habitaciones-container');
        container.innerHTML = '';
 
        tiposHabitacion.forEach(habitacion => {
            const infoCard = this.crearTarjetaInfoHabitacion(habitacion);
            container.appendChild(infoCard);
        });
    }
 
    crearTarjetaInfoHabitacion(habitacion) {
        const div = document.createElement('div');
        div.className = 'habitacion-card';
 
        const reservasDeEsteTipo = this.reservas.filter(r => r.tipoHabitacion.id === habitacion.id);
        const totalReservado = reservasDeEsteTipo.length;
        const ingresosTotales = reservasDeEsteTipo.reduce((total, r) => total + r.precioTotal, 0);
 
        div.innerHTML = `
            <h3>${habitacion.nombre}</h3>
            <p>${habitacion.descripcion}</p>
            <div class="precio">$${habitacion.precio} /noche</div>
            
            <div style="margin-top: 15px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                <h4>📊 Estadísticas</h4>
                <p><strong>Veces reservada:</strong> ${totalReservado}</p>
                <p><strong>Máximo huéspedes:</strong> ${habitacion.id}</p>
                <p><strong>Ingresos generados:</strong> $${ingresosTotales}</p>
            </div>
 
            <button class="btn btn-primary" onclick="sistema.iniciarNuevaReserva()" style="margin-top: 15px; width: 100%;">
                🎯 Reservar Esta Habitación
            </button>
        `;
 
        return div;
    }
 
    mostrarEstadisticas() {
        this.ocultarTodasLasSecciones();
        document.getElementById('seccion-estadisticas').classList.remove('hidden');
 
        const container = document.getElementById('estadisticas-container');
        const stats = this.calcularEstadisticasCompletas();
 
        container.innerHTML = `
            <div class="stats-card">
                <h3>📈 Estadísticas Generales</h3>
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-number">${stats.totalReservas}</span>
                        <span>Total Reservas</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">$${stats.ingresosTotales}</span>
                        <span>Ingresos Totales</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${stats.totalHuespedes}</span>
                        <span>Total Huéspedes</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${stats.promedioNoches}</span>
                        <span>Promedio Noches</span>
                    </div>
                </div>
            </div>
 
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
                <div style="background: white; padding: 25px; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
                    <h4>🛏️ Habitaciones Más Reservadas</h4>
                    ${stats.habitacionesPopulares.map(h => `
                        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
                            <span>${h.nombre}</span>
                            <strong>${h.reservas} reservas</strong>
                        </div>
                    `).join('')}
                </div>
 
                <div style="background: white; padding: 25px; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
                    <h4>🌍 Nacionalidades de Huéspedes</h4>
                    ${stats.nacionalidades.slice(0, 5).map(n => `
                        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
                            <span>${n.pais}</span>
                            <strong>${n.cantidad} huéspedes</strong>
                        </div>
                    `).join('')}
                </div>
            </div>
 
            <div style="background: white; padding: 25px; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); margin-top: 20px;">
                <h4>📊 Ingresos por Tipo de Habitación</h4>
                ${tiposHabitacion.map(habitacion => {
                    const ingresos = this.calcularIngresosPorHabitacion(habitacion.id);
                    const porcentaje = stats.ingresosTotales > 0 ? ((ingresos / stats.ingresosTotales) * 100).toFixed(1) : 0;
                    return `
                        <div style="margin: 15px 0;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                <span>${habitacion.nombre}</span>
                                <strong>$${ingresos} (${porcentaje}%)</strong>
                            </div>
                            <div style="background: #ecf0f1; height: 8px; border-radius: 4px;">
                                <div style="background: linear-gradient(45deg, #3498db, #2980b9); height: 100%; width: ${porcentaje}%; border-radius: 4px; transition: width 0.3s;"></div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
 
    ocultarTodasLasSecciones() {
        const secciones = [
            'menu-principal', 'seccion-nueva-reserva', 'seccion-ver-reservas', 
            'seccion-ver-habitaciones', 'seccion-estadisticas'
        ];
        
        secciones.forEach(seccionId => {
            document.getElementById(seccionId).classList.add('hidden');
        });
    }
 
    mostrarPaso(numeroPaso) {
        const pasos = ['paso-habitacion', 'paso-huespedes', 'paso-fechas', 'paso-confirmacion'];
        
        pasos.forEach((paso, index) => {
            const elemento = document.getElementById(paso);
            if (index === numeroPaso - 1) {
                elemento.classList.remove('hidden');
            } else {
                elemento.classList.add('hidden');
            }
        });
    }
 
    actualizarIndicadorPasos() {
        for (let i = 1; i <= 4; i++) {
            const step = document.getElementById(`step-${i}`);
            step.classList.remove('active', 'completed');
            
            if (i < this.pasoActual) {
                step.classList.add('completed');
            } else if (i === this.pasoActual) {
                step.classList.add('active');
            }
        }
    }
 
    irAPasoHabitacion() {
        this.pasoActual = 1;
        this.mostrarPaso(1);
        this.actualizarIndicadorPasos();
    }
 
    actualizarEstadisticas() {
        const totalReservas = this.reservas.length;
        const ingresosTotales = this.reservas.reduce((total, reserva) => total + reserva.precioTotal, 0);
 
        document.getElementById('total-reservas').textContent = totalReservas;
        document.getElementById('ingresos-totales').textContent = `$${ingresosTotales}`;
    }
 
    calcularEstadisticasCompletas() {
        const totalReservas = this.reservas.length;
        const ingresosTotales = this.reservas.reduce((total, reserva) => total + reserva.precioTotal, 0);
        const totalHuespedes = this.reservas.reduce((total, reserva) => total + reserva.cantidadHuespedes, 0);
        const promedioNoches = totalReservas > 0 ? 
            Math.round(this.reservas.reduce((total, reserva) => total + reserva.noches, 0) / totalReservas * 10) / 10 : 0;
 
        const habitacionesCount = {};
        this.reservas.forEach(reserva => {
            const nombre = reserva.tipoHabitacion.nombre;
            habitacionesCount[nombre] = (habitacionesCount[nombre] || 0) + 1;
        });
 
        const habitacionesPopulares = Object.entries(habitacionesCount)
            .map(([nombre, reservas]) => ({ nombre, reservas }))
            .sort((a, b) => b.reservas - a.reservas);
 
        const nacionalidadesCount = {};
        this.reservas.forEach(reserva => {
            eserva.huespedes.forEach(huesped => {
                const pais = huesped.nacionalidad;
                nacionalidadesCount[pais] = (nacionalidadesCount[pais] || 0) + 1;
            });
        });
 
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
 
    calcularIngresosPorHabitacion(idHabitacion) {
        return this.reservas
            .filter(reserva => reserva.tipoHabitacion.id === idHabitacion)
            .reduce((total, reserva) => total + reserva.precioTotal, 0);
    }
 
    formatearFecha(fechaString) {
        const fecha = new Date(fechaString + 'T00:00:00');
        return fecha.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
 
    formatearFechaCompleta(fechaISO) {
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
 
    mostrarAlerta(mensaje, tipo) {
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
 }
 
 let sistema;
 
 document.addEventListener('DOMContentLoaded', function() {
    sistema = new SistemaReservasHotel();
 });