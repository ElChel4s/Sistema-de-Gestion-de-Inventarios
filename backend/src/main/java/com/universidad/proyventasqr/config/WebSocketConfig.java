package com.universidad.proyventasqr.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * Configuración de WebSocket para alertas en tiempo real
 * Permite que todos los usuarios reciban alertas globales
 */
@Configuration
@EnableWebSocketMessageBroker // Habilita el broker de mensajes WebSocket
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Configura el broker de mensajes

        // /topic/alertas - Canal para alertas globales (todos los usuarios)
        // /queue/alertas - Canal para alertas privadas (usuario específico)
        config.enableSimpleBroker("/topic", "/queue");

        // Prefijo para mensajes enviados desde el cliente al servidor
        config.setApplicationDestinationPrefixes("/app");

        // Prefijo para mensajes privados
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Registra los endpoints de WebSocket

        // Endpoint principal para conectar desde el frontend
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*") // Permite conexiones desde cualquier origen
                .withSockJS(); // Habilita SockJS para compatibilidad con navegadores antiguos

        // Endpoint alternativo sin SockJS (para navegadores modernos)
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*");
    }
}