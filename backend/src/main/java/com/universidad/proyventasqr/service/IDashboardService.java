package com.universidad.proyventasqr.service;

import com.universidad.proyventasqr.dto.DashboardDTO;

public interface IDashboardService {

    /**
     * Obtiene todos los datos del dashboard
     * 
     * @return DashboardDTO con todas las estadísticas requeridas
     */
    DashboardDTO obtenerDatosDashboard();
}