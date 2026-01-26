-- Remove old migration records so we can use the reorganized migration names.
-- Run once after reorganizing prisma/migrations, then: prisma migrate resolve --applied 20260126000000_init && prisma migrate resolve --applied 20260126000001_add_demo_flag
DELETE FROM "_prisma_migrations"
WHERE migration_name IN (
        '20260125142846_init',
        '20260126000000_add_demo_flag'
    );