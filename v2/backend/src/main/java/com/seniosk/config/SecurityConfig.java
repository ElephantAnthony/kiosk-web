package com.seniosk.config;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {
    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // Explicit allowlist. No administrator account until the auth milestone.
        // Keep CSRF protection enabled for future cookie-based authentication.
        return http.authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.GET, "/healthz", "/v3/api-docs", "/v3/api-docs/**",
                        "/swagger-ui.html", "/swagger-ui/**").permitAll()
                .anyRequest().denyAll())
            .exceptionHandling(errors -> errors.authenticationEntryPoint((request, response, failure) ->
                response.sendError(HttpServletResponse.SC_FORBIDDEN)))
            .build();
    }
}
