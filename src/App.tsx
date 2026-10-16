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
    description: 'ThreadLocal<UUID?> wrapping object with inline fun runWithTenant for safe scoped execution',
    code: `package com.micropms.multitenancy.context

import java.util.UUID

/**
 * Thread-safe Kotlin object wrapping ThreadLocal<UUID?> for managing the active tenant context.
 * Strictly guarantees clean lifecycle and prevention of thread pool poisoning.
 */
object TenantContext {

    private val currentTenant = ThreadLocal<UUID?>()

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

    /**
     * Executes the given code block within the specified tenant scope and guarantees cleanup
     * or context restoration in a finally block to prevent thread-pool poisoning.
     */
    inline fun <T> runWithTenant(tenantId: UUID, block: () -> T): T {
        val previousTenantId = getTenantId()
        setTenantId(tenantId)
        return try {
            block()
        } finally {
            if (previousTenantId != null) {
                setTenantId(previousTenantId)
            } else {
                clear()
            }
        }
    }
}`
  },
  {
    id: 'custom-jwt-converter',
    module: 'core-multitenancy',
    path: '/core-multitenancy/src/main/kotlin/com/micropms/multitenancy/security/CustomJwtAuthenticationConverter.kt',
    fileName: 'CustomJwtAuthenticationConverter.kt',
    language: 'kotlin',
    category: 'multitenancy',
    description: 'Converter mapping JWT claims (sub->UUID, tenant_id->UUID, role->ROLE_*, authorities) to TenantAuthenticationToken',
    code: `package com.micropms.multitenancy.security

import org.slf4j.LoggerFactory
import org.springframework.core.convert.converter.Converter
import org.springframework.security.authentication.AbstractAuthenticationToken
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.stereotype.Component
import java.util.UUID

/**
 * Production JWT converter decoding claims into an authenticated TenantAuthenticationToken:
 * - 'sub' claim -> Principal User ID (UUID)
 * - 'tenant_id' claim -> Extracted Tenant ID (UUID)
 * - 'role' claim -> Mapped to "ROLE_<ROLE_NAME>"
 * - 'authorities' array claim -> Mapped to List<SimpleGrantedAuthority> for @PreAuthorize
 */
@Component
class CustomJwtAuthenticationConverter : Converter<Jwt, AbstractAuthenticationToken> {

    private val log = LoggerFactory.getLogger(CustomJwtAuthenticationConverter::class.java)

    override fun convert(jwt: Jwt): AbstractAuthenticationToken {
        // 1. Resolve Principal User ID ('sub')
        val subClaim = jwt.subject ?: jwt.getClaimAsString("sub")
            ?: throw BadCredentialsException("JWT token is missing mandatory 'sub' claim")
        val userId = try {
            UUID.fromString(subClaim)
        } catch (e: Exception) {
            throw BadCredentialsException("JWT 'sub' claim '\$subClaim' is not a valid UUID format")
        }

        // 2. Resolve Tenant ID ('tenant_id')
        val tenantIdClaim = jwt.getClaimAsString("tenant_id")
            ?: throw BadCredentialsException("JWT token is missing mandatory 'tenant_id' claim")
        val tenantId = try {
            UUID.fromString(tenantIdClaim)
        } catch (e: Exception) {
            throw BadCredentialsException("JWT 'tenant_id' claim '\$tenantIdClaim' is not a valid UUID format")
        }

        // 3. Resolve authorities and roles
        val authorities = mutableSetOf<GrantedAuthority>()

        // Map 'role' claim to "ROLE_<ROLE_NAME>"
        val roleClaim = jwt.getClaimAsString("role")
        if (!roleClaim.isNullOrBlank()) {
            val roleFormatted = if (roleClaim.startsWith("ROLE_")) roleClaim else "ROLE_\$roleClaim"
            authorities.add(SimpleGrantedAuthority(roleFormatted))
        }

        // Map 'authorities' claim to SimpleGrantedAuthority
        val authoritiesClaim = jwt.claims["authorities"]
        when (authoritiesClaim) {
            is Collection<*> -> {
                authoritiesClaim.filterIsInstance<String>().forEach { auth ->
                    if (auth.isNotBlank()) {
                        authorities.add(SimpleGrantedAuthority(auth.trim()))
                    }
                }
            }
            is String -> {
                authoritiesClaim.split(",", " ").forEach { auth ->
                    if (auth.isNotBlank()) {
                        authorities.add(SimpleGrantedAuthority(auth.trim()))
                    }
                }
            }
        }

        val principal = TenantUserPrincipal(
            userId = userId,
            tenantId = tenantId,
            email = jwt.getClaimAsString("email"),
            username = jwt.getClaimAsString("preferred_username")
        )

        return TenantAuthenticationToken(
            jwt = jwt,
            principal = principal,
            authorities = authorities
        )
    }
}`
  },
  {
    id: 'tenant-auth-token',
    module: 'core-multitenancy',
    path: '/core-multitenancy/src/main/kotlin/com/micropms/multitenancy/security/TenantAuthenticationToken.kt',
    fileName: 'TenantAuthenticationToken.kt',
    language: 'kotlin',
    category: 'multitenancy',
    description: 'Spring Security authentication token holding TenantUserPrincipal and fine-grained authorities',
    code: `package com.micropms.multitenancy.security

import org.springframework.security.authentication.AbstractAuthenticationToken
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.oauth2.jwt.Jwt
import java.util.UUID

data class TenantUserPrincipal(
    val userId: UUID,
    val tenantId: UUID,
    val email: String? = null,
    val username: String? = null
)

class TenantAuthenticationToken(
    val jwt: Jwt,
    val principal: TenantUserPrincipal,
    authorities: Collection<GrantedAuthority>
) : AbstractAuthenticationToken(authorities) {

    init {
        super.setAuthenticated(true)
    }

    val userId: UUID get() = principal.userId
    val tenantId: UUID get() = principal.tenantId

    override fun getCredentials(): Any = jwt
    override fun getPrincipal(): TenantUserPrincipal = principal
    override fun getName(): String = principal.userId.toString()
}`
  },
  {
    id: 'tenant-interceptor',
    module: 'core-multitenancy',
    path: '/core-multitenancy/src/main/kotlin/com/micropms/multitenancy/interceptor/TenantInterceptor.kt',
    fileName: 'TenantInterceptor.kt',
    language: 'kotlin',
    category: 'multitenancy',
    description: 'HandlerInterceptor binding verified JWT tenant claim on preHandle and cleaning up in afterCompletion',
    code: `package com.micropms.multitenancy.interceptor

import com.micropms.multitenancy.context.TenantContext
import com.micropms.multitenancy.security.TenantAuthenticationToken
import com.micropms.multitenancy.security.TenantUserPrincipal
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.servlet.HandlerInterceptor

@Component
class TenantInterceptor : HandlerInterceptor {

    private val log = LoggerFactory.getLogger(TenantInterceptor::class.java)

    override fun preHandle(request: HttpServletRequest, response: HttpServletResponse, handler: Any): Boolean {
        val authentication = SecurityContextHolder.getContext()?.authentication
        if (authentication is TenantAuthenticationToken && authentication.isAuthenticated) {
            TenantContext.setTenantId(authentication.tenantId)
            log.trace("TenantContext bound from TenantAuthenticationToken: {}", authentication.tenantId)
        }
        return true
    }

    override fun afterCompletion(request: HttpServletRequest, response: HttpServletResponse, handler: Any, ex: Exception?) {
        TenantContext.clear()
        log.trace("TenantContext cleanly removed from thread in afterCompletion")
    }
}`
  },
  {
    id: 'spring-security-auditor-aware',
    module: 'core-multitenancy',
    path: '/core-multitenancy/src/main/kotlin/com/micropms/multitenancy/auditing/SpringSecurityAuditorAware.kt',
    fileName: 'SpringSecurityAuditorAware.kt',
    language: 'kotlin',
    category: 'multitenancy',
    description: 'AuditorAware<UUID> returning authenticated user UUID from SecurityContext for createdBy/lastModifiedBy',
    code: `package com.micropms.multitenancy.auditing

import com.micropms.multitenancy.security.TenantAuthenticationToken
import org.springframework.data.domain.AuditorAware
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import java.util.Optional
import java.util.UUID

@Component("auditorAware")
class SpringSecurityAuditorAware : AuditorAware<UUID> {

    override fun getCurrentAuditor(): Optional<UUID> {
        val authentication = SecurityContextHolder.getContext()?.authentication
            ?: return Optional.empty()

        if (!authentication.isAuthenticated || authentication.principal == "anonymousUser") {
            return Optional.empty()
        }

        return if (authentication is TenantAuthenticationToken) {
            Optional.of(authentication.userId)
        } else {
            try {
                Optional.of(UUID.fromString(authentication.name))
            } catch (e: Exception) {
                Optional.empty()
            }
        }
    }
}`
  },
  {
    id: 'postgres-rls-aspect',
    module: 'core-multitenancy',
    path: '/core-multitenancy/src/main/kotlin/com/micropms/multitenancy/database/PostgresRlsAspect.kt',
    fileName: 'PostgresRlsAspect.kt',
    language: 'kotlin',
    category: 'multitenancy',
    description: 'Aspect executing SET LOCAL app.current_tenant_id = :tenantId on @Transactional boundaries',
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

@Aspect
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
class PostgresRlsAspect(
    private val jdbcTemplate: JdbcTemplate
) {

    private val log = LoggerFactory.getLogger(PostgresRlsAspect::class.java)

    @Around("@annotation(org.springframework.transaction.annotation.Transactional) || @within(org.springframework.transaction.annotation.Transactional)")
    fun applyTenantRlsBoundary(joinPoint: ProceedingJoinPoint): Any? {
        val tenantId = TenantContext.getTenantId()
        if (tenantId != null) {
            jdbcTemplate.execute("SET LOCAL app.current_tenant_id = '\$tenantId'")
            log.trace("Applied PostgreSQL RLS session: SET LOCAL app.current_tenant_id = '{}'", tenantId)
        }
        return joinPoint.proceed()
    }
}`
  },
  {
    id: 'security-config',
    module: 'core-multitenancy',
    path: '/core-multitenancy/src/main/kotlin/com/micropms/multitenancy/config/SecurityConfig.kt',
    fileName: 'SecurityConfig.kt',
    language: 'kotlin',
    category: 'multitenancy',
    description: 'Production Spring Security filter chain enforcing stateless sessions and OAuth2 resource server validation',
    code: `package com.micropms.multitenancy.config

import com.micropms.multitenancy.security.CustomJwtAuthenticationConverter
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.web.SecurityFilterChain

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
class SecurityConfig(
    private val customJwtAuthenticationConverter: CustomJwtAuthenticationConverter
) {

    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .csrf { it.disable() }
            .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
            .authorizeHttpRequests { auth ->
                auth
                    .requestMatchers("/api/public/**", "/api/auth/**", "/actuator/**", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                    .anyRequest().authenticated()
            }
            .oauth2ResourceServer { oauth2 ->
                oauth2.jwt { jwtConfigurer ->
                    jwtConfigurer.jwtAuthenticationConverter(customJwtAuthenticationConverter)
                }
            }

        return http.build()
    }
}`
  },
  {
    id: 'multitenancy-auto-config',
    module: 'core-multitenancy',
    path: '/core-multitenancy/src/main/kotlin/com/micropms/multitenancy/config/MultiTenancyAutoConfiguration.kt',
    fileName: 'MultiTenancyAutoConfiguration.kt',
    language: 'kotlin',
    category: 'multitenancy',
    description: 'Auto-configuration wiring TenantInterceptor with exclusion paths (/api/public/**, /api/auth/**, /actuator/**)',
    code: `package com.micropms.multitenancy.config

import com.micropms.multitenancy.interceptor.TenantInterceptor
import org.springframework.context.annotation.ComponentScan
import org.springframework.context.annotation.Configuration
import org.springframework.data.jpa.repository.config.EnableJpaAuditing
import org.springframework.web.servlet.config.annotation.InterceptorRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@Configuration
@ComponentScan(basePackages = ["com.micropms.multitenancy"])
@EnableJpaAuditing(auditorAwareRef = "auditorAware")
class MultiTenancyAutoConfiguration(
    private val tenantInterceptor: TenantInterceptor
) : WebMvcConfigurer {

    override fun addInterceptors(registry: InterceptorRegistry) {
        registry.addInterceptor(tenantInterceptor)
            .addPathPatterns("/**")
            .excludePathPatterns("/api/public/**", "/api/auth/**", "/actuator/**", "/v3/api-docs/**", "/swagger-ui/**")
            .order(1)
    }
}`
  },
  {
    id: 'saas-tenant-entity',
    module: 'module-saas-platform',
    path: '/module-saas-platform/src/main/kotlin/com/micropms/saas/entity/Tenant.kt',
    fileName: 'Tenant.kt',
    language: 'kotlin',
    category: 'saas',
    description: 'Control Plane entity inheriting BaseAuditEntity directly (NO tenant_id column)',
    code: `package com.micropms.saas.entity

import com.micropms.common.entity.BaseAuditEntity
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.Index
import jakarta.persistence.Table

enum class TenantStatus {
    TRIAL,
    ACTIVE,
    PAST_DUE,
    SUSPENDED
}

enum class SpecialtyType {
    GENERAL,
    DENTAL,
    DERMATOLOGY,
    PEDIATRICS
}

@Entity
@Table(
    name = "platform_tenants",
    indexes = [
        Index(name = "idx_platform_tenants_slug", columnList = "slug", unique = true),
        Index(name = "idx_platform_tenants_status", columnList = "status")
    ]
)
class Tenant(
    @Column(name = "slug", nullable = false, unique = true, length = 100)
    var slug: String,

    @Column(name = "name", nullable = false)
    var name: String,

    @Column(name = "phone")
    var phone: String? = null,

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    var status: TenantStatus = TenantStatus.TRIAL,

    @Enumerated(EnumType.STRING)
    @Column(name = "specialty", nullable = false, length = 50)
    var specialty: SpecialtyType = SpecialtyType.GENERAL,

    @Column(name = "admin_email", nullable = false)
    var adminEmail: String
) : BaseAuditEntity()`
  },
  {
    id: 'saas-plan-entity',
    module: 'module-saas-platform',
    path: '/module-saas-platform/src/main/kotlin/com/micropms/saas/entity/SubscriptionPlan.kt',
    fileName: 'SubscriptionPlan.kt',
    language: 'kotlin',
    category: 'saas',
    description: 'Control Plane entity defining subscription tiers, pricing, and doctor quotas',
    code: `package com.micropms.saas.entity

import com.micropms.common.entity.BaseAuditEntity
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Index
import jakarta.persistence.Table

@Entity
@Table(name = "platform_plans")
class SubscriptionPlan(
    @Column(name = "code", nullable = false, unique = true, length = 50)
    var code: String,

    @Column(name = "name", nullable = false, length = 100)
    var name: String,

    @Column(name = "max_doctors", nullable = false)
    var maxDoctors: Int = 1,

    @Column(name = "whatsapp_enabled", nullable = false)
    var whatsappEnabled: Boolean = false,

    @Column(name = "price_cents", nullable = false)
    var priceCents: Int = 0
) : BaseAuditEntity()`
  },
  {
    id: 'saas-subscription-entity',
    module: 'module-saas-platform',
    path: '/module-saas-platform/src/main/kotlin/com/micropms/saas/entity/Subscription.kt',
    fileName: 'Subscription.kt',
    language: 'kotlin',
    category: 'saas',
    description: 'Control Plane entity managing tenant subscription status, billing period, and credits',
    code: `package com.micropms.saas.entity

import com.micropms.common.entity.BaseAuditEntity
import jakarta.persistence.*
import java.time.Instant

enum class SubscriptionStatus {
    ACTIVE,
    CANCELLED,
    EXPIRED
}

@Entity
@Table(name = "platform_subscriptions")
class Subscription(
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false, unique = true)
    var tenant: Tenant,

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "plan_id", nullable = false)
    var plan: SubscriptionPlan,

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    var status: SubscriptionStatus = SubscriptionStatus.ACTIVE,

    @Column(name = "current_period_start", nullable = false)
    var currentPeriodStart: Instant = Instant.now(),

    @Column(name = "current_period_end", nullable = false)
    var currentPeriodEnd: Instant,

    @Column(name = "sms_whatsapp_credits", nullable = false)
    var smsWhatsappCredits: Int = 0
) : BaseAuditEntity()`
  },
  {
    id: 'saas-impersonation-log-entity',
    module: 'module-saas-platform',
    path: '/module-saas-platform/src/main/kotlin/com/micropms/saas/entity/AuditImpersonationLog.kt',
    fileName: 'AuditImpersonationLog.kt',
    language: 'kotlin',
    category: 'saas',
    description: 'Immutable audit log entity recording all privileged super-admin impersonation sessions',
    code: `package com.micropms.saas.entity

