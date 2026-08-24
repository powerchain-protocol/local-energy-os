# EV Charging

```text
EV --ISO 15118--> EVSE --OCPP--> PowerChain Charge
                               ├─ Reservations
                               ├─ Smart Charging
                               ├─ Tariffs
                               ├─ Metering
                               ├─ Grid Constraints
                               ├─ V2G
                               └─ Settlement
PowerChain <--> OCPI <--> CPO / eMSP
```

V2G modes: `GRID_TO_VEHICLE`, `SOLAR_TO_VEHICLE`, `VEHICLE_TO_HOME`, `VEHICLE_TO_BUILDING`, `VEHICLE_TO_GRID`. Dispatch requires hardware capability, user policy, minimum battery reserve, grid constraint, simulation, policy approval, and execution.
