# Dependency Management

## Overview

ArchForge uses two mechanisms to manage dependency versions, achieving functionality similar to Maven's `dependencyManagement`:

1. **Spring Boot BOM** -- manages versions for all Spring Boot ecosystem dependencies
2. **Custom BOM** (`dependencies` module) -- manages versions for third-party libraries

With these two BOMs (Bill of Materials), submodules declare dependencies without specifying version numbers.

## How It Works

### Spring Boot BOM

The root `build.gradle.kts` imports the Spring Boot BOM so that all Spring-managed library versions are resolved automatically:

```kotlin
dependencies {
    // Spring Boot BOM for dependency version management
    add("implementation", platform("org.springframework.boot:spring-boot-dependencies:4.0.5"))

    // JUnit BOM
    add("testImplementation", platform("org.junit:junit-bom:6.0.3"))
}
```

### Custom BOM (java-platform)

The `dependencies/build.gradle.kts` module uses Gradle's `java-platform` plugin to define version constraints for every third-party library used in the project:

```kotlin
plugins {
    `java-platform`
}

dependencies {
    constraints {
        api("com.baomidou:dynamic-datasource-spring-boot4-starter:4.5.0")
        api("io.jsonwebtoken:jjwt-api:0.12.6")
        api("com.querydsl:querydsl-jpa:5.1.0")
        api("org.flywaydb:flyway-core:11.14.1")
        api("com.google.guava:guava:33.4.8-jre")
        api("commons-io:commons-io:2.19.0")
        api("org.apache.commons:commons-lang3:3.20.0")
        api("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.8.11")
        api("org.mapstruct:mapstruct:1.6.3")
        api("org.testcontainers:testcontainers:2.0.4")
        // ... all versions in one place
    }
}
```

### Root Project Wiring

The root `build.gradle.kts` applies both BOMs to every subproject (except the `dependencies` module itself):

```kotlin
subprojects {
    if (name != "dependencies") {
        apply(plugin = "java-library")

        dependencies {
            // Spring Boot BOM
            add("implementation", platform("org.springframework.boot:spring-boot-dependencies:4.0.5"))

            // Custom BOM
            add("implementation", platform(project(":dependencies")))
        }
    }
}
```

## Usage in Submodules

With both BOMs applied, submodules declare dependencies without version numbers:

```kotlin
// domain/admin-user/build.gradle.kts
dependencies {
    // Spring Boot starters (version from Spring Boot BOM)
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-aop")
    implementation("org.springframework.boot:spring-boot-starter-actuator")

    // Third-party libraries (version from custom BOM)
    implementation("com.google.guava:guava")
    implementation("org.apache.commons:commons-lang3")
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui")

    // Lombok (version from Spring Boot BOM)
    compileOnly("org.projectlombok:lombok")
    annotationProcessor("org.projectlombok:lombok")

    // Test dependencies (version from JUnit BOM + custom BOM)
    testImplementation("org.junit.jupiter:junit-jupiter-api")
    testRuntimeOnly("org.junit.jupiter:junit-jupiter-engine")
    testImplementation("org.testcontainers:testcontainers")
}
```

## Adding a New Dependency

### Spring Boot Ecosystem

If the dependency is part of the Spring Boot ecosystem, simply add it without a version -- the Spring Boot BOM resolves it:

```kotlin
dependencies {
    implementation("org.springframework.boot:spring-boot-starter-security")
}
```

### Third-Party Library

For non-Spring-Boot dependencies, first add a version constraint to `dependencies/build.gradle.kts`:

```kotlin
dependencies {
    constraints {
        api("org.example:example-library:1.0.0")
    }
}
```

Then reference it in any submodule without a version:

```kotlin
dependencies {
    implementation("org.example:example-library")
}
```

## Benefits

1. **Centralized version control** -- all dependency versions live in one or two places, making upgrades straightforward
2. **Clean submodule declarations** -- no version numbers scattered across dozens of `build.gradle.kts` files
3. **No version conflicts** -- the BOM guarantees consistent versions across the entire project
4. **Easy maintenance** -- upgrading a library requires a single-line change in the platform module

## Related Pages

- [Tech Stack](./tech-stack.md) -- full list of technologies and rationale
- [Project Structure](./project-structure.md) -- how modules are organized