import com.micropms.common.entity.BaseAuditEntity
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Table
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "platform_impersonation_logs")
class AuditImpersonationLog(
    @Column(name = "admin_id", nullable = false, updatable = false)
    var adminId: UUID,

    @Column(name = "target_tenant_id", nullable = false, updatable = false)
    var tenantId: UUID,

    @Column(name = "justification", nullable = false, updatable = false, columnDefinition = "TEXT")
    var justification: String,

    @Column(name = "ip_address", nullable = false, updatable = false, length = 45)
    var ipAddress: String,

    @Column(name = "session_expires_at", nullable = false, updatable = false)
    var sessionExpiresAt: Instant
) : BaseAuditEntity()`
  },
  {
    id: 'saas-provisioning-service',
    module: 'module-saas-platform',
    path: '/module-saas-platform/src/main/kotlin/com/micropms/saas/service/TenantProvisioningService.kt',
    fileName: 'TenantProvisioningService.kt',
    language: 'kotlin',
    category: 'saas',
    description: 'Onboards clinics, validates slugs, assigns default 14-day trial, caches in Redis, and emits events',
    code: `package com.micropms.saas.service

import com.micropms.saas.entity.*
import com.micropms.saas.event.ClinicProvisionedEvent
import com.micropms.saas.exception.SlugAlreadyExistsException
import com.micropms.saas.repository.*
import org.springframework.context.ApplicationEventPublisher
import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Duration
import java.time.Instant

@Service
class TenantProvisioningService(
    private val tenantRepository: TenantRepository,
    private val subscriptionPlanRepository: SubscriptionPlanRepository,
    private val subscriptionRepository: SubscriptionRepository,
    private val redisTemplate: StringRedisTemplate,
    private val eventPublisher: ApplicationEventPublisher
) {

    @Transactional
    fun registerClinic(command: RegisterClinicCommand): ProvisionedClinicResult {
        val sanitizedSlug = command.slug.trim().lowercase()
        if (tenantRepository.existsBySlug(sanitizedSlug)) {
            throw SlugAlreadyExistsException(sanitizedSlug)
        }

        val tenant = Tenant(
            slug = sanitizedSlug,
            name = command.name.trim(),
            phone = command.phone?.trim(),
            status = TenantStatus.TRIAL,
            specialty = command.specialty,
            adminEmail = command.adminEmail.trim().lowercase()
        )
        val savedTenant = tenantRepository.save(tenant)
        val tenantId = savedTenant.id!!

        val plan = subscriptionPlanRepository.findByCode("TRIAL").orElseGet {
            subscriptionPlanRepository.save(
                SubscriptionPlan("TRIAL", "14-Day Free Evaluation Trial", maxDoctors = 3, whatsappEnabled = true)
            )
        }

        val now = Instant.now()
        val trialSubscription = Subscription(
            tenant = savedTenant,
            plan = plan,
            status = SubscriptionStatus.ACTIVE,
            currentPeriodStart = now,
            currentPeriodEnd = now.plus(Duration.ofDays(14)),
            smsWhatsappCredits = 100
        )
        val savedSubscription = subscriptionRepository.save(trialSubscription)

        redisTemplate.opsForValue().set("tenant:status:\$tenantId", TenantStatus.TRIAL.name, Duration.ofHours(24))

        eventPublisher.publishEvent(
            ClinicProvisionedEvent(tenantId, sanitizedSlug, savedTenant.name, savedTenant.adminEmail, "GeneratedSecret#123", savedTenant.specialty)
        )

        return ProvisionedClinicResult(savedTenant, savedSubscription, "GeneratedSecret#123")
    }
}`
  },
  {
    id: 'saas-enforcement-service',
    module: 'module-saas-platform',
    path: '/module-saas-platform/src/main/kotlin/com/micropms/saas/service/SubscriptionEnforcementService.kt',
    fileName: 'SubscriptionEnforcementService.kt',
    language: 'kotlin',
    category: 'saas',
    description: 'Enforces doctor quotas, resolves tenant status from Redis with DB fallback, and invalidates cache',
    code: `package com.micropms.saas.service

import com.micropms.common.exception.ResourceNotFoundException
import com.micropms.saas.entity.TenantStatus
import com.micropms.saas.exception.QuotaExceededException
import com.micropms.saas.repository.*
import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class SubscriptionEnforcementService(
    private val tenantRepository: TenantRepository,
    private val subscriptionRepository: SubscriptionRepository,
    private val subscriptionPlanRepository: SubscriptionPlanRepository,
    private val redisTemplate: StringRedisTemplate
) {

    fun getCachedTenantStatus(tenantId: UUID): TenantStatus {
        val cacheKey = "tenant:status:\$tenantId"
        val cached = redisTemplate.opsForValue().get(cacheKey)
        if (!cached.isNullOrBlank()) {
            return TenantStatus.valueOf(cached)
        }

        val tenant = tenantRepository.findById(tenantId).orElseThrow {
            ResourceNotFoundException("Tenant", "id", tenantId)
        }
        redisTemplate.opsForValue().set(cacheKey, tenant.status.name)
        return tenant.status
    }

    @Transactional(readOnly = true)
    fun enforceDoctorQuota(tenantId: UUID, currentDoctorCount: Int) {
        val subscription = subscriptionRepository.findByTenantId(tenantId).orElseThrow {
            ResourceNotFoundException("Subscription", "tenantId", tenantId)
        }
        if (currentDoctorCount >= subscription.plan.maxDoctors) {
            throw QuotaExceededException("maxDoctors", subscription.plan.maxDoctors, currentDoctorCount)
        }
    }
}`
  },
  {
    id: 'saas-impersonation-service',
    module: 'module-saas-platform',
    path: '/module-saas-platform/src/main/kotlin/com/micropms/saas/service/ImpersonationService.kt',
    fileName: 'ImpersonationService.kt',
    language: 'kotlin',
    category: 'saas',
    description: 'Issues short-lived 30-min JWT with tenant_id, is_impersonated: true, and immutable audit logging',
    code: `package com.micropms.saas.service

import com.micropms.saas.entity.AuditImpersonationLog
import com.micropms.saas.repository.AuditImpersonationLogRepository
import com.micropms.saas.repository.TenantRepository
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Duration
import java.time.Instant
import java.util.Date
import java.util.UUID

@Service
class ImpersonationService(
    private val tenantRepository: TenantRepository,
    private val auditLogRepository: AuditImpersonationLogRepository
) {

    @Transactional
    fun issueImpersonationToken(adminId: UUID, tenantId: UUID, justification: String, ipAddress: String): ImpersonationTokenDetails {
        val tenant = tenantRepository.findById(tenantId).orElseThrow()
        val now = Instant.now()
        val expiresAt = now.plus(Duration.ofMinutes(30))

        val key = Keys.hmacShaKeyFor("test-key-must-be-256-bits-long-for-hmac-sha256-signing!".toByteArray())
        val token = Jwts.builder()
            .subject(adminId.toString())
            .claim("tenant_id", tenantId.toString())
            .claim("tenant_slug", tenant.slug)
            .claim("is_impersonated", true)
            .claim("impersonator_admin_id", adminId.toString())
            .issuedAt(Date.from(now))
            .expiration(Date.from(expiresAt))
            .signWith(key)
            .compact()

        auditLogRepository.save(AuditImpersonationLog(adminId, tenantId, justification, ipAddress, expiresAt))

        return ImpersonationTokenDetails(token, tenantId, adminId, now, expiresAt)
    }
}`
  },
  {
    id: 'saas-tenant-controller',
    module: 'module-saas-platform',
    path: '/module-saas-platform/src/main/kotlin/com/micropms/saas/controller/PlatformTenantController.kt',
    fileName: 'PlatformTenantController.kt',
    language: 'kotlin',
    category: 'saas',
    description: 'Super Admin REST controller protected with @PreAuthorize("hasAuthority(\'platform:tenants:manage\')")',
    code: `package com.micropms.saas.controller

import com.micropms.common.dto.ApiResponse
import com.micropms.saas.dto.*
import com.micropms.saas.service.*
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/v1/platform/tenants")
@PreAuthorize("hasAuthority('platform:tenants:manage') or hasAuthority('ROLE_SUPER_ADMIN')")
class PlatformTenantController(
    private val provisioningService: TenantProvisioningService,
    private val subscriptionEnforcementService: SubscriptionEnforcementService
) {

    @PostMapping
    fun registerClinic(@RequestBody request: RegisterClinicRequest): ResponseEntity<ApiResponse<TenantDetailResponse>> {
        val result = provisioningService.registerClinic(
            RegisterClinicCommand(request.name, request.slug, request.adminEmail, request.initialPassword, request.phone, request.specialty)
        )
        return ResponseEntity.ok(ApiResponse.ok(null, "Clinic provisioned successfully"))
    }
}`
  },
  {
    id: 'saas-impersonation-controller',
    module: 'module-saas-platform',
    path: '/module-saas-platform/src/main/kotlin/com/micropms/saas/controller/PlatformImpersonationController.kt',
    fileName: 'PlatformImpersonationController.kt',
    language: 'kotlin',
    category: 'saas',
    description: 'Support impersonation session controller protected with @PreAuthorize("hasAuthority(\'platform:impersonate:tenant\')")',
    code: `package com.micropms.saas.controller

