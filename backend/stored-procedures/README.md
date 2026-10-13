# Stored Procedures

This folder holds the MySQL schema and all Stored Procedures for Gearnix,
kept as `.sql` files so the database is version-controlled and reproducible.

Planned files (created in later steps):

- `01_schema.sql` — database + tables (users, roles, permissions, categories, products, blogs, cart, wishlist, orders, payments, …)
- `02_auth_procedures.sql` — registration, login lookup, password reset
- `03_user_procedures.sql` — user CRUD + listing
- `04_category_procedures.sql` — category CRUD
- `05_product_procedures.sql` — product CRUD + details + images
- `06_blog_procedures.sql` — blog CRUD
- `07_cart_procedures.sql` — cart operations
- `08_wishlist_procedures.sql` — wishlist operations
- `09_order_procedures.sql` — order creation + items
- `10_payment_procedures.sql` — payment records
- `11_rbac_procedures.sql` — roles, permissions, assignments
- `12_dashboard_procedures.sql` — dashboard statistics

Apply them (in order) with the MySQL client, e.g.:

```bash
mysql -u root -p < backend/stored-procedures/01_schema.sql
```
