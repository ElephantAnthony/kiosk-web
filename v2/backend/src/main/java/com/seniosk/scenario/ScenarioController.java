package com.seniosk.scenario;

import io.swagger.v3.oas.annotations.Operation;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/scenarios")
public class ScenarioController {
    private final ScenarioCatalog catalog;
    public ScenarioController(ScenarioCatalog catalog) { this.catalog = catalog; }

    @GetMapping
    @Operation(summary = "List bundled practice scenarios")
    public List<Scenario> list() { return catalog.list(); }

    @GetMapping("/{scenarioId}/{version}")
    @Operation(summary = "Read a specific immutable scenario version")
    public Scenario detail(@PathVariable String scenarioId, @PathVariable int version) {
        return catalog.get(scenarioId, version);
    }
}
