# 依赖管理

## 概述

ArchForge 使用两种机制管理依赖版本，实现了类似 Maven `dependencyManagement` 的功能：

1. **Spring Boot BOM** -- 管理所有 Spring Boot 生态系统依赖的版本
2. **自定义 BOM**（`dependencies` 模块）-- 管理第三方库的版本

通过这两个 BOM（Bill of Materials），子模块声明依赖时无需指定版本号。

## 工作原理

### Spring Boot BOM

根目录的 `build.gradle.kts` 导入了 Spring Boot BOM，使所有 Spring 管理的库版本自动解析：

```kotlin
dependencies {
    // Spring Boot BOM for dependency version management
    add("implementation", platform("org.springframework.boot:spring-boot-dependencies:4.0.5"))

    // JUnit BOM
    add("testImplementation", platform("org.junit:junit-bom:6.0.3"))
}
```

### 自定义 BOM（java-platform）

`dependencies/build.gradle.kts` 模块使用 Gradle 的 `java-platform` 插件，为项目中使用的每个第三方库定义版本约束：

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

### 根项目关联

根目录的 `build.gradle.kts` 将两个 BOM 应用于每个子项目（`dependencies` 模块自身除外）：

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

## 子模块中的使用

两个 BOM 应用后，子模块声明依赖时无需指定版本号：

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

## 添加新依赖

### Spring Boot 生态系统

如果依赖属于 Spring Boot 生态系统，直接添加即可无需指定版本——Spring Boot BOM 会自动解析：

```kotlin
dependencies {
    implementation("org.springframework.boot:spring-boot-starter-security")
}
```

### 第三方库

对于非 Spring Boot 依赖，首先在 `dependencies/build.gradle.kts` 中添加版本约束：

```kotlin
dependencies {
    constraints {
        api("org.example:example-library:1.0.0")
    }
}
```

然后在任意子模块中引用，无需指定版本：

```kotlin
dependencies {
    implementation("org.example:example-library")
}
```

## 优势

1. **版本集中管理** -- 所有依赖版本集中在一到两个文件中，升级更加便捷
2. **子模块声明简洁** -- 不再有版本号散落在数十个 `build.gradle.kts` 文件中
3. **杜绝版本冲突** -- BOM 保证整个项目使用一致的版本
4. **维护简单** -- 升级某个库只需在 platform 模块中修改一行

## 相关页面

- [技术栈](/zh/guide/tech-stack.md) -- 完整的技术列表与选型理由
- [项目结构](/zh/guide/project-structure.md) -- 模块组织方式
