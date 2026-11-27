package com.seniosk.admin;

import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import static org.junit.jupiter.api.Assertions.*;

class AdminSecurityTest {
    @Test void missingConfigurationDisablesAuthentication() {
        var manager=new AdminSecurity().adminAuthenticationManager("","");
        assertThrows(BadCredentialsException.class,()->manager.authenticate(UsernamePasswordAuthenticationToken.unauthenticated("admin",UUID.randomUUID().toString())));
    }
    @Test void validConfigurationAuthenticatesOnlyConfiguredUser() {
        String password=UUID.randomUUID().toString();
        var manager=new AdminSecurity().adminAuthenticationManager("fixture",password);
        var principal=manager.authenticate(UsernamePasswordAuthenticationToken.unauthenticated("fixture",password));
        assertTrue(principal.isAuthenticated());
        assertNull(principal.getCredentials());
        assertTrue(principal.getAuthorities().stream().anyMatch(a->a.getAuthority().equals("ROLE_ADMIN")));
        assertThrows(BadCredentialsException.class,()->manager.authenticate(UsernamePasswordAuthenticationToken.unauthenticated("other",password)));
    }
}
