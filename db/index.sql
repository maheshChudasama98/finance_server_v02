SET GLOBAL  sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));


ALTER TABLE `fv2`.`fn_accounts` 
ADD COLUMN `MaxAmount` DECIMAL(10,2) NULL AFTER `MinAmount`,
CHANGE COLUMN `MinAmount` `MinAmount` DECIMAL(10,2) NULL DEFAULT '0.00' ; 


ALTER TABLE `fv2`.`fn_parties` 
ADD COLUMN `MaxAmount` DECIMAL(10,2) NULL AFTER `MinAmount`,
CHANGE COLUMN `MinAmount` `MinAmount` DECIMAL(10,2) NULL DEFAULT '0.00' ;

ALTER TABLE `demo_test`.`users` 
DROP INDEX `Mobile` ,
DROP INDEX `Email` ;


ALTER TABLE `demo_test`.`modules` 
ADD COLUMN `Icon` VARCHAR(255) NULL AFTER `Router`;


ALTER TABLE `defaultdb`.`modules` 
DROP INDEX `ModulesName`;

ALTER TABLE `demo_test`.`roles` 
ADD COLUMN `ParentNoteId` INT NULL AFTER `Icon`;


ALTER TABLE `demo_test`.`roles` 
ADD INDEX `roles_ibfk_2_idx` (`ParentNoteId` ASC) VISIBLE;

-------------------------------------- 1-04-2025 ( live in done )

ALTER TABLE `defaultdb`.`fn_transactions` 
ADD COLUMN `AccountBalance` DECIMAL(10,2) NULL DEFAULT NULL AFTER `PartyAmount`,
ADD COLUMN `PartyBalance` DECIMAL(10,2) NULL DEFAULT NULL AFTER `AccountBalance`;


