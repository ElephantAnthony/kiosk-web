# Kiosk workflow

```mermaid
stateDiagram-v2
    [*] --> LOADING
    LOADING --> START
    START --> STARTING
    STARTING --> MISSION
    MISSION --> MENU
    MENU --> OPTION
    OPTION --> CART
    CART --> OPTION: edit
    CART --> MENU: back
    CART --> PAYMENT: nonempty cart
    PAYMENT --> CART: back
    PAYMENT --> SUBMITTING: freeze request
    SUBMITTING --> COMPLETE: server result
    SUBMITTING --> SUBMIT_ERROR: uncertain response
    SUBMIT_ERROR --> SUBMITTING: identical retry
    MISSION --> CANCELLING: cancel
    MENU --> CANCELLING: cancel
    OPTION --> CANCELLING: cancel
    CART --> CANCELLING: cancel
    PAYMENT --> CANCELLING: cancel
    CANCELLING --> CANCELLED: server confirmation
    CANCELLING --> CANCEL_ERROR
    CANCEL_ERROR --> CANCELLING: retry
    CANCELLED --> START
    COMPLETE --> START
```

Help toggles within a state. Invalid events are ignored. Loading and starting failures have retry paths. A missing server session leads to EXPIRED and an explicit restart. Cancellation after an uncertain submission can conflict if completion won; retry the original submission to recover its result. No edit after frozen submission. The user can change options and quantity via cart edit before checkout.
