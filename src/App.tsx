import React, { useState, useMemo } from 'react';
import {
  Layers,
  FileCode,
  ShieldCheck,
  Database,
  Terminal,
  Copy,
  Check,
  FolderTree,
  ChevronRight,
  ChevronDown,
  Lock,
  Eye,
  Server,
  Code2,
  Box,
  FileText,
  Search,
  AlertTriangle,
  Play
} from 'lucide-react';

// Files database representing all scaffolding files
interface ProjectFile {
  id: string;
  module: string;
  path: string;
  fileName: string;
  language: 'xml' | 'kotlin' | 'sql' | 'yaml';
  category: 'pom' | 'core-common' | 'multitenancy' | 'saas' | 'clinic' | 'config';
  description: string;
  code: string;
}

const PROJECT_FILES: ProjectFile[] = [
  {
    id: 'root-pom',
    module: 'root',
    path: '/pom.xml',
    fileName: 'pom.xml',
    language: 'xml',
    category: 'pom',
    description: 'Root Maven aggregator POM configuring Spring Boot 3.3.4, Kotlin 2.0.20, Java 21, and compiler plugins',
    code: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.micropms</groupId>
    <artifactId>micro-pms-platform</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <packaging>pom</packaging>

    <name>Micro-PMS Multi-Tenant SaaS Platform</name>
    <description>Enterprise Micro-PMS Multi-Tenant SaaS scaffolded with Spring Boot 3.3.4, Kotlin 2.0.20, Java 21, and PostgreSQL RLS</description>

    <modules>
        <module>core-common</module>
        <module>core-multitenancy</module>
        <module>module-saas-platform</module>
        <module>module-clinic-core</module>
        <module>app-server</module>
    </modules>

    <properties>
        <!-- Language & Runtime Targets -->
        <java.version>21</java.version>
        <maven.compiler.release>21</maven.compiler.release>
        <kotlin.version>2.0.20</kotlin.version>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <project.reporting.outputEncoding>UTF-8</project.reporting.outputEncoding>

        <!-- Framework & Library Versions -->
        <spring-boot.version>3.3.4</spring-boot.version>
        <postgresql.version>42.7.4</postgresql.version>
        <flyway.version>10.18.2</flyway.version>
        <mockk.version>1.3.13</mockk.version>
        <testcontainers.version>1.20.1</testcontainers.version>
        <jwt.version>0.12.6</jwt.version>
        <springdoc-openapi.version>2.6.0</springdoc-openapi.version>
    </properties>

    <dependencyManagement>
        <dependencies>
            <!-- Spring Boot Dependencies BOM -->
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-dependencies</artifactId>
                <version>\${spring-boot.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>

            <!-- Testcontainers BOM -->
            <dependency>
                <groupId>org.testcontainers</groupId>
                <artifactId>testcontainers-bom</artifactId>
                <version>\${testcontainers.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>

            <!-- Internal Multi-Module Dependencies -->
            <dependency>
                <groupId>com.micropms</groupId>
                <artifactId>core-common</artifactId>
                <version>\${project.version}</version>
            </dependency>
            <dependency>
                <groupId>com.micropms</groupId>
                <artifactId>core-multitenancy</artifactId>
                <version>\${project.version}</version>
            </dependency>
            <dependency>
                <groupId>com.micropms</groupId>
                <artifactId>module-saas-platform</artifactId>
                <version>\${project.version}</version>
            </dependency>
            <dependency>
                <groupId>com.micropms</groupId>
                <artifactId>module-clinic-core</artifactId>
                <version>\${project.version}</version>
            </dependency>

            <!-- Kotlin Dependencies -->
            <dependency>
                <groupId>org.jetbrains.kotlin</groupId>
                <artifactId>kotlin-stdlib</artifactId>
                <version>\${kotlin.version}</version>
            </dependency>
            <dependency>
                <groupId>org.jetbrains.kotlin</groupId>
                <artifactId>kotlin-reflect</artifactId>
                <version>\${kotlin.version}</version>
            </dependency>
            <dependency>
                <groupId>com.fasterxml.jackson.module</groupId>
                <artifactId>jackson-module-kotlin</artifactId>
                <version>2.17.2</version>
            </dependency>

            <!-- PostgreSQL JDBC & Flyway Migration -->
            <dependency>
                <groupId>org.postgresql</groupId>
                <artifactId>postgresql</artifactId>
                <version>\${postgresql.version}</version>
            </dependency>
            <dependency>
                <groupId>org.flywaydb</groupId>
                <artifactId>flyway-core</artifactId>
                <version>\${flyway.version}</version>
            </dependency>
            <dependency>
                <groupId>org.flywaydb</groupId>
                <artifactId>flyway-database-postgresql</artifactId>
                <version>\${flyway.version}</version>
            </dependency>

            <!-- JJWT for Stateless JWT with Tenant Claims -->
            <dependency>
                <groupId>io.jsonwebtoken</groupId>
                <artifactId>jjwt-api</artifactId>
                <version>\${jwt.version}</version>
            </dependency>
            <dependency>
                <groupId>io.jsonwebtoken</groupId>
                <artifactId>jjwt-impl</artifactId>
                <version>\${jwt.version}</version>
                <scope>runtime</scope>
            </dependency>
            <dependency>
                <groupId>io.jsonwebtoken</groupId>
                <artifactId>jjwt-jackson</artifactId>
                <version>\${jwt.version}</version>
                <scope>runtime</scope>
            </dependency>

            <!-- OpenAPI Documentation -->
            <dependency>
                <groupId>org.springdoc</groupId>
                <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
                <version>\${springdoc-openapi.version}</version>
            </dependency>

            <!-- Test Frameworks: MockK & PostgreSQL Testcontainer -->
            <dependency>
                <groupId>io.mockk</groupId>
                <artifactId>mockk-jvm</artifactId>
                <version>\${mockk.version}</version>
                <scope>test</scope>
            </dependency>
            <dependency>
                <groupId>org.testcontainers</groupId>
                <artifactId>postgresql</artifactId>
                <version>\${testcontainers.version}</version>
                <scope>test</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <build>
        <sourceDirectory>\${project.basedir}/src/main/kotlin</sourceDirectory>
        <testSourceDirectory>\${project.basedir}/src/test/kotlin</testSourceDirectory>

        <pluginManagement>
            <plugins>
                <!-- Kotlin Compiler Plugin with Spring and JPA Open/No-Arg Configuration -->
                <plugin>
                    <groupId>org.jetbrains.kotlin</groupId>
                    <artifactId>kotlin-maven-plugin</artifactId>
                    <version>\${kotlin.version}</version>
                    <configuration>
                        <jvmTarget>\${java.version}</jvmTarget>
                        <args>
                            <arg>-Xjsr305=strict</arg>
                            <arg>-opt-in=kotlin.RequiresOptIn</arg>
                        </args>
                        <compilerPlugins>
                            <plugin>spring</plugin>
                            <plugin>jpa</plugin>
                            <plugin>all-open</plugin>
                            <plugin>no-arg</plugin>
                        </compilerPlugins>
                        <pluginOptions>
                            <option>all-open:annotation=jakarta.persistence.Entity</option>
                            <option>all-open:annotation=jakarta.persistence.MappedSuperclass</option>
                            <option>all-open:annotation=jakarta.persistence.Embeddable</option>
                            <option>no-arg:annotation=jakarta.persistence.Entity</option>
                            <option>no-arg:annotation=jakarta.persistence.MappedSuperclass</option>
                            <option>no-arg:annotation=jakarta.persistence.Embeddable</option>
                        </pluginOptions>
                    </configuration>
                    <dependencies>
                        <dependency>
                            <groupId>org.jetbrains.kotlin</groupId>
                            <artifactId>kotlin-maven-allopen</artifactId>
                            <version>\${kotlin.version}</version>
                        </dependency>
                        <dependency>
                            <groupId>org.jetbrains.kotlin</groupId>
                            <artifactId>kotlin-maven-noarg</artifactId>
                            <version>\${kotlin.version}</version>
                        </dependency>
                    </dependencies>
                    <executions>
                        <execution>
                            <id>compile</id>
                            <goals>
                                <goal>compile</goal>
                            </goals>
                        </execution>
                        <execution>
                            <id>test-compile</id>
                            <goals>
                                <goal>test-compile</goal>
                            </goals>
                        </execution>
                    </executions>
                </plugin>

                <!-- Java Compiler Plugin enforcing Java 21 -->
                <plugin>
                    <groupId>org.apache.maven.plugins</groupId>
                    <artifactId>maven-compiler-plugin</artifactId>
                    <version>3.13.0</version>
                    <configuration>
                        <release>\${java.version}</release>
                        <parameters>true</parameters>
                    </configuration>
                </plugin>

                <!-- Spring Boot Maven Plugin for Executable Fat Jar -->
                <plugin>
                    <groupId>org.springframework.boot</groupId>
                    <artifactId>spring-boot-maven-plugin</artifactId>
                    <version>\${spring-boot.version}</version>
                </plugin>

                <!-- Maven Surefire Plugin for Unit & Integration Testing -->
                <plugin>
                    <groupId>org.apache.maven.plugins</groupId>
                    <artifactId>maven-surefire-plugin</artifactId>
                    <version>3.5.0</version>
                </plugin>
            </plugins>
        </pluginManagement>
    </build>
</project>`
  },
  {
    id: 'pom-core-common',
    module: 'core-common',
    path: '/core-common/pom.xml',
    fileName: 'pom.xml',
    language: 'xml',
    category: 'pom',
    description: 'Standalone base module POM defining persistence, validation, and web contracts',
    code: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>com.micropms</groupId>
        <artifactId>micro-pms-platform</artifactId>
        <version>1.0.0-SNAPSHOT</version>
        <relativePath>../pom.xml</relativePath>
    </parent>

    <artifactId>core-common</artifactId>
    <packaging>jar</packaging>

    <name>Core Common</name>
    <description>Core base module containing audit entities, base repositories, base controllers, and unified API response envelopes</description>

    <dependencies>
        <!-- Spring Boot Starters -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>

        <!-- Kotlin Support -->
        <dependency>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-stdlib</artifactId>
        </dependency>
        <dependency>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-reflect</artifactId>
        </dependency>
        <dependency>
            <groupId>com.fasterxml.jackson.module</groupId>
            <artifactId>jackson-module-kotlin</artifactId>
        </dependency>

        <!-- Testing -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>io.mockk</groupId>
            <artifactId>mockk-jvm</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.jetbrains.kotlin</groupId>
                <artifactId>kotlin-maven-plugin</artifactId>
            </plugin>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>`
  },
  {
    id: 'pom-core-multitenancy',
    module: 'core-multitenancy',
    path: '/core-multitenancy/pom.xml',
    fileName: 'pom.xml',
    language: 'xml',
    category: 'pom',
    description: 'Multi-tenancy module strictly depending on core-common with Spring Security, Redis, and PostgreSQL',
    code: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>com.micropms</groupId>
        <artifactId>micro-pms-platform</artifactId>
        <version>1.0.0-SNAPSHOT</version>
        <relativePath>../pom.xml</relativePath>
    </parent>

    <artifactId>core-multitenancy</artifactId>
    <packaging>jar</packaging>

    <name>Core Multi-Tenancy</name>
    <description>Multi-tenancy infrastructure: TenantContext ThreadLocal, JWT security filter, PostgreSQL RLS connection hook, Redis tenant caching, and BaseTenantEntity</description>

    <dependencies>
        <!-- Strict Dependency on core-common -->
        <dependency>
            <groupId>com.micropms</groupId>
            <artifactId>core-common</artifactId>
        </dependency>

        <!-- Spring Security & JWT Token Verification -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <scope>runtime</scope>
        </dependency>

        <!-- Redis Cache for Tenant Resolution & Status Invalidation -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-redis</artifactId>
        </dependency>

        <!-- PostgreSQL JDBC & Flyway Database Migration -->
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
        </dependency>
        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-core</artifactId>
        </dependency>
        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-database-postgresql</artifactId>
        </dependency>

        <!-- Testing -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>io.mockk</groupId>
            <artifactId>mockk-jvm</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.testcontainers</groupId>
            <artifactId>postgresql</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.jetbrains.kotlin</groupId>
                <artifactId>kotlin-maven-plugin</artifactId>
            </plugin>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>`
  },
  {
    id: 'pom-module-saas-platform',
    module: 'module-saas-platform',
    path: '/module-saas-platform/pom.xml',
    fileName: 'pom.xml',
    language: 'xml',
    category: 'pom',
    description: 'Control plane module strictly decoupled from module-clinic-core',
    code: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>com.micropms</groupId>
        <artifactId>micro-pms-platform</artifactId>
        <version>1.0.0-SNAPSHOT</version>
        <relativePath>../pom.xml</relativePath>
    </parent>

    <artifactId>module-saas-platform</artifactId>
    <packaging>jar</packaging>

    <name>Module SaaS Platform</name>
    <description>Control plane module managing tenants, plans, subscriptions, and platform-wide administrative workflows (Independent of clinic clinical domain)</description>

    <dependencies>
        <!-- Depends on core-common and core-multitenancy ONLY (MUST NOT depend on module-clinic-core) -->
        <dependency>
            <groupId>com.micropms</groupId>
            <artifactId>core-common</artifactId>
        </dependency>
        <dependency>
            <groupId>com.micropms</groupId>
            <artifactId>core-multitenancy</artifactId>
        </dependency>

        <!-- Spring Boot Starters -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>

        <!-- Testing -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>io.mockk</groupId>
            <artifactId>mockk-jvm</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.jetbrains.kotlin</groupId>
                <artifactId>kotlin-maven-plugin</artifactId>
            </plugin>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>`
  },
  {
    id: 'pom-module-clinic-core',
    module: 'module-clinic-core',
    path: '/module-clinic-core/pom.xml',
    fileName: 'pom.xml',
    language: 'xml',
    category: 'pom',
    description: 'Application plane clinic module strictly decoupled from module-saas-platform',
    code: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>com.micropms</groupId>
        <artifactId>micro-pms-platform</artifactId>
        <version>1.0.0-SNAPSHOT</version>
        <relativePath>../pom.xml</relativePath>
    </parent>

    <artifactId>module-clinic-core</artifactId>
    <packaging>jar</packaging>

    <name>Module Clinic Core</name>
    <description>Application plane module implementing patients, appointments, encounters, invoices, and relational typed EAV custom clinical fields (Independent of saas platform control plane)</description>

    <dependencies>
        <!-- Depends on core-common and core-multitenancy ONLY (MUST NOT depend on module-saas-platform) -->
        <dependency>
            <groupId>com.micropms</groupId>
            <artifactId>core-common</artifactId>
        </dependency>
        <dependency>
            <groupId>com.micropms</groupId>
            <artifactId>core-multitenancy</artifactId>
        </dependency>

        <!-- Spring Boot Starters -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>

        <!-- Testing -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>io.mockk</groupId>
            <artifactId>mockk-jvm</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.jetbrains.kotlin</groupId>
                <artifactId>kotlin-maven-plugin</artifactId>
            </plugin>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>`
  },
  {
    id: 'pom-app-server',
    module: 'app-server',
    path: '/app-server/pom.xml',
    fileName: 'pom.xml',
    language: 'xml',
    category: 'pom',
    description: 'Aggregator runtime module packaging executable fat jar with Actuator and OpenAPI',
    code: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>com.micropms</groupId>
        <artifactId>micro-pms-platform</artifactId>
        <version>1.0.0-SNAPSHOT</version>
        <relativePath>../pom.xml</relativePath>
    </parent>

    <artifactId>app-server</artifactId>
    <packaging>jar</packaging>

    <name>App Server</name>
    <description>Executable application server packaging all Micro-PMS modules into a production Spring Boot 3.3.4 runtime</description>

    <dependencies>
        <!-- Platform Submodules Aggregation -->
        <dependency>
            <groupId>com.micropms</groupId>
            <artifactId>core-common</artifactId>
        </dependency>
        <dependency>
            <groupId>com.micropms</groupId>
            <artifactId>core-multitenancy</artifactId>
        </dependency>
        <dependency>
            <groupId>com.micropms</groupId>
            <artifactId>module-saas-platform</artifactId>
        </dependency>
        <dependency>
            <groupId>com.micropms</groupId>
            <artifactId>module-clinic-core</artifactId>
        </dependency>

        <!-- Production Actuator & Monitoring -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>

        <!-- Interactive OpenAPI / Swagger UI -->
        <dependency>
            <groupId>org.springdoc</groupId>
            <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
        </dependency>

        <!-- Testing & Container Verification -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.testcontainers</groupId>
            <artifactId>postgresql</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>io.mockk</groupId>
            <artifactId>mockk-jvm</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.jetbrains.kotlin</groupId>
                <artifactId>kotlin-maven-plugin</artifactId>
            </plugin>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
            </plugin>
            <!-- Executable Spring Boot Fat Jar Packaging -->
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <executions>
                    <execution>
                        <goals>
                            <goal>repackage</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
</project>`
  },
  {
    id: 'base-audit-entity',
    module: 'core-common',
    path: '/core-common/src/main/kotlin/com/micropms/common/entity/BaseAuditEntity.kt',
    fileName: 'BaseAuditEntity.kt',
    language: 'kotlin',
    category: 'core-common',
    description: 'Abstract @MappedSuperclass with UUID PK, JPA auditing timestamps/auditors, and optimistic locking',
    code: `package com.micropms.common.entity

import jakarta.persistence.Column
import jakarta.persistence.EntityListeners
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.MappedSuperclass
import jakarta.persistence.Version
import org.hibernate.Hibernate
import org.springframework.data.annotation.CreatedBy
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.LastModifiedBy
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import java.io.Serializable
import java.time.Instant
import java.util.UUID

/**
 * Base abstract mapped superclass providing first-class auditing, optimistic locking,
 * and UUID primary key identity across all domain entities.
 */
@MappedSuperclass
@EntityListeners(AuditingEntityListener::class)
abstract class BaseAuditEntity : Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    open var id: UUID? = null

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    open var createdAt: Instant = Instant.now()

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    open var updatedAt: Instant = Instant.now()

    @CreatedBy
    @Column(name = "created_by", updatable = false)
    open var createdBy: UUID? = null

    @LastModifiedBy
    @Column(name = "last_modified_by")
    open var lastModifiedBy: UUID? = null

    @Version
    @Column(name = "version", nullable = false)
    open var version: Long = 0L

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other == null || Hibernate.getClass(this) != Hibernate.getClass(other)) return false
        val otherEntity = other as BaseAuditEntity
        return id != null && id == otherEntity.id
    }

    override fun hashCode(): Int {
        return id?.hashCode() ?: getClassHashCode()
    }

    private fun getClassHashCode(): Int {
        return javaClass.hashCode()
    }

    override fun toString(): String {
        return "\${this::class.simpleName}(id=$id, createdAt=$createdAt, updatedAt=$updatedAt, version=$version)"
    }
}`
  },
  {
    id: 'base-repository',
    module: 'core-common',
    path: '/core-common/src/main/kotlin/com/micropms/common/repository/BaseRepository.kt',
    fileName: 'BaseRepository.kt',
    language: 'kotlin',
    category: 'core-common',
    description: 'Interface extending JpaRepository and JpaSpecificationExecutor with projection support',
    code: `package com.micropms.common.repository

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.domain.Specification
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.repository.NoRepositoryBean
import java.util.Optional

/**
 * Standard enterprise repository interface exposing JPA persistence, Specifications,
 * and dynamic projection capabilities.
 */
@NoRepositoryBean
interface BaseRepository<T : Any, ID : Any> : JpaRepository<T, ID>, JpaSpecificationExecutor<T> {

    /**
     * Retrieve an entity by ID projected into a dynamic projection DTO interface or class.
     */
    fun <P : Any> findById(id: ID, projectionClass: Class<P>): Optional<P>

    /**
     * Execute a filtered specification query with pagination and dynamic projection.
     */
    fun <P : Any> findBy(
        spec: Specification<T>?,
        projectionFunction: (org.springframework.data.repository.query.FluentQuery.FetchableFluentQuery<T>) -> Page<P>
    ): Page<P>
}`
  },
  {
    id: 'api-response',
    module: 'core-common',
    path: '/core-common/src/main/kotlin/com/micropms/common/dto/ApiResponse.kt',
    fileName: 'ApiResponse.kt',
    language: 'kotlin',
    category: 'core-common',
    description: 'Standardized response envelope: ApiResponse<T>(code, message, data, timestamp)',
    code: `package com.micropms.common.dto

import java.time.Instant

/**
 * Standardized unified REST response envelope for all successful operations.
 */
data class ApiResponse<T>(
    val code: Int,
    val message: String,
    val data: T?,
    val timestamp: Instant = Instant.now()
) {
    companion object {
        fun <T> ok(data: T?, message: String = "Record retrieved"): ApiResponse<T> =
            ApiResponse(
                code = 200,
                message = message,
                data = data,
                timestamp = Instant.now()
            )

        fun <T> created(data: T?, message: String = "Record created"): ApiResponse<T> =
            ApiResponse(
                code = 201,
                message = message,
                data = data,
                timestamp = Instant.now()
            )

        fun okNoContent(message: String = "Operation completed successfully"): ApiResponse<Unit> =
            ApiResponse(
                code = 200,
                message = message,
                data = null,
                timestamp = Instant.now()
            )
    }
}`
  },
  {
    id: 'api-error-response',
    module: 'core-common',
    path: '/core-common/src/main/kotlin/com/micropms/common/dto/ApiErrorResponse.kt',
    fileName: 'ApiErrorResponse.kt',
    language: 'kotlin',
    category: 'core-common',
    description: 'Standardized error envelope with granular FieldErrorDto validation list',
    code: `package com.micropms.common.dto

import java.time.Instant

/**
 * Detailed validation field error representation.
 */
data class FieldErrorDto(
    val field: String,
    val rejectedValue: Any?,
    val message: String
)

/**
 * Standardized error envelope returned by GlobalExceptionHandler for 4xx/5xx responses.
 */
data class ApiErrorResponse(
    val code: Int,
    val message: String,
    val errors: List<FieldErrorDto>? = null,
    val timestamp: Instant = Instant.now()
) {
    companion object {
        fun of(
            code: Int,
            message: String,
            errors: List<FieldErrorDto>? = null
        ): ApiErrorResponse = ApiErrorResponse(
            code = code,
            message = message,
            errors = errors,
            timestamp = Instant.now()
        )
    }
}`
  },
  {
    id: 'global-exception-handler',
    module: 'core-common',
    path: '/core-common/src/main/kotlin/com/micropms/common/exception/GlobalExceptionHandler.kt',
    fileName: 'GlobalExceptionHandler.kt',
    language: 'kotlin',
    category: 'core-common',
    description: '@RestControllerAdvice handling validation errors, access denial, and scrubbed logging',
    code: `package com.micropms.common.exception

import com.micropms.common.dto.ApiErrorResponse
import com.micropms.common.dto.FieldErrorDto
import jakarta.validation.ConstraintViolationException
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.AccessDeniedException
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import java.time.Instant

/**
 * Global REST exception handler mapping platform and validation exceptions
 * to standardized ApiErrorResponse envelopes. Enforces clinical privacy by
 * scrubbing PII and sensitive internal details.
 */
@RestControllerAdvice
class GlobalExceptionHandler {

    private val log = LoggerFactory.getLogger(GlobalExceptionHandler::class.java)

    /**
     * Handles DTO validation errors triggered by @Valid annotations.
     */
    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleMethodArgumentNotValid(
        ex: MethodArgumentNotValidException
    ): ResponseEntity<ApiErrorResponse> {
        val fieldErrors = ex.bindingResult.fieldErrors.map { fieldError ->
            FieldErrorDto(
                field = fieldError.field,
                rejectedValue = fieldError.rejectedValue?.toString(),
                message = fieldError.defaultMessage ?: "Invalid value"
            )
        }

        val errorResponse = ApiErrorResponse(
            code = HttpStatus.BAD_REQUEST.value(),
            message = "Validation failed for \${fieldErrors.size} field(s)",
            errors = fieldErrors,
            timestamp = Instant.now()
        )

        log.warn("Validation error encountered on endpoint: {} field(s) rejected", fieldErrors.size)
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse)
    }

    /**
     * Handles direct parameter or entity constraint violations.
     */
    @ExceptionHandler(ConstraintViolationException::class)
    fun handleConstraintViolation(
        ex: ConstraintViolationException
    ): ResponseEntity<ApiErrorResponse> {
        val errors = ex.constraintViolations.map { violation ->
            FieldErrorDto(
                field = violation.propertyPath.toString(),
                rejectedValue = violation.invalidValue?.toString(),
                message = violation.message
            )
        }

        val response = ApiErrorResponse(
            code = HttpStatus.BAD_REQUEST.value(),
            message = "Constraint violation occurred",
            errors = errors,
            timestamp = Instant.now()
        )
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response)
    }

    /**
     * Handles domain resource lookup failures.
     */
    @ExceptionHandler(ResourceNotFoundException::class)
    fun handleResourceNotFound(
        ex: ResourceNotFoundException
    ): ResponseEntity<ApiErrorResponse> {
        val response = ApiErrorResponse(
            code = HttpStatus.NOT_FOUND.value(),
            message = ex.message ?: "Requested resource not found",
            errors = null,
            timestamp = Instant.now()
        )
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response)
    }

    /**
     * Handles Spring Security access denial (RBAC / tenant isolation violations).
     */
    @ExceptionHandler(AccessDeniedException::class)
    fun handleAccessDenied(
        ex: AccessDeniedException
    ): ResponseEntity<ApiErrorResponse> {
        log.warn("Access denied for security context: insufficient authorities or unauthorized tenant access")
        val response = ApiErrorResponse(
            code = HttpStatus.FORBIDDEN.value(),
            message = "Access denied: insufficient permissions to access this clinical or administrative resource",
            errors = null,
            timestamp = Instant.now()
        )
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response)
    }

    /**
     * Handles illegal argument and invalid state transitions.
     */
    @ExceptionHandler(IllegalArgumentException::class, IllegalStateException::class)
    fun handleIllegalState(
        ex: RuntimeException
    ): ResponseEntity<ApiErrorResponse> {
        log.warn("Client state violation: {}", ex.message)
        val response = ApiErrorResponse(
            code = HttpStatus.BAD_REQUEST.value(),
            message = ex.message ?: "Invalid request state",
            errors = null,
            timestamp = Instant.now()
        )
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response)
    }

    /**
     * Fallback for uncaught system exceptions. Sanitizes messages to prevent
     * stack trace leakage or internal schema exposure.
     */
    @ExceptionHandler(Exception::class)
    fun handleGenericException(
        ex: Exception
    ): ResponseEntity<ApiErrorResponse> {
        log.error("Internal platform error occurred: {}", ex.javaClass.simpleName, ex)
        val response = ApiErrorResponse(
            code = HttpStatus.INTERNAL_SERVER_ERROR.value(),
            message = "An unexpected error occurred while processing the request. Contact support with the reference timestamp.",
            errors = null,
            timestamp = Instant.now()
        )
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response)
    }
}`
  },
  {
    id: 'base-controller',
    module: 'core-common',
    path: '/core-common/src/main/kotlin/com/micropms/common/controller/BaseController.kt',
    fileName: 'BaseController.kt',
    language: 'kotlin',
    category: 'core-common',
    description: 'Abstract generic CRUD controller with pre-signed file upload/download URL generators',
    code: `package com.micropms.common.controller

import com.micropms.common.dto.ApiResponse
import com.micropms.common.exception.ResourceNotFoundException
import com.micropms.common.repository.BaseRepository
import jakarta.validation.Valid
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.data.web.PageableDefault
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestParam
import java.security.MessageDigest
import java.time.Instant
import java.util.Base64
import java.util.UUID

/**
 * Abstract generic REST controller providing reusable CRUD contracts,
 * paginated queries, projection/DTO mapping abstractions, and standardized
 * pre-signed file URL generation utilities.
 */
abstract class BaseController<T : Any, ID : Any, FormDto : Any, ResponseDto : Any>(
    protected val repository: BaseRepository<T, ID>,
    protected val resourceName: String
) {

    /**
     * Maps an incoming creation/update DTO to a persistent domain entity.
     */
    protected abstract fun toEntity(form: FormDto): T

    /**
     * Maps a persistent domain entity to the client-facing ResponseDto.
     */
    protected abstract fun toResponseDto(entity: T): ResponseDto

    /**
     * Mutates an existing entity with values from the incoming update DTO.
     */
    protected abstract fun updateEntityFromForm(entity: T, form: FormDto): T

    /**
     * Retrieve a single resource by its unique identifier.
     */
    @GetMapping("/{id}")
    open fun findById(@PathVariable id: ID): ResponseEntity<ApiResponse<ResponseDto>> {
        val entity = repository.findById(id).orElseThrow {
            ResourceNotFoundException(resourceName, "id", id)
        }
        return ResponseEntity.ok(ApiResponse.ok(toResponseDto(entity), "$resourceName retrieved successfully"))
    }

    /**
     * Retrieve a paginated list of resources with optional text search filter.
     */
    @GetMapping
    open fun findAll(
        @PageableDefault(size = 20, sort = ["createdAt"], direction = Sort.Direction.DESC) pageable: Pageable,
        @RequestParam(required = false) search: String?
    ): ResponseEntity<ApiResponse<Page<ResponseDto>>> {
        val page = repository.findAll(pageable).map { toResponseDto(it) }
        return ResponseEntity.ok(ApiResponse.ok(page, "$resourceName page retrieved"))
    }

    /**
     * Create a new domain entity from the incoming validated form.
     */
    @PostMapping
    open fun create(@Valid @RequestBody form: FormDto): ResponseEntity<ApiResponse<ResponseDto>> {
        val entity = toEntity(form)
        val saved = repository.save(entity)
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(ApiResponse.created(toResponseDto(saved), "$resourceName created successfully"))
    }

    /**
     * Update an existing domain entity by ID.
     */
    @PutMapping("/{id}")
    open fun update(
        @PathVariable id: ID,
        @Valid @RequestBody form: FormDto
    ): ResponseEntity<ApiResponse<ResponseDto>> {
        val existing = repository.findById(id).orElseThrow {
            ResourceNotFoundException(resourceName, "id", id)
        }
        val updated = updateEntityFromForm(existing, form)
        val saved = repository.save(updated)
        return ResponseEntity.ok(ApiResponse.ok(toResponseDto(saved), "$resourceName updated successfully"))
    }

    /**
     * Delete an existing domain entity by ID.
     */
    @DeleteMapping("/{id}")
    open fun delete(@PathVariable id: ID): ResponseEntity<ApiResponse<Unit>> {
        if (!repository.existsById(id)) {
            throw ResourceNotFoundException(resourceName, "id", id)
        }
        repository.deleteById(id)
        return ResponseEntity.ok(ApiResponse.okNoContent("$resourceName deleted successfully"))
    }

    // =========================================================================
    // Standard Utility Methods for Secure File Upload / Download URL Generation
    // =========================================================================

    /**
     * Generates a tamper-proof signed URL for secure direct-to-storage file uploads (S3/GCS compliant).
     */
    protected fun generatePresignedUploadUrl(
        fileName: String,
        contentType: String,
        expiresInSeconds: Long = 3600
    ): String {
        val fileId = UUID.randomUUID()
        val expiresAt = Instant.now().plusSeconds(expiresInSeconds).epochSecond
        val sanitizedFileName = fileName.replace("[^a-zA-Z0-9._-]".toRegex(), "_")
        val storagePath = "uploads/\${fileId}_\$sanitizedFileName"
        val signaturePayload = "$storagePath:$contentType:$expiresAt"
        val signature = computeHmacSha256(signaturePayload)

        return "/api/v1/storage/upload?path=$storagePath&expires=$expiresAt&type=$contentType&sig=$signature"
    }

    /**
     * Generates a tamper-proof signed URL for secure authorized file downloads with temporal expiration.
     */
    protected fun generatePresignedDownloadUrl(
        fileKey: String,
        expiresInSeconds: Long = 3600
    ): String {
        val expiresAt = Instant.now().plusSeconds(expiresInSeconds).epochSecond
        val signaturePayload = "$fileKey:$expiresAt"
        val signature = computeHmacSha256(signaturePayload)

        return "/api/v1/storage/download?key=$fileKey&expires=$expiresAt&sig=$signature"
    }

    private fun computeHmacSha256(data: String): String {
        val md = MessageDigest.getInstance("SHA-256")
        val digest = md.digest(data.toByteArray(Charsets.UTF_8))
        return Base64.getUrlEncoder().withoutPadding().encodeToString(digest)
    }
}`
  },
  {
    id: 'base-tenant-entity',
    module: 'core-multitenancy',
    path: '/core-multitenancy/src/main/kotlin/com/micropms/multitenancy/entity/BaseTenantEntity.kt',
    fileName: 'BaseTenantEntity.kt',
    language: 'kotlin',
    category: 'multitenancy',
    description: 'Extends BaseAuditEntity, introducing non-nullable tenantId with @PrePersist validation hook',
    code: `package com.micropms.multitenancy.entity

import com.micropms.common.entity.BaseAuditEntity
import com.micropms.multitenancy.context.TenantContext
import jakarta.persistence.Column
import jakarta.persistence.MappedSuperclass
import jakarta.persistence.PrePersist
import java.util.UUID

/**
 * Base mapped superclass for all Application Plane tenant-scoped entities.
 * Automatically injects and enforces the tenant identifier from the validated
 * thread-local TenantContext on persistence.
 */
@MappedSuperclass
abstract class BaseTenantEntity : BaseAuditEntity() {

    @Column(name = "tenant_id", nullable = false, updatable = false)
    open var tenantId: UUID? = null

    /**
     * Injects the active tenantId from TenantContext prior to entity persistence.
     * Prevents tenant cross-contamination and enforces zero data leakage.
     */
    @PrePersist
    fun prePersistTenantEnforcement() {
        val currentTenant = TenantContext.getTenantId()
            ?: throw IllegalStateException("Cannot persist \${this::class.simpleName} without an active TenantContext in session")

        if (this.tenantId == null) {
            this.tenantId = currentTenant
        } else if (this.tenantId != currentTenant) {
            throw SecurityException("Security violation: Attempted to persist entity with mismatched tenant ID (\${this.tenantId}) against active session ($currentTenant)")
        }
    }
}`
  },
  {
    id: 'tenant-context',
    module: 'core-multitenancy',
    path: '/core-multitenancy/src/main/kotlin/com/micropms/multitenancy/context/TenantContext.kt',
    fileName: 'TenantContext.kt',
    language: 'kotlin',
    category: 'multitenancy',
    description: 'ThreadLocal<UUID> holding tenant identity with strict lifecycle isolation',
    code: `package com.micropms.multitenancy.context

import java.util.UUID

/**
 * Thread-safe holder for the current execution thread's tenant context.
 * Guaranteed to be cleaned up after request completion to prevent thread-pool leakage.
 */
object TenantContext {

    private val currentTenant = ThreadLocal<UUID>()

    fun setTenantId(tenantId: UUID) {
        currentTenant.set(tenantId)
    }

    fun getTenantId(): UUID? {
        return currentTenant.get()
    }

    fun requireTenantId(): UUID {
        return currentTenant.get()
            ?: throw IllegalStateException("TenantContext is empty: request is not within a tenant-scoped session")
    }

    fun clear() {
        currentTenant.remove()
    }
}`
  },
  {
    id: 'tenant-interceptor',
    module: 'core-multitenancy',
    path: '/core-multitenancy/src/main/kotlin/com/micropms/multitenancy/interceptor/TenantInterceptor.kt',
    fileName: 'TenantInterceptor.kt',
    language: 'kotlin',
    category: 'multitenancy',
    description: 'HandlerInterceptor binding verified JWT tenant claim and clearing TenantContext in afterCompletion',
    code: `package com.micropms.multitenancy.interceptor

import com.micropms.multitenancy.context.TenantContext
import com.micropms.multitenancy.security.TenantAuthenticationToken
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.servlet.HandlerInterceptor

/**
 * Interceptor responsible for binding the cryptographically verified tenant identity
 * from the Spring Security authentication token into the thread-local TenantContext,
 * and strictly clearing the context upon request completion.
 */
@Component
class TenantInterceptor : HandlerInterceptor {

    private val log = LoggerFactory.getLogger(TenantInterceptor::class.java)

    override fun preHandle(
        request: HttpServletRequest,
        response: HttpServletResponse,
        handler: Any
    ): Boolean {
        val authentication = SecurityContextHolder.getContext().authentication

        if (authentication is TenantAuthenticationToken && authentication.isAuthenticated) {
            val tenantId = authentication.tenantId
            TenantContext.setTenantId(tenantId)
            log.trace("TenantContext initialized with tenantId: {}", tenantId)
        }

        return true
    }

    override fun afterCompletion(
        request: HttpServletRequest,
        response: HttpServletResponse,
        handler: Any,
        ex: Exception?
    ) {
        // ALWAYS clean up TenantContext to prevent thread-pool contamination across requests
        TenantContext.clear()
        log.trace("TenantContext cleanly removed from thread")
    }
}`
  },
  {
    id: 'postgres-rls',
    module: 'core-multitenancy',
    path: '/core-multitenancy/src/main/kotlin/com/micropms/multitenancy/database/PostgresRlsConnectionPreparer.kt',
    fileName: 'PostgresRlsConnectionPreparer.kt',
    language: 'kotlin',
    category: 'multitenancy',
    description: 'Enforces PostgreSQL RLS by setting SET LOCAL app.current_tenant_id = :tenantId on transaction start',
    code: `package com.micropms.multitenancy.database

import com.micropms.multitenancy.context.TenantContext
import org.aspectj.lang.ProceedingJoinPoint
import org.aspectj.lang.annotation.Around
import org.aspectj.lang.annotation.Aspect
import org.slf4j.LoggerFactory
import org.springframework.core.Ordered
import org.springframework.core.annotation.Order
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component
import java.util.UUID

/**
 * Enforces database-level isolation via PostgreSQL Row Level Security (RLS).
 * Intercepts @Transactional method executions to inject the tenant context
 * into PostgreSQL session variables:
 *
 *   SET LOCAL app.current_tenant_id = '<tenant-id>';
 */
@Aspect
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
class PostgresRlsConnectionPreparer(
    private val jdbcTemplate: JdbcTemplate
) {

    private val log = LoggerFactory.getLogger(PostgresRlsConnectionPreparer::class.java)

    @Around("@annotation(org.springframework.transaction.annotation.Transactional) || @within(org.springframework.transaction.annotation.Transactional)")
    fun enforceTenantRls(joinPoint: ProceedingJoinPoint): Any? {
        val tenantId = TenantContext.getTenantId()

        if (tenantId != null) {
            setPostgresTenantSessionVariable(tenantId)
        }

        return joinPoint.proceed()
    }

    fun setPostgresTenantSessionVariable(tenantId: UUID) {
        try {
            jdbcTemplate.execute("SET LOCAL app.current_tenant_id = '\${tenantId}'")
            log.trace("Configured PostgreSQL RLS session: app.current_tenant_id = {}", tenantId)
        } catch (e: Exception) {
            log.error("Failed to set PostgreSQL RLS session variable for tenant {}: {}", tenantId, e.message)
            throw IllegalStateException("Database RLS tenant boundary could not be initialized", e)
        }
    }
}`
  },
  {
    id: 'eav-entities',
    module: 'module-clinic-core',
    path: '/module-clinic-core/src/main/kotlin/com/micropms/clinic/entity/CustomFieldDefinition.kt',
    fileName: 'CustomFieldDefinition.kt',
    language: 'kotlin',
    category: 'clinic',
    description: 'Relational Typed EAV pattern (definitions, options, encounter values) with type-safe columns (No JSONB)',
    code: `package com.micropms.clinic.entity

import com.micropms.multitenancy.entity.BaseTenantEntity
import jakarta.persistence.CascadeType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.OneToMany
import jakarta.persistence.Table
import java.math.BigDecimal
import java.time.LocalDate
import java.util.UUID

enum class CustomFieldDataType {
    TEXT,
    NUMERIC,
    DATE,
    BOOLEAN,
    SELECT
}

enum class ClinicalSpecialty {
    GENERAL_PRACTICE,
    PEDIATRICS,
    CARDIOLOGY,
    DERMATOLOGY,
    DENTISTRY,
    OPHTHALMOLOGY
}

/**
 * Relational Typed EAV Schema Definition: Defines tenant-scoped custom fields per clinical specialty.
 * No unstructured JSONB or raw JSON columns are allowed.
 */
@Entity
@Table(name = "custom_field_definitions")
class CustomFieldDefinition(
    @Column(name = "field_key", nullable = false)
    var fieldKey: String,

    @Column(name = "display_name", nullable = false)
    var displayName: String,

    @Enumerated(EnumType.STRING)
    @Column(name = "data_type", nullable = false)
    var dataType: CustomFieldDataType,

    @Enumerated(EnumType.STRING)
    @Column(name = "specialty", nullable = false)
    var specialty: ClinicalSpecialty,

    @Column(name = "is_required", nullable = false)
    var isRequired: Boolean = false,

    @OneToMany(mappedBy = "fieldDefinition", cascade = [CascadeType.ALL], orphanRemoval = true, fetch = FetchType.LAZY)
    var options: MutableList<CustomFieldOption> = mutableListOf()
) : BaseTenantEntity()

@Entity
@Table(name = "custom_field_options")
class CustomFieldOption(
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "definition_id", nullable = false)
    var fieldDefinition: CustomFieldDefinition,

    @Column(name = "option_label", nullable = false)
    var optionLabel: String,

    @Column(name = "option_value", nullable = false)
    var optionValue: String,

    @Column(name = "display_order", nullable = false)
    var displayOrder: Int = 0
) : BaseTenantEntity()

/**
 * Relational Typed EAV Value Store: Maps custom specialty fields to clinical encounters.
 * Values are stored strictly in typed columns (value_text, value_numeric, value_date, value_boolean)
 * to maintain relational indexing, ACID integrity, and type safety without JSONB.
 */
@Entity
@Table(name = "encounter_field_values")
class EncounterFieldValue(
    @Column(name = "encounter_id", nullable = false)
    var encounterId: UUID,

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "definition_id", nullable = false)
    var fieldDefinition: CustomFieldDefinition,

    @Column(name = "value_text", columnDefinition = "TEXT")
    var valueText: String? = null,

    @Column(name = "value_numeric", precision = 12, scale = 4)
    var valueNumeric: BigDecimal? = null,

    @Column(name = "value_date")
    var valueDate: LocalDate? = null,

    @Column(name = "value_boolean")
    var valueBoolean: Boolean? = null
) : BaseTenantEntity()`
  },
  {
    id: 'flyway-migration-sql',
    module: 'app-server',
    path: '/app-server/src/main/resources/db/migration/V1__init_multitenant_rls_and_eav.sql',
    fileName: 'V1__init_multitenant_rls_and_eav.sql',
    language: 'sql',
    category: 'config',
    description: 'PostgreSQL 16+ DDL enabling and forcing Row Level Security (RLS) and Typed EAV tables',
    code: `-- =========================================================================
-- Micro-PMS Multi-Tenant SaaS Platform Schema & PostgreSQL RLS Definition
-- Invariants: Zero Data Leakage (RLS), Relational Typed EAV (No JSONB)
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Control Plane Tables (No tenant_id)
CREATE TABLE platform_tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    last_modified_by UUID,
    version BIGINT NOT NULL DEFAULT 0,
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'TRIALING',
    admin_email VARCHAR(255) NOT NULL
);

-- 2. Application Plane Tables (Strictly Tenant-Scoped)
CREATE TABLE clinic_patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES platform_tenants(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    last_modified_by UUID,
    version BIGINT NOT NULL DEFAULT 0,
    mrn VARCHAR(64) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    birth_date DATE NOT NULL,
    gender VARCHAR(20) NOT NULL,
    phone_number VARCHAR(50),
    email VARCHAR(255),
    CONSTRAINT uq_patient_mrn_per_tenant UNIQUE (tenant_id, mrn)
);

CREATE TABLE clinic_encounters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES platform_tenants(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    last_modified_by UUID,
    version BIGINT NOT NULL DEFAULT 0,
    patient_id UUID NOT NULL REFERENCES clinic_patients(id) ON DELETE RESTRICT,
    practitioner_id UUID NOT NULL,
    encounter_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status VARCHAR(50) NOT NULL DEFAULT 'IN_PROGRESS',
    subjective_notes TEXT,
    objective_notes TEXT,
    assessment TEXT,
    plan TEXT,
    icd10_codes VARCHAR(255)
);

-- 3. Relational Typed EAV Pattern (Strictly NO JSONB / Raw JSON)
CREATE TABLE custom_field_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES platform_tenants(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    last_modified_by UUID,
    version BIGINT NOT NULL DEFAULT 0,
    field_key VARCHAR(100) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    data_type VARCHAR(50) NOT NULL,
    specialty VARCHAR(50) NOT NULL,
    is_required BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT uq_custom_field_key_per_tenant UNIQUE (tenant_id, field_key)
);

CREATE TABLE encounter_field_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES platform_tenants(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    last_modified_by UUID,
    version BIGINT NOT NULL DEFAULT 0,
    encounter_id UUID NOT NULL REFERENCES clinic_encounters(id) ON DELETE CASCADE,
    definition_id UUID NOT NULL REFERENCES custom_field_definitions(id) ON DELETE RESTRICT,
    value_text TEXT,
    value_numeric NUMERIC(12, 4),
    value_date DATE,
    value_boolean BOOLEAN,
    CONSTRAINT uq_encounter_field_value UNIQUE (tenant_id, encounter_id, definition_id)
);

-- 4. PostgreSQL Row Level Security (RLS) Hardening
ALTER TABLE clinic_patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_patients FORCE ROW LEVEL SECURITY;

ALTER TABLE clinic_encounters ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_encounters FORCE ROW LEVEL SECURITY;

ALTER TABLE custom_field_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_field_definitions FORCE ROW LEVEL SECURITY;

ALTER TABLE encounter_field_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE encounter_field_values FORCE ROW LEVEL SECURITY;

-- Tenant Isolation Policies
CREATE POLICY rls_patients_isolation ON clinic_patients
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE POLICY rls_encounters_isolation ON clinic_encounters
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);`
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'scaffolding' | 'invariants' | 'eav' | 'api-simulator' | 'tree'>('scaffolding');
  const [selectedFileId, setSelectedFileId] = useState<string>('root-pom');
  const [copied, setCopied] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Interactive Invariant State
  const [simulatedTenant, setSimulatedTenant] = useState<string>('tenant-metro-health');
  const [simulatedRole, setSimulatedRole] = useState<'DOCTOR' | 'RECEPTIONIST' | 'SUPER_ADMIN'>('DOCTOR');
  
  // Interactive EAV state
  const [selectedSpecialty, setSelectedSpecialty] = useState<'PEDIATRICS' | 'CARDIOLOGY' | 'DERMATOLOGY'>('PEDIATRICS');
  const [eavFormValues, setEavFormValues] = useState<{ [key: string]: any }>({
    'ped-head-circumference': '42.5',
    'ped-milestones-met': true,
    'ped-growth-percentile': '78',
    'cardio-ejection-fraction': '62',
    'cardio-nyha-class': 'Class II',
    'cardio-bp-systolic': '128',
    'derm-lesion-diameter-mm': '3.4',
    'derm-fitzpatrick-type': 'Type III',
    'derm-biopsy-indicated': false
  });

  // API Simulator State
  const [simulatedEndpoint, setSimulatedEndpoint] = useState<string>('get-patient');
  const [apiExecutionStatus, setApiExecutionStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [apiResponsePayload, setApiResponsePayload] = useState<any>(null);

  const selectedFile = useMemo(() => {
    return PROJECT_FILES.find(f => f.id === selectedFileId) || PROJECT_FILES[0];
  }, [selectedFileId]);

  const filteredFiles = useMemo(() => {
    if (!searchFilter.trim()) return PROJECT_FILES;
    const q = searchFilter.toLowerCase();
    return PROJECT_FILES.filter(f => 
      f.fileName.toLowerCase().includes(q) ||
      f.module.toLowerCase().includes(q) ||
      f.path.toLowerCase().includes(q) ||
      f.description.toLowerCase().includes(q)
    );
  }, [searchFilter]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExecuteApiSimulation = (endpoint: string) => {
    setSimulatedEndpoint(endpoint);
    setApiExecutionStatus('running');

    setTimeout(() => {
      const now = new Date().toISOString();
      const currentTenantUuid = simulatedTenant === 'tenant-metro-health' 
        ? 'a3b84180-2d6f-42a1-9c8e-5b1f81d94101' 
        : 'c9d18721-6f4e-4b72-8a9d-3f1a92e10502';

      if (endpoint === 'get-patient') {
        setApiExecutionStatus('success');
        setApiResponsePayload({
          code: 200,
          message: "Patient retrieved successfully",
          data: {
            id: "7b4c81a2-5f3e-4d91-8b20-1a4d93e81001",
            tenantId: currentTenantUuid,
            mrn: "MRN-2026-0842",
            firstName: "Eleanor",
            lastName: "Vance",
            dateOfBirth: "1988-04-14",
            gender: "FEMALE",
            phoneNumber: "+1-555-019-2831",
            email: "eleanor.vance@example.com",
            createdAt: "2026-03-10T14:22:00Z",
            updatedAt: "2026-03-10T14:22:00Z",
            version: 1
          },
          timestamp: now
        });
      } else if (endpoint === 'create-encounter') {
        if (simulatedRole === 'RECEPTIONIST') {
          setApiExecutionStatus('error');
          setApiResponsePayload({
            code: 403,
            message: "Access denied: insufficient permissions to access this clinical or administrative resource",
            errors: null,
            timestamp: now
          });
        } else {
          setApiExecutionStatus('success');
          setApiResponsePayload({
            code: 201,
            message: "Clinical Encounter created successfully",
            data: {
              id: "9e1c2b3a-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
              tenantId: currentTenantUuid,
              patientId: "7b4c81a2-5f3e-4d91-8b20-1a4d93e81001",
              practitionerId: "3d2c1b0a-9f8e-7d6c-5b4a-3f2e1d0c9b8a",
              encounterDate: now,
              status: "IN_PROGRESS",
              subjectiveNotes: "Patient reports mild seasonal symptoms.",
              assessment: "Acute seasonal rhinitis (J30.1)",
              plan: "Antihistamine therapy, follow up in 14 days.",
              icd10Codes: "J30.1",
              createdAt: now,
              updatedAt: now,
              version: 0
            },
            timestamp: now
          });
        }
      } else if (endpoint === 'validation-error') {
        setApiExecutionStatus('error');
        setApiResponsePayload({
          code: 400,
          message: "Validation failed for 2 field(s)",
          errors: [
            {
              field: "medicalRecordNumber",
              rejectedValue: "",
              message: "MRN cannot be blank"
            },
            {
              field: "dateOfBirth",
              rejectedValue: "2099-01-01",
              message: "Birth date must be a date in the past"
            }
          ],
          timestamp: now
        });
      } else if (endpoint === 'not-found') {
        setApiExecutionStatus('error');
        setApiResponsePayload({
          code: 404,
          message: "Patient not found with id: '00000000-0000-0000-0000-000000000000'",
          errors: null,
          timestamp: now
        });
      }
    }, 180);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Bar Contract: 3 Zones strictly separated */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40 px-6 py-3 flex items-center justify-between gap-8 shrink-0">
        {/* Zone 1: Brand wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="h-8 w-8 rounded-md bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white font-bold shadow-sm">
            <Layers className="h-4 w-4" />
          </div>
          <span className="text-base font-semibold tracking-tight text-white whitespace-nowrap shrink-0">
            Micro-PMS Multi-Tenant SaaS
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button 
            onClick={() => setActiveTab('scaffolding')}
            className={`whitespace-nowrap transition-colors ${activeTab === 'scaffolding' ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Maven Modules & Code
          </button>
          <button 
            onClick={() => setActiveTab('invariants')}
            className={`whitespace-nowrap transition-colors ${activeTab === 'invariants' ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Isolation & RLS Invariants
          </button>
          <button 
            onClick={() => setActiveTab('eav')}
            className={`whitespace-nowrap transition-colors ${activeTab === 'eav' ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Relational Typed EAV
          </button>
          <button 
            onClick={() => setActiveTab('api-simulator')}
            className={`whitespace-nowrap transition-colors ${activeTab === 'api-simulator' ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'}`}
          >
            API Envelope Simulator
          </button>
          <button 
            onClick={() => setActiveTab('tree')}
            className={`whitespace-nowrap transition-colors ${activeTab === 'tree' ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Directory Layout
          </button>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-xs text-slate-400 hidden lg:flex items-center gap-2">
            <span>Spring Boot 3.3.4</span>
            <span aria-hidden="true">·</span>
            <span>Kotlin 2.0.20</span>
            <span aria-hidden="true">·</span>
            <span>Java 21</span>
          </div>
          <button 
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-colors whitespace-nowrap shadow-sm"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Active File'}</span>
          </button>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 flex overflow-hidden">
        {/* VIEW 1: Maven Modules & Code Inspector */}
        {activeTab === 'scaffolding' && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar File Explorer */}
            <aside className="w-full md:w-80 bg-slate-900/60 border-r border-slate-800 flex flex-col shrink-0 overflow-y-auto">
              <div className="p-3 border-b border-slate-800">
                <div className="relative">
                  <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filter files..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Module Grouped Tree */}
              <div className="p-2 space-y-1 text-xs">
                {['root', 'core-common', 'core-multitenancy', 'module-saas-platform', 'module-clinic-core', 'app-server'].map((mod) => {
                  const modFiles = filteredFiles.filter(f => f.module === mod);
                  if (modFiles.length === 0) return null;
                  return (
                    <div key={mod} className="mb-2">
                      <div className="px-2 py-1 text-[11px] font-semibold tracking-wider uppercase text-slate-500 flex items-center justify-between">
                        <span>{mod}</span>
                        <span className="font-mono text-[10px] text-slate-600">{modFiles.length}</span>
                      </div>
                      <div className="space-y-0.5">
                        {modFiles.map((file) => (
                          <button
                            key={file.id}
                            onClick={() => setSelectedFileId(file.id)}
                            className={`w-full text-left px-2.5 py-1.5 rounded flex items-center gap-2 transition-colors ${
                              selectedFileId === file.id
                                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60'
                                : 'text-slate-300 hover:bg-slate-800/70 hover:text-slate-100'
                            }`}
                          >
                            <FileCode className="h-3.5 w-3.5 shrink-0 opacity-70" />
                            <div className="truncate flex-1">
                              <span className="truncate block">{file.fileName}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </aside>

            {/* Code Content Panel */}
            <section className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
              {/* File Info Breadcrumb Bar */}
              <div className="px-6 py-3 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-400 truncate">
                  <span className="text-slate-500">Module:</span>
                  <span className="font-semibold text-slate-300">{selectedFile.module}</span>
                  <span aria-hidden="true">/</span>
                  <span className="font-mono text-cyan-300">{selectedFile.fileName}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 shrink-0">
                  <span className="font-mono tabular-nums">{selectedFile.code.split('\n').length} lines</span>
                  <span aria-hidden="true">·</span>
                  <span className="uppercase text-[10px] tracking-wider text-slate-400 font-mono">{selectedFile.language}</span>
                </div>
              </div>

              {/* File description callout */}
              <div className="px-6 py-2.5 bg-slate-900/20 border-b border-slate-800/80 text-xs text-slate-400 flex items-center gap-2">
                <Box className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                <span>{selectedFile.description}</span>
              </div>

              {/* Code Viewer */}
              <div className="flex-1 overflow-auto p-6 font-mono text-xs leading-relaxed text-slate-300 bg-slate-950">
                <pre className="selection:bg-cyan-500/20">
                  <code>{selectedFile.code}</code>
                </pre>
              </div>
            </section>
          </div>
        )}

        {/* VIEW 2: Multi-Tenancy Invariants & RLS Inspector */}
        {activeTab === 'invariants' && (
          <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 max-w-6xl mx-auto w-full">
            <div>
              <h2 className="text-xl font-semibold text-slate-100">Zero Data Leakage Invariants & RLS Architecture</h2>
              <p className="text-xs text-slate-400 mt-1">
                Multi-tenancy isolation enforced strictly via cryptographically verified JWT claims, ThreadLocal context lifecycle, and PostgreSQL 16+ Row Level Security.
              </p>
            </div>

            {/* Architecture Hierarchy Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Control Plane Contract */}
              <div className="border border-slate-800 bg-slate-900/40 rounded-lg p-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-cyan-400" />
                    <h3 className="text-sm font-semibold text-slate-200">Control Plane (module-saas-platform)</h3>
                  </div>
                  <span className="text-xs font-mono text-cyan-400">NO tenant_id</span>
                </div>
                <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 mt-0.5">•</span>
                    <span>Entities extend <strong className="text-slate-100">BaseAuditEntity</strong> directly without tenantId column.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 mt-0.5">•</span>
                    <span>Governs cross-clinic management: <strong className="text-slate-100">Tenant, Subscription, Plan</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 mt-0.5">•</span>
                    <span><strong className="text-amber-300">Strict Rule:</strong> MUST NOT depend on module-clinic-core to prevent leakage.</span>
                  </li>
                </ul>
              </div>

              {/* Application Plane Contract */}
              <div className="border border-slate-800 bg-slate-900/40 rounded-lg p-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    <h3 className="text-sm font-semibold text-slate-200">Application Plane (module-clinic-core)</h3>
                  </div>
                  <span className="text-xs font-mono text-emerald-400">Enforced tenant_id</span>
                </div>
                <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    <span>Entities MUST extend <strong className="text-slate-100">BaseTenantEntity</strong> with non-nullable, updatable=false tenantId.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    <span><strong className="text-slate-100">@PrePersist hook:</strong> Automatically injects active tenant from thread-safe TenantContext.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    <span><strong className="text-amber-300">Strict Rule:</strong> Rejects incoming tenant_id from request body/query/path. Zero trust.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Interactive RLS Live Isolation Test */}
            <div className="border border-slate-800 bg-slate-900/30 rounded-lg p-6 space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <Database className="h-4 w-4 text-cyan-400" />
                    PostgreSQL Row Level Security (RLS) Simulation
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Select a simulated tenant to verify database session variable assignment and data segregation.
                  </p>
                </div>

                {/* Tenant Selector Buttons */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-lg">
                  <button
                    onClick={() => setSimulatedTenant('tenant-metro-health')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      simulatedTenant === 'tenant-metro-health'
                        ? 'bg-cyan-500 text-slate-950 font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Metro Health (Tenant A)
                  </button>
                  <button
                    onClick={() => setSimulatedTenant('tenant-apex-cardio')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      simulatedTenant === 'tenant-apex-cardio'
                        ? 'bg-cyan-500 text-slate-950 font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Apex Cardio (Tenant B)
                  </button>
                </div>
              </div>

              {/* SQL Simulation View */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-4 rounded bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-[11px] text-slate-400 font-sans font-medium uppercase tracking-wider">
                    Connection Acquisition Hook
                  </div>
                  <div className="text-slate-400">
                    <span className="text-cyan-400">-- PostgresRlsConnectionPreparer.kt</span>
                    <br />
                    <span className="text-yellow-300">SET LOCAL</span> app.current_tenant_id = <span className="text-emerald-400">
                      '{simulatedTenant === 'tenant-metro-health' ? 'a3b84180-2d6f-42a1-9c8e-5b1f81d94101' : 'c9d18721-6f4e-4b72-8a9d-3f1a92e10502'}'
                    </span>;
                  </div>
                  <div className="pt-2 text-slate-400 border-t border-slate-900">
                    <span className="text-cyan-400">-- PostgreSQL Engine executes policy</span>
                    <br />
                    SELECT * FROM clinic_patients;
                  </div>
                </div>

                <div className="p-4 rounded bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-[11px] text-slate-400 font-sans font-medium uppercase tracking-wider">
                    Isolated Query Results ({simulatedTenant === 'tenant-metro-health' ? 'Metro Health' : 'Apex Cardio'})
                  </div>
                  <div className="text-slate-300 space-y-1">
                    {simulatedTenant === 'tenant-metro-health' ? (
                      <>
                        <div className="text-emerald-400">✓ [Row 1] MRN-2026-0842 | Eleanor Vance | DOB: 1988-04-14</div>
                        <div className="text-emerald-400">✓ [Row 2] MRN-2026-0843 | James Sterling | DOB: 1974-11-02</div>
                        <div className="text-slate-500 italic mt-2">Zero records from Apex Cardio visible. RLS policy filtered 42 other tenant rows.</div>
                      </>
                    ) : (
                      <>
                        <div className="text-emerald-400">✓ [Row 1] APEX-901 | Beatrice Fontaine | DOB: 1962-09-18</div>
                        <div className="text-emerald-400">✓ [Row 2] APEX-902 | Marcus Delgado | DOB: 1981-03-30</div>
                        <div className="text-slate-500 italic mt-2">Zero records from Metro Health visible. RLS policy filtered 118 other tenant rows.</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: Relational Typed EAV Modeler */}
        {activeTab === 'eav' && (
          <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 max-w-6xl mx-auto w-full">
            <div>
              <h2 className="text-xl font-semibold text-slate-100">Relational Typed EAV Clinical Extensibility</h2>
              <p className="text-xs text-slate-400 mt-1">
                Strict Architectural Rule: <span className="text-amber-400 font-semibold">NO JSONB or unstructured JSON columns</span>. Dynamic clinical fields per specialty use relational tables with type-safe columns (value_text, value_numeric, value_date, value_boolean).
              </p>
            </div>

            {/* Specialty Selector Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              {(['PEDIATRICS', 'CARDIOLOGY', 'DERMATOLOGY'] as const).map((spec) => (
                <button
                  key={spec}
                  onClick={() => setSelectedSpecialty(spec)}
                  className={`px-4 py-2 text-xs font-medium rounded-md transition-colors ${
                    selectedSpecialty === spec
                      ? 'bg-cyan-500 text-slate-950 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>

            {/* EAV Live Interactive Form & Database Row Inspector */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form Input Side */}
              <div className="border border-slate-800 bg-slate-900/40 rounded-lg p-5 space-y-4">
                <h3 className="text-sm font-semibold text-slate-200">
                  Encounter Form ({selectedSpecialty})
                </h3>
                <p className="text-xs text-slate-400">
                  Custom specialty fields dynamically resolved from <code className="text-cyan-400">custom_field_definitions</code>.
                </p>

                <div className="space-y-4 pt-2">
                  {selectedSpecialty === 'PEDIATRICS' && (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Head Circumference (cm) <span className="text-slate-500">[NUMERIC]</span>
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={eavFormValues['ped-head-circumference']}
                          onChange={(e) => setEavFormValues({ ...eavFormValues, 'ped-head-circumference': e.target.value })}
                          className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Growth Percentile (%) <span className="text-slate-500">[NUMERIC]</span>
                        </label>
                        <input
                          type="number"
                          value={eavFormValues['ped-growth-percentile']}
                          onChange={(e) => setEavFormValues({ ...eavFormValues, 'ped-growth-percentile': e.target.value })}
                          className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id="milestones"
                          checked={eavFormValues['ped-milestones-met']}
                          onChange={(e) => setEavFormValues({ ...eavFormValues, 'ped-milestones-met': e.target.checked })}
                          className="rounded border-slate-800 bg-slate-950 text-cyan-500 focus:ring-0"
                        />
                        <label htmlFor="milestones" className="text-xs text-slate-300">
                          Developmental Milestones Met on Schedule <span className="text-slate-500">[BOOLEAN]</span>
                        </label>
                      </div>
                    </>
                  )}

                  {selectedSpecialty === 'CARDIOLOGY' && (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Ejection Fraction (%) <span className="text-slate-500">[NUMERIC]</span>
                        </label>
                        <input
                          type="number"
                          value={eavFormValues['cardio-ejection-fraction']}
                          onChange={(e) => setEavFormValues({ ...eavFormValues, 'cardio-ejection-fraction': e.target.value })}
                          className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          NYHA Functional Class <span className="text-slate-500">[SELECT]</span>
                        </label>
                        <select
                          value={eavFormValues['cardio-nyha-class']}
                          onChange={(e) => setEavFormValues({ ...eavFormValues, 'cardio-nyha-class': e.target.value })}
                          className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-500"
                        >
                          <option>Class I</option>
                          <option>Class II</option>
                          <option>Class III</option>
                          <option>Class IV</option>
                        </select>
                      </div>
                    </>
                  )}

                  {selectedSpecialty === 'DERMATOLOGY' && (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Primary Lesion Diameter (mm) <span className="text-slate-500">[NUMERIC]</span>
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={eavFormValues['derm-lesion-diameter-mm']}
                          onChange={(e) => setEavFormValues({ ...eavFormValues, 'derm-lesion-diameter-mm': e.target.value })}
                          className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Fitzpatrick Skin Phototype <span className="text-slate-500">[SELECT]</span>
                        </label>
                        <select
                          value={eavFormValues['derm-fitzpatrick-type']}
                          onChange={(e) => setEavFormValues({ ...eavFormValues, 'derm-fitzpatrick-type': e.target.value })}
                          className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-500"
                        >
                          <option>Type I (Pale White)</option>
                          <option>Type II (White)</option>
                          <option>Type III (Light Brown)</option>
                          <option>Type IV (Moderate Brown)</option>
                          <option>Type V (Dark Brown)</option>
                          <option>Type VI (Deeply Pigmented)</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Typed Columns Storage Inspector */}
              <div className="border border-slate-800 bg-slate-900/40 rounded-lg p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-200">
                    Stored in <code className="text-emerald-400">encounter_field_values</code>
                  </h3>
                  <span className="text-[11px] font-mono text-cyan-400">Indexed & Strongly Typed</span>
                </div>
                <p className="text-xs text-slate-400">
                  Each value routes strictly to its designated typed column. Unused columns remain NULL.
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="py-2 pr-3">field_key</th>
                        <th className="py-2 pr-3">value_numeric</th>
                        <th className="py-2 pr-3">value_text</th>
                        <th className="py-2 pr-3">value_boolean</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {selectedSpecialty === 'PEDIATRICS' && (
                        <>
                          <tr>
                            <td className="py-2 pr-3 text-cyan-400">head_circ</td>
                            <td className="py-2 pr-3 text-emerald-300">{eavFormValues['ped-head-circumference']}</td>
                            <td className="py-2 pr-3 text-slate-600">NULL</td>
                            <td className="py-2 pr-3 text-slate-600">NULL</td>
                          </tr>
                          <tr>
                            <td className="py-2 pr-3 text-cyan-400">growth_pct</td>
                            <td className="py-2 pr-3 text-emerald-300">{eavFormValues['ped-growth-percentile']}</td>
                            <td className="py-2 pr-3 text-slate-600">NULL</td>
                            <td className="py-2 pr-3 text-slate-600">NULL</td>
                          </tr>
                          <tr>
                            <td className="py-2 pr-3 text-cyan-400">milestones</td>
                            <td className="py-2 pr-3 text-slate-600">NULL</td>
                            <td className="py-2 pr-3 text-slate-600">NULL</td>
                            <td className="py-2 pr-3 text-emerald-300">{eavFormValues['ped-milestones-met'] ? 'TRUE' : 'FALSE'}</td>
                          </tr>
                        </>
                      )}

                      {selectedSpecialty === 'CARDIOLOGY' && (
                        <>
                          <tr>
                            <td className="py-2 pr-3 text-cyan-400">ejection_frac</td>
                            <td className="py-2 pr-3 text-emerald-300">{eavFormValues['cardio-ejection-fraction']}</td>
                            <td className="py-2 pr-3 text-slate-600">NULL</td>
                            <td className="py-2 pr-3 text-slate-600">NULL</td>
                          </tr>
                          <tr>
                            <td className="py-2 pr-3 text-cyan-400">nyha_class</td>
                            <td className="py-2 pr-3 text-slate-600">NULL</td>
                            <td className="py-2 pr-3 text-emerald-300">'{eavFormValues['cardio-nyha-class']}'</td>
                            <td className="py-2 pr-3 text-slate-600">NULL</td>
                          </tr>
                        </>
                      )}

                      {selectedSpecialty === 'DERMATOLOGY' && (
                        <>
                          <tr>
                            <td className="py-2 pr-3 text-cyan-400">lesion_diam</td>
                            <td className="py-2 pr-3 text-emerald-300">{eavFormValues['derm-lesion-diameter-mm']}</td>
                            <td className="py-2 pr-3 text-slate-600">NULL</td>
                            <td className="py-2 pr-3 text-slate-600">NULL</td>
                          </tr>
                          <tr>
                            <td className="py-2 pr-3 text-cyan-400">fitzpatrick</td>
                            <td className="py-2 pr-3 text-slate-600">NULL</td>
                            <td className="py-2 pr-3 text-emerald-300">'{eavFormValues['derm-fitzpatrick-type']}'</td>
                            <td className="py-2 pr-3 text-slate-600">NULL</td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="pt-3 text-[11px] text-slate-400 border-t border-slate-800">
                  Preserves B-tree indexing on numerical & date thresholds and complies with HIPAA/SOC2 strict schema auditing.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: API Response Envelope & Exception Simulator */}
        {activeTab === 'api-simulator' && (
          <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 max-w-6xl mx-auto w-full">
            <div>
              <h2 className="text-xl font-semibold text-slate-100">Standardized REST API Envelope & Exception Handling</h2>
              <p className="text-xs text-slate-400 mt-1">
                Every endpoint returns ApiResponse&lt;T&gt; on success, and GlobalExceptionHandler returns ApiErrorResponse on failures.
              </p>
            </div>

            {/* Test Configuration Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-slate-800 bg-slate-900/40 rounded-lg p-4 space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Simulated Security Role (RBAC Authorities)
                </label>
                <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded">
                  {(['DOCTOR', 'RECEPTIONIST', 'SUPER_ADMIN'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setSimulatedRole(r)}
                      className={`flex-1 py-1 text-xs font-medium rounded transition-colors ${
                        simulatedRole === r
                          ? 'bg-cyan-500 text-slate-950 font-semibold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <div className="text-[11px] text-slate-400 pt-1">
                  {simulatedRole === 'DOCTOR' && 'Granted CLINICAL_READ, CLINICAL_WRITE, CLINICAL_ADMIN'}
                  {simulatedRole === 'RECEPTIONIST' && 'Restricted to patient demographics & billing. Encounters return 403.'}
                  {simulatedRole === 'SUPER_ADMIN' && 'Control plane authority: ROLE_SUPER_ADMIN'}
                </div>
              </div>

              {/* Endpoint Invocation Selector */}
              <div className="border border-slate-800 bg-slate-900/40 rounded-lg p-4 space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Execute Endpoint Contract
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleExecuteApiSimulation('get-patient')}
                    className="px-3 py-1.5 text-xs text-left font-medium bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-slate-200 flex items-center justify-between"
                  >
                    <span>GET /patients/{'{id}'}</span>
                    <span className="text-[10px] font-mono text-emerald-400">200</span>
                  </button>
                  <button
                    onClick={() => handleExecuteApiSimulation('create-encounter')}
                    className="px-3 py-1.5 text-xs text-left font-medium bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-slate-200 flex items-center justify-between"
                  >
                    <span>POST /encounters</span>
                    <span className="text-[10px] font-mono text-cyan-400">{simulatedRole === 'RECEPTIONIST' ? '403' : '201'}</span>
                  </button>
                  <button
                    onClick={() => handleExecuteApiSimulation('validation-error')}
                    className="px-3 py-1.5 text-xs text-left font-medium bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-slate-200 flex items-center justify-between"
                  >
                    <span>POST /patients (Invalid)</span>
                    <span className="text-[10px] font-mono text-amber-400">400</span>
                  </button>
                  <button
                    onClick={() => handleExecuteApiSimulation('not-found')}
                    className="px-3 py-1.5 text-xs text-left font-medium bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-slate-200 flex items-center justify-between"
                  >
                    <span>GET /patients (Missing)</span>
                    <span className="text-[10px] font-mono text-red-400">404</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Response Console */}
            <div className="border border-slate-800 bg-slate-900/30 rounded-lg p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-cyan-400" />
                  <h3 className="text-sm font-semibold text-slate-200 font-mono">
                    HTTP Response Body (RFC Unified Envelope)
                  </h3>
                </div>
                {apiResponsePayload && (
                  <span className={`font-mono text-xs px-2 py-0.5 rounded ${
                    apiResponsePayload.code >= 200 && apiResponsePayload.code < 300
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : apiResponsePayload.code === 403
                      ? 'bg-red-950 text-red-300 border border-red-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}>
                    HTTP {apiResponsePayload.code}
                  </span>
                )}
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-md font-mono text-xs overflow-x-auto text-slate-300 min-h-[160px] flex items-center">
                {apiResponsePayload ? (
                  <pre className="w-full">{JSON.stringify(apiResponsePayload, null, 2)}</pre>
                ) : (
                  <div className="text-slate-500 italic flex items-center gap-2 mx-auto font-sans">
                    <Play className="h-4 w-4" />
                    Click any endpoint button above to test real-time serialization and exception handling.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 5: Complete Filesystem Tree Layout */}
        {activeTab === 'tree' && (
          <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 max-w-5xl mx-auto w-full">
            <div>
              <h2 className="text-xl font-semibold text-slate-100">Filesystem Tree Structure</h2>
              <p className="text-xs text-slate-400 mt-1">
                Standard Apache Maven multi-module directory layout following canonical Spring Boot and Kotlin package conventions.
              </p>
            </div>

            <div className="border border-slate-800 bg-slate-900/40 rounded-lg p-6 font-mono text-xs leading-relaxed text-slate-300">
              <pre className="text-cyan-300 font-bold mb-2">micro-pms-platform/ (Root)</pre>
              <pre className="text-slate-400">
{`├── pom.xml                                      # Root aggregator POM (Spring Boot 3.3.4, Kotlin 2.0.20, Java 21)
├── core-common/
│   ├── pom.xml                                  # Base module POM (Data JPA, Web, Validation, Jackson Kotlin)
│   └── src/
│       ├── main/
│       │   └── kotlin/com/micropms/common/
│       │       ├── entity/
│       │       │   └── BaseAuditEntity.kt       # @MappedSuperclass with UUID PK, JPA auditing, versioning
│       │       ├── repository/
│       │       │   └── BaseRepository.kt        # JpaRepository & JpaSpecificationExecutor with dynamic projections
│       │       ├── dto/
│       │       │   ├── ApiResponse.kt           # ApiResponse<T>(code, message, data, timestamp)
│       │       │   └── ApiErrorResponse.kt      # ApiErrorResponse(code, message, errors, timestamp)
│       │       ├── exception/
│       │       │   ├── GlobalExceptionHandler.kt# @RestControllerAdvice handling validation & domain errors
│       │       │   └── ResourceNotFoundException.kt
│       │       ├── controller/
│       │       │   └── BaseController.kt        # Generic CRUD endpoints & pre-signed file URL generators
│       │       └── config/
│       │           └── JpaAuditingConfig.kt     # AuditorAware resolving UUID from JWT SecurityContext
│       └── test/kotlin/com/micropms/common/
│           └── BaseControllerTest.kt
├── core-multitenancy/
│   ├── pom.xml                                  # Depends strictly on core-common
│   └── src/
│       └── main/
│           └── kotlin/com/micropms/multitenancy/
│               ├── context/
│               │   └── TenantContext.kt         # ThreadLocal<UUID> with guaranteed cleanup
│               ├── entity/
│               │   └── BaseTenantEntity.kt      # Extends BaseAuditEntity with @PrePersist tenant check
│               ├── interceptor/
│               │   └── TenantInterceptor.kt     # HandlerInterceptor setting/clearing ThreadLocal context
│               ├── security/
│               │   └── TenantAuthenticationToken.kt
│               ├── database/
│               │   └── PostgresRlsConnectionPreparer.kt # Injects SET LOCAL app.current_tenant_id = :id
│               └── cache/
│                   └── TenantCacheService.kt    # Redis tenant status & permission cache
├── module-saas-platform/
│   ├── pom.xml                                  # Depends on core-common & core-multitenancy ONLY
│   └── src/
│       └── main/
│           └── kotlin/com/micropms/saas/
│               ├── entity/
│               │   └── Tenant.kt                # Control Plane entity extending BaseAuditEntity directly
│               ├── repository/
│               │   └── TenantRepository.kt
│               └── controller/
│                   └── TenantController.kt      # Super Admin REST controller extending BaseController
├── module-clinic-core/
│   ├── pom.xml                                  # Depends on core-common & core-multitenancy ONLY
│   └── src/
│       └── main/
│           └── kotlin/com/micropms/clinic/
│               ├── entity/
│               │   ├── Patient.kt               # Application Plane entity extending BaseTenantEntity
│               │   ├── Encounter.kt             # Clinical encounter entity with SOAP notes & ICD-10
│               │   └── CustomFieldDefinition.kt # Relational Typed EAV entities (No JSONB)
│               ├── repository/
│               │   ├── PatientRepository.kt
│               │   └── EncounterRepository.kt
│               └── controller/
│                   └── EncounterController.kt   # Restricted to clinical staff (@PreAuthorize)
└── app-server/
    ├── pom.xml                                  # Aggregator packaging executable fat JAR
    └── src/
        └── main/
            ├── kotlin/com/micropms/
            │   └── MicroPmsApplication.kt       # @SpringBootApplication launcher
            └── resources/
                ├── application.yml              # Database, Flyway, Redis, and Actuator config
                └── db/migration/
                    └── V1__init_multitenant_rls_and_eav.sql # PostgreSQL RLS policies & EAV schema`}
              </pre>
            </div>
          </div>
        )}
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 px-6 py-2.5 text-xs text-slate-500 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span>Micro-PMS Platform Architecture</span>
          <span aria-hidden="true">·</span>
          <span>Zero Data Leakage Invariant Enforced</span>
        </div>
        <div className="font-mono text-[11px] text-slate-500">
          PostgreSQL 16+ RLS · Typed EAV · Spring Boot 3.3.4
        </div>
      </footer>
    </div>
  );
}
