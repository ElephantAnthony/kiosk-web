package com.seniosk.scenario;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.springframework.http.ProblemDetail;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value = "/api/scenarios", produces = "application/json")
public class ScenarioController {
    private final ScenarioCatalog catalog;
    public ScenarioController(ScenarioCatalog catalog) { this.catalog = catalog; }

    @GetMapping
    @Operation(summary = "List bundled practice scenarios")
    public List<Scenario> list() { return catalog.list(); }

    @GetMapping("/{scenarioId}/{version}")
    @Operation(summary = "Read a specific immutable scenario version")
    @ApiResponse(responseCode = "200", description = "Scenario definition")
    @ApiResponse(responseCode = "404", description = "Scenario not found", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class)))
    public Scenario detail(@PathVariable String scenarioId, @PathVariable int version) {
        return catalog.get(scenarioId, version);
    }
}
