-- Новая пустая база dkip2027_course. Только ГИА БУ 09.02.07-5-2027.

CREATE TABLE counterparty (
 id VARCHAR(32) NOT NULL,
 name VARCHAR(255) NOT NULL,
 inn VARCHAR(20) NOT NULL,
 address VARCHAR(500) NOT NULL,
 phone VARCHAR(64) NOT NULL,
 party_type VARCHAR(24) NOT NULL,
 PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE item (
 id INT AUTO_INCREMENT NOT NULL,
 code VARCHAR(64) UNIQUE NOT NULL,
 name VARCHAR(255) NOT NULL,
 kind VARCHAR(16) NOT NULL,
 unit VARCHAR(16) NOT NULL,
 PRIMARY KEY (id),
 CHECK (kind IN ('product','material','operation'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE price (
 item_id INT NOT NULL,
 valid_from DATE NOT NULL,
 amount DECIMAL(14,2) NOT NULL,
 PRIMARY KEY (item_id,valid_from),
 FOREIGN KEY (item_id) REFERENCES item(id),
 CHECK (amount>=0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE specification (
 id INT AUTO_INCREMENT NOT NULL,
 product_id INT UNIQUE NOT NULL,
 name VARCHAR(255) NOT NULL,
 output_qty DECIMAL(14,3) NOT NULL,
 manufacturer_id VARCHAR(32) NOT NULL,
 PRIMARY KEY (id),
 FOREIGN KEY (product_id) REFERENCES item(id),
 FOREIGN KEY (manufacturer_id) REFERENCES counterparty(id),
 CHECK (output_qty>0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE specification_component (
 specification_id INT NOT NULL,
 item_id INT NOT NULL,
 qty DECIMAL(14,3) NOT NULL,
 time_norm DECIMAL(14,3) NOT NULL,
 PRIMARY KEY (specification_id,item_id),
 FOREIGN KEY (specification_id) REFERENCES specification(id),
 FOREIGN KEY (item_id) REFERENCES item(id),
 CHECK (qty>0),
 CHECK (time_norm>0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE customer_order (
 id INT AUTO_INCREMENT NOT NULL,
 doc_no VARCHAR(64) UNIQUE NOT NULL,
 doc_date DATE NOT NULL,
 customer_id VARCHAR(32) NOT NULL,
 executor_id VARCHAR(32) NOT NULL,
 PRIMARY KEY (id),
 FOREIGN KEY (customer_id) REFERENCES counterparty(id),
 FOREIGN KEY (executor_id) REFERENCES counterparty(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE customer_order_line (
 id INT AUTO_INCREMENT NOT NULL,
 order_id INT NOT NULL,
 product_id INT NOT NULL,
 source_code VARCHAR(64) NOT NULL,
 qty DECIMAL(14,3) NOT NULL,
 sale_price DECIMAL(14,2) NOT NULL,
 discount DECIMAL(14,2) NOT NULL,
 PRIMARY KEY (id),
 FOREIGN KEY (order_id) REFERENCES customer_order(id),
 FOREIGN KEY (product_id) REFERENCES item(id),
 CHECK (qty>0),
 CHECK (sale_price>=0),
 CHECK (discount>=0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE production_order (
 id INT AUTO_INCREMENT NOT NULL,
 doc_no VARCHAR(64) UNIQUE NOT NULL,
 doc_date DATE NOT NULL,
 launch_date DATE NOT NULL,
 department VARCHAR(255) NOT NULL,
 PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE production_product (
 production_id INT NOT NULL,
 product_id INT NOT NULL,
 qty DECIMAL(14,3) NOT NULL,
 PRIMARY KEY (production_id,product_id),
 FOREIGN KEY (production_id) REFERENCES production_order(id),
 FOREIGN KEY (product_id) REFERENCES item(id),
 CHECK (qty>0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE production_resource (
 production_id INT NOT NULL,
 item_id INT NOT NULL,
 qty DECIMAL(14,3) NOT NULL,
 source_unit VARCHAR(16) NOT NULL,
 PRIMARY KEY (production_id,item_id),
 FOREIGN KEY (production_id) REFERENCES production_order(id),
 FOREIGN KEY (item_id) REFERENCES item(id),
 CHECK (qty>0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE users (
 id INT AUTO_INCREMENT NOT NULL,
 login VARCHAR(64) UNIQUE NOT NULL,
 password_hash VARCHAR(255) NOT NULL,
 role VARCHAR(16) NOT NULL,
 failed_attempts INT NOT NULL,
 is_locked BOOLEAN NOT NULL,
 PRIMARY KEY (id),
 CHECK (failed_attempts>=0),
 CHECK (role IN ('admin','user'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE notes (
 id INT AUTO_INCREMENT NOT NULL,
 title VARCHAR(255) NOT NULL,
 content TEXT NOT NULL,
 id_user INT NOT NULL,
 created_at DATE NOT NULL,
 PRIMARY KEY (id),
 FOREIGN KEY (id_user) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE VIEW order_cost AS
SELECT o.id AS order_id,
 ROUND(SUM(l.qty / s.output_qty * c.qty * c.time_norm * p.amount),2) AS total_cost
FROM customer_order o
JOIN customer_order_line l ON l.order_id=o.id
JOIN specification s ON s.product_id=l.product_id
JOIN specification_component c ON c.specification_id=s.id
JOIN price p ON p.item_id=c.item_id
 AND p.valid_from=(SELECT MAX(p2.valid_from) FROM price p2
                  WHERE p2.item_id=c.item_id AND p2.valid_from<=o.doc_date)
GROUP BY o.id;
-- До расчёта проверяйте полноту норм и наличие цены каждого ресурса на дату заказа.
