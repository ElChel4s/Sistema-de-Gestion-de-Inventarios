package com.universidad.proyventasqr.e2e;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.containers.PostgreSQLContainer;

@Disabled("Skipping E2E test due to missing Docker environment")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
class CategoriaE2ETest {
    @Container
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15")
        .withDatabaseName("testdb")
        .withUsername("test")
        .withPassword("test");
    
    @Test
    void flujoCompletoCategoria() {
        // Aquí puedes usar RestTemplate o WebTestClient para probar el flujo real contra la app y la DB real
        // Ejemplo: crear estudiante, consultar, actualizar, eliminar, etc.
    }
}
