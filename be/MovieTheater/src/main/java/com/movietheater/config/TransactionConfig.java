package com.movietheater.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.transaction.annotation.TransactionManagementConfigurer;

import jakarta.persistence.EntityManagerFactory;

/**
 * Configuration class for transaction management in the application.
 */
@Configuration
@EnableTransactionManagement
public class TransactionConfig implements TransactionManagementConfigurer {
    private static final Logger logger = LoggerFactory.getLogger(TransactionConfig.class);

    private final EntityManagerFactory entityManagerFactory;

    public TransactionConfig(EntityManagerFactory entityManagerFactory) {
        logger.info("Injecting EntityManagerFactory into TransactionConfig");
        this.entityManagerFactory = entityManagerFactory;
    }

    @Override
    public PlatformTransactionManager annotationDrivenTransactionManager() {
        logger.info("Creating JpaTransactionManager with injected EntityManagerFactory");
        return new JpaTransactionManager(entityManagerFactory);
    }
}
