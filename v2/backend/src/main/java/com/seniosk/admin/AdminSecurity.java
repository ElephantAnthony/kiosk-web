package com.seniosk.admin;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.csrf.HttpSessionCsrfTokenRepository;

@Configuration
public class AdminSecurity {
    public static final String CONTEXT_KEY = "seniosk.admin.security";
    @Bean
    HttpSessionSecurityContextRepository adminContextRepository() {
        var repo = new HttpSessionSecurityContextRepository();
        repo.setSpringSecurityContextKey(CONTEXT_KEY);
        return repo;
    }

    @Bean
    AuthenticationManager adminAuthenticationManager(
        @Value("${ADMIN_USERNAME:}") String username,
        @Value("${ADMIN_PASSWORD:}") String password) {
        boolean enabled = !username.isBlank() && username.length() <= 80
            && password.length() >= 16 && password.getBytes(StandardCharsets.UTF_8).length <= 72;
        var encoder = new BCryptPasswordEncoder(12);
        String hash = encoder.encode(enabled ? password : UUID.randomUUID().toString());
        return authentication -> {
            String supplied = String.valueOf(authentication.getCredentials());
            boolean validLength = supplied.getBytes(StandardCharsets.UTF_8).length <= 72;
            boolean passwordMatches = encoder.matches(validLength ? supplied : "", hash);
            boolean usernameMatches = MessageDigest.isEqual(username.getBytes(StandardCharsets.UTF_8),
                authentication.getName().getBytes(StandardCharsets.UTF_8));
            if (!enabled || !validLength || !usernameMatches || !passwordMatches)
                throw new BadCredentialsException("Invalid administrator credentials");
            return UsernamePasswordAuthenticationToken.authenticated(username, null,
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
        };
    }

    @Bean
    @Order(1)
    SecurityFilterChain adminChain(HttpSecurity http, HttpSessionSecurityContextRepository adminContextRepository) throws Exception {
        return http.securityMatcher("/api/admin/**")
            .securityContext(c -> c.securityContextRepository(adminContextRepository).requireExplicitSave(true))
            .csrf(c -> c.csrfTokenRepository(new HttpSessionCsrfTokenRepository()))
            .requestCache(c -> c.disable())
            .logout(c -> c.disable())
            .authorizeHttpRequests(a -> a.requestMatchers(HttpMethod.POST, "/api/admin/login").permitAll()
                .anyRequest().hasRole("ADMIN"))
            .exceptionHandling(e -> e.authenticationEntryPoint((req,res,ex)->res.setStatus(401))
                .accessDeniedHandler((req,res,ex)->res.setStatus(403)))
            .build();
    }
}
