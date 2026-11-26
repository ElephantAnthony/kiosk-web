package com.seniosk.scenario;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class ScenarioCatalogTest {
    private final ObjectMapper mapper = new ObjectMapper();
    private final ScenarioCatalog catalog = new ScenarioCatalog(mapper);

    @Test void acceptsBundledCafe() {
        var s = catalog.get("boram-cafe", 1);
        assertEquals(3, s.menus().size());
        assertEquals(2, s.missions().getFirst().expected().getFirst().quantity());
    }
    @Test void rejectsUnknownProperty() {
        ObjectNode node = mapper.valueToTree(catalog.get("boram-cafe", 1));
        node.put("unknown", true);
        assertThrows(IllegalArgumentException.class, () -> catalog.parse(node));
    }
    @Test void rejectsUnknownMenuReference() {
        ObjectNode node = mapper.valueToTree(catalog.get("boram-cafe", 1));
        ((ObjectNode)node.at("/missions/0/expected/0")).put("menuId", "does-not-exist");
        assertThrows(IllegalArgumentException.class, () -> catalog.parse(node));
    }
    @Test void rejectsMissingRequiredOption() {
        ObjectNode node = mapper.valueToTree(catalog.get("boram-cafe", 1));
        ((ObjectNode)node.at("/missions/0/expected/0")).putArray("optionIds");
        assertThrows(IllegalArgumentException.class, () -> catalog.parse(node));
    }
    @Test void rejectsEmptyExpectedOrder() {
        ObjectNode node = mapper.valueToTree(catalog.get("boram-cafe", 1));
        ((ObjectNode)node.at("/missions/0")).putArray("expected");
        assertThrows(IllegalArgumentException.class, () -> catalog.parse(node));
    }
}
