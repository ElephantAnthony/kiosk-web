package com.seniosk.grading;

import com.seniosk.scenario.Scenario.OrderLine;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;

public record SubmissionRequest(
    @NotNull @Size(max = 100) List<@NotNull @Valid Line> order,
    @NotBlank @Pattern(regexp = "CARD|CASH") String payment,
    @NotNull @Min(0) @Max(86400000) Long clientActiveMs
) {
    public record Line(
        @NotBlank @Pattern(regexp = "^[a-z][a-z0-9-]{0,63}$") String menuId,
        @NotNull @Size(max = 10) List<@NotBlank @Pattern(regexp = "^[a-z][a-z0-9-]{0,63}$") String> optionIds,
        @NotBlank @Pattern(regexp = "DINE_IN|TAKE_OUT") String packing,
        @NotNull @Min(1) @Max(20) Integer quantity
    ) {
        OrderLine toOrderLine() { return new OrderLine(menuId, List.copyOf(optionIds), packing, quantity); }
    }
}
