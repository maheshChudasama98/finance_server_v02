SET GLOBAL  sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));


ALTER TABLE `demo_test`.`fn_accounts` 
ADD COLUMN `MaxAmount` DECIMAL(10,2) NULL AFTER `MinAmount`,
CHANGE COLUMN `MinAmount` `MinAmount` DECIMAL(10,2) NULL DEFAULT '0.00' ;


ALTER TABLE `demo_test`.`fn_parties` 
ADD COLUMN `MaxAmount` DECIMAL(10,2) NULL AFTER `MinAmount`,
CHANGE COLUMN `MinAmount` `MinAmount` DECIMAL(10,2) NULL DEFAULT '0.00' ;