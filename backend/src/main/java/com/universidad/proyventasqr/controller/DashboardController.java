package com.universidad.proyventasqr.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.universidad.proyventasqr.dto.DashboardDTO;
import com.universidad.proyventasqr.service.IDashboardService;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private IDashboardService dashboardService;

    /**
     * Obtiene todos los datos del dashboard
     * 
     * @return DashboardDTO con todas las estadísticas:
     *         - Total de productos y almacenes
     *         - Valor total de productos
     *         - Productos por almacén y su valor
     *         - Productos más vendidos
     *         - Productos con bajo stock
     *         - Cantidad y valor de compras y ventas
     *         - Estadísticas por usuario (compras, ventas, traspasos)
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','GERENTE','PERSONAL')")
    public ResponseEntity<DashboardDTO> obtenerDatosDashboard() {
        DashboardDTO dashboard = dashboardService.obtenerDatosDashboard();
        return ResponseEntity.ok(dashboard);
    }
}