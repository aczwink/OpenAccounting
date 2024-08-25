/*!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.8-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: openaccounting
-- ------------------------------------------------------
-- Server version	10.11.8-MariaDB-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `accountingMonths`
--

DROP TABLE IF EXISTS `accountingMonths`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `accountingMonths` (
  `year` smallint(5) unsigned NOT NULL,
  `month` tinyint(3) unsigned NOT NULL,
  `isOpen` tinyint(1) NOT NULL,
  PRIMARY KEY (`year`,`month`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `config`
--

DROP TABLE IF EXISTS `config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `config` (
  `name` varchar(100) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `data` mediumblob NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `identities`
--

DROP TABLE IF EXISTS `identities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `identities` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `firstName` varchar(200) NOT NULL,
  `lastName` varchar(200) NOT NULL,
  `notes` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `identities_paymentAccounts`
--

DROP TABLE IF EXISTS `identities_paymentAccounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `identities_paymentAccounts` (
  `identityId` int(10) unsigned NOT NULL,
  `paymentServiceId` int(10) unsigned NOT NULL,
  `externalAccount` varchar(200) NOT NULL,
  PRIMARY KEY (`identityId`,`paymentServiceId`,`externalAccount`),
  KEY `identities_paymentAccounts_paymentServiceId` (`paymentServiceId`),
  CONSTRAINT `identities_paymentAccounts_identityId` FOREIGN KEY (`identityId`) REFERENCES `identities` (`id`),
  CONSTRAINT `identities_paymentAccounts_paymentServiceId` FOREIGN KEY (`paymentServiceId`) REFERENCES `paymentServices` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `identities_subscriptions`
--

DROP TABLE IF EXISTS `identities_subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `identities_subscriptions` (
  `identityId` int(10) unsigned NOT NULL,
  `subscriptionId` int(10) unsigned NOT NULL,
  `begin` date NOT NULL,
  `end` date DEFAULT NULL,
  KEY `identities_subscriptions_identityId` (`identityId`),
  KEY `identities_subscriptions_subscriptionId` (`subscriptionId`),
  CONSTRAINT `identities_subscriptions_identityId` FOREIGN KEY (`identityId`) REFERENCES `identities` (`id`),
  CONSTRAINT `identities_subscriptions_subscriptionId` FOREIGN KEY (`subscriptionId`) REFERENCES `subscriptions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `items`
--

DROP TABLE IF EXISTS `items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `items` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `timestamp` datetime NOT NULL,
  `debtorId` int(10) unsigned NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` char(3) NOT NULL,
  `subscriptionId` int(10) unsigned DEFAULT NULL,
  `productId` int(10) unsigned DEFAULT NULL,
  `note` varchar(200) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `items_subscriptionId` (`subscriptionId`),
  KEY `items_identityId` (`debtorId`),
  KEY `items_productId` (`productId`),
  CONSTRAINT `items_identityId` FOREIGN KEY (`debtorId`) REFERENCES `identities` (`id`),
  CONSTRAINT `items_productId` FOREIGN KEY (`productId`) REFERENCES `products` (`id`),
  CONSTRAINT `items_subscriptionId` FOREIGN KEY (`subscriptionId`) REFERENCES `subscriptions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `items_open`
--

DROP TABLE IF EXISTS `items_open`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `items_open` (
  `itemId` int(10) unsigned NOT NULL,
  PRIMARY KEY (`itemId`),
  CONSTRAINT `items_open_itemId` FOREIGN KEY (`itemId`) REFERENCES `items` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `paymentServices`
--

DROP TABLE IF EXISTS `paymentServices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `paymentServices` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `type` varchar(50) NOT NULL,
  `name` varchar(200) NOT NULL,
  `externalAccount` varchar(200) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `paymentServices_accounts`
--

DROP TABLE IF EXISTS `paymentServices_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `paymentServices_accounts` (
  `paymentServiceId` int(10) unsigned NOT NULL,
  `account` varchar(200) NOT NULL,
  `name` varchar(200) NOT NULL,
  PRIMARY KEY (`paymentServiceId`,`account`),
  CONSTRAINT `paymentServices_accounts` FOREIGN KEY (`paymentServiceId`) REFERENCES `paymentServices` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `payments` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `type` tinyint(3) unsigned NOT NULL,
  `paymentServiceId` int(10) unsigned NOT NULL,
  `externalTransactionId` varchar(200) NOT NULL,
  `senderId` int(10) unsigned NOT NULL,
  `receiverId` int(10) unsigned NOT NULL,
  `timestamp` datetime NOT NULL,
  `grossAmount` decimal(10,2) NOT NULL,
  `transactionFee` decimal(10,2) NOT NULL,
  `currency` char(3) NOT NULL,
  `note` varchar(200) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `paymentServiceId` (`paymentServiceId`,`externalTransactionId`),
  KEY `payments_senderId` (`senderId`),
  KEY `payments_receiverId` (`receiverId`),
  CONSTRAINT `payments_paymentServiceId` FOREIGN KEY (`paymentServiceId`) REFERENCES `paymentServices` (`id`),
  CONSTRAINT `payments_receiverId` FOREIGN KEY (`receiverId`) REFERENCES `identities` (`id`),
  CONSTRAINT `payments_senderId` FOREIGN KEY (`senderId`) REFERENCES `identities` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `payments_items`
--

DROP TABLE IF EXISTS `payments_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `payments_items` (
  `paymentId` int(10) unsigned NOT NULL,
  `itemId` int(10) unsigned NOT NULL,
  PRIMARY KEY (`paymentId`,`itemId`),
  KEY `payments_items_itemId` (`itemId`),
  CONSTRAINT `payments_items_itemId` FOREIGN KEY (`itemId`) REFERENCES `items` (`id`),
  CONSTRAINT `payments_items_paymentId` FOREIGN KEY (`paymentId`) REFERENCES `payments` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `payments_links`
--

DROP TABLE IF EXISTS `payments_links`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `payments_links` (
  `paymentId` int(10) unsigned NOT NULL,
  `linkedPaymentId` int(10) unsigned NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `reason` tinyint(3) unsigned NOT NULL,
  PRIMARY KEY (`linkedPaymentId`),
  CONSTRAINT `payments_links_linkedPaymentId` FOREIGN KEY (`linkedPaymentId`) REFERENCES `payments` (`id`),
  CONSTRAINT `payments_links_paymentId` FOREIGN KEY (`paymentId`) REFERENCES `payments` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `payments_open`
--

DROP TABLE IF EXISTS `payments_open`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `payments_open` (
  `paymentId` int(10) unsigned NOT NULL,
  KEY `payments_open_paymentId` (`paymentId`),
  CONSTRAINT `payments_open_paymentId` FOREIGN KEY (`paymentId`) REFERENCES `payments` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `products` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `subscriptions`
--

DROP TABLE IF EXISTS `subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `subscriptions` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping routines for database 'openaccounting'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-08-25 22:26:04
