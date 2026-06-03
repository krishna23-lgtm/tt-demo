# TechTank Watch Together Backend

Spring Boot backend for the Watch Together OTT platform.

## Run

```bash
cd /Users/B0330588/Downloads/techtankDemo/backend
mvn spring-boot:run
```

Configuration lives in `src/main/resources/application.yml`.

Configured MongoDB URI:

```text
mongodb://admin:admin@localhost:27017/msp?authSource=admin
```

Override with:

```bash
MONGODB_URI=mongodb://localhost:27017/watch_together mvn spring-boot:run
```

## Verify

```bash
mvn clean install
```

REST examples are in `postman/`.

WebSocket examples are in `docs/websocket-test-examples.md`.
