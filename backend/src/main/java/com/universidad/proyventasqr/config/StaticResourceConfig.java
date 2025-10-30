package com.universidad.proyventasqr.config;

import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    @Value("${app.qr.storage-path:qrs}")
    private String qrStoragePath;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path qrUploadDir = Paths.get(qrStoragePath);
        String qrUploadPath = qrUploadDir.toFile().getAbsolutePath();
        
        registry.addResourceHandler("/qrs/**")
                .addResourceLocations("file:" + qrUploadPath + "/");
    }
}
