package com.universidad.proyventasqr.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Permitir CORS para el frontend en todas las rutas (incluye /api/** y /qrs/**)
        registry.addMapping("/**")
            .allowedOrigins("http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD")
            .allowedHeaders("*")
            .exposedHeaders("Authorization")
            .allowCredentials(true)
            .maxAge(3600); // Cache CORS por 1 hora
    }
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Expone la carpeta qrs para acceso externo
        registry.addResourceHandler("/qrs/**")
                .addResourceLocations("file:qrs/"); // Cambiado a la ruta correcta basada en app.qr.storage-path
    }
}
