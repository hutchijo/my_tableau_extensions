CREATE TABLE `ext_products` (
	`product_asin` VARCHAR(100) NOT NULL,
	`product_mpn` VARCHAR(300) NULL DEFAULT NULL,
	`product_title` VARCHAR(300) NULL DEFAULT NULL,
	`product_manufacturer` VARCHAR(100) NULL DEFAULT NULL,
	`product_brand` VARCHAR(100) NULL DEFAULT NULL,
	`product_package_quantity` INT(11) NULL DEFAULT '0',
	`product_color` VARCHAR(100) NULL DEFAULT NULL,
	`product_size` VARCHAR(100) NULL DEFAULT NULL,
	`product_price` FLOAT NOT NULL DEFAULT '0',
	`product_group` VARCHAR(100) NULL DEFAULT NULL,
	`product_image` LONGTEXT NOT NULL,
	`product_description` LONGTEXT NOT NULL,
	`quantity_purchased` INT(11) NULL DEFAULT '0',
	`last_purchased` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`product_asin`, `last_purchased`)
)
COLLATE='utf8_general_ci'
ENGINE=InnoDB
;