package com.seniosk;

import org.springframework.boot.SpringApplication;
import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;

@OpenAPIDefinition(info = @Info(title = "SENIOSK API", version = "0.3.0", description = "Fictional kiosk training, scenario catalog, isolated learning sessions and server grading"))
@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
public class SenioskApplication {
    public static void main(String[] args) {
        SpringApplication.run(SenioskApplication.class, args);
    }
}