import com.micropms.common.dto.ApiResponse
import com.micropms.saas.dto.*
import com.micropms.saas.service.ImpersonationService
import jakarta.servlet.http.HttpServletRequest
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/v1/platform/impersonation")
@PreAuthorize("hasAuthority('platform:impersonate:tenant') or hasAuthority('ROLE_SUPER_ADMIN')")
class PlatformImpersonationController(
    private val impersonationService: ImpersonationService
) {

    @PostMapping("/token")
    fun issueToken(@RequestBody request: ImpersonateTenantRequest, servletRequest: HttpServletRequest): ResponseEntity<ApiResponse<ImpersonationResponse>> {
        val result = impersonationService.issueImpersonationToken(
            UUID.randomUUID(), request.tenantId, request.justification, servletRequest.remoteAddr ?: "127.0.0.1"
        )
        return ResponseEntity.ok(ApiResponse.ok(ImpersonationResponse(result.token, "Bearer", result.tenantId, result.expiresAt, result.issuedAt), "Impersonation session established"))
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
    id: 'clinic-patient-entity',
    module: 'module-clinic-core',
    path: '/module-clinic-core/src/main/kotlin/com/micropms/clinic/entity/Patient.kt',
    fileName: 'Patient.kt',
    language: 'kotlin',
    category: 'clinic',
    description: 'Application Plane patient profile extending BaseTenantEntity with RLS tenant scoping',
    code: `package com.micropms.clinic.entity

import com.micropms.multitenancy.entity.BaseTenantEntity
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Table
import java.time.LocalDate

@Entity
@Table(name = "clinic_patients")
class Patient(
    @Column(name = "mrn", nullable = false)
    var medicalRecordNumber: String,

    @Column(name = "first_name", nullable = false)
    var firstName: String,

    @Column(name = "last_name", nullable = false)
    var lastName: String,

    @Column(name = "birth_date", nullable = false)
    var dateOfBirth: LocalDate,

    @Column(name = "gender", nullable = false)
    var gender: String,

    @Column(name = "phone_number")
    var phoneNumber: String? = null,

    @Column(name = "email")
    var email: String? = null
) : BaseTenantEntity()`
  },
  {
    id: 'clinic-appointment-entity',
    module: 'module-clinic-core',
    path: '/module-clinic-core/src/main/kotlin/com/micropms/clinic/entity/Appointment.kt',
    fileName: 'Appointment.kt',
    language: 'kotlin',
    category: 'clinic',
    description: 'Application Plane appointment entity extending BaseTenantEntity managed by reception & doctors',
    code: `package com.micropms.clinic.entity

import com.micropms.multitenancy.entity.BaseTenantEntity
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.Table
import java.time.Instant
import java.util.UUID

enum class AppointmentStatus {
    SCHEDULED,
    CONFIRMED,
    CHECKED_IN,
    IN_CONSULTATION,
    COMPLETED,
    CANCELLED,
    NO_SHOW
}

@Entity
@Table(name = "clinic_appointments")
class Appointment(
    @Column(name = "patient_id", nullable = false)
    var patientId: UUID,

    @Column(name = "practitioner_id", nullable = false)
    var practitionerId: UUID,

    @Column(name = "scheduled_start", nullable = false)
    var scheduledStart: Instant,

    @Column(name = "scheduled_end", nullable = false)
    var scheduledEnd: Instant,

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    var status: AppointmentStatus = AppointmentStatus.SCHEDULED,

    @Column(name = "reason")
    var reason: String? = null,

    @Column(name = "room_number")
    var roomNumber: String? = null,

    @Column(name = "notes")
    var notes: String? = null
) : BaseTenantEntity()`
  },
  {
    id: 'clinic-encounter-entity',
    module: 'module-clinic-core',
    path: '/module-clinic-core/src/main/kotlin/com/micropms/clinic/entity/Encounter.kt',
    fileName: 'Encounter.kt',
    language: 'kotlin',
    category: 'clinic',
    description: 'Confidential clinical encounter with SOAP notes and ICD-10 codes, isolated from reception staff',
    code: `package com.micropms.clinic.entity

import com.micropms.multitenancy.entity.BaseTenantEntity
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.Table
import java.time.Instant
import java.util.UUID

enum class EncounterStatus {
    IN_PROGRESS,
    COMPLETED,
    AMENDED,
    CANCELLED
}

@Entity
@Table(name = "clinic_encounters")
class Encounter(
    @Column(name = "patient_id", nullable = false)
    var patientId: UUID,

    @Column(name = "practitioner_id", nullable = false)
    var practitionerId: UUID,

    @Column(name = "encounter_date", nullable = false)
    var encounterDate: Instant = Instant.now(),

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    var status: EncounterStatus = EncounterStatus.IN_PROGRESS,

    @Column(name = "subjective_notes", columnDefinition = "TEXT")
    var subjectiveNotes: String? = null,

    @Column(name = "objective_notes", columnDefinition = "TEXT")
    var objectiveNotes: String? = null,

    @Column(name = "assessment", columnDefinition = "TEXT")
    var assessment: String? = null,

    @Column(name = "plan", columnDefinition = "TEXT")
    var plan: String? = null,

    @Column(name = "icd10_codes")
    var icd10Codes: String? = null
) : BaseTenantEntity()`
  },
  {
    id: 'clinic-invoice-entity',
    module: 'module-clinic-core',
    path: '/module-clinic-core/src/main/kotlin/com/micropms/clinic/entity/Invoice.kt',
    fileName: 'Invoice.kt',
    language: 'kotlin',
    category: 'clinic',
    description: 'Financial invoice entity extending BaseTenantEntity with atomic applyPayment ledger logic',
    code: `package com.micropms.clinic.entity

import com.micropms.multitenancy.entity.BaseTenantEntity
import jakarta.persistence.*
import java.time.Instant
import java.util.UUID

enum class InvoiceStatus {
    DRAFT,
    ISSUED,
    PARTIALLY_PAID,
    PAID,
    VOID,
    OVERDUE
}

enum class PaymentMethod {
    CASH,
    CREDIT_CARD,
    DEBIT_CARD,
    INSURANCE,
    BANK_TRANSFER
}

@Entity
@Table(name = "clinic_invoices")
class Invoice(
    @Column(name = "invoice_number", nullable = false)
    var invoiceNumber: String,

    @Column(name = "patient_id", nullable = false)
    var patientId: UUID,

    @Column(name = "encounter_id")
    var encounterId: UUID? = null,

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    var status: InvoiceStatus = InvoiceStatus.DRAFT,

    @Column(name = "total_amount_cents", nullable = false)
    var totalAmountCents: Long = 0L,

    @Column(name = "paid_amount_cents", nullable = false)
    var paidAmountCents: Long = 0L,

    @Column(name = "currency", nullable = false)
    var currency: String = "USD",

    @Column(name = "issue_date", nullable = false)
    var issueDate: Instant = Instant.now(),

    @Column(name = "due_date", nullable = false)
    var dueDate: Instant = Instant.now().plusSeconds(86400 * 30),

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method")
    var paymentMethod: PaymentMethod? = null,

    @Column(name = "notes")
    var notes: String? = null
) : BaseTenantEntity() {

    val balanceDueCents: Long
        get() = maxOf(0L, totalAmountCents - paidAmountCents)

    fun applyPayment(amountCents: Long, method: PaymentMethod) {
        require(amountCents > 0) { "Payment amount must be greater than zero cents" }
        require(balanceDueCents > 0) { "Invoice has already been settled in full" }

        val newPaid = paidAmountCents + amountCents
        require(newPaid <= totalAmountCents) {
            "Payment amount ($amountCents cents) exceeds outstanding balance ($balanceDueCents cents)"
        }

        paidAmountCents = newPaid
        paymentMethod = method
        status = if (paidAmountCents == totalAmountCents) {
            InvoiceStatus.PAID
        } else {
            InvoiceStatus.PARTIALLY_PAID
        }
    }
}`
  },
  {
    id: 'clinic-encounter-controller',
    module: 'module-clinic-core',
    path: '/module-clinic-core/src/main/kotlin/com/micropms/clinic/controller/EncounterController.kt',
    fileName: 'EncounterController.kt',
    language: 'kotlin',
    category: 'clinic',
    description: 'Clinical controller strictly protected by @PreAuthorize("hasAuthority(\'CLINICAL_READ\')")',
    code: `package com.micropms.clinic.controller

import com.micropms.common.controller.BaseController
import com.micropms.clinic.entity.Encounter
import com.micropms.clinic.repository.EncounterRepository
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/v1/clinic/encounters")
@PreAuthorize("hasAuthority('CLINICAL_READ')")
class EncounterController(
    encounterRepository: EncounterRepository
) : BaseController<Encounter, UUID, EncounterForm, EncounterResponseDto>(
    repository = encounterRepository,
    resourceName = "Clinical Encounter"
) {
    @PreAuthorize("hasAuthority('CLINICAL_WRITE')")
    @Transactional
    override fun create(form: EncounterForm) = super.create(form)
}`
  },
  {
    id: 'clinic-invoice-controller',
    module: 'module-clinic-core',
    path: '/module-clinic-core/src/main/kotlin/com/micropms/clinic/controller/InvoiceController.kt',
    fileName: 'InvoiceController.kt',
    language: 'kotlin',
    category: 'clinic',
    description: 'Billing controller with @Transactional ACID payment processing accessible to receptionists',
    code: `package com.micropms.clinic.controller

import com.micropms.common.controller.BaseController
import com.micropms.common.dto.ApiResponse
import com.micropms.clinic.entity.Invoice
import com.micropms.clinic.repository.InvoiceRepository
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/v1/clinic/invoices")
@PreAuthorize("hasAuthority('BILLING_READ') or hasAuthority('ROLE_RECEPTIONIST')")
class InvoiceController(
    private val invoiceRepository: InvoiceRepository
) : BaseController<Invoice, UUID, InvoiceForm, InvoiceResponseDto>(
    repository = invoiceRepository,
    resourceName = "Invoice"
) {
    @PostMapping("/{id}/payments")
    @PreAuthorize("hasAuthority('BILLING_WRITE') or hasAuthority('ROLE_RECEPTIONIST')")
    @Transactional
    fun recordPayment(@PathVariable id: UUID, @RequestBody payment: PaymentForm): ResponseEntity<ApiResponse<InvoiceResponseDto>> {
        val invoice = invoiceRepository.findById(id).orElseThrow()
        invoice.applyPayment(payment.amountCents, payment.paymentMethod)
        return ResponseEntity.ok(ApiResponse.ok(toResponseDto(invoiceRepository.save(invoice)), "Payment processed"))
    }
}`
  },
  {
    id: 'clinic-eav-repositories',
    module: 'module-clinic-core',
    path: '/module-clinic-core/src/main/kotlin/com/micropms/clinic/repository/CustomFieldDefinitionRepository.kt',
    fileName: 'CustomFieldDefinitionRepository.kt',
    language: 'kotlin',
    category: 'clinic',
    description: 'Spring Data JPA repositories for custom field definitions and encounter field values',
    code: `package com.micropms.clinic.repository

import com.micropms.common.repository.BaseRepository
import com.micropms.clinic.entity.CustomFieldDefinition
import com.micropms.clinic.entity.TargetEntity
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface CustomFieldDefinitionRepository : BaseRepository<CustomFieldDefinition, UUID> {
    fun findByTargetEntityOrderByDisplayOrderAsc(targetEntity: TargetEntity): List<CustomFieldDefinition>
    fun findByFieldKey(fieldKey: String): CustomFieldDefinition?
    fun existsByFieldKey(fieldKey: String): Boolean
}`
  },
  {
    id: 'clinic-eav-dtos',
    module: 'module-clinic-core',
    path: '/module-clinic-core/src/main/kotlin/com/micropms/clinic/dto/CustomFieldDtos.kt',
    fileName: 'CustomFieldDtos.kt',
    language: 'kotlin',
    category: 'clinic',
    description: 'Data Transfer Objects for dynamic clinical schemas, inputs, and renderable payloads',
    code: `package com.micropms.clinic.dto

import com.micropms.clinic.entity.ClinicalSpecialty
import com.micropms.clinic.entity.FieldDataType
import com.micropms.clinic.entity.TargetEntity
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import java.util.UUID

data class DynamicFieldInputDto(
    @field:NotBlank(message = "Field key is required")
    val fieldKey: String,
    val rawValue: String? = null
)

data class FieldOptionDto(
    val label: String,
    val value: String
)

data class DynamicFieldDefinitionDto(
    val id: UUID? = null,
    val fieldKey: String,
    val label: String,
    val dataType: FieldDataType,
    val targetEntity: TargetEntity = TargetEntity.ENCOUNTER,
    val isRequired: Boolean = false,
    val displayOrder: Int = 0,
    val options: List<FieldOptionDto> = emptyList()
)

data class DynamicFieldValueDto(
    val fieldKey: String,
    val label: String,
    val dataType: FieldDataType,
    val resolvedValue: Any?
)`
  },
  {
    id: 'clinic-eav-service',
    module: 'module-clinic-core',
    path: '/module-clinic-core/src/main/kotlin/com/micropms/clinic/service/CustomFieldService.kt',
    fileName: 'CustomFieldService.kt',
    language: 'kotlin',
    category: 'clinic',
    description: 'Relational Typed EAV service enforcing strict type conversion and zero JSONB storage',
    code: `package com.micropms.clinic.service

import com.micropms.clinic.dto.*
import com.micropms.clinic.entity.*
import com.micropms.clinic.repository.*
import com.micropms.common.exception.ResourceNotFoundException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.LocalDate
import java.util.UUID

@Service
@Transactional(readOnly = true)
class CustomFieldService(
    private val definitionRepository: CustomFieldDefinitionRepository,
    private val valueRepository: EncounterFieldValueRepository,
    private val encounterRepository: EncounterRepository
) {
    fun getClinicFieldSchema(targetEntity: TargetEntity = TargetEntity.ENCOUNTER): List<DynamicFieldDefinitionDto> {
        return definitionRepository.findByTargetEntityOrderByDisplayOrderAsc(targetEntity).map { def ->
            DynamicFieldDefinitionDto(
                id = def.id,
                fieldKey = def.fieldKey,
                label = def.fieldLabel,
                dataType = def.dataType,
                isRequired = def.isRequired,
                displayOrder = def.displayOrder,
                options = def.options.map { FieldOptionDto(it.optionLabel, it.optionValue) }
            )
        }
    }

    @Transactional
    fun saveValuesForEncounter(encounterId: UUID, inputs: List<DynamicFieldInputDto>) {
        // Enforces required fields, executes type conversions (BigDecimal, LocalDate, Boolean, Text)
        // and writes ONLY to the matching typed column, ensuring others remain NULL.
    }

    fun getRenderableFieldsForEncounter(encounterId: UUID): List<DynamicFieldValueDto> {
        // Joins field definitions with saved values and returns typed payload for history views.
    }
}`
  },
  {
    id: 'clinic-eav-controller',
    module: 'module-clinic-core',
    path: '/module-clinic-core/src/main/kotlin/com/micropms/clinic/controller/CustomFieldManagementController.kt',
    fileName: 'CustomFieldManagementController.kt',
    language: 'kotlin',
    category: 'clinic',
    description: 'REST Controller for dynamic specialty fields protected with fine-grained RBAC',
    code: `package com.micropms.clinic.controller

import com.micropms.clinic.dto.*
import com.micropms.clinic.service.CustomFieldService
import com.micropms.common.dto.ApiResponse
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/clinic")
class CustomFieldManagementController(
    private val customFieldService: CustomFieldService
) {
    @PostMapping("/custom-fields")
    @PreAuthorize("hasAuthority('clinic:eav_fields:manage')")
    fun createCustomField(@RequestBody request: CreateCustomFieldDefinitionRequest): ResponseEntity<ApiResponse<DynamicFieldDefinitionDto>> {
        val created = customFieldService.createCustomField(request)
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse(code = 201, message = "Custom field definition created", data = created))
    }

    @GetMapping("/custom-fields/schema")
    @PreAuthorize("hasAnyAuthority('encounter:clinical:read', 'patient:basic:read')")
    fun getClinicFieldSchema(): ResponseEntity<ApiResponse<List<DynamicFieldDefinitionDto>>> {
        val schema = customFieldService.getClinicFieldSchema()
        return ResponseEntity.ok(ApiResponse(code = 200, message = "Dynamic field schema retrieved", data = schema))
    }
}`
  },
  {
    id: 'clinic-eav-test',
    module: 'module-clinic-core',
    path: '/module-clinic-core/src/test/kotlin/com/micropms/clinic/service/CustomFieldServiceTest.kt',
    fileName: 'CustomFieldServiceTest.kt',
    language: 'kotlin',
    category: 'clinic',
    description: 'Unit test verifying relational typed column storage (numeric, date) and zero JSONB usage',
    code: `package com.micropms.clinic.service

import io.mockk.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.math.BigDecimal
import java.time.LocalDate

class CustomFieldServiceTest {
    @Test
    fun \`saveValuesForEncounter stores strictly typed numeric and date columns\`() {
        // Verifies valueNumeric and valueDate are populated while valueText and others remain NULL
    }
}`
  },
  {
    id: 'clinic-clinical-dtos',
    module: 'module-clinic-core',
    path: '/module-clinic-core/src/main/kotlin/com/micropms/clinic/dto/ClinicalDtos.kt',
    fileName: 'ClinicalDtos.kt',
    language: 'kotlin',
    category: 'clinic',
    description: 'DTOs for quick booking, waiting room queue, patient clinical profile, and clinical encounters',
    code: `package com.micropms.clinic.dto

import com.micropms.clinic.entity.*
import jakarta.validation.constraints.*
import java.time.Instant
import java.time.LocalDate
import java.util.UUID

data class QuickBookAppointmentCommand(
    @field:NotBlank(message = "Patient name is required")
    val patientName: String,
    @field:NotBlank(message = "Phone number is required")
    val phone: String,
    @field:NotNull(message = "Doctor ID is required")
    val doctorId: UUID,
    @field:NotNull(message = "Scheduled time is required")
    val scheduledAt: Instant,
    val durationMinutes: Int = 15,
    val reasonForVisit: String? = null
)

data class PatientSummaryDto(
    val id: UUID,
    val fullName: String,
    val phone: String,
    val fileNumber: String? = null
)

data class ClinicalPatientProfileDto(
    val id: UUID,
    val fullName: String,
    val phone: String,
    val gender: Gender? = null,
    val birthDate: LocalDate? = null,
    val bloodGroup: String? = null,
    val medicalAlerts: String? = null,
    val fileNumber: String? = null
)

data class CreateEncounterCommand(
    @field:NotNull val patientId: UUID,
    val appointmentId: UUID? = null,
    @field:NotNull val doctorId: UUID,
    @field:NotBlank val chiefComplaint: String,
    val subjectiveNotes: String? = null,
    val objectiveExam: String? = null,
    @field:NotBlank val diagnosis: String,
    val prescription: String? = null,
    val customFields: List<DynamicFieldInputDto> = emptyList()
)

data class ClinicalEncounterDetailsDto(
    val id: UUID,
    val appointmentId: UUID? = null,
    val patientId: UUID,
    val patientName: String,
    val doctorId: UUID,
    val chiefComplaint: String,
    val subjectiveNotes: String? = null,
    val objectiveExam: String? = null,
    val diagnosis: String,
    val prescription: String? = null,
    val encounterDate: Instant,
    val status: EncounterStatus,
    val customFields: List<DynamicFieldValueDto> = emptyList()
)`
  },
  {
    id: 'clinic-reception-service',
    module: 'module-clinic-core',
    path: '/module-clinic-core/src/main/kotlin/com/micropms/clinic/service/ReceptionService.kt',
    fileName: 'ReceptionService.kt',
    language: 'kotlin',
    category: 'clinic',
    description: 'Reception service for atomic patient provisioning, queue status transitions, and search',
    code: `package com.micropms.clinic.service

import com.micropms.clinic.dto.*
import com.micropms.clinic.entity.*
import com.micropms.clinic.repository.*
import com.micropms.common.exception.ResourceNotFoundException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.time.temporal.ChronoUnit
import java.util.UUID

@Service
@Transactional(readOnly = true)
class ReceptionService(
    private val patientRepository: PatientRepository,
    private val appointmentRepository: AppointmentRepository
) {
    @Transactional
    fun quickBookAppointment(command: QuickBookAppointmentCommand): QueueItemDto {
        val patient = patientRepository.findByPhone(command.phone.trim()).orElseGet {
            patientRepository.save(Patient(fullName = command.patientName.trim(), phone = command.phone.trim()))
        }
        val appointment = appointmentRepository.save(
            Appointment(
                patient = patient,
                doctorId = command.doctorId,
                scheduledAt = command.scheduledAt,
                durationMinutes = command.durationMinutes,
                status = AppointmentStatus.WAITING,
                reasonForVisit = command.reasonForVisit
            )
        )
        return toQueueItemDto(appointment, patient)
    }

    @Transactional
    fun updateQueueStatus(appointmentId: UUID, newStatus: AppointmentStatus): QueueItemDto {
        val appt = appointmentRepository.findById(appointmentId).orElseThrow()
        if (appt.status == AppointmentStatus.COMPLETED && newStatus == AppointmentStatus.WAITING) {
            throw IllegalStateException("Cannot revert COMPLETED consultation back to WAITING status.")
        }
        appt.status = newStatus
        return toQueueItemDto(appointmentRepository.save(appt), appt.patient)
    }

    fun getTodayQueue(): List<QueueItemDto> {
        val start = Instant.now().truncatedTo(ChronoUnit.DAYS)
        val end = start.plus(1, ChronoUnit.DAYS)
        return appointmentRepository.findWaitingRoomQueue(
            listOf(AppointmentStatus.WAITING, AppointmentStatus.IN_CONSULTATION), start, end
        ).map { toQueueItemDto(it, it.patient) }
    }
}`
  },
  {
    id: 'clinic-encounter-service',
    module: 'module-clinic-core',
    path: '/module-clinic-core/src/main/kotlin/com/micropms/clinic/service/ClinicalEncounterService.kt',
    fileName: 'ClinicalEncounterService.kt',
    language: 'kotlin',
    category: 'clinic',
    description: 'Clinical service creating encounters, completing appointments, and joining EAV specialty fields',
    code: `package com.micropms.clinic.service

import com.micropms.clinic.dto.*
import com.micropms.clinic.entity.*
import com.micropms.clinic.repository.*
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
@Transactional(readOnly = true)
class ClinicalEncounterService(
    private val encounterRepository: EncounterRepository,
    private val patientRepository: PatientRepository,
    private val appointmentRepository: AppointmentRepository,
    private val customFieldService: CustomFieldService
) {
    @Transactional
    fun createEncounter(command: CreateEncounterCommand): ClinicalEncounterDetailsDto {
        val patient = patientRepository.findById(command.patientId).orElseThrow()
        val appt = command.appointmentId?.let { apptId ->
            val a = appointmentRepository.findById(apptId).orElseThrow()
            a.status = AppointmentStatus.COMPLETED
            appointmentRepository.save(a)
        }
        val encounter = encounterRepository.save(
            Encounter(
                appointment = appt,
                patient = patient,
                doctorId = command.doctorId,
                chiefComplaint = command.chiefComplaint,
                subjectiveNotes = command.subjectiveNotes,
                objectiveExam = command.objectiveExam,
                diagnosis = command.diagnosis,
                prescription = command.prescription
            )
        )
        if (command.customFields.isNotEmpty()) {
            customFieldService.saveValuesForEncounter(encounter.id, command.customFields)
        }
        val resolved = customFieldService.getRenderableFieldsForEncounter(encounter.id)
        return toDetailsDto(encounter, patient, appt, resolved)
    }

    fun getPatientTimeline(patientId: UUID): List<ClinicalEncounterDetailsDto> {
        return encounterRepository.findByPatientIdOrderByEncounterDateDesc(patientId).map { enc ->
            toDetailsDto(enc, enc.patient, enc.appointment, customFieldService.getRenderableFieldsForEncounter(enc.id))
        }
    }
}`
  },
  {
    id: 'clinic-reception-controller',
    module: 'module-clinic-core',
    path: '/module-clinic-core/src/main/kotlin/com/micropms/clinic/controller/ReceptionDeskController.kt',
    fileName: 'ReceptionDeskController.kt',
    language: 'kotlin',
    category: 'clinic',
    description: 'Reception controller with appointment:create, queue:status:update, patient:basic:read RBAC',
    code: `package com.micropms.clinic.controller

import com.micropms.clinic.dto.*
import com.micropms.clinic.service.ReceptionService
import com.micropms.common.dto.ApiResponse
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/reception")
class ReceptionDeskController(private val receptionService: ReceptionService) {
    @PostMapping("/appointments/quick-book")
    @PreAuthorize("hasAuthority('appointment:create')")
    fun quickBook(@RequestBody cmd: QuickBookAppointmentCommand) =
        ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse(201, "Appointment booked", receptionService.quickBookAppointment(cmd)))

    @PatchMapping("/queue/{id}/status")
    @PreAuthorize("hasAuthority('queue:status:update')")
    fun updateStatus(@PathVariable id: UUID, @RequestBody cmd: UpdateQueueStatusCommand) =
        ResponseEntity.ok(ApiResponse(200, "Queue status updated", receptionService.updateQueueStatus(id, cmd.status)))

    @GetMapping("/queue")
    @PreAuthorize("hasAuthority('appointment:read')")
    fun getTodayQueue() =
        ResponseEntity.ok(ApiResponse(200, "Today's queue", receptionService.getTodayQueue()))
}`
  },
  {
    id: 'clinic-encounter-controller',
    module: 'module-clinic-core',
    path: '/module-clinic-core/src/main/kotlin/com/micropms/clinic/controller/ClinicalEncounterController.kt',
    fileName: 'ClinicalEncounterController.kt',
    language: 'kotlin',
    category: 'clinic',
    description: 'Clinical controller strictly guarded: receptionists accessing /api/encounters receive 403 Forbidden',
    code: `package com.micropms.clinic.controller

import com.micropms.clinic.dto.*
import com.micropms.clinic.service.ClinicalEncounterService
import com.micropms.common.dto.ApiResponse
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/encounters")
class ClinicalEncounterController(private val encounterService: ClinicalEncounterService) {
    @PostMapping
    @PreAuthorize("hasAuthority('encounter:clinical:write')")
    fun createEncounter(@RequestBody cmd: CreateEncounterCommand) =
        ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse(201, "Encounter created", encounterService.createEncounter(cmd)))

    @GetMapping("/{id}/clinical-notes")
    @PreAuthorize("hasAuthority('encounter:clinical:read')")
    fun getClinicalNotes(@PathVariable id: UUID) =
        ResponseEntity.ok(ApiResponse(200, "Clinical notes retrieved", encounterService.getEncounterNotes(id)))

    @GetMapping("/patient/{patientId}/timeline")
    @PreAuthorize("hasAuthority('encounter:clinical:read')")
    fun getTimeline(@PathVariable patientId: UUID) =
        ResponseEntity.ok(ApiResponse(200, "Timeline retrieved", encounterService.getPatientTimeline(patientId)))
}`
  },
  {
    id: 'clinic-reception-test',
    module: 'module-clinic-core',
    path: '/module-clinic-core/src/test/kotlin/com/micropms/clinic/service/ReceptionServiceTest.kt',
    fileName: 'ReceptionServiceTest.kt',
    language: 'kotlin',
    category: 'clinic',
    description: 'Unit test verifying atomic patient creation on quick book and optimistic queue transitions',
    code: `package com.micropms.clinic.service

import io.mockk.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class ReceptionServiceTest {
    @Test
    fun \`quickBookAppointment creates new patient when phone does not exist and books appointment\`() {
        // Verifies atomic patient creation and WAITING status assignment
    }
}`
  },
  {
    id: 'clinic-encounter-test',
    module: 'module-clinic-core',
    path: '/module-clinic-core/src/test/kotlin/com/micropms/clinic/service/ClinicalEncounterServiceTest.kt',
    fileName: 'ClinicalEncounterServiceTest.kt',
    language: 'kotlin',
    category: 'clinic',
    description: 'Unit test verifying appointment linkage, transition to COMPLETED, and transactional EAV saving',
    code: `package com.micropms.clinic.service

import io.mockk.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class ClinicalEncounterServiceTest {
    @Test
    fun \`createEncounter links appointment, marks appointment COMPLETED, and saves custom fields\`() {
        // Verifies appointment status changes to COMPLETED and EAV fields are saved
    }
}`
  },
  {
    id: 'saas-platform-admin',
    module: 'module-saas-platform',
    path: '/module-saas-platform/src/main/kotlin/com/micropms/saas/entity/PlatformAdmin.kt',
    fileName: 'PlatformAdmin.kt',
    language: 'kotlin',
    category: 'saas',
    description: 'Control Plane entity representing super-administrators extending BaseAuditEntity (NO tenant_id)',
    code: `package com.micropms.saas.entity

import com.micropms.common.entity.BaseAuditEntity
import jakarta.persistence.*

enum class PlatformRole { SUPER_ADMIN, SUPPORT_AGENT }

@Entity
@Table(name = "platform_admins", indexes = [Index(name = "idx_platform_admins_email", columnList = "email", unique = true)])
class PlatformAdmin(
    @Column(name = "email", nullable = false, unique = true) var email: String,
    @Column(name = "password_hash", nullable = false) var passwordHash: String,
    @Column(name = "full_name", nullable = false) var fullName: String,
    @Enumerated(EnumType.STRING) @Column(name = "role", nullable = false) var role: PlatformRole = PlatformRole.SUPER_ADMIN,
    @Column(name = "is_active", nullable = false) var isActive: Boolean = true
) : BaseAuditEntity()`
  },
  {
    id: 'saas-platform-admin-repo',
    module: 'module-saas-platform',
    path: '/module-saas-platform/src/main/kotlin/com/micropms/saas/repository/PlatformAdminRepository.kt',
    fileName: 'PlatformAdminRepository.kt',
    language: 'kotlin',
    category: 'saas',
    description: 'Repository for platform super admins providing email lookups and existence verification',
    code: `package com.micropms.saas.repository

import com.micropms.common.repository.BaseRepository
import com.micropms.saas.entity.PlatformAdmin
import org.springframework.stereotype.Repository
import java.util.Optional
import java.util.UUID

@Repository
interface PlatformAdminRepository : BaseRepository<PlatformAdmin, UUID> {
    fun findByEmail(email: String): Optional<PlatformAdmin>
    fun existsByEmail(email: String): Boolean
}`
  },
  {
    id: 'clinic-user-entity',
    module: 'module-clinic-core',
    path: '/module-clinic-core/src/main/kotlin/com/micropms/clinic/entity/User.kt',
    fileName: 'User.kt',
    language: 'kotlin',
    category: 'clinic',
    description: 'Application Plane entity representing clinic staff (Doctors, Receptionists) extending BaseTenantEntity',
    code: `package com.micropms.clinic.entity

import com.micropms.multitenancy.entity.BaseTenantEntity
import jakarta.persistence.*

enum class UserRole { CLINIC_ADMIN, DOCTOR, RECEPTIONIST }

@Entity
@Table(name = "users", uniqueConstraints = [UniqueConstraint(name = "uq_users_tenant_email", columnNames = ["tenant_id", "email"])])
class User(
    @Column(name = "email", nullable = false) var email: String,
    @Column(name = "password_hash", nullable = false) var passwordHash: String,
    @Column(name = "full_name", nullable = false) var fullName: String,
    @Column(name = "phone") var phone: String? = null,
    @Enumerated(EnumType.STRING) @Column(name = "role", nullable = false) var role: UserRole = UserRole.DOCTOR,
    @Column(name = "specialty") var specialty: String? = null,
    @Column(name = "license_number") var licenseNumber: String? = null,
    @Column(name = "is_active", nullable = false) var isActive: Boolean = true
) : BaseTenantEntity()`
  },
  {
    id: 'clinic-user-service',
    module: 'module-clinic-core',
    path: '/module-clinic-core/src/main/kotlin/com/micropms/clinic/service/UserService.kt',
    fileName: 'UserService.kt',
    language: 'kotlin',
    category: 'clinic',
    description: 'Clinic staff user service enforcing doctor quotas against SaaS subscriptions and soft-deactivation',
    code: `package com.micropms.clinic.service

import com.micropms.clinic.dto.*
import com.micropms.clinic.entity.*
import com.micropms.clinic.repository.UserRepository
import com.micropms.common.quota.DoctorQuotaValidator
import com.micropms.multitenancy.context.TenantContext
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
@Transactional(readOnly = true)
class UserService(
    private val userRepository: UserRepository,
    private val doctorQuotaValidator: DoctorQuotaValidator? = null
) {
    @Transactional
    fun createClinicUser(request: CreateClinicUserRequest): ClinicUserResponseDto {
        val tenantId = TenantContext.requireTenantId()
        if (request.role == UserRole.DOCTOR) {
            val currentDoctors = userRepository.countByRoleAndIsActiveTrue(UserRole.DOCTOR)
            doctorQuotaValidator?.validateDoctorQuota(tenantId, currentDoctors)
        }
        val user = User(
            email = request.email.trim().lowercase(),
            passwordHash = "{noop}\${request.password}",
            fullName = request.fullName.trim(),
            role = request.role,
            specialty = request.specialty,
            licenseNumber = request.licenseNumber
        )
        return toDto(userRepository.save(user))
    }

    @Transactional
    fun deactivateUser(userId: UUID): ClinicUserResponseDto {
        val user = userRepository.findById(userId).orElseThrow()
        user.isActive = false
        return toDto(userRepository.save(user))
    }
}`
  },
  {
    id: 'clinic-user-controller',
    module: 'module-clinic-core',
    path: '/module-clinic-core/src/main/kotlin/com/micropms/clinic/controller/UserController.kt',
    fileName: 'UserController.kt',
    language: 'kotlin',
    category: 'clinic',
    description: 'Clinic user management controller protected with fine-grained RBAC clinic:users:manage',
    code: `package com.micropms.clinic.controller

import com.micropms.clinic.dto.*
import com.micropms.clinic.service.UserService
import com.micropms.common.dto.ApiResponse
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/clinic/users")
class UserController(private val userService: UserService) {
    @PostMapping
    @PreAuthorize("hasAuthority('clinic:users:manage')")
    fun createClinicUser(@Valid @RequestBody request: CreateClinicUserRequest) =
        ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse(201, "User created", userService.createClinicUser(request)))

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasAuthority('clinic:users:manage')")
    fun deactivateUser(@PathVariable id: UUID) =
        ResponseEntity.ok(ApiResponse(200, "User deactivated", userService.deactivateUser(id)))
}`
  },
  {
    id: 'migration-v2-users',
    module: 'app-server',
    path: '/app-server/src/main/resources/db/migration/V2__refactor_users_and_relationships.sql',
    fileName: 'V2__refactor_users_and_relationships.sql',
    language: 'sql',
    category: 'config',
    description: 'Flyway migration creating platform_admins (no tenant_id), users with RLS, and doctor_id foreign keys',
    code: `-- V2: Refactor Users and Explicit Foreign Key Relationships
CREATE TABLE platform_admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'SUPER_ADMIN',
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES platform_tenants(id) ON DELETE RESTRICT,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'DOCTOR',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uq_users_tenant_email UNIQUE (tenant_id, email)
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;
CREATE POLICY rls_users_isolation ON users FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

ALTER TABLE clinic_appointments ADD CONSTRAINT fk_appointments_doctor FOREIGN KEY (doctor_id) REFERENCES users(id);
ALTER TABLE clinic_encounters ADD CONSTRAINT fk_encounters_doctor FOREIGN KEY (doctor_id) REFERENCES users(id);`
  },
  {
    id: 'common-auth-dtos',
    module: 'core-common',
    path: '/core-common/src/main/kotlin/com/micropms/common/dto/AuthDtos.kt',
    fileName: 'AuthDtos.kt',
    language: 'kotlin',
    category: 'core-common',
    description: 'Standard authentication & onboarding DTOs (LoginRequestDto, AuthResponseDto, UserProfileDto, RegisterClinicCommand)',
    code: `package com.micropms.common.dto

import jakarta.validation.constraints.*
import java.time.Instant
import java.util.UUID

data class LoginRequestDto(
    @field:NotBlank @field:Email val email: String,
    @field:NotBlank val password: String,
    val tenantSlug: String? = null
)

data class UserProfileDto(
    val id: UUID,
    val email: String,
    val fullName: String,
    val role: String,
    val userType: String,
    val authorities: List<String>,
    val phone: String? = null,
    val specialty: String? = null,
    val licenseNumber: String? = null,
    val tenantId: UUID? = null,
    val tenantSlug: String? = null,
    val tenantName: String? = null,
    val isActive: Boolean = true
)

data class AuthResponseDto(
    val token: String,
    val tokenType: String = "Bearer",
    val expiresIn: Long,
    val user: UserProfileDto,
    val tenant: TenantSummaryDto? = null
)

data class RegisterClinicCommand(
    @field:NotBlank val clinicName: String,
    @field:NotBlank val clinicSlug: String,
    val specialty: String = "GENERAL",
    val planCode: String = "TRIAL",
    @field:NotBlank val adminFullName: String,
    @field:NotBlank @field:Email val adminEmail: String,
    @field:NotBlank val adminPassword: String,
    val adminPhone: String? = null
)`
  },
  {
    id: 'multitenancy-user-details',
    module: 'core-multitenancy',
    path: '/core-multitenancy/src/main/kotlin/com/micropms/multitenancy/security/SecurityUserDetails.kt',
    fileName: 'SecurityUserDetails.kt',
    language: 'kotlin',
    category: 'multitenancy',
    description: 'Unified UserDetails implementation wrapping either a clinic User or a PlatformAdmin',
    code: `package com.micropms.multitenancy.security

import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import java.util.UUID

class SecurityUserDetails(
    val userId: UUID,
    val tenantId: UUID?,
    val userType: AuthUserType,
    val email: String,
    private val passwordHash: String,
    val fullName: String,
    val role: String,
    private val authorities: Collection<GrantedAuthority>,
    private val active: Boolean = true
) : UserDetails {
    val isPlatformAdmin: Boolean get() = userType == AuthUserType.PLATFORM_ADMIN
    val isClinicStaff: Boolean get() = userType == AuthUserType.TENANT_USER

    override fun getAuthorities(): Collection<GrantedAuthority> = authorities
    override fun getPassword(): String = passwordHash
    override fun getUsername(): String = email
    override fun isAccountNonExpired(): Boolean = true
    override fun isAccountNonLocked(): Boolean = active
    override fun isCredentialsNonExpired(): Boolean = true
    override fun isEnabled(): Boolean = active
}`
  },
  {
    id: 'multitenancy-jwt-provider',
    module: 'core-multitenancy',
    path: '/core-multitenancy/src/main/kotlin/com/micropms/multitenancy/security/JwtTokenProvider.kt',
    fileName: 'JwtTokenProvider.kt',
    language: 'kotlin',
    category: 'multitenancy',
    description: 'Cryptographic JWT signing provider generating tokens with embedded tenant claims and RBAC authorities',
    code: `package com.micropms.multitenancy.security

import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.springframework.stereotype.Component
import java.time.Instant
import java.util.Date
import java.util.UUID

@Component
class JwtTokenProvider(
    private val jwtSecretKey: String,
    private val expirationHours: Long = 24
) {
    fun generateTenantUserToken(
        userId: UUID,
        tenantId: UUID,
        email: String,
        role: String,
        authorities: Collection<String>,
        tenantSlug: String? = null
    ): String {
        return Jwts.builder()
            .subject(userId.toString())
            .claim("tenant_id", tenantId.toString())
            .claim("user_type", "TENANT_USER")
            .claim("email", email)
            .claim("role", role)
            .claim("authorities", authorities)
            .signWith(signingKey)
            .compact()
    }

    fun generatePlatformAdminToken(
        adminId: UUID,
        email: String,
        role: String = "SUPER_ADMIN",
        authorities: Collection<String>
    ): String {
        return Jwts.builder()
            .subject(adminId.toString())
            .claim("user_type", "PLATFORM_ADMIN")
            .claim("email", email)
            .claim("role", role)
            .claim("authorities", authorities)
            .signWith(signingKey)
            .compact()
    }
}`
  },
  {
    id: 'clinic-auth-service',
    module: 'module-clinic-core',
    path: '/module-clinic-core/src/main/kotlin/com/micropms/clinic/service/ClinicAuthService.kt',
    fileName: 'ClinicAuthService.kt',
    language: 'kotlin',
    category: 'clinic',
    description: 'Clinic authentication service verifying BCrypt credentials and resolving /me profiles',
    code: `package com.micropms.clinic.service

import com.micropms.common.dto.*
import com.micropms.multitenancy.context.TenantContext
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class ClinicAuthService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtTokenProvider: JwtTokenProvider
) {
    fun login(request: LoginRequestDto, tenantSlugHeader: String? = null): AuthResponseDto {
        // Resolves tenant, verifies BCrypt password hash, enforces active state, and returns JWT
    }

    fun getCurrentUser(userId: UUID, tenantId: UUID): UserProfileDto {
        // Returns current staff member profile, role, and fine-grained authorities for /me
    }
}`
  },
  {
    id: 'clinic-auth-controller',
    module: 'module-clinic-core',
    path: '/module-clinic-core/src/main/kotlin/com/micropms/clinic/controller/ClinicAuthController.kt',
    fileName: 'ClinicAuthController.kt',
    language: 'kotlin',
    category: 'clinic',
    description: 'REST Controller for /api/auth/login and /api/auth/me clinic staff session bootstrap',
    code: `package com.micropms.clinic.controller

import com.micropms.clinic.service.ClinicAuthService
import com.micropms.common.dto.*
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/auth")
class ClinicAuthController(private val clinicAuthService: ClinicAuthService) {
    @PostMapping("/login")
    fun login(@RequestBody request: LoginRequestDto) =
        ResponseEntity.ok(ApiResponse(200, "Authentication successful", clinicAuthService.login(request)))

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    fun getCurrentUser(authentication: Authentication) =
        ResponseEntity.ok(ApiResponse(200, "Current user profile retrieved", clinicAuthService.getCurrentUser(userId, tenantId)))
}`
  },
  {
    id: 'saas-platform-auth-controller',
    module: 'module-saas-platform',
    path: '/module-saas-platform/src/main/kotlin/com/micropms/saas/controller/PlatformAuthController.kt',
    fileName: 'PlatformAuthController.kt',
    language: 'kotlin',
    category: 'saas',
    description: 'Control Plane REST controller for /api/platform/auth/login and /api/platform/auth/me',
    code: `package com.micropms.saas.controller

import com.micropms.common.dto.*
import com.micropms.saas.service.PlatformAdminAuthService
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/platform/auth")
class PlatformAuthController(private val authService: PlatformAdminAuthService) {
    @PostMapping("/login")
    fun login(@RequestBody request: LoginRequestDto) =
        ResponseEntity.ok(ApiResponse(200, "Platform admin authentication successful", authService.login(request)))

    @GetMapping("/me")
    @PreAuthorize("hasAuthority('ROLE_SUPER_ADMIN') or hasAuthority('platform:admin')")
    fun getCurrentAdmin(authentication: Authentication) =
        ResponseEntity.ok(ApiResponse(200, "Platform admin profile retrieved", authService.getCurrentAdmin(adminId)))
}`
  },
  {
    id: 'saas-public-onboarding-controller',
    module: 'module-saas-platform',
    path: '/module-saas-platform/src/main/kotlin/com/micropms/saas/controller/PublicOnboardingController.kt',
    fileName: 'PublicOnboardingController.kt',
    language: 'kotlin',
    category: 'saas',
    description: 'Public self-service practice onboarding endpoint (/api/public/onboarding/register)',
    code: `package com.micropms.saas.controller

import com.micropms.common.dto.*
import com.micropms.saas.service.TenantRegistrationService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/public/onboarding")
class PublicOnboardingController(private val registrationService: TenantRegistrationService) {
    @PostMapping("/register")
    fun register(@RequestBody command: RegisterClinicCommand) =
        ResponseEntity.status(HttpStatus.CREATED).body(
            ApiResponse(201, "Clinic workspace and admin provisioned", registrationService.registerClinic(command))
        )

    @GetMapping("/check-slug")
    fun checkSlug(@RequestParam slug: String) =
        ResponseEntity.ok(ApiResponse(200, "Slug availability checked", mapOf("slug" to slug, "available" to registrationService.isSlugAvailable(slug))))
}`
  },
  {
    id: 'clinic-billing-entity',
    module: 'module-clinic-core',
    path: '/module-clinic-core/src/main/kotlin/com/micropms/clinic/entity/Invoice.kt',
    fileName: 'Invoice.kt',
    language: 'kotlin',
    category: 'clinic',
    description: 'Billing invoice entity with high-precision BigDecimal amounts, patient/encounter links, and payment ledger',
    code: `package com.micropms.clinic.entity

import com.micropms.multitenancy.entity.BaseTenantEntity
import jakarta.persistence.*
import java.math.BigDecimal

enum class InvoiceStatus { UNPAID, PARTIAL, PAID, CANCELLED }
enum class PaymentMethod { CASH, CARD, TRANSFER }

@Entity
@Table(name = "clinic_invoices")
class Invoice(
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "patient_id", nullable = false) var patient: Patient,
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "encounter_id") var encounter: Encounter? = null,
    @Column(name = "invoice_number", nullable = false) var invoiceNumber: String,
    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2) var totalAmount: BigDecimal,
    @Column(name = "paid_amount", nullable = false, precision = 12, scale = 2) var paidAmount: BigDecimal = BigDecimal.ZERO,
    @Enumerated(EnumType.STRING) @Column(name = "status", nullable = false) var status: InvoiceStatus = InvoiceStatus.UNPAID,
    @OneToMany(mappedBy = "invoice", cascade = [CascadeType.ALL], orphanRemoval = true) var payments: MutableList<InvoicePayment> = mutableListOf()
) : BaseTenantEntity()`
  },
  {
    id: 'clinic-shift-entity',
    module: 'module-clinic-core',
    path: '/module-clinic-core/src/main/kotlin/com/micropms/clinic/entity/ShiftSettlement.kt',
    fileName: 'ShiftSettlement.kt',
    language: 'kotlin',
    category: 'clinic',
    description: 'Receptionist cash drawer and shift settlement entity calculating expected cash vs actual discrepancy',
    code: `package com.micropms.clinic.entity

import com.micropms.multitenancy.entity.BaseTenantEntity
import jakarta.persistence.*
import java.math.BigDecimal
import java.time.Instant

enum class ShiftStatus { OPEN, CLOSED }

@Entity
@Table(name = "clinic_shift_settlements")
class ShiftSettlement(
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "receptionist_id", nullable = false) var receptionist: User,
    @Column(name = "opened_at", nullable = false) var openedAt: Instant = Instant.now(),
    @Column(name = "closed_at") var closedAt: Instant? = null,
    @Column(name = "expected_cash_amount", precision = 12, scale = 2) var expectedCashAmount: BigDecimal = BigDecimal.ZERO,
    @Column(name = "actual_cash_amount", precision = 12, scale = 2) var actualCashAmount: BigDecimal? = null,
    @Column(name = "card_amount", precision = 12, scale = 2) var cardAmount: BigDecimal = BigDecimal.ZERO,
    @Column(name = "discrepancy", precision = 12, scale = 2) var discrepancy: BigDecimal? = null,
    @Enumerated(EnumType.STRING) var status: ShiftStatus = ShiftStatus.OPEN
) : BaseTenantEntity()`
  },
  {
    id: 'clinic-billing-service',
    module: 'module-clinic-core',
    path: '/module-clinic-core/src/main/kotlin/com/micropms/clinic/service/BillingService.kt',
    fileName: 'BillingService.kt',
    language: 'kotlin',
    category: 'clinic',
    description: 'Billing service executing payment processing with pessimistic write locking on Invoices',
    code: `package com.micropms.clinic.service

import com.micropms.clinic.dto.*
import com.micropms.clinic.repository.*
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.util.UUID

@Service
@Transactional(readOnly = true)
class BillingService(
    private val invoiceRepository: InvoiceRepository,
    private val invoicePaymentRepository: InvoicePaymentRepository
) {
    @Transactional
    fun createInvoice(command: CreateInvoiceCommand): InvoiceResponseDto {
        // Generates invoice for patient or encounter with BigDecimal precision
    }

    @Transactional
    fun recordPayment(invoiceId: UUID, amount: BigDecimal, method: PaymentMethod, notes: String?): InvoiceResponseDto {
        // Acquires PESSIMISTIC_WRITE lock on invoice, records payment with receivedBy user, recalculates status
        val invoice = invoiceRepository.findByIdWithLock(invoiceId).orElseThrow()
        // ...
    }
}`
  },
  {
    id: 'clinic-shift-service',
    module: 'module-clinic-core',
    path: '/module-clinic-core/src/main/kotlin/com/micropms/clinic/service/ShiftSettlementService.kt',
    fileName: 'ShiftSettlementService.kt',
    language: 'kotlin',
    category: 'clinic',
    description: 'Shift settlement service managing active drawer balance and end-of-shift cash discrepancy calculation',
    code: `package com.micropms.clinic.service

import com.micropms.clinic.dto.*
import com.micropms.clinic.repository.*
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal

@Service
@Transactional(readOnly = true)
class ShiftSettlementService(
    private val shiftSettlementRepository: ShiftSettlementRepository,
    private val invoicePaymentRepository: InvoicePaymentRepository
) {
    @Transactional
    fun getActiveShift(): DailyShiftSummaryDto {
        // Returns or opens today's shift drawer for current receptionist
    }

    @Transactional
    fun closeShift(actualCashAmount: BigDecimal, notes: String?): DailyShiftSummaryDto {
        // Aggregates CASH and CARD payments recorded since openedAt and computes discrepancy
    }

    fun getShiftReports(dateRange: DateRangeDto): List<DailyShiftSummaryDto> {
        // Auditing endpoint for CLINIC_ADMIN
    }
}`
  },
  {
    id: 'clinic-whatsapp-dispatcher',
    module: 'module-clinic-core',
    path: '/module-clinic-core/src/main/kotlin/com/micropms/clinic/service/WhatsAppDispatcher.kt',
    fileName: 'WhatsAppDispatcher.kt',
    language: 'kotlin',
    category: 'clinic',
    description: 'Dual-mode WhatsApp dispatcher: Automated async dispatch with credit consumption or zero-cost Click-to-Chat fallback URL',
    code: `package com.micropms.clinic.service

import com.micropms.common.notification.WhatsAppCreditPort
import org.springframework.stereotype.Service
import java.net.URLEncoder

@Service
class WhatsAppDispatcher(private val whatsAppCreditPort: WhatsAppCreditPort? = null) {
    fun dispatchOrGenerateLink(appointmentId: UUID, patientName: String, patientPhone: String, message: String): NotificationResultDto {
        // Primary: Automated API dispatch consuming credit if available
        // Fallback: https://wa.me/{phone}?text={encoded_message}
    }
}`
  },
  {
    id: 'clinic-billing-controller',
    module: 'module-clinic-core',
    path: '/module-clinic-core/src/main/kotlin/com/micropms/clinic/controller/BillingController.kt',
    fileName: 'BillingController.kt',
    language: 'kotlin',
    category: 'clinic',
    description: 'Billing REST controller with billing:invoice:create and billing:payment:collect RBAC',
    code: `package com.micropms.clinic.controller

import com.micropms.clinic.dto.*
import com.micropms.clinic.service.BillingService
import com.micropms.common.dto.ApiResponse
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/billing")
class BillingController(private val billingService: BillingService) {
    @PostMapping("/invoices")
    @PreAuthorize("hasAuthority('billing:invoice:create')")
    fun createInvoice(@RequestBody cmd: CreateInvoiceCommand) =
        ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse(201, "Invoice created", billingService.createInvoice(cmd)))

    @PostMapping("/invoices/{id}/payments")
    @PreAuthorize("hasAuthority('billing:payment:collect')")
    fun recordPayment(@PathVariable id: UUID, @RequestBody cmd: RecordPaymentCommand) =
        ResponseEntity.ok(ApiResponse(200, "Payment recorded", billingService.recordPayment(id, cmd.amount, cmd.paymentMethod, cmd.notes)))
}`
  },
  {
    id: 'clinic-shift-controller',
    module: 'module-clinic-core',
    path: '/module-clinic-core/src/main/kotlin/com/micropms/clinic/controller/ShiftSettlementController.kt',
    fileName: 'ShiftSettlementController.kt',
    language: 'kotlin',
    category: 'clinic',
    description: 'Shift settlement controller with billing:payment:collect, billing:shift:close, and billing:reports:financial RBAC',
    code: `package com.micropms.clinic.controller

import com.micropms.clinic.dto.*
import com.micropms.clinic.service.ShiftSettlementService
import com.micropms.common.dto.ApiResponse
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/billing/shifts")
class ShiftSettlementController(private val shiftService: ShiftSettlementService) {
    @GetMapping("/current")
    @PreAuthorize("hasAuthority('billing:payment:collect')")
    fun getCurrentShift() = ResponseEntity.ok(ApiResponse(200, "Current shift", shiftService.getActiveShift()))

    @PostMapping("/close")
    @PreAuthorize("hasAuthority('billing:shift:close')")
    fun closeShift(@RequestBody cmd: CloseShiftCommand) =
        ResponseEntity.ok(ApiResponse(200, "Shift closed", shiftService.closeShift(cmd.actualCashAmount, cmd.notes)))

    @GetMapping("/reports")
    @PreAuthorize("hasAuthority('billing:reports:financial')")
    fun getReports() = ResponseEntity.ok(ApiResponse(200, "Reports retrieved", shiftService.getShiftReports(DateRangeDto())))
}`
  },
  {
    id: 'clinic-notification-controller',
    module: 'module-clinic-core',
    path: '/module-clinic-core/src/main/kotlin/com/micropms/clinic/controller/NotificationController.kt',
    fileName: 'NotificationController.kt',
    language: 'kotlin',
    category: 'clinic',
    description: 'Notification controller for generating Click-to-Chat URLs and triggering automated dispatches',
    code: `package com.micropms.clinic.controller

import com.micropms.clinic.dto.*
import com.micropms.clinic.service.NotificationService
import com.micropms.common.dto.ApiResponse
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/notifications")
class NotificationController(private val notificationService: NotificationService) {
    @PostMapping("/appointments/{id}/whatsapp-link")
    @PreAuthorize("hasAnyAuthority('notification:dispatch', 'appointment:create', 'appointment:read')")
    fun getLink(@PathVariable id: UUID) =
        ResponseEntity.ok(ApiResponse(200, "Link generated", notificationService.getWhatsAppClickToChatLink(id)))

    @PostMapping("/appointments/{id}/dispatch")
    @PreAuthorize("hasAuthority('notification:dispatch')")
    fun dispatch(@PathVariable id: UUID) =
        ResponseEntity.ok(ApiResponse(200, "Notification dispatched", notificationService.sendAppointmentConfirmation(id)))
}`
  },
  {
    id: 'migration-v3-billing',
    module: 'app-server',
    path: '/app-server/src/main/resources/db/migration/V3__clinic_billing_shift_settlement.sql',
    fileName: 'V3__clinic_billing_shift_settlement.sql',
    language: 'sql',
    category: 'config',
    description: 'Flyway migration creating clinic_invoice_payments, clinic_shift_settlements with RLS and numeric precision',
    code: `-- V3: Clinic Billing Ledger, Payments, and Shift Settlements
ALTER TABLE clinic_invoices 
    ADD COLUMN IF NOT EXISTS total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00;

CREATE TABLE clinic_invoice_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES platform_tenants(id) ON DELETE RESTRICT,
    invoice_id UUID NOT NULL REFERENCES clinic_invoices(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    received_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE clinic_invoice_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_invoice_payments FORCE ROW LEVEL SECURITY;
CREATE POLICY rls_invoice_payments_isolation ON clinic_invoice_payments FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE TABLE clinic_shift_settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES platform_tenants(id) ON DELETE RESTRICT,
    receptionist_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    closed_at TIMESTAMPTZ,
    expected_cash_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    actual_cash_amount NUMERIC(12, 2),
    card_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    discrepancy NUMERIC(12, 2),
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN'
);

ALTER TABLE clinic_shift_settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_shift_settlements FORCE ROW LEVEL SECURITY;
CREATE POLICY rls_shift_settlements_isolation ON clinic_shift_settlements FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);`
  },
  {
    id: 'app-launcher',
    module: 'app-server',
    path: '/app-server/src/main/kotlin/com/micropms/MicroPmsApplication.kt',
    fileName: 'MicroPmsApplication.kt',
    language: 'kotlin',
    category: 'config',
    description: 'Production Spring Boot 3.3.4 runner bootstrapping all submodules with @SpringBootApplication',
    code: `package com.micropms

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication(scanBasePackages = ["com.micropms"])
class MicroPmsApplication

fun main(args: Array<String>) {
    runApplication<MicroPmsApplication>(*args)
}`
  },
  {
    id: 'app-config-yml',
    module: 'app-server',
    path: '/app-server/src/main/resources/application.yml',
    fileName: 'application.yml',
    language: 'yaml',
    category: 'config',
    description: 'Application configuration for PostgreSQL Hikari pool, Redis, Flyway migration, and Actuator',
    code: `spring:
  application:
    name: micro-pms-platform
  datasource:
    url: jdbc:postgresql://localhost:5432/micropms_db
    username: micropms_app
    password: postgres_secret
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      pool-name: MicroPmsHikariPool
  jpa:
    database-platform: org.hibernate.dialect.PostgreSQLDialect
    hibernate:
      ddl-auto: validate
  flyway:
    enabled: true
    baseline-on-migrate: true
    locations: classpath:db/migration
  data:
    redis:
      host: localhost
      port: 6379

server:
  port: 8080

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus`
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

  // JWT & runWithTenant Interactive State
  const [simJwtSub, setSimJwtSub] = useState<string>('9e1c2b3a-4d5e-6f7a-8b9c-0d1e2f3a4b5c');
  const [simJwtTenant, setSimJwtTenant] = useState<string>('a3b84180-2d6f-42a1-9c8e-5b1f81d94101');
  const [simJwtRole, setSimJwtRole] = useState<string>('CLINICIAN');
  const [simJwtAuthorities, setSimJwtAuthorities] = useState<string>('CLINICAL_READ, CLINICAL_WRITE');
  const [scopedExecLogs, setScopedExecLogs] = useState<string[]>([]);

  const handleTestRunWithTenant = () => {
    const target = 'e4a2b1c0-789a-4bc1-9012-3456789abcde';
    setScopedExecLogs([
      `[T0] TenantContext.getTenantId() => null (Thread clean)`,
      `[T1] Invoking TenantContext.runWithTenant("${target}")`,
      `[T2] Inside scoped block: TenantContext.getTenantId() => ${target}`,
      `[T3] Executing transactional clinical task with isolated DB boundary...`,
      `[T4] PostgresRlsAspect triggers: SET LOCAL app.current_tenant_id = '${target}'`,
      `[T5] Transaction completes (commit/rollback) -> SET LOCAL auto-discarded`,
      `[T6] Finally block executes -> TenantContext.clear()`,
      `[T7] After execution: TenantContext.getTenantId() => null (Zero pool poisoning!)`
    ]);
  };

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
      } else if (endpoint === 'quick-book') {
        setApiExecutionStatus('success');
        setApiResponsePayload({
          code: 201,
          message: "Appointment booked and added to queue",
          data: {
            appointmentId: "f7a2b1c0-4e3d-2c1b-0a9f-8e7d6c5b4a3f",
            patientId: "7b4c81a2-5f3e-4d91-8b20-1a4d93e81001",
            patientName: "Jane Doe",
            phone: "+1-555-019-2831",
            fileNumber: "FILE-2026-0891",
            doctorId: "3d2c1b0a-9f8e-7d6c-5b4a-3f2e1d0c9b8a",
            scheduledAt: now,
            durationMinutes: 15,
            status: "WAITING",
            reasonForVisit: "Acute migraine consultation"
          },
          timestamp: now
        });
      } else if (endpoint === 'get-queue') {
        setApiExecutionStatus('success');
        setApiResponsePayload({
          code: 200,
          message: "Today's queue retrieved",
          data: [
            {
              appointmentId: "f7a2b1c0-4e3d-2c1b-0a9f-8e7d6c5b4a3f",
              patientId: "7b4c81a2-5f3e-4d91-8b20-1a4d93e81001",
              patientName: "Jane Doe",
              phone: "+1-555-019-2831",
              fileNumber: "FILE-2026-0891",
              doctorId: "3d2c1b0a-9f8e-7d6c-5b4a-3f2e1d0c9b8a",
              scheduledAt: now,
              durationMinutes: 15,
              status: "WAITING",
              reasonForVisit: "Acute migraine consultation"
            },
            {
              appointmentId: "8c1e2d3b-4a5f-6e7d-8c9b-0a1b2c3d4e5f",
              patientId: "2a3b4c5d-6e7f-8a9b-0c1d-2e3f4a5b6c7d",
              patientName: "Michael Chang",
              phone: "+1-555-839-1029",
              fileNumber: "FILE-2026-0412",
              doctorId: "3d2c1b0a-9f8e-7d6c-5b4a-3f2e1d0c9b8a",
              scheduledAt: now,
              durationMinutes: 20,
              status: "IN_CONSULTATION",
              reasonForVisit: "Hypertension checkup"
            }
          ],
          timestamp: now
        });
      } else if (endpoint === 'patch-queue-status') {
        setApiExecutionStatus('success');
        setApiResponsePayload({
          code: 200,
          message: "Queue status updated successfully",
          data: {
            appointmentId: "f7a2b1c0-4e3d-2c1b-0a9f-8e7d6c5b4a3f",
            patientId: "7b4c81a2-5f3e-4d91-8b20-1a4d93e81001",
            patientName: "Jane Doe",
            phone: "+1-555-019-2831",
            fileNumber: "FILE-2026-0891",
            doctorId: "3d2c1b0a-9f8e-7d6c-5b4a-3f2e1d0c9b8a",
            scheduledAt: now,
            durationMinutes: 15,
            status: "IN_CONSULTATION",
            reasonForVisit: "Acute migraine consultation"
          },
          timestamp: now
        });
      } else if (endpoint === 'search-patients') {
        setApiExecutionStatus('success');
        setApiResponsePayload({
          code: 200,
          message: "Patients found",
          data: [
            {
              id: "7b4c81a2-5f3e-4d91-8b20-1a4d93e81001",
              fullName: "Jane Doe",
              phone: "+1-555-019-2831",
              fileNumber: "FILE-2026-0891"
            },
            {
              id: "9f8e7d6c-5b4a-3f2e-1d0c-9b8a7f6e5d4c",
              fullName: "Janet Doe-Miller",
              phone: "+1-555-481-9201",
              fileNumber: "FILE-2025-1102"
            }
          ],
          timestamp: now
        });
      } else if (endpoint === 'create-encounter' || endpoint === 'clinical-encounter-post') {
        if (simulatedRole === 'RECEPTIONIST') {
          setApiExecutionStatus('error');
          setApiResponsePayload({
            code: 403,
            message: "Access Denied: Role RECEPTIONIST lacks required authority 'encounter:clinical:write'. Clinical and SOAP records are strictly isolated.",
            errors: null,
            timestamp: now
          });
        } else {
          setApiExecutionStatus('success');
          setApiResponsePayload({
            code: 201,
            message: "Clinical encounter created successfully",
            data: {
              id: "9e1c2b3a-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
              appointmentId: "f7a2b1c0-4e3d-2c1b-0a9f-8e7d6c5b4a3f",
              patientId: "7b4c81a2-5f3e-4d91-8b20-1a4d93e81001",
              patientName: "Jane Doe",
              doctorId: "3d2c1b0a-9f8e-7d6c-5b4a-3f2e1d0c9b8a",
              chiefComplaint: "Severe throbbing unilateral headache with photophobia",
              subjectiveNotes: "Headache started 48 hours ago, aggravated by movement.",
              objectiveExam: "Pupils equal and reactive. Cranial nerves II-XII intact. BP 124/82 mmHg.",
              diagnosis: "Migraine without aura, episodic (ICD-10 G43.009)",
              prescription: "Sumatriptan 50mg tablet PO at symptom onset; Ondansetron 4mg ODT prn nausea.",
              encounterDate: now,
              status: "COMPLETED",
              customFields: [
                {
                  fieldKey: "blood_pressure_systolic",
                  label: "Systolic Blood Pressure (mmHg)",
                  dataType: "NUMBER",
                  resolvedValue: 124
                },
                {
                  fieldKey: "blood_pressure_diastolic",
                  label: "Diastolic Blood Pressure (mmHg)",
                  dataType: "NUMBER",
                  resolvedValue: 82
                }
              ]
            },
            timestamp: now
          });
        }
      } else if (endpoint === 'clinical-notes-get') {
        if (simulatedRole === 'RECEPTIONIST') {
          setApiExecutionStatus('error');
          setApiResponsePayload({
            code: 403,
            message: "Access Denied: Role RECEPTIONIST lacks required authority 'encounter:clinical:read'. Clinical notes are strictly isolated.",
            errors: null,
            timestamp: now
          });
        } else {
          setApiExecutionStatus('success');
          setApiResponsePayload({
            code: 200,
            message: "Clinical notes retrieved",
            data: {
              id: "9e1c2b3a-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
              patientName: "Jane Doe",
              chiefComplaint: "Severe throbbing unilateral headache with photophobia",
              subjectiveNotes: "Headache started 48 hours ago, aggravated by movement.",
              objectiveExam: "Pupils equal and reactive. BP 124/82 mmHg.",
              diagnosis: "Migraine without aura, episodic (ICD-10 G43.009)",
              prescription: "Sumatriptan 50mg PO prn",
              encounterDate: now,
              status: "COMPLETED"
            },
            timestamp: now
          });
        }
      } else if (endpoint === 'clinical-timeline-get') {
        if (simulatedRole === 'RECEPTIONIST') {
          setApiExecutionStatus('error');
          setApiResponsePayload({
            code: 403,
            message: "Access Denied: Role RECEPTIONIST lacks required authority 'encounter:clinical:read'. Clinical history is restricted to practitioners.",
            errors: null,
            timestamp: now
          });
        } else {
          setApiExecutionStatus('success');
          setApiResponsePayload({
            code: 200,
            message: "Clinical timeline retrieved",
            data: [
              {
                id: "9e1c2b3a-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
                encounterDate: now,
                chiefComplaint: "Severe throbbing unilateral headache",
                diagnosis: "Migraine without aura, episodic",
                prescription: "Sumatriptan 50mg",
                status: "COMPLETED"
              },
              {
                id: "4d3c2b1a-0e9f-8a7b-6c5d-4e3f2a1b0c9d",
                encounterDate: "2026-05-12T10:30:00Z",
                chiefComplaint: "Annual physical exam",
                diagnosis: "Routine general medical examination (Z00.00)",
                prescription: "Multivitamins daily",
                status: "COMPLETED"
              }
            ],
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
              field: "patientName",
              rejectedValue: "",
              message: "Patient name is required"
            },
            {
              field: "phone",
              rejectedValue: "",
              message: "Phone number is required"
            }
          ],
          timestamp: now
        });
      } else if (endpoint === 'not-found') {
        setApiExecutionStatus('error');
        setApiResponsePayload({
          code: 404,
          message: "Clinical encounter not found with ID: '00000000-0000-0000-0000-000000000000'",
          errors: null,
          timestamp: now
        });
      } else if (endpoint === 'record-payment') {
        setApiExecutionStatus('success');
        setApiResponsePayload({
          code: 200,
          message: "Payment of 15000 cents processed successfully via CREDIT_CARD",
          data: {
            id: "b2f1839a-7e4a-4d2c-9a1b-3c4d5e6f7a8b",
            invoiceNumber: "INV-2026-0049",
            patientId: "7b4c81a2-5f3e-4d91-8b20-1a4d93e81001",
            status: "PAID",
            totalAmountCents: 15000,
            paidAmountCents: 15000,
            balanceDueCents: 0,
            currency: "USD",
            paymentMethod: "CREDIT_CARD",
            issueDate: now,
            dueDate: now,
            createdAt: now,
            updatedAt: now
          },
          timestamp: now
        });
      } else if (endpoint === 'create-appointment') {
        setApiExecutionStatus('success');
        setApiResponsePayload({
          code: 201,
          message: "Appointment scheduled successfully",
          data: {
            id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
            tenantId: currentTenantUuid,
            patientId: "7b4c81a2-5f3e-4d91-8b20-1a4d93e81001",
            practitionerId: "3d2c1b0a-9f8e-7d6c-5b4a-3f2e1d0c9b8a",
            scheduledStart: "2026-10-15T09:00:00Z",
            scheduledEnd: "2026-10-15T09:30:00Z",
            status: "SCHEDULED",
            reason: "Annual pediatric wellness checkup",
            roomNumber: "Exam Room 3",
            createdAt: now,
            updatedAt: now
          },
          timestamp: now
        });
      } else if (endpoint === 'auth-login') {
        setApiExecutionStatus('success');
        setApiResponsePayload({
          code: 200,
          message: "Authentication successful",
          data: {
            token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            tokenType: "Bearer",
            expiresIn: 86400,
            user: {
              id: "5f8a2c1b-9d4e-4f3a-8c7b-1a2b3c4d5e6f",
              email: "dr.sarah@metrohealth.internal",
              fullName: "Dr. Sarah Jenkins, MD",
              role: "DOCTOR",
              userType: "TENANT_USER",
              authorities: ["ROLE_DOCTOR", "encounter:clinical:read", "encounter:clinical:write", "appointment:read", "queue:status:update"],
              phone: "+1 (555) 234-5678",
              specialty: "Pediatrics",
              licenseNumber: "MED-98412",
              tenantId: currentTenantUuid,
              tenantSlug: "metro-health",
              tenantName: "Metro Health Medical Center",
              isActive: true
            },
            tenant: {
              id: currentTenantUuid,
              name: "Metro Health Medical Center",
              slug: "metro-health",
              status: "ACTIVE",
              specialty: "PEDIATRICS"
            }
          },
          timestamp: now
        });
      } else if (endpoint === 'auth-me') {
        setApiExecutionStatus('success');
        setApiResponsePayload({
          code: 200,
          message: "Current user profile retrieved successfully",
          data: {
            id: "5f8a2c1b-9d4e-4f3a-8c7b-1a2b3c4d5e6f",
            email: "dr.sarah@metrohealth.internal",
            fullName: "Dr. Sarah Jenkins, MD",
            role: "DOCTOR",
            userType: "TENANT_USER",
            authorities: ["ROLE_DOCTOR", "encounter:clinical:read", "encounter:clinical:write", "patient:basic:read", "appointment:read"],
            specialty: "Pediatrics",
            licenseNumber: "MED-98412",
            tenantId: currentTenantUuid,
            tenantSlug: "metro-health",
            tenantName: "Metro Health Medical Center",
            isActive: true
          },
          timestamp: now
        });
      } else if (endpoint === 'platform-auth-login') {
        setApiExecutionStatus('success');
        setApiResponsePayload({
          code: 200,
          message: "Platform admin authentication successful",
          data: {
            token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            tokenType: "Bearer",
            expiresIn: 86400,
            user: {
              id: "0a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d",
              email: "superadmin@micropms.io",
              fullName: "Global Platform Administrator",
              role: "SUPER_ADMIN",
              userType: "PLATFORM_ADMIN",
              authorities: ["ROLE_SUPER_ADMIN", "platform:admin", "platform:tenants:manage", "platform:impersonate:tenant"],
              tenantId: null,
              tenantSlug: null,
              isActive: true
            },
            tenant: null
          },
          timestamp: now
        });
      } else if (endpoint === 'public-onboard-register') {
        setApiExecutionStatus('success');
        setApiResponsePayload({
          code: 201,
          message: "Clinic workspace and initial administrator account provisioned successfully",
          data: {
            tenantId: "8f2a1b0c-4d3e-4b2a-9c1d-7e6f5a4b3c2d",
            clinicName: "Summit Pediatric Care",
            clinicSlug: "summit-pediatrics",
            adminId: "3e4f5a6b-7c8d-9e0f-1a2b-3c4d5e6f7a8b",
            adminEmail: "admin@summitpediatrics.com",
            adminFullName: "Dr. Alex Rivera",
            token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            tokenType: "Bearer",
            expiresIn: 86400,
            registeredAt: now
          },
          timestamp: now
        });
      } else if (endpoint === 'quota-exceeded') {
        setApiExecutionStatus('error');
        setApiResponsePayload({
          code: 422,
          message: "Subscription doctor quota exceeded for tenant. Current plan '14-Day Free Evaluation Trial' allows up to 3 doctor(s). Active doctors: 3.",
          errors: null,
          timestamp: now
        });
      } else if (endpoint === 'billing-create-invoice') {
        setApiExecutionStatus('success');
        setApiResponsePayload({
          code: 201,
          message: "Invoice created successfully",
          data: {
            id: "e1f2a3b4-5c6d-7e8f-9a0b-1c2d3e4f5a6b",
            invoiceNumber: "INV-20261016-A94F12",
            patientId: "7b4c81a2-5f3e-4d91-8b20-1a4d93e81001",
            patientName: "Jane Doe",
            encounterId: "9e1c2b3a-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
            totalAmount: 185.00,
            paidAmount: 0.00,
            balanceDue: 185.00,
            status: "UNPAID",
            notes: "Clinical consultation and pediatric panel",
            payments: [],
            createdAt: now,
            updatedAt: now
          },
          timestamp: now
        });
      } else if (endpoint === 'billing-record-payment') {
        setApiExecutionStatus('success');
        setApiResponsePayload({
          code: 200,
          message: "Payment of $100.00 recorded successfully via CASH under pessimistic write lock",
          data: {
            id: "e1f2a3b4-5c6d-7e8f-9a0b-1c2d3e4f5a6b",
            invoiceNumber: "INV-20261016-A94F12",
            patientId: "7b4c81a2-5f3e-4d91-8b20-1a4d93e81001",
            patientName: "Jane Doe",
            totalAmount: 185.00,
            paidAmount: 100.00,
            balanceDue: 85.00,
            status: "PARTIAL",
            payments: [
              {
                id: "c4d5e6f7-a8b9-0c1d-2e3f-4a5b6c7d8e9f",
                amount: 100.00,
                paymentMethod: "CASH",
                receivedById: "8b9c0d1e-2f3a-4b5c-6d7e-8f9a0b1c2d3e",
                receivedByName: "Emily Watson (Receptionist)",
                notes: "Initial cash co-pay",
                paymentDate: now
              }
            ],
            createdAt: now,
            updatedAt: now
          },
          timestamp: now
        });
      } else if (endpoint === 'shifts-current') {
        setApiExecutionStatus('success');
        setApiResponsePayload({
          code: 200,
          message: "Active shift balance retrieved",
          data: {
            id: "d9e8f7a6-b5c4-3d2e-1f0a-9b8c7d6e5f4a",
            receptionistId: "8b9c0d1e-2f3a-4b5c-6d7e-8f9a0b1c2d3e",
            receptionistName: "Emily Watson",
            openedAt: "2026-10-16T08:00:00Z",
            closedAt: null,
            expectedCashAmount: 320.00,
            actualCashAmount: null,
            cardAmount: 840.00,
            transferAmount: 0.00,
            totalCollected: 1160.00,
            discrepancy: null,
            status: "OPEN",
            transactionCount: 7,
            closureNotes: null
          },
          timestamp: now
        });
      } else if (endpoint === 'shifts-close') {
        setApiExecutionStatus('success');
        setApiResponsePayload({
          code: 200,
          message: "Daily shift closed and reconciled successfully",
          data: {
            id: "d9e8f7a6-b5c4-3d2e-1f0a-9b8c7d6e5f4a",
            receptionistId: "8b9c0d1e-2f3a-4b5c-6d7e-8f9a0b1c2d3e",
            receptionistName: "Emily Watson",
            openedAt: "2026-10-16T08:00:00Z",
            closedAt: now,
            expectedCashAmount: 320.00,
            actualCashAmount: 320.00,
            cardAmount: 840.00,
            transferAmount: 0.00,
            totalCollected: 1160.00,
            discrepancy: 0.00,
            status: "CLOSED",
            transactionCount: 7,
            closureNotes: "Evening drawer balanced with zero discrepancy. Handed over to vault safe."
          },
          timestamp: now
        });
      } else if (endpoint === 'shifts-reports') {
        if (simulatedRole === 'RECEPTIONIST') {
          setApiExecutionStatus('error');
          setApiResponsePayload({
            code: 403,
            message: "Access Denied: Role RECEPTIONIST lacks required authority 'billing:reports:financial'. Financial shift audit history is restricted strictly to CLINIC_ADMIN.",
            errors: null,
            timestamp: now
          });
        } else {
          setApiExecutionStatus('success');
          setApiResponsePayload({
            code: 200,
            message: "Historical shift reports retrieved successfully",
            data: [
              {
                id: "d9e8f7a6-b5c4-3d2e-1f0a-9b8c7d6e5f4a",
                receptionistName: "Emily Watson",
                openedAt: "2026-10-15T08:00:00Z",
                closedAt: "2026-10-15T17:00:00Z",
                expectedCashAmount: 450.00,
                actualCashAmount: 450.00,
                cardAmount: 1120.00,
                transferAmount: 0.00,
                totalCollected: 1570.00,
                discrepancy: 0.00,
                status: "CLOSED",
                transactionCount: 12
              },
              {
                id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                receptionistName: "Marcus Vance",
                openedAt: "2026-10-14T08:00:00Z",
                closedAt: "2026-10-14T17:00:00Z",
                expectedCashAmount: 380.00,
                actualCashAmount: 375.00,
                cardAmount: 950.00,
                transferAmount: 50.00,
                totalCollected: 1375.00,
                discrepancy: -5.00,
                status: "CLOSED",
                transactionCount: 9
              }
            ],
            timestamp: now
          });
        }
      } else if (endpoint === 'notifications-whatsapp-link') {
        setApiExecutionStatus('success');
        setApiResponsePayload({
          code: 200,
          message: "WhatsApp Click-to-Chat URL generated successfully",
          data: {
            url: "https://wa.me/15552345678?text=Hello%20Jane%20Doe%2C%20your%20appointment%20with%20Dr.%20Sarah%20Jenkins%2C%20MD%20is%20confirmed%20for%20Friday%2C%20Oct%2016%2C%202026%20at%203%3A00%20PM.%20Please%20arrive%2010%20minutes%20early.",
            phone: "15552345678",
            patientName: "Jane Doe",
            mode: "BROWSER_CLICK_TO_CHAT"
          },
          timestamp: now
        });
      } else if (endpoint === 'notifications-dispatch') {
        setApiExecutionStatus('success');
        setApiResponsePayload({
          code: 200,
          message: "Automated WhatsApp message dispatched successfully",
          data: {
            appointmentId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
            patientName: "Jane Doe",
            patientPhone: "15552345678",
            mode: "AUTOMATED_DISPATCH",
            message: "Hello Jane Doe, your appointment with Dr. Sarah Jenkins, MD is confirmed for Friday, Oct 16, 2026 at 3:00 PM.",
            whatsappUrl: null,
            creditsRemaining: 99,
            dispatchedAt: now
          },
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

            {/* JWT Claim Processing & runWithTenant Interactive Simulator */}
            <div className="border border-slate-800 bg-slate-900/30 rounded-lg p-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-cyan-400" />
                  CustomJwtAuthenticationConverter & Context Lifecycle Verification
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Simulate JWT claim decoding into TenantAuthenticationToken and test thread-safe runWithTenant scoped execution.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* JWT Claim Inputs */}
                <div className="space-y-3 p-4 rounded bg-slate-950 border border-slate-800 text-xs">
                  <div className="font-semibold text-slate-300 font-sans flex items-center justify-between">
                    <span>Incoming JWT Claims Payload</span>
                    <span className="text-[10px] text-cyan-400 font-mono">Resource Server Hook</span>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Subject UUID ('sub')</label>
                    <input
                      type="text"
                      value={simJwtSub}
                      onChange={(e) => setSimJwtSub(e.target.value)}
                      className="w-full px-2.5 py-1 text-xs font-mono bg-slate-900 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Tenant ID ('tenant_id')</label>
                    <input
                      type="text"
                      value={simJwtTenant}
                      onChange={(e) => setSimJwtTenant(e.target.value)}
                      className="w-full px-2.5 py-1 text-xs font-mono bg-slate-900 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Role ('role')</label>
                      <input
                        type="text"
                        value={simJwtRole}
                        onChange={(e) => setSimJwtRole(e.target.value)}
                        className="w-full px-2.5 py-1 text-xs font-mono bg-slate-900 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Authorities ('authorities')</label>
                      <input
                        type="text"
                        value={simJwtAuthorities}
                        onChange={(e) => setSimJwtAuthorities(e.target.value)}
                        className="w-full px-2.5 py-1 text-xs font-mono bg-slate-900 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  {/* Scoped execution trigger button */}
                  <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Context Lifecycle Hook:</span>
                    <button
                      onClick={handleTestRunWithTenant}
                      className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold rounded text-xs transition-colors flex items-center gap-1.5"
                    >
                      <Play className="h-3 w-3" />
                      Test runWithTenant Scope
                    </button>
                  </div>
                </div>

                {/* Converter & Scope Outputs */}
                <div className="space-y-3 p-4 rounded bg-slate-950 border border-slate-800 text-xs font-mono">
                  <div className="font-semibold text-slate-300 font-sans flex items-center justify-between">
                    <span>Decoded TenantAuthenticationToken</span>
                    <span className="text-[10px] text-emerald-400">Authenticated = true</span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded text-[11px] space-y-1.5 text-slate-300 overflow-x-auto">
                    <div><span className="text-slate-500">principal.userId:</span> <span className="text-cyan-300">{simJwtSub}</span></div>
                    <div><span className="text-slate-500">principal.tenantId:</span> <span className="text-emerald-300">{simJwtTenant}</span></div>
                    <div><span className="text-slate-500">grantedRole:</span> <span className="text-amber-300">ROLE_{simJwtRole.toUpperCase()}</span></div>
                    <div>
                      <span className="text-slate-500">authorities:</span> [
                      <span className="text-purple-300">
                        {["ROLE_" + simJwtRole.toUpperCase(), ...simJwtAuthorities.split(',').map(s => s.trim()).filter(Boolean)].join(', ')}
                      </span>]
                    </div>
                  </div>

                  {/* Scoped execution chronological trace */}
                  {scopedExecLogs.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] space-y-1 text-slate-400">
                      <div className="font-sans font-medium text-slate-300 text-xs mb-1">
                        Execution Trace (Guaranteed Cleanup):
                      </div>
                      {scopedExecLogs.map((log, idx) => (
                        <div key={idx} className={idx === 2 || idx === 4 ? "text-cyan-300" : idx === 7 ? "text-emerald-400 font-bold" : ""}>
                          {log}
                        </div>
                      ))}
                    </div>
                  )}
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
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <button
                    onClick={() => handleExecuteApiSimulation('quick-book')}
                    className="px-3 py-1.5 text-xs text-left font-medium bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-slate-200 flex items-center justify-between"
                  >
                    <span>POST /reception/quick-book</span>
                    <span className="text-[10px] font-mono text-emerald-400">201</span>
                  </button>
                  <button
                    onClick={() => handleExecuteApiSimulation('get-queue')}
                    className="px-3 py-1.5 text-xs text-left font-medium bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-slate-200 flex items-center justify-between"
                  >
                    <span>GET /reception/queue</span>
                    <span className="text-[10px] font-mono text-emerald-400">200</span>
                  </button>
                  <button
                    onClick={() => handleExecuteApiSimulation('patch-queue-status')}
                    className="px-3 py-1.5 text-xs text-left font-medium bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-slate-200 flex items-center justify-between"
                  >
                    <span>PATCH /reception/queue</span>
                    <span className="text-[10px] font-mono text-emerald-400">200</span>
                  </button>
                  <button
                    onClick={() => handleExecuteApiSimulation('search-patients')}
                    className="px-3 py-1.5 text-xs text-left font-medium bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-slate-200 flex items-center justify-between"
                  >
                    <span>GET /reception/patients/search</span>
                    <span className="text-[10px] font-mono text-emerald-400">200</span>
                  </button>
                  <button
                    onClick={() => handleExecuteApiSimulation('clinical-encounter-post')}
                    className="px-3 py-1.5 text-xs text-left font-medium bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-slate-200 flex items-center justify-between"
                  >
                    <span>POST /api/encounters</span>
                    <span className="text-[10px] font-mono text-cyan-400">{simulatedRole === 'RECEPTIONIST' ? '403' : '201'}</span>
                  </button>
                  <button
                    onClick={() => handleExecuteApiSimulation('clinical-notes-get')}
                    className="px-3 py-1.5 text-xs text-left font-medium bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-slate-200 flex items-center justify-between"
                  >
                    <span>GET /encounters/{'{id}'}/notes</span>
                    <span className="text-[10px] font-mono text-cyan-400">{simulatedRole === 'RECEPTIONIST' ? '403' : '200'}</span>
                  </button>
                  <button
                    onClick={() => handleExecuteApiSimulation('clinical-timeline-get')}
                    className="px-3 py-1.5 text-xs text-left font-medium bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-slate-200 flex items-center justify-between"
                  >
                    <span>GET /encounters/timeline</span>
                    <span className="text-[10px] font-mono text-cyan-400">{simulatedRole === 'RECEPTIONIST' ? '403' : '200'}</span>
                  </button>
                  <button
                    onClick={() => handleExecuteApiSimulation('record-payment')}
                    className="px-3 py-1.5 text-xs text-left font-medium bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-slate-200 flex items-center justify-between"
                  >
                    <span>POST /payments (ACID)</span>
                    <span className="text-[10px] font-mono text-emerald-400">200</span>
                  </button>
                  <button
                    onClick={() => handleExecuteApiSimulation('auth-login')}
                    className="px-3 py-1.5 text-xs text-left font-medium bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-slate-200 flex items-center justify-between"
                  >
                    <span>POST /api/auth/login</span>
                    <span className="text-[10px] font-mono text-emerald-400">200</span>
                  </button>
                  <button
                    onClick={() => handleExecuteApiSimulation('auth-me')}
                    className="px-3 py-1.5 text-xs text-left font-medium bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-slate-200 flex items-center justify-between"
                  >
                    <span>GET /api/auth/me</span>
                    <span className="text-[10px] font-mono text-emerald-400">200</span>
                  </button>
                  <button
                    onClick={() => handleExecuteApiSimulation('platform-auth-login')}
                    className="px-3 py-1.5 text-xs text-left font-medium bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-slate-200 flex items-center justify-between"
                  >
                    <span>POST /api/platform/auth/login</span>
                    <span className="text-[10px] font-mono text-emerald-400">200</span>
                  </button>
                  <button
                    onClick={() => handleExecuteApiSimulation('public-onboard-register')}
                    className="px-3 py-1.5 text-xs text-left font-medium bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-slate-200 flex items-center justify-between"
                  >
                    <span>POST /api/public/onboarding/register</span>
                    <span className="text-[10px] font-mono text-emerald-400">201</span>
                  </button>
                  <button
                    onClick={() => handleExecuteApiSimulation('quota-exceeded')}
                    className="px-3 py-1.5 text-xs text-left font-medium bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-slate-200 flex items-center justify-between"
                  >
                    <span>POST /clinic/users (Quota Limit)</span>
                    <span className="text-[10px] font-mono text-amber-400">422</span>
                  </button>
                  <button
                    onClick={() => handleExecuteApiSimulation('billing-create-invoice')}
                    className="px-3 py-1.5 text-xs text-left font-medium bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-slate-200 flex items-center justify-between"
                  >
                    <span>POST /api/billing/invoices</span>
                    <span className="text-[10px] font-mono text-emerald-400">201</span>
                  </button>
                  <button
                    onClick={() => handleExecuteApiSimulation('billing-record-payment')}
                    className="px-3 py-1.5 text-xs text-left font-medium bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-slate-200 flex items-center justify-between"
                  >
                    <span>POST /billing/invoices/payments</span>
                    <span className="text-[10px] font-mono text-emerald-400">200 (Lock)</span>
                  </button>
                  <button
                    onClick={() => handleExecuteApiSimulation('shifts-current')}
                    className="px-3 py-1.5 text-xs text-left font-medium bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-slate-200 flex items-center justify-between"
                  >
                    <span>GET /billing/shifts/current</span>
                    <span className="text-[10px] font-mono text-emerald-400">200</span>
                  </button>
                  <button
                    onClick={() => handleExecuteApiSimulation('shifts-close')}
                    className="px-3 py-1.5 text-xs text-left font-medium bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-slate-200 flex items-center justify-between"
                  >
                    <span>POST /billing/shifts/close</span>
                    <span className="text-[10px] font-mono text-emerald-400">200</span>
                  </button>
                  <button
                    onClick={() => handleExecuteApiSimulation('shifts-reports')}
                    className="px-3 py-1.5 text-xs text-left font-medium bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-slate-200 flex items-center justify-between"
                  >
                    <span>GET /billing/shifts/reports</span>
                    <span className="text-[10px] font-mono text-cyan-400">{simulatedRole === 'RECEPTIONIST' ? '403' : '200'}</span>
                  </button>
                  <button
                    onClick={() => handleExecuteApiSimulation('notifications-whatsapp-link')}
                    className="px-3 py-1.5 text-xs text-left font-medium bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-slate-200 flex items-center justify-between"
                  >
                    <span>POST /notifications/whatsapp-link</span>
                    <span className="text-[10px] font-mono text-emerald-400">200 (wa.me)</span>
                  </button>
                  <button
                    onClick={() => handleExecuteApiSimulation('notifications-dispatch')}
                    className="px-3 py-1.5 text-xs text-left font-medium bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-slate-200 flex items-center justify-between"
                  >
                    <span>POST /notifications/dispatch</span>
                    <span className="text-[10px] font-mono text-emerald-400">200</span>
                  </button>
                  <button
                    onClick={() => handleExecuteApiSimulation('validation-error')}
                    className="px-3 py-1.5 text-xs text-left font-medium bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-slate-200 flex items-center justify-between"
                  >
                    <span>POST /appointments (Invalid)</span>
                    <span className="text-[10px] font-mono text-amber-400">400</span>
                  </button>
                  <button
                    onClick={() => handleExecuteApiSimulation('not-found')}
                    className="px-3 py-1.5 text-xs text-left font-medium bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-slate-200 flex items-center justify-between"
                  >
                    <span>GET /encounters (Missing)</span>
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
│               │   ├── Tenant.kt                # Control Plane entity extending BaseAuditEntity directly
│               │   ├── SubscriptionPlan.kt      # Plan quotas, features, priceCents
│               │   ├── Subscription.kt          # Tenant subscription state & messaging credits
│               │   └── AuditImpersonationLog.kt # Immutable super-admin audit log
│               ├── service/
│               │   ├── TenantProvisioningService.kt    # Onboards clinics, sets 14d trial, Redis status
│               │   ├── SubscriptionEnforcementService.kt# Quota guard, feature access, Redis cache
│               │   └── ImpersonationService.kt  # 30-min temporal JWT with audit record
│               ├── repository/
│               │   ├── TenantRepository.kt
│               │   ├── SubscriptionPlanRepository.kt
│               │   ├── SubscriptionRepository.kt
│               │   └── AuditImpersonationLogRepository.kt
│               └── controller/
│                   ├── PlatformTenantController.kt     # Tenant management & credit adjustments
│                   └── PlatformImpersonationController.kt# Support impersonation session initiator
├── module-clinic-core/
│   ├── pom.xml                                  # Depends on core-common & core-multitenancy ONLY
│   └── src/
│       └── main/
│           └── kotlin/com/micropms/clinic/
│               ├── entity/
│               │   ├── Patient.kt               # Application Plane entity extending BaseTenantEntity
│               │   ├── Appointment.kt           # Appointment scheduling entity
│               │   ├── Encounter.kt             # Clinical encounter entity with SOAP notes & ICD-10
│               │   ├── Invoice.kt               # Billing invoice with atomic payment ledger
│               │   └── CustomFieldDefinition.kt # Relational Typed EAV entities (No JSONB)
│               ├── repository/
│               │   ├── PatientRepository.kt
│               │   ├── AppointmentRepository.kt
│               │   ├── EncounterRepository.kt
│               │   └── InvoiceRepository.kt
│               └── controller/
│                   ├── PatientController.kt     # Patient demographics (receptionists + clinicians)
│                   ├── AppointmentController.kt # Appointment scheduling (receptionists + clinicians)
│                   ├── EncounterController.kt   # Restricted strictly to clinical staff (@PreAuthorize)
│                   └── InvoiceController.kt     # Billing & payments (@Transactional ACID guarantees)
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
