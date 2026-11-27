package com.seniosk.scenario;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class ScenarioInitializer implements ApplicationRunner {
    private final ScenarioCatalog catalog;
    private final ScenarioRepository repository;
    public ScenarioInitializer(ScenarioCatalog catalog, ScenarioRepository repository) {
        this.catalog = catalog;
        this.repository = repository;
    }

    // Refuse to start on an incompatible change to a stored version.
    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        catalog.list().forEach(repository::ensureVersion);
    }
}
