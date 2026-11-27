package com.seniosk.scenario;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.networknt.schema.JsonSchema;
import com.networknt.schema.JsonSchemaFactory;
import com.networknt.schema.SpecVersion;
import java.io.IOException;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
public class ScenarioCatalog {
    private final ObjectMapper mapper;
    private final JsonSchema schema;
    private final List<Scenario> scenarios;

    public ScenarioCatalog(ObjectMapper mapper) {
        this.mapper = mapper;
        try (var input = new ClassPathResource("contracts/scenario.schema.json").getInputStream()) {
            schema = JsonSchemaFactory.getInstance(SpecVersion.VersionFlag.V202012).getSchema(mapper.readTree(input));
            var fixtures = new PathMatchingResourcePatternResolver()
                .getResources("classpath*:contracts/scenarios/*.json");
            var loaded = new java.util.ArrayList<Scenario>();
            Set<String> keys = new HashSet<>();
            for (var fixture : fixtures) {
                try (var stream = fixture.getInputStream()) {
                    Scenario scenario = parse(mapper.readTree(stream));
                    require(keys.add(scenario.scenarioId() + ":" + scenario.version()), "duplicate scenario version");
                    loaded.add(scenario);
                }
            }
            require(!loaded.isEmpty(), "scenario catalog is empty");
            loaded.sort(java.util.Comparator.comparing(Scenario::scenarioId).thenComparingInt(Scenario::version));
            scenarios = List.copyOf(loaded);
        } catch (IOException | IllegalArgumentException ex) {
            throw new IllegalStateException("Invalid bundled scenario contract", ex);
        }
    }

    Scenario parse(JsonNode node) throws IOException {
        var violations = schema.validate(node);
        require(violations.isEmpty(), "scenario violates JSON Schema");
        Scenario result = mapper.treeToValue(node, Scenario.class);
        validateReferences(result);
        return result;
    }

    public List<Scenario> list() { return scenarios; }

    public Scenario get(String id, int version) {
        return scenarios.stream().filter(s -> s.scenarioId().equals(id) && s.version() == version)
            .findFirst().orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Scenario not found"));
    }

    static void validateReferences(Scenario scenario) {
        Set<String> categories = new HashSet<>();
        scenario.categories().forEach(c -> require(categories.add(c.id()), "duplicate category id"));
        Map<String, Scenario.Menu> menus = new HashMap<>();
        for (var menu : scenario.menus()) {
            require(categories.contains(menu.categoryId()), "unknown category");
            require(menus.putIfAbsent(menu.id(), menu) == null, "duplicate menu id");
            Set<String> groups = new HashSet<>();
            Set<String> options = new HashSet<>();
            for (var group : menu.optionGroups()) {
                require(groups.add(group.id()), "duplicate group id");
                group.options().forEach(o -> require(options.add(o.id()), "duplicate option id within menu"));
            }
        }
        Set<String> missions = new HashSet<>();
        for (var mission : scenario.missions()) {
            require(missions.add(mission.id()), "duplicate mission id");
            require(scenario.paymentOptions().contains(mission.payment()), "unsupported payment");
            for (var line : mission.expected()) {
                var menu = menus.get(line.menuId());
                require(menu != null, "unknown mission menu");
                require(scenario.packingOptions().contains(line.packing()), "unsupported packing");
                var selected = new HashSet<>(line.optionIds());
                for (var group : menu.optionGroups()) {
                    long count = group.options().stream().filter(o -> selected.remove(o.id())).count();
                    require(count <= 1 && (!group.required() || count == 1), "invalid option group selection");
                }
                require(selected.isEmpty(), "unknown mission option");
            }
        }
    }

    private static void require(boolean condition, String message) {
        if (!condition) throw new IllegalArgumentException(message);
    }
}
