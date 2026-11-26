package com.seniosk.scenario;

import java.util.List;

public record Scenario(String scenarioId, int version, String title, String description,
                       List<Category> categories, List<Menu> menus, List<String> packingOptions,
                       List<String> paymentOptions, List<MissionTemplate> missions) {
    public record Category(String id, String label) {}
    public record Menu(String id, String categoryId, String label, int price, List<OptionGroup> optionGroups) {}
    public record OptionGroup(String id, String label, boolean required, List<Option> options) {}
    public record Option(String id, String label, int priceDelta) {}
    public record OrderLine(String menuId, List<String> optionIds, String packing, int quantity) {}
    public record MissionTemplate(String id, String instruction, List<OrderLine> expected, String payment) {}
}
